import assert from "node:assert/strict";
import fs from "node:fs";
import { PRODUCT_CARD_FIELD_LABELS } from "../src/content/produce/product-card-labels";
import {
  PRODUCT_CARD_CONTENT,
  PUBLIC_PRODUCT_CARD_CONTENT,
} from "../src/data/productCardContent";
import { PRODUCT_LIBRARY } from "../src/data/products";
import { locales } from "../src/i18n/config";

const catalogueProducts = Object.values(PRODUCT_LIBRARY).flatMap((world) =>
  world.families.flatMap((family) => family.products),
);
const catalogueIds = catalogueProducts.map((product) => product.id).sort();
const registryIds = Object.keys(PRODUCT_CARD_CONTENT).sort();
const publicIds = Object.keys(PUBLIC_PRODUCT_CARD_CONTENT).sort();

assert.equal(catalogueProducts.length, 37);
assert.deepEqual(registryIds, catalogueIds, "internal registry must cover the canonical 37 products exactly");
assert.deepEqual(publicIds, catalogueIds, "public registry must cover the canonical 37 products exactly");

const categoryCounts = { fresh: 0, frozen: 0, dried: 0 };
const forbiddenPublicClaims = /GlobalG\.A\.P\.|\bClass I\b|Phytosanitary Certified|BRC|HACCP|organic certification/i;

for (const product of catalogueProducts) {
  const internal = PRODUCT_CARD_CONTENT[product.id];
  const publicContent = PUBLIC_PRODUCT_CARD_CONTENT[product.id];
  assert.ok(internal, `${product.id} is missing internal content`);
  assert.ok(publicContent, `${product.id} is missing public content`);
  assert.equal(internal.productId, product.id);
  assert.equal(publicContent.productId, product.id);
  assert.equal(internal.category, product.worldId);
  assert.equal(publicContent.category, product.worldId);
  categoryCounts[internal.category] += 1;

  assert.ok(internal.fields.length >= 6 && internal.fields.length <= 7, `${product.id} must have 6–7 fields`);
  assert.equal(publicContent.fields.length, internal.fields.length);
  assert.equal(new Set(internal.fields.map((field) => field.labelKey)).size, internal.fields.length, `${product.id} has duplicate rows`);
  assert.deepEqual(internal.fields.map((field) => field.displayOrder), internal.fields.map((_, index) => index + 1));
  assert.ok(internal.clientReview.required, `${product.id} must remain client-reviewable`);
  assert.ok(internal.clientReview.assumptions.length > 0, `${product.id} needs an assumption register`);
  assert.ok(internal.sourceRefs.length > 0, `${product.id} needs source metadata`);
  assert.ok(internal.imageBrief.brief.trim(), `${product.id} needs an image brief`);

  for (const field of internal.fields) {
    assert.ok(field.value.trim(), `${product.id}/${field.labelKey} has an empty value`);
    assert.ok(field.sourceRefs.length > 0, `${product.id}/${field.labelKey} has no source reference`);
    assert.equal(field.reviewRequired, true, `${product.id}/${field.labelKey} must remain reviewable`);
    if (field.assumed) {
      assert.ok(field.assumptionReason?.trim(), `${product.id}/${field.labelKey} needs an assumption reason`);
    }
    assert.doesNotMatch(`${field.labelKey} ${field.value}`, forbiddenPublicClaims, `${product.id} contains a forbidden public claim`);
  }

  for (const field of publicContent.fields) {
    assert.deepEqual(
      Object.keys(field).sort(),
      ["displayOrder", "labelKey", "value"],
      `${product.id}/${field.labelKey} leaked governance metadata`,
    );
    assert.notEqual(field.labelKey, "origin", `${product.id} injected a legacy origin row`);
  }

  console.log(`✓ ${product.id}: ${publicContent.fields.length} finalized fields`);
}

assert.deepEqual(categoryCounts, { fresh: 20, frozen: 11, dried: 6 });
assert.equal(
  PRODUCT_CARD_CONTENT["produce:half-fried-french-fries"].publicName,
  "Pre-fried Frozen French Fries",
);

for (const locale of locales) {
  const localeLabels = PRODUCT_CARD_FIELD_LABELS[locale];
  for (const content of Object.values(PUBLIC_PRODUCT_CARD_CONTENT)) {
    for (const field of content.fields) {
      assert.ok(localeLabels[field.labelKey]?.trim(), `${locale}/${field.labelKey} is missing a localized label`);
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
  assert.doesNotMatch(source, /getProductSpecData|VERIFIED_PRODUCT_SPECS/, `${componentPath} still consumes legacy specs`);
}

console.log("✓ 37/37 product cards use the finalized registry");
console.log("✓ Fresh 20 / Frozen 11 / Dried 6");
console.log("✓ No empty values, duplicate rows, legacy origin rows, or forbidden certification claims");
console.log("✓ Internal governance metadata is absent from the public projection");
console.log("✓ All field labels exist in en, ar, ru, de, and fr");
