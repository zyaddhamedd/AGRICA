import assert from "node:assert/strict";
import { locales } from "../src/i18n/config";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "../src/content/page-dictionaries";
import { buildProductAtlasItems, filterProductAtlasItems, toggleQuoteItem } from "../src/data/productCatalogue";
import { HERBS_SPICES_CATALOGUE, HERBS_SPICES_FAMILIES } from "../src/data/herbs-spices/catalogue";
import { getHerbsSpicesMedia } from "../src/data/herbs-spices/media";
import { productImageFor } from "../src/data/productImages";

function assertNoEmptyStrings(value: unknown, path: string): void {
  if (typeof value === "string") { assert.ok(value.trim(), `${path} must not be empty`); return; }
  if (Array.isArray(value)) { value.forEach((entry, index) => assertNoEmptyStrings(entry, `${path}[${index}]`)); return; }
  if (value && typeof value === "object") Object.entries(value).forEach(([key, entry]) => assertNoEmptyStrings(entry, `${path}.${key}`));
}

for (const locale of locales) {
  const home = homeDictionary(locale);
  const produce = productsDictionary(locale);
  const herbs = herbsSpicesDictionary(locale);
  const atlas = buildProductAtlasItems(produce);

  assert.equal(atlas.length, 37, `${locale}: all Produce products are localized`);
  assert.equal(Object.keys(produce.products).length, 37, `${locale}: Produce translation completeness`);
  assert.equal(Object.keys(produce.families).length, 8, `${locale}: Produce family completeness`);
  assert.equal(Object.keys(herbs.products).length, 27, `${locale}: Herbs translation completeness`);
  assert.equal(Object.keys(herbs.families).length, 6, `${locale}: Herbs family completeness`);
  assert.equal(home.season.months.length, 12, `${locale}: month completeness`);
  assert.ok(herbs.forms.Powder, `${locale}: source-cased product form is localized`);
  assertNoEmptyStrings(home, `${locale}.home`);
  assertNoEmptyStrings(herbs.homepage, `${locale}.herbsSpices.homepage`);
  assert.deepEqual(Object.keys(produce.worlds), ["fresh", "frozen", "dried"], `${locale}: world query values remain canonical`);
  assert.deepEqual(Object.keys(herbs.families), HERBS_SPICES_FAMILIES.map(({ id }) => id), `${locale}: Herbs family query values remain canonical`);

  for (const item of atlas) {
    assert.ok(produce.products[item.id]?.name, `${locale}: missing ${item.id}`);
    assert.equal(item.mediaKey, buildProductAtlasItems()[atlas.indexOf(item)].mediaKey, `${locale}: media identity remains stable`);
  }
  for (const item of HERBS_SPICES_CATALOGUE) {
    assert.ok(herbs.products[item.id]?.name, `${locale}: missing ${item.id}`);
    assert.equal(getHerbsSpicesMedia(item.mediaKey)?.key, item.mediaKey, `${locale}: Herbs media identity remains stable`);
  }

  const localizedOrange = produce.products["produce:orange"].name;
  const localizedResults = filterProductAtlasItems(atlas, { activeWorld: "dried", activeFamilyId: null, searchQuery: localizedOrange });
  const englishAliasResults = filterProductAtlasItems(atlas, { activeWorld: "dried", activeFamilyId: null, searchQuery: "Oranges" });
  assert.equal(localizedResults[0]?.id, "produce:orange", `${locale}: localized Produce search`);
  assert.equal(englishAliasResults[0]?.id, "produce:orange", `${locale}: English Produce alias search`);

  const quote = toggleQuoteItem([], atlas[0]);
  assert.equal(quote[0].id, atlas[0].id, `${locale}: quote identity uses canonical ID`);
  assert.equal(productImageFor("produce:orange"), "/assets/products/fresh/oranges.avif");
  const localizedHerb = herbs.products["herbs-spices:red-chilli-pepper"];
  assert.ok(localizedHerb.aliases.some((alias) => alias.toLocaleLowerCase().includes("red chilli pepper")), `${locale}: Herbs English alias search`);
}

assert.deepEqual(HERBS_SPICES_FAMILIES.map(({ id }) => id), ["herbs", "flowers", "seeds", "spices", "roots", "dehydrated-vegetables"]);
assert.equal(productsDictionary("ar").products["produce:orange"].aliases.includes("Oranges"), true);
assert.equal(herbsSpicesDictionary("de").products["herbs-spices:basil"].aliases.includes("Basil"), true);

console.log("Phase 3A localization, search aliases, and stable identity checks passed.");
