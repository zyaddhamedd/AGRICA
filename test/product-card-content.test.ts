import assert from "node:assert/strict";
import fs from "node:fs";
import { PRODUCT_CARD_FIELD_LABELS } from "../src/content/produce/product-card-labels";
import { PRODUCT_CARD_CONTENT, PUBLIC_PRODUCT_CARD_CONTENT } from "../src/data/productCardContent";
import { PRODUCT_LIBRARY } from "../src/data/products";
import { locales } from "../src/i18n/config";

const catalogueProducts = Object.values(PRODUCT_LIBRARY).flatMap((world) =>
  world.families.flatMap((family) => family.products),
);
const catalogueIds = catalogueProducts.map(({ id }) => id).sort();
assert.equal(catalogueProducts.length, 34);
assert.deepEqual(Object.keys(PRODUCT_CARD_CONTENT).sort(), catalogueIds);
assert.deepEqual(Object.keys(PUBLIC_PRODUCT_CARD_CONTENT).sort(), catalogueIds);

const unmatchedId = "produce:half-fried-french-fries";
let approvedCount = 0;
const categoryCounts: Record<string, number> = { fresh: 0, frozen: 0 };

for (const product of catalogueProducts) {
  const internal = PRODUCT_CARD_CONTENT[product.id];
  const publicContent = PUBLIC_PRODUCT_CARD_CONTENT[product.id];
  assert.ok(internal && publicContent, `${product.id} is missing card content`);
  assert.equal(internal.category, product.worldId);
  assert.equal(publicContent.category, product.worldId);
  categoryCounts[internal.category] += 1;
  assert.equal(new Set(internal.fields.map(({ labelKey }) => labelKey)).size, internal.fields.length);
  assert.deepEqual(internal.fields.map(({ displayOrder }) => displayOrder), internal.fields.map((_, index) => index + 1));

  for (const field of internal.fields) {
    assert.ok(field.value.trim(), `${product.id}/${field.labelKey} is empty`);
    assert.ok(field.sourceRefs.length, `${product.id}/${field.labelKey} has no source`);
  }

  if (product.id === unmatchedId) {
    assert.equal(internal.clientReview.required, true);
    assert.ok(internal.fields.every(({ assumed, reviewRequired }) => assumed && reviewRequired));
    continue;
  }

  approvedCount += 1;
  assert.equal(internal.clientReview.required, false, `${product.id} should be client-approved`);
  assert.ok(internal.fields.length >= 11 && internal.fields.length <= 14, `${product.id} has an unexpected source-row count`);
  assert.ok(internal.fields.every(({ assumed, reviewRequired }) => !assumed && !reviewRequired));
  assert.ok(internal.sourceRefs[0]?.includes("client-approved"));
  assert.ok(publicContent.fields.some(({ labelKey }) => labelKey === "product"));
  assert.ok(publicContent.fields.some(({ labelKey }) => labelKey === "origin"));

  for (const field of publicContent.fields) {
    assert.deepEqual(Object.keys(field).sort(), ["displayOrder", "labelKey", "value"]);
  }
}

assert.equal(approvedCount, 33);
assert.deepEqual(categoryCounts, { fresh: 21, frozen: 13 });
assert.equal(PRODUCT_CARD_CONTENT[unmatchedId].publicName, "Pre-fried Frozen French Fries");

for (const locale of locales) {
  for (const content of Object.values(PUBLIC_PRODUCT_CARD_CONTENT)) {
    for (const field of content.fields) {
      assert.ok(PRODUCT_CARD_FIELD_LABELS[locale][field.labelKey]?.trim(), `${locale}/${field.labelKey} label missing`);
    }
  }
}

for (const componentPath of [
  "src/components/products/ProductFlipCard.tsx",
  "src/components/products/ProductCardBack.tsx",
  "src/components/products/ProductSpecTable.tsx",
  "src/components/products/ProductDetailSheet.tsx",
]) {
  const source = fs.readFileSync(componentPath, "utf8");
  assert.doesNotMatch(source, /getProductSpecData|VERIFIED_PRODUCT_SPECS/);
}

console.log("✓ 33/33 approved source products use official specifications");
console.log("✓ 1 unmatched catalogue product remains explicitly reviewable");
console.log("✓ All specification labels exist in EN, AR, RU, DE, and FR");
