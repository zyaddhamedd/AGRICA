import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserSession} from './cdp-client.mjs';
const out=process.env.QA_OUTPUT_DIR ?? '/private/tmp/agrica-seo-qa';
fs.mkdirSync(out,{recursive:true});
const locales=['en','ar','ru','de','fr'];
const products={'oranges':'produce:orange','fresh-strawberries':'produce:fresh-strawberry','iqf-strawberries':'produce:iqf-strawberry','iqf-broccoli':'produce:iqf-broccoli'};
const s=await createBrowserSession({baseUrl:process.env.BASE_URL ?? 'http://localhost:3117',port:9472});
const results={passed:false,rows:[],noJS:[],screenshots:[],errors:[]};
async function visit(locale,slug,width){
 const route=`/${locale}/products/${slug}`;
 await s.navigate(route);
 await s.waitFor(`location.pathname===${JSON.stringify(route)}&&!!document.querySelector('[data-product-profile]')`,route);
 await new Promise(r=>setTimeout(r,350));
 const state=await s.evaluate(`(()=>{const m=document.querySelector('[data-product-profile]');const h=document.querySelector('header');const controls=[...h.querySelectorAll('[data-division-switcher], [data-language-trigger], .global-navbar-menu-btn, .global-navbar-brand')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}});const overlap=controls.some((a,i)=>controls.some((b,j)=>i<j&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1));return {lang:document.documentElement.lang,dir:document.documentElement.dir,profile:m.dataset.productProfile,h1:m.querySelector('h1')?.textContent.trim(),title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,overlap,controlsInViewport:controls.every(r=>r.left>=-1&&r.right<=innerWidth+1),breadcrumbs:[...m.querySelector('nav ol').querySelectorAll('a')].map(a=>({text:a.textContent.trim(),href:a.getAttribute('href'),current:a.getAttribute('aria-current')})),specs:m.querySelectorAll('dl dd').length,englishValues:[...m.querySelectorAll('dl dd')].every(e=>e.lang==='en'&&e.dir==='ltr'),email:m.querySelector('a[href^="mailto:info@agriculturecairo.com"]')?.getAttribute('href'),contact:!!m.querySelector('a[href="/contact"]'),canonical:document.querySelector('link[rel="canonical"]')?.href}})()`);
 assert.equal(state.lang,locale);assert.equal(state.dir,locale==='ar'?'rtl':'ltr');assert.equal(state.profile,products[slug]);
 assert.ok(state.h1&&state.title.includes(state.h1));assert.ok(state.specs>=5&&state.englishValues);
 assert.equal(state.overflow,false,`${route} ${width}: overflow`);assert.equal(state.overlap,false,`${route} ${width}: overlap`);assert.equal(state.controlsInViewport,true);
 assert.equal(state.breadcrumbs.length,3);assert.ok([`/${locale}`,`/${locale}/`].includes(state.breadcrumbs[0].href));assert.equal(state.breadcrumbs[1].href,`/${locale}/products`);assert.equal(state.breadcrumbs[2].href,route);assert.equal(state.breadcrumbs[2].current,'page');assert.equal(state.breadcrumbs[2].text,state.h1);
 assert.ok(state.email&&state.contact);assert.equal(state.canonical,`https://www.agriculturecairo.com${route}`);
 await s.evaluate(`document.querySelector('[data-language-trigger]').focus()`);await s.click('[data-language-trigger]');await s.waitFor(`!!document.querySelector('[data-language-option]')`,'language popover');
 const alternates=await s.evaluate(`[...document.querySelectorAll('[data-language-option]')].map(a=>({locale:a.dataset.locale,href:a.getAttribute('href')}))`);
 for(const alt of alternates)assert.equal(alt.href,`/${alt.locale}/products/${slug}`,'same product language destination');assert.equal(alternates.length,5);
 await s.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});await s.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
 results.rows.push({route,width,...state,languageDestinations:alternates,passed:true});
 if((locale==='en'&&slug==='oranges'&&width===1440)||(locale==='ar'&&slug==='fresh-strawberries'&&width===390)||(locale==='ru'&&slug==='iqf-broccoli'&&width===320)||(locale==='de'&&slug==='iqf-strawberries'&&width===768)){
  const file=`${out}/${locale}-${slug}-${width}.png`;const screenshot=await s.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(file,Buffer.from(screenshot.data,'base64'));results.screenshots.push(file);
 }
}
try{
 for(const width of [1440,390]){await s.setViewport(width,900);for(const locale of locales)for(const slug of Object.keys(products))await visit(locale,slug,width);console.log(`PASS ${width}: 20 pilot layouts and language controls`);}
 for(const width of [320,768]){await s.setViewport(width,900);for(const locale of ['ar','ru','de'])for(const slug of Object.keys(products))await visit(locale,slug,width);console.log(`PASS ${width}: 12 compact/tablet pilot layouts`);}
 await s.send('Emulation.setScriptExecutionDisabled',{value:true});
 for(const [locale,slug] of [['en','oranges'],['ar','fresh-strawberries'],['de','iqf-strawberries'],['fr','iqf-broccoli']]){
  await s.navigate(`/${locale}/products/${slug}`);const state=await s.evaluate(`(()=>{const m=document.querySelector('[data-product-profile]');return {h1:m?.querySelector('h1')?.textContent,specs:m?.querySelectorAll('dl dd').length,text:m?.innerText,links:m?.querySelectorAll('a[href]').length}})()`);assert.ok(state.h1&&state.specs>=5&&state.links>=6&&state.text.includes('Egypt'));results.noJS.push({locale,slug,h1:state.h1,specs:state.specs,links:state.links,passed:true});
 }
 results.errors=s.getErrors();assert.deepEqual(results.errors,[]);results.passed=true;
 console.log('PASS: 64 pilot layouts, language destinations, breadcrumbs, contact, zero overflow/overlap; 4 no-JS pages; no runtime errors.');
}catch(e){results.failure=e.stack;throw e;}finally{fs.writeFileSync(`${out}/independent-browser-results.json`,JSON.stringify(results,null,2));await s.close();}
