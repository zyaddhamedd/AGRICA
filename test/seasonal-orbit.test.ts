import assert from "node:assert/strict";
import { locales } from "../src/i18n/config";
import { seasonEditorialDictionary } from "../src/content/season-editorial-dictionaries";
import { PRODUCT_LIBRARY } from "../src/data/products";
import {
  HERO_BY_MONTH,
  MONTHS,
  SEASONAL_PRODUCTS,
  SEASON_SOURCES,
  getHeroForMonth,
  getProductsStartingNextMonth,
  getSeasonalProductsForMonth,
  isSeasonActive,
} from "../src/data/seasons";

const catalogueIds = new Set(
  Object.values(PRODUCT_LIBRARY).flatMap((world) =>
    world.families.flatMap((family) => family.products.map((product) => product.id)),
  ),
);
const sourceIds = new Set(SEASON_SOURCES.map((source) => source.id));

assert.equal(MONTHS.length, 12, "orbit contains all twelve months");
assert.equal(Object.keys(HERO_BY_MONTH).length, 12, "every month has exactly one explicit hero");

for (const entry of SEASONAL_PRODUCTS) {
  assert.ok(catalogueIds.has(entry.productId), `${entry.productId} exists in the AGRICA catalog`);
  assert.equal(Object.keys(entry.monthly).length, 12, `${entry.productId} has a complete monthly matrix`);
  entry.sourceIds.forEach((sourceId) => assert.ok(sourceIds.has(sourceId), `${entry.productId} source ${sourceId} exists`));
}

for (const month of MONTHS) {
  const hero = getHeroForMonth(month.number);
  assert.equal(hero.productId, HERO_BY_MONTH[month.number], `${month.name} uses the curated hero mapping`);
  assert.ok(hero.heroEligible, `${month.name} hero is eligible`);
  assert.ok(hero.agricaApproved, `${month.name} hero is approved`);
  assert.ok(isSeasonActive(hero.monthly[month.number]), `${month.name} hero is in its planning window`);
  assert.ok(
    getSeasonalProductsForMonth(month.number).every((entry) => entry.agricaApproved),
    `${month.name} hides unapproved seasonal products`,
  );
  assert.ok(
    getProductsStartingNextMonth(month.number).every((entry) => entry.agricaApproved),
    `${month.name} next-month preview hides unapproved products`,
  );
}

for (const locale of locales) {
  const copy = seasonEditorialDictionary(locale);
  assert.ok(copy.titleLead.trim(), `${locale} seasonal title is localized`);
  assert.ok(copy.disclaimer.trim(), `${locale} disclaimer is localized`);
  assert.deepEqual(Object.keys(copy.status), ["peak", "in-season", "opening", "final"]);
}

assert.equal(SEASONAL_PRODUCTS.find((entry) => entry.productId === "produce:blueberry")?.agricaApproved, false);
assert.equal(SEASONAL_PRODUCTS.find((entry) => entry.productId === "produce:guava")?.agricaApproved, false);

console.log("Editorial Orbit seasonal data validation passed.");
