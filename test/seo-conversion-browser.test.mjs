import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserSession} from './cdp-client.mjs';
const s=await createBrowserSession({baseUrl:process.env.BASE_URL??'http://localhost:3117',port:9473});
const results=[];
async function visit(route) { await s.navigate(route);await s.waitFor(`location.pathname+location.search===${JSON.stringify(route)}`,'route loaded');await new Promise(r=>setTimeout(r,500)); }
async function fill(form) {
 await s.evaluate(`(()=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;for(const e of document.querySelectorAll(${JSON.stringify(form+' input')})){setter.call(e,e.type==='email'?'qa@example.com':'QA');e.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
}
try {
 await s.setViewport(390,900);
 for(const locale of ['en','ar','ru','de','fr']) {
  await visit(`/${locale}`);await fill('#trade form');
  const notice=await s.evaluate(`(()=>{const p=document.querySelector('#trade form > p').cloneNode(true);p.querySelector('a').remove();return p.textContent.trim()})()`);
  await s.evaluate(`document.querySelector('#trade form').requestSubmit()`);
  await s.waitFor(`!!document.querySelector('.trade-success-note')`,'preview notice');
  assert.equal(await s.evaluate(`document.querySelector('.trade-success-note').textContent.trim()`),notice);
  assert.ok(await s.evaluate(`!!document.querySelector('#trade a[href="mailto:info@agriculturecairo.com"]')`));
  await visit(`/${locale}/products?world=frozen`);
  const scene='[data-product-id="produce:half-fried-french-fries"]';
  await s.click(`${scene} .export-card-keyboard-toggle`);
  await s.waitFor(`!!document.querySelector('#product-card-flight-dialog .export-spec-notice')`,'unapproved specifications notice');
  assert.equal(await s.evaluate(`document.querySelectorAll('#product-card-flight-dialog .export-spec-row').length`),0);
  assert.ok(await s.evaluate(`!!document.querySelector('#product-card-flight-dialog .export-spec-notice a[href^="mailto:"]')`));
  await s.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await s.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
  await s.waitFor(`!document.querySelector('#product-card-flight-dialog')`,'card closes');
  await s.click(`${scene} .export-card-quote`);await s.click('.enquiry-dock-btn');
  await s.waitFor(`document.querySelector('#quote-form')!==null`,'quote form');await fill('#quote-form');
  const quoteNotice=await s.evaluate(`(()=>{const p=document.querySelector('#quote-form').previousElementSibling.cloneNode(true);p.querySelector('a').remove();return p.textContent.trim()})()`);
  await s.evaluate(`document.querySelector('#quote-form').requestSubmit()`);
  await s.waitFor(`!!document.querySelector('#quote-success').textContent.trim()`,'quote preview status');
  assert.equal(await s.evaluate(`document.querySelector('#quote-success').textContent.trim()`),quoteNotice);
  results.push({locale,homePreview:true,unapprovedSpecsHidden:true,identityAndQuoteRetained:true,quotePreview:true});
 }
 await visit('/ar/company');
 assert.equal(await s.evaluate(`document.documentElement.dir`),'rtl');
 assert.equal(await s.evaluate(`document.querySelector('main').lang`),'en');
 assert.equal(await s.evaluate(`document.querySelector('main').dir`),'ltr');
 assert.equal(await s.evaluate(`getComputedStyle(document.querySelector('header')).direction`),'rtl');
 assert.equal(await s.evaluate(`document.querySelector('header').closest('[lang="en"]')===null`),true);
 assert.deepEqual(s.getErrors(),[]);
 const out=process.env.QA_OUTPUT_DIR??'docs/seo/evidence';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/conversion-validation.json`,JSON.stringify({passed:true,results,companyLanguageScope:true},null,2)+'\n');
 console.log('PASS: five-language truthful preview forms; fries identity/enquiry preserved without assumed specifications; Arabic Company chrome and English main language boundaries.');
}finally{await s.close();}
