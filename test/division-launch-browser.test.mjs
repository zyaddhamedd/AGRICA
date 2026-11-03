import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBrowserSession } from './cdp-client.mjs';
import { assertHerbsIndexing } from './division-launch-policy.mjs';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3117';
const locales = ['en', 'ar', 'ru', 'de', 'fr'];
const suffixes = ['', '/products', '/standard', '/herbs-spices', '/herbs-spices/products', '/herbs-spices/standard'];
const evidenceDir = process.env.QA_OUTPUT_DIR ?? '/private/tmp/agrica-phase1-qa';
fs.mkdirSync(evidenceDir, { recursive: true });

// Validate rendered metadata, including query variants, rather than source strings.
for (const locale of locales) {
  for (const suffix of suffixes) {
    const route = `/${locale}${suffix}`;
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'), `${route}: no conflicting HTTP robots`);
    const canonical = `https://www.agriculturecairo.com/${locale}${suffix}`;
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `${route}: self canonical`);
    if (suffix.startsWith('/herbs-spices')) assertHerbsIndexing(html, route);
    else assert.ok(html.includes('name="robots" content="index, follow"'), `${route}: Produce indexing preserved`);
  }
  for (const [suffix, query] of [['/products', '?world=frozen'], ['/herbs-spices/products', '?family=flowers']]) {
    const html = await (await fetch(`${baseUrl}/${locale}${suffix}${query}`)).text();
    assert.ok(html.includes(`rel="canonical" href="https://www.agriculturecairo.com/${locale}${suffix}"`), 'filters canonicalize to catalogue');
  }
}
for (const [source, target] of [['/herbs-spices','/en/herbs-spices'],['/herbs-spices/products','/en/herbs-spices/products'],['/herbs-spices/standard','/en/herbs-spices/standard']]) {
  const response = await fetch(baseUrl + source, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get('location'), baseUrl).pathname, target);
}

for (const route of ['/es/herbs-spices', '/xx/herbs-spices/products', '/es/products', '/xx/standard']) {
  assert.equal((await fetch(baseUrl + route)).status, 404, `${route}: unsupported locale`);
}

const browser = await createBrowserSession({ baseUrl, port: 9467 });
const rows = [];
async function visit(route) {
  await browser.navigate(route);
  await browser.waitFor(`location.pathname === ${JSON.stringify(route)} && !!document.querySelector('[data-division-switcher] a[aria-current="page"]')`, route);
}
try {
  for (const width of [1440, 390, 320]) {
    await browser.setViewport(width, 900);
    for (const locale of locales) {
      for (const suffix of suffixes) {
        const route = `/${locale}${suffix}`;
        await visit(route);
        const state = await browser.evaluate(`(() => {
          const nav = document.querySelector('[data-division-switcher]');
          const links = [...nav.querySelectorAll('a')];
          const header = nav.closest('header');
          const controls = [...header.querySelectorAll('[data-division-switcher], [data-language-trigger], .global-navbar-menu-btn, button[aria-controls="herbs-spices-menu"], .global-navbar-brand, .hero-navbar-brand, .hero-navbar-menu-btn, a[class*="HerbsSpicesHeader_brand"]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width};});
          const overlap = controls.some((a,i)=>controls.some((b,j)=>i<j && Math.min(a.right,b.right)-Math.max(a.x,b.x)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1));
          return {lang:document.documentElement.lang,dir:document.documentElement.dir,links:links.map(a=>({href:a.getAttribute('href'),active:a.getAttribute('aria-current'),text:a.textContent.trim(),width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height})),overflow:document.documentElement.scrollWidth>innerWidth,overlap,controlsInViewport:controls.every(r=>r.x>=-1&&r.right<=innerWidth+1),transition:getComputedStyle(links[0]).transitionDuration};
        })()`);
        assert.equal(state.lang, locale);
        assert.equal(state.dir, locale === 'ar' ? 'rtl' : 'ltr');
        assert.equal(state.links.length, 2);
        assert.equal(state.links.filter(a=>a.active === 'page').length, 1);
        assert.ok(state.links.every(a=>(a.href === `/${locale}` || a.href.startsWith(`/${locale}/`)) && a.text.length>2 && a.height>=32), `${route} ${width}: full labels and touch area`);
        assert.equal(state.overlap, false, `${route} ${width}: header controls overlap`);
        assert.equal(state.controlsInViewport, true, `${route} ${width}: controls within viewport`);
        assert.equal(state.overflow, false, `${route} ${width}: horizontal overflow`);
        rows.push({ route, width, ...state });
        if ((width===1440&&locale==='en'&&suffix==='') || (width===390&&locale==='ar'&&suffix==='/herbs-spices') || (width===320&&locale==='ru'&&suffix==='/herbs-spices') || (width===390&&locale==='fr'&&suffix==='')) {
          const shot = await browser.send('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
          fs.writeFileSync(`${evidenceDir}/${locale}-${width}-${suffix.includes('herbs')?'herbs':'produce'}.png`,Buffer.from(shot.data,'base64'));
        }
      }
      // Actual client navigation both ways, including equivalent semantic page role.
      await visit(`/${locale}/products`);
      await browser.click('[data-division-switcher] a:nth-child(2)');
      await browser.waitFor(`location.pathname === '/${locale}/herbs-spices/products'`, 'switch to Herbs catalogue');
      await browser.click('[data-division-switcher] a:first-child');
      await browser.waitFor(`location.pathname === '/${locale}/products'`, 'switch back to Produce catalogue');
      // Language chooser still opens and dismisses; the new control doesn't steal it.
      await browser.evaluate(`document.querySelector('[data-language-trigger]').focus()`);
      await browser.click('[data-language-trigger]');
      await browser.waitFor(`document.querySelector('[data-language-trigger]').getAttribute('aria-expanded') === 'true'`, 'language opens');
      await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
      await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
      await browser.waitFor(`document.querySelector('[data-language-trigger]').getAttribute('aria-expanded') === 'false'`, 'language closes');
    }
  }
  await browser.setEmulatedMedia([{name:'prefers-reduced-motion',value:'reduce'}]);
  await visit('/ar/herbs-spices');
  assert.ok(await browser.evaluate(`parseFloat(getComputedStyle(document.querySelector('[data-division-switcher] a')).transitionDuration) <= 0.01`), 'reduced-motion transition is negligible');
  await browser.evaluate(`document.querySelector('[data-division-switcher] a').focus()`);
  assert.equal(await browser.evaluate(`document.activeElement.matches('[data-division-switcher] a')`),true);
  await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});
  await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});
  assert.equal(await browser.evaluate(`document.activeElement.matches('[data-division-switcher] a:nth-child(2)')`),true,'keyboard traversal');
  // Preview must never claim that a local-only form submitted an enquiry.
  assert.equal(await browser.evaluate(`document.querySelector('form button[type="submit"]').textContent.includes('إرسال')`),false);
  assert.equal(await browser.evaluate(`!!document.querySelector('a[href="mailto:info@agriculturecairo.com"]')`),true);
  const errors = browser.getErrors();
  assert.deepEqual(errors, [], 'no browser runtime errors');
  fs.writeFileSync(`${evidenceDir}/results.json`,JSON.stringify({passed:true,rows,errors},null,2));
  console.log(`PASS: 30 routes, 10 filter canonicals, redirects; ${rows.length} desktop/mobile locale layouts, navigation, language controls, keyboard and reduced motion.`);
} finally { await browser.close(); }
