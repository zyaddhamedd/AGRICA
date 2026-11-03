import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.BASE_URL ?? 'http://localhost:3117';
const origin = 'https://www.agriculturecairo.com';
const locales = ['en','ar','ru','de','fr'];
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
function elements(html, tag) { return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(m=>Object.fromEntries([...m[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(a=>[a[1].toLowerCase(),decode(a[2])]))); }
async function read(path, bot = false) {
  const response = await fetch(base + path, { redirect:'manual', headers: bot ? {'user-agent':'Googlebot'} : {} });
  return { response, html: await response.text() };
}
const robot = await read('/robots.txt');
assert.equal(robot.response.status,200);
assert.ok(robot.html.includes('Allow: /') && robot.html.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok(!robot.html.includes('Disallow: /'));
const site = await read('/sitemap.xml');
assert.equal(site.response.status,200);
const urls = [...site.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
assert.equal(new Set(urls).size,urls.length);
assert.ok(!urls.some(u=>u.includes('?')||u.includes('/herbs-spices/standard')||u.endsWith('/')));
assert.deepEqual(urls.filter(u=>u.endsWith('/company')),[`${origin}/en/company`]);
assert.ok(!site.html.includes('<lastmod>'));
const results=[];
for(const url of urls) {
  const path = new URL(url).pathname;
  for(const bot of [false,true]) {
    const {response,html}=await read(path,bot);
    assert.equal(response.status,200,`${path}: direct status`);
    assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'));
    const links=elements(html,'link');const meta=elements(html,'meta');
    assert.deepEqual(links.filter(l=>l.rel==='canonical').map(l=>l.href),[url],`${path}: single canonical`);
    assert.ok(meta.some(m=>m.name==='robots'&&m.content==='index, follow'),`${path}: indexable`);
    assert.ok(meta.some(m=>m.property==='og:url'&&m.content===url),`${path}: OG canonical`);
    assert.ok(meta.some(m=>m.property==='og:title')&&meta.some(m=>m.name==='twitter:card'),`${path}: social`);
    const alternate=links.filter(l=>l.rel==='alternate'&&l.hreflang);
    if(path==='/contact'||path.endsWith('/company')) assert.equal(alternate.length,0);
    else {
      assert.equal(alternate.length,6,`${path}: complete language set`);
      for(const locale of [...locales,'x-default']) {
        const target=path.replace(/^\/(en|ar|ru|de|fr)(?=\/|$)/,`/${locale==='x-default'?'en':locale}`);
        assert.equal(alternate.find(l=>l.hreflang===locale)?.href,origin+target,`${path}: alternate ${locale}`);
        assert.ok(urls.includes(origin+target),`${path}: alternate must be canonical in sitemap`);
      }
    }
    const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    if(path!=='/contact') assert.ok(schemas.some(s=>s['@graph']?.some(n=>n['@type']==='Organization')));
    assert.ok(!schemas.some(s=>JSON.stringify(s).match(/"@type":"(?:Offer|AggregateRating|Review|Product)"/)), 'no unsupported shopping markup');
    if(/\/products\/[^/]+$/.test(path)) {
      assert.equal((html.match(/<h1\b/g)||[]).length,1,`${path}: one product heading`);
      assert.ok(html.includes('data-product-profile')&&html.includes('mailto:info@agriculturecairo.com'));
      assert.ok(schemas.some(s=>s['@type']==='BreadcrumbList'));
      assert.ok(html.includes('lang="en"'),`${path}: source-language technical values`);
    }
  }
  results.push({path,canonical:url,normalAndGooglebot:true});
}
for(const locale of locales) {
  const restricted=await read(`/${locale}/herbs-spices/standard`);
  assert.equal(restricted.response.status,200);
  assert.ok(restricted.html.includes('name="robots" content="noindex, nofollow"'));
  assert.equal(elements(restricted.html,'link').filter(l=>l.hreflang).length,0);
  const company=await read(`/${locale}/company`);
  assert.equal(company.response.status,200);
  assert.deepEqual(elements(company.html,'link').filter(l=>l.rel==='canonical').map(l=>l.href),[`${origin}/en/company`]);
  for(const [suffix,query] of [['/products','?world=frozen'],['/herbs-spices/products','?family=flowers']]) {
    const {html}=await read(`/${locale}${suffix}${query}`);
    assert.deepEqual(elements(html,'link').filter(l=>l.rel==='canonical').map(l=>l.href),[`${origin}/${locale}${suffix}`]);
  }
}
for(const path of ['/es/herbs-spices','/xx/products','/en/products/not-a-product','/ar/products/half-fried-french-fries','/xx/products/oranges']) {
  const {response,html}=await read(path,true);assert.equal(response.status,404,`${path}: unknown route`);
  assert.ok(!elements(html,'meta').some(m=>m.name==='robots'&&m.content==='index, follow'),`${path}: not indexable`);
}
const root=await read('/');assert.equal(root.response.status,308);assert.equal(root.response.headers.get('location'),'/en');
const out=process.env.QA_OUTPUT_DIR??'docs/seo/evidence';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/http-validation.json`,JSON.stringify({passed:true,sitemapUrls:urls.length,results,restrictedRoutes:5,companyCopies:5,filterVariants:10,invalidRoutes:5},null,2)+'\n');
console.log(`PASS: ${urls.length} sitemap canonical URLs × normal/Googlebot, reciprocal hreflang, social/JSON-LD, restrictions, duplicate Company policy, filters and 404s.`);
