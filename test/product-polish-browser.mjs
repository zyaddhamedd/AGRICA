import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserSession} from './cdp-client.mjs';
import {SEO_PRODUCTS,seoProductById} from '../src/seo/products.ts';
import {getPublicProductCardContent} from '../src/data/productCardContent.ts';
const base=process.env.BASE_URL??'http://localhost:3117';
const out=process.env.QA_OUTPUT_DIR??'/private/tmp/agrica-product-polish';
fs.mkdirSync(out+'/after',{recursive:true});
const s=await createBrowserSession({baseUrl:base,port:9483});
const result={layouts:[],flows:[],noJS:[],errors:[]};
const locales=['en','ar','ru','de','fr'];
async function visit(path){await s.navigate(path);await s.waitFor(`location.pathname+location.search===${JSON.stringify(path)}`,'route');await new Promise(r=>setTimeout(r,350));}
async function key(key,code=key,vk){for(const type of ['keyDown','keyUp'])await s.send('Input.dispatchKeyEvent',{type,key,code,...(vk?{windowsVirtualKeyCode:vk}:{})});}
try{
 for(const width of [1440,1024,768,390,320]){
  await s.setViewport(width,1000);
  for(const locale of locales)for(const product of SEO_PRODUCTS){
   const path=`/${locale}/products/${product.slug}`;await visit(path);
   const state=await s.evaluate(`(()=>{const m=document.querySelector('[data-product-profile]');const image=m.querySelector('img');const fields=[...m.querySelectorAll('[data-specification-field]')].map(e=>({key:e.dataset.specificationField,value:e.querySelector('dd').textContent}));return {h1:m.querySelectorAll('h1').length,lang:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,fields,groups:m.querySelectorAll('[data-specification-group]').length,fit:getComputedStyle(image).objectFit,headerOverlap:m.getBoundingClientRect().top<document.querySelector('header').getBoundingClientRect().bottom,canonical:document.querySelector('link[rel=canonical]').href,anchor:!!m.querySelector('a[href="#profile-specifications"]')}})()`);
   assert.equal(state.h1,1);assert.equal(state.lang,locale);assert.equal(state.dir,locale==='ar'?'rtl':'ltr');assert.equal(state.overflow,false,path+' '+width);assert.equal(state.headerOverlap,false);assert.equal(state.groups,3);assert.equal(state.fit,'cover');assert.ok(state.anchor);assert.equal(state.canonical,'https://www.agriculturecairo.com'+path);
   const expected=getPublicProductCardContent(product.id).fields.map(f=>({key:f.labelKey,value:f.value})).sort((a,b)=>a.key.localeCompare(b.key));
   assert.deepEqual(state.fields.sort((a,b)=>a.key.localeCompare(b.key)),expected,'all approved fields exactly once, verbatim');
   result.layouts.push({path,width,passed:true});
   if(locale==='en'&&[1440,390].includes(width)){const shot=await s.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`${out}/after/${product.slug}-${width}.png`,Buffer.from(shot.data,'base64'));}
  }
  console.log(`PASS ${width}: all 4 products × 5 locales`);
 }
 // Genuine touch/keyboard activation, existing enquiry state, close animation and native Back.
 for(const width of [1440,390]){
  await s.setViewport(width,900);
  for(const locale of width===390?locales:['en'])for(const product of SEO_PRODUCTS){
   const source=`/${locale}/products?world=${product.world}`;await visit(source);
   const selector=`[data-product-id="${product.id}"] .export-card-keyboard-toggle`;
   await s.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await new Promise(r=>setTimeout(r,100));
   const originalY=await s.evaluate('scrollY');await s.click(selector);await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'flight ready');
   assert.equal(await s.evaluate(`document.querySelector('[data-explore-product]').getAttribute('href')`),`/${locale}/products/${product.slug}`);
   // Existing enquiry toggle stays in the modal and does not navigate/close it.
   const before=await s.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch').getAttribute('aria-pressed')`);
   await s.click('#product-card-flight-dialog .enquiry-notch');
   assert.notEqual(await s.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch').getAttribute('aria-pressed')`),before);
   await s.evaluate(`document.querySelector('[data-explore-product]').focus()`);await key('Tab');await key('Tab');
   assert.equal(await s.evaluate(`document.activeElement.matches('.export-card-flight-close')`),true,'focus trap wraps');
   if(width===390){const r=await s.evaluate(`document.querySelector('[data-explore-product]').getBoundingClientRect().toJSON()`);assert.ok(r.height>=44);const x=r.x+r.width/2,y=r.y+r.height/2;await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else {await s.evaluate(`document.querySelector('[data-explore-product]').focus()`);await key('Enter','Enter',13);}
   await s.waitFor(`location.pathname==='/${locale}/products/${product.slug}'`,'Explore destination');await s.waitFor(`!!document.querySelector('[data-product-profile]')`,'SSR destination');
   assert.equal(await s.evaluate(`document.body.style.position`),'');assert.equal(await s.evaluate(`!!document.querySelector('main').closest('[inert]')`),false);
   await s.evaluate('history.back()');await s.waitFor(`location.pathname+location.search===${JSON.stringify(source)}`,'Back source');
   await s.waitFor(`Math.abs(scrollY-${originalY})<3 && document.activeElement?.closest('[data-product-id]')?.dataset.productId===${JSON.stringify(product.id)}`,'Back focus and exact scroll');
   assert.equal(await s.evaluate(`!!document.querySelector('#product-card-flight-dialog')`),false);assert.equal(await s.evaluate(`sessionStorage.getItem('agrica:product-explore-return')`),null);
   // Original Escape closing still restores the same trigger and scroll.
   await s.click(selector);await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'reopen');await key('Escape');await s.waitFor(`!document.querySelector('#product-card-flight-dialog')`,'close');
   assert.ok(Math.abs(await s.evaluate('scrollY')-originalY)<3);
   result.flows.push({width,locale,product:product.slug,activation:width===390?'touch':'keyboard',backRestored:true});
  }
 }
 await visit('/en/products?world=fresh');await s.click('[data-product-id="produce:lemon"] .export-card-keyboard-toggle');await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'nonpilot ready');assert.equal(await s.evaluate(`!!document.querySelector('[data-explore-product]')`),false);await key('Escape');
 await s.setEmulatedMedia([{name:'prefers-reduced-motion',value:'reduce'}]);await visit('/ar/products?world=frozen');await s.click('[data-product-id="produce:iqf-broccoli"] .export-card-keyboard-toggle');await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'reduced motion');await key('Escape');await s.waitFor(`!document.querySelector('#product-card-flight-dialog')`,'reduced close');
 // A later ordinary catalogue visit must not consume an old Back position.
 await visit('/en/products/oranges');
 await s.evaluate(`sessionStorage.setItem('agrica:product-explore-return',JSON.stringify({url:'/en/products?world=fresh',productId:'produce:orange',y:1200,createdAt:Date.now()}));location.assign('/en/products?world=fresh')`);
 await s.waitFor(`location.pathname+location.search==='/en/products?world=fresh' && !!document.querySelector('.atlas-grid')`,'ordinary return');
 await s.waitFor(`sessionStorage.getItem('agrica:product-explore-return')===null`,'ordinary visit clears marker');
 assert.equal(await s.evaluate('scrollY'),0,'ordinary catalogue visit starts normally');
 await s.send('Emulation.setScriptExecutionDisabled',{value:true});
 for(const locale of ['en','ar'])for(const product of SEO_PRODUCTS){await visit(`/${locale}/products/${product.slug}`);assert.equal(await s.evaluate(`document.querySelectorAll('[data-specification-field]').length`),getPublicProductCardContent(product.id).fields.length);result.noJS.push({locale,product:product.slug,passed:true});}
 await visit('/en/products');assert.equal(await s.evaluate(`document.querySelectorAll('[data-product-discovery] a[href^="/en/products/"]').length`),SEO_PRODUCTS.length,'existing directory provides no-JS crawlability without duplication');
 result.errors=s.getErrors();assert.deepEqual(result.errors,[]);result.passed=true;console.log('PASS: 100 layouts, 24 Explore/Back flows, keyboard/touch/enquiry/focus/scroll, nonpilot gating, reduced motion and 8 no-JS profiles.');
}finally{fs.writeFileSync(out+'/browser-results.json',JSON.stringify(result,null,2));await s.close();}
