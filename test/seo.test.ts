import assert from "node:assert/strict";
import fs from "node:fs";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { locales } from "../src/i18n/config";
import { divisionPageMetadata } from "../src/divisions/metadata";
import { pageMetadata } from "../src/seo/metadata";
import { absoluteUrl, INDEXABLE_LOCALIZED_PATHS, languageAlternates, localizedUrl, SITE_ORIGIN, SITE_LOGO } from "../src/seo/site";

assert.equal(localizedUrl("en", "/"), `${SITE_ORIGIN}/en`);
assert.equal(absoluteUrl("/en/products?world=frozen#atlas"), `${SITE_ORIGIN}/en/products`);
assert.ok(fs.existsSync(`public${SITE_LOGO}`));
const entries = sitemap();
assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
assert.ok(entries.every((entry) => !entry.url.includes('?') && !entry.url.endsWith('/') && !entry.lastModified));
assert.ok(!entries.some((entry) => entry.url.includes('/herbs-spices/standard')));
assert.deepEqual(entries.filter((entry) => entry.url.endsWith('/company')).map((entry) => entry.url), [`${SITE_ORIGIN}/en/company`]);
assert.ok(entries.some((entry) => entry.url === `${SITE_ORIGIN}/contact`));
for (const path of INDEXABLE_LOCALIZED_PATHS) {
  for (const locale of locales) {
    const entry = entries.find((entry) => entry.url === localizedUrl(locale, path));
    assert.ok(entry);
    assert.deepEqual(entry.alternates?.languages, languageAlternates(path));
    assert.equal(Object.keys(entry.alternates!.languages!).length, 6);
    const meta = pageMetadata(locale, path, { title: 'Test', description: 'Description' });
    assert.equal(meta.alternates?.canonical, entry.url);
    assert.deepEqual(meta.alternates?.languages, entry.alternates?.languages);
    assert.deepEqual(meta.robots, { index: true, follow: true });
  }
}
for (const locale of locales) {
  const restricted = divisionPageMetadata(locale, "herbs-spices", "standard");
  assert.deepEqual(restricted.robots, { index: false, follow: false });
  assert.equal(restricted.alternates?.languages, undefined);
  const company = pageMetadata(locale, "/company", { title: 'Company', description: 'Existing English body' }, { translated: false, canonicalLocale: 'en' });
  assert.equal(company.alternates?.canonical, `${SITE_ORIGIN}/en/company`);
  assert.equal(company.alternates?.languages, undefined);
}
assert.deepEqual(robots().rules, { userAgent: '*', allow: '/' });
assert.equal(robots().sitemap, `${SITE_ORIGIN}/sitemap.xml`);
console.log('✓ Canonical normalization, sitemap eligibility, reciprocal language policy, image existence and restricted-route policy');
