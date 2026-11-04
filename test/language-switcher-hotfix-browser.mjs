import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserSession} from './cdp-client.mjs';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3118';
const out = process.env.QA_OUTPUT_DIR ?? '/private/tmp/agrica-language-hotfix-qa';
fs.mkdirSync(out, {recursive: true});
let s = await createBrowserSession({baseUrl, port: 9497});
const locales = ['en', 'ar', 'ru', 'de', 'fr'];
const variants = [
  {id: 'home', suffix: ''},
  {id: 'produce', suffix: '/products?world=frozen'},
  {id: 'herbs', suffix: '/herbs-spices/products?family=flowers'},
];
const result = {geometry: [], navigation: [], keyboard: [], scrolling: [], divisions: [], errors: []};
let mobile = true;
const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const route = (locale, variant) => `/${locale}${variant.suffix}`;
const normalized = (url) => {const u = new URL(url, baseUrl); return u.pathname.replace(/\/$/, '') + u.search;};
async function viewport(width) {mobile = width < 681; await s.setViewport(width, mobile ? 740 : 900);}
async function visit(path) {
  await s.navigate(path);
  await s.waitFor(`(location.pathname.endsWith('/')?location.pathname.slice(0,-1):location.pathname)+location.search===${JSON.stringify(normalized(path))}`, 'direct route');
  await pause(500);
}
async function key(key, vk) {
  for (const type of ['keyDown', 'keyUp']) await s.send('Input.dispatchKeyEvent', {type, key, code: key, windowsVirtualKeyCode: vk});
}
async function point(selector) {
  const p = await s.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);return{x,y,hit:!!h&&e.contains(h),href:e.getAttribute('href')}})()`);
  assert.ok(p?.hit, `actual hit target: ${selector}`);
  return p;
}
async function activate(selector) {
  await s.send('Page.bringToFront');
  const {x, y} = await point(selector);
  if (mobile) {
    await s.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    await s.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  } else {
    await s.send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
    for (const type of ['mousePressed', 'mouseReleased']) await s.send('Input.dispatchMouseEvent', {type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, modifiers: 0, clickCount: 1});
  }
}
async function open() {
  await activate('[data-language-trigger]');
  await s.waitFor(`!!document.querySelector('[data-language-menu]')`, 'language menu opens');
  await pause(180); // Preserve the existing 140ms fade before measuring hit targets.
}
async function menu() {
  const state = await s.evaluate(`(()=>{const m=document.querySelector('[data-language-menu]'),r=m.getBoundingClientRect();return{lang:document.documentElement.lang,dir:document.documentElement.dir,position:getComputedStyle(m).position,rect:r.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,options:[...m.querySelectorAll('[data-language-option]')].map(a=>{const r=a.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{locale:a.dataset.locale,href:a.getAttribute('href'),top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,hit:!!hit&&a.contains(hit)}})}})()`);
  result.lastMenu = state;
  assert.equal(state.position, 'absolute');
  assert.equal(state.overflow, false);
  assert.ok(state.rect.left >= 0 && state.rect.right <= (await s.evaluate('innerWidth')));
  assert.ok(state.rect.top >= 0 && state.rect.bottom <= (await s.evaluate('innerHeight')));
  assert.deepEqual(state.options.map(o => o.locale), locales);
  for (const option of state.options) {
    assert.ok(option.hit, `${state.lang}: actual hit target ${JSON.stringify(option)}`);
    assert.ok(option.height >= 37.9, '38px minimum target, allowing subpixel transform rounding');
    assert.ok(option.left >= 0 && option.top >= 0 && option.right <= (await s.evaluate('innerWidth')) && option.bottom <= (await s.evaluate('innerHeight')));
  }
  return state;
}
async function dismissed() {await s.waitFor(`!document.querySelector('[data-language-menu]')`, 'menu dismisses');}
async function arrived(locale, variant) {
  await s.waitFor(`(location.pathname.endsWith('/')?location.pathname.slice(0,-1):location.pathname)+location.search===${JSON.stringify(normalized(route(locale, variant)))} && document.documentElement.lang===${JSON.stringify(locale)}`, 'localized destination with validated query');
  assert.equal(await s.evaluate('document.documentElement.dir'), locale === 'ar' ? 'rtl' : 'ltr');
  assert.ok(await s.evaluate(`document.cookie.includes('agrica_locale=${locale}')`));
}
async function shot(name) {const data = await s.send('Page.captureScreenshot', {format: 'png'}); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(data.data, 'base64'));}

try {
  // All source locales, all five option hit targets, every navbar, all requested widths.
  for (const width of [320, 375, 390, 430, 1440]) {
    await viewport(width);
    for (const locale of locales) for (const variant of variants) {
      await visit(route(locale, variant));
      const before = await s.evaluate(`(()=>{const h=document.querySelector('[data-language-trigger]').closest('header');return{rect:h.getBoundingClientRect().toJSON(),y:scrollY,height:document.documentElement.scrollHeight,bodyPosition:document.body.style.position}})()`);
      await open();
      const state = await menu();
      for (const option of state.options) assert.equal(normalized(option.href), normalized(route(option.locale, variant)));
      const after = await s.evaluate(`(()=>{const h=document.querySelector('[data-language-trigger]').closest('header');return{rect:h.getBoundingClientRect().toJSON(),y:scrollY,height:document.documentElement.scrollHeight,bodyPosition:document.body.style.position}})()`);
      assert.deepEqual(after, before, 'opening does not move/redesign the navbar or scroll/lock the document');
      if (['en', 'ar'].includes(locale) && [320, 390, 1440].includes(width)) await shot(`${locale}-${variant.id}-${width}`);
      await key('Escape', 27); await dismissed();
      result.geometry.push({width, locale, variant: variant.id, ...state, passed: true});
    }
    console.log(`PASS ${width}: 5 source locales × 3 navbars × 5 reachable options`);
    // Every destination is activated by real touch on mobile and mouse on desktop.
    for (const target of locales) for (const variant of variants) {
      const source = target === 'ar' || target === 'de' ? 'en' : 'ar';
      await visit(route(source, variant)); await open(); await menu();
      await activate(`[data-language-option][data-locale=${target}]`); await arrived(target, variant);
      result.navigation.push({width, source, target, variant: variant.id, activation: mobile ? 'touch' : 'mouse', passed: true});
    }
    console.log(`PASS ${width}: 15 actual localized navigation/query/cookie checks`);
  }
  // Keyboard wrapping, Tab, Escape focus restoration, outside dismissal and Enter navigation.
  for (const width of [320, 1440]) {
    await viewport(width);
    for (const locale of ['en', 'ar']) for (const variant of variants) {
      await visit(route(locale, variant));
      await s.evaluate(`document.querySelector('[data-language-trigger]').focus()`); await key('ArrowDown', 40);
      await s.waitFor(`document.activeElement?.dataset.locale===${JSON.stringify(locale)}`, 'active option receives keyboard focus');
      await key('End', 35); assert.equal(await s.evaluate('document.activeElement.dataset.locale'), 'fr');
      await key('ArrowDown', 40); assert.equal(await s.evaluate('document.activeElement.dataset.locale'), 'en');
      await key('ArrowUp', 38); assert.equal(await s.evaluate('document.activeElement.dataset.locale'), 'fr');
      await key('Home', 36); await key('Tab', 9); assert.equal(await s.evaluate('document.activeElement.dataset.locale'), 'ar');
      await key('Escape', 27); await dismissed();
      await s.waitFor(`document.activeElement?.matches('[data-language-trigger]')`, 'Escape restores trigger focus');
      await open();
      await s.send('Input.dispatchMouseEvent', {type: 'mousePressed', x: 2, y: 600, button: 'left', clickCount: 1});
      await s.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: 2, y: 600, button: 'left', clickCount: 1});
      await dismissed();
      await s.evaluate(`document.querySelector('[data-language-trigger]').focus()`); await key('ArrowDown', 40);
      await s.waitFor(`document.activeElement?.dataset.locale===${JSON.stringify(locale)}`, 'keyboard reopens with scheduled option focus');
      await key('End', 35); await s.waitFor(`document.activeElement?.dataset.locale==='fr'`, 'End focuses the final option');
      await key('Enter', 13); await arrived('fr', variant);
      result.keyboard.push({width, locale, variant: variant.id, passed: true});
    }
  }
  // Existing scroll-down hide/up reveal and open-menu pinning remain intact.
  await viewport(390);
  for (const locale of ['en', 'ar']) for (const variant of variants) {
    // Exercise the shared global header outside the catalogue's pre-existing overflow container.
    const scrollRoute = variant.id === 'produce' ? `/${locale}/products/oranges` : route(locale, variant);
    await visit(scrollRoute);
    const owner = `document.querySelector('[data-language-trigger]').closest('[data-hidden]')`;
    await s.evaluate('scrollTo({top:400,behavior:"instant"})'); await s.waitFor(`${owner}.dataset.hidden==='true'`, 'navbar hides down');
    await s.evaluate('scrollTo({top:200,behavior:"instant"})'); await s.waitFor(`${owner}.dataset.hidden==='false'`, 'navbar reveals up'); await pause(300);
    await open(); await menu();
    await s.evaluate('scrollTo({top:300,behavior:"instant"})'); await pause(300);
    assert.equal(await s.evaluate(`${owner}.dataset.hidden`), 'false'); await menu();
    await key('Escape', 27); await dismissed(); result.scrolling.push({locale, variant: variant.id, route: scrollRoute, passed: true});
  }
  console.log('PASS: sticky header cases');
  let divisionCase = 0;
  for (const width of [390, 1440]) {
    await viewport(width);
    for (const locale of locales) {
      result.errors.push(...s.getErrors()); await s.close();
      s = await createBrowserSession({baseUrl, port: 9510 + divisionCase++}); await viewport(width);
      await visit(`/${locale}/products?world=frozen`); await activate('[data-division-switcher] a:nth-child(2)');
      await s.waitFor(`location.pathname==='/${locale}/herbs-spices/products' && !!document.querySelector('[data-material-specimen]') && document.documentElement.lang==='${locale}'`, 'division Herbs UI committed'); await pause(300);
      await activate('[data-division-switcher] a:first-child'); await s.waitFor(`location.pathname==='/${locale}/products' && !!document.querySelector('.atlas-grid') && document.documentElement.lang==='${locale}'`, 'division Produce UI committed'); await pause(300);
      assert.equal(await s.evaluate('document.documentElement.dir'), locale === 'ar' ? 'rtl' : 'ltr');
      result.divisions.push({width, locale, passed: true});
    }
    console.log(`PASS ${width}: all 5 division navigation pairs`);
  }
  result.errors.push(...s.getErrors()); await s.close();
  s = await createBrowserSession({baseUrl, port: 9520}); await viewport(390);
  await s.setEmulatedMedia([{name: 'prefers-reduced-motion', value: 'reduce'}]); await visit('/ar/products'); await open();
  assert.equal(await s.evaluate(`getComputedStyle(document.querySelector('[data-language-menu]')).animationName`), 'none'); await menu();
  result.errors.push(...s.getErrors()); assert.deepEqual(result.errors, []); result.passed = true;
  console.log(`PASS: ${result.geometry.length} menu layouts, ${result.navigation.length} real navigations, ${result.keyboard.length} keyboard cases, ${result.scrolling.length} sticky cases, ${result.divisions.length} division cases; reduced motion; no runtime errors.`);
} catch (error) {
  result.failure = error.stack; result.errors.push(...s.getErrors());
  try {await shot('failure'); result.failureState = await s.evaluate(`({url:location.href,active:document.activeElement?.outerHTML.slice(0,800),scroll:scrollY})`);} catch {}
  throw error;
} finally {
  fs.writeFileSync(`${out}/browser-results.json`, JSON.stringify(result, null, 2)); await s.close();
}
