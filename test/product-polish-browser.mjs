import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserSession} from './cdp-client.mjs';
import {SEO_PRODUCTS,seoProductById} from '../src/seo/products.ts';
import {productsDictionary} from '../src/content/page-dictionaries.ts';
import {getPublicProductCardContent} from '../src/data/productCardContent.ts';
const base=process.env.BASE_URL??'http://localhost:3117';
const out=process.env.QA_OUTPUT_DIR??'/private/tmp/agrica-product-polish';
fs.mkdirSync(out+'/after',{recursive:true});
const s=await createBrowserSession({baseUrl:base,port:9483});
const result={layouts:[],flows:[],catalogueReturns:[],noJS:[],errors:[]};
const locales=['en','ar','ru','de','fr'];
async function visit(path){await s.navigate(path);await s.waitFor(`location.pathname+location.search===${JSON.stringify(path)}`,'route');await new Promise(r=>setTimeout(r,350));}
async function visibleAnchor(selector){
 const a=await s.evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)});if(!a)return null;const r=a.getBoundingClientRect(),c=getComputedStyle(a),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{href:a.getAttribute('href'),text:a.textContent.trim(),x:r.x+r.width/2,y:r.y+r.height/2,height:r.height,visible:r.width>0&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&c.visibility==='visible'&&c.display!=='none'&&!!hit&&a.contains(hit)}})()`);
 assert.ok(a?.visible,`${selector} visible, unobscured and touch-sized`);return a;
}
async function pointerActivate(a,touch){
 if(touch){await s.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y}]});await s.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else {await s.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:a.x,y:a.y});for(const type of ['mousePressed','mouseReleased'])await s.send('Input.dispatchMouseEvent',{type,x:a.x,y:a.y,button:'left',clickCount:1});}
}
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
   const back=await visibleAnchor('[data-back-to-catalogue]');assert.equal(back.href,`/${locale}/products?world=${product.world}`);assert.ok(back.text.includes(productsDictionary(locale).ui.backToCatalogue));
   result.layouts.push({path,width,passed:true});
   if(locale==='en'&&[1440,390].includes(width)){const shot=await s.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(`${out}/after/${product.slug}-${width}.png`,Buffer.from(shot.data,'base64'));}
  }
  console.log(`PASS ${width}: all 4 products × 5 locales`);
 }
 // Directly opened product pages return to the appropriate localized world without history state.
 await s.setViewport(390,844);
 for(const locale of locales)for(const product of SEO_PRODUCTS){
  await visit(`/${locale}/products/${product.slug}`);
  const back=await visibleAnchor('[data-back-to-catalogue]');await pointerActivate(back,true);
  await s.waitFor(`location.pathname+location.search===${JSON.stringify(`/${locale}/products?world=${product.world}`)} && document.querySelector('.products-page')?.dataset.world===${JSON.stringify(product.world)}`,'direct Back to Catalogue');
  assert.equal(await s.evaluate('document.body.style.position'),'');
  result.catalogueReturns.push({locale,product:product.slug,world:product.world,passed:true});
 }
 console.log('PASS 20 direct product → localized catalogue returns');
 // Genuine touch/keyboard activation, existing enquiry state, close animation and native Back.
 for(const width of [1440,390]){
  await s.setViewport(width,900);
  for(const locale of locales)for(const product of SEO_PRODUCTS){
   const source=`/${locale}/products?world=${product.world}`;await visit(source);
   const selector=`[data-product-id="${product.id}"] .export-card-keyboard-toggle`;
   await s.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await new Promise(r=>setTimeout(r,100));
   const originalY=await s.evaluate('scrollY');await s.click(selector);await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'flight ready');
   const explore=await visibleAnchor('[data-explore-product]');assert.equal(explore.href,`/${locale}/products/${product.slug}`);assert.ok(explore.text.includes(productsDictionary(locale).ui.exploreProduct));
   if(['en','ar'].includes(locale)&&product.slug==='oranges'){const shot=await s.send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`${out}/after/explore-${locale}-${width}.png`,Buffer.from(shot.data,'base64'));}
   // Existing enquiry toggle stays in the modal and does not navigate/close it.
   const before=await s.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch').getAttribute('aria-pressed')`);
   await s.click('#product-card-flight-dialog .enquiry-notch');
   assert.notEqual(await s.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch').getAttribute('aria-pressed')`),before);
   await s.evaluate(`document.querySelector('[data-explore-product]').focus()`);await key('Tab');await key('Tab');
   assert.equal(await s.evaluate(`document.activeElement.matches('.export-card-flight-close')`),true,'focus trap wraps');
   if(width===1440&&locale==='en'){await s.evaluate(`document.querySelector('[data-explore-product]').focus()`);await key('Enter','Enter',13);}
   else await pointerActivate(await visibleAnchor('[data-explore-product]'),width===390);
   await s.waitFor(`location.pathname==='/${locale}/products/${product.slug}'`,'Explore destination');await s.waitFor(`!!document.querySelector('[data-product-profile]')`,'SSR destination');
   assert.equal(await s.evaluate(`document.body.style.position`),'');assert.equal(await s.evaluate(`!!document.querySelector('main').closest('[inert]')`),false);
   await s.evaluate('history.back()');await s.waitFor(`location.pathname+location.search===${JSON.stringify(source)}`,'Back source');
   await s.waitFor(`Math.abs(scrollY-${originalY})<3 && document.activeElement?.closest('[data-product-id]')?.dataset.productId===${JSON.stringify(product.id)}`,'Back focus and exact scroll');
   assert.equal(await s.evaluate(`!!document.querySelector('#product-card-flight-dialog')`),false);assert.equal(await s.evaluate(`sessionStorage.getItem('agrica:product-explore-return')`),null);
   // Original Escape closing still restores the same trigger and scroll.
   await s.click(selector);await s.waitFor(`document.querySelector('#product-card-flight-dialog')?.dataset.ready==='true'`,'reopen');await key('Escape');await s.waitFor(`!document.querySelector('#product-card-flight-dialog')`,'close');
   assert.ok(Math.abs(await s.evaluate('scrollY')-originalY)<3);
   result.flows.push({width,locale,product:product.slug,activation:width===390?'touch':locale==='en'?'keyboard':'mouse',backRestored:true});
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
 for(const locale of ['en','ar'])for(const product of SEO_PRODUCTS){await visit(`/${locale}/products/${product.slug}`);assert.equal(await s.evaluate(`document.querySelectorAll('[data-specification-field]').length`),getPublicProductCardContent(product.id).fields.length);assert.equal(await s.evaluate(`document.querySelector('[data-back-to-catalogue]').getAttribute('href')`),`/${locale}/products?world=${product.world}`);result.noJS.push({locale,product:product.slug,passed:true});}
 await visit('/en/products');assert.equal(await s.evaluate(`document.querySelectorAll('[data-product-discovery] a[href^="/en/products/"]').length`),SEO_PRODUCTS.length,'existing directory provides no-JS crawlability without duplication');
 result.errors=s.getErrors();assert.deepEqual(result.errors,[]);result.passed=true;console.log('PASS: 100 layouts, 40 Explore/Back flows, 20 direct catalogue returns, keyboard/mouse/touch/enquiry/focus/scroll, nonpilot gating, reduced motion and 8 no-JS profiles.');
}finally{fs.writeFileSync(out+'/browser-results.json',JSON.stringify(result,null,2));await s.close();}
