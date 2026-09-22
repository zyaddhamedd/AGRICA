import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  HERBS_SPICES_AVAILABLE_FORMS,
  HERBS_SPICES_CATALOGUE,
  HERBS_SPICES_FAMILIES,
} from "../src/data/herbs-spices/catalogue";
import { HERBS_SPICES_HOMEPAGE } from "../src/data/herbs-spices/homepage";
import { HERBS_SPICES_MEDIA, HERBS_SPICES_MEDIA_MANIFEST } from "../src/data/herbs-spices/media";

console.log("--- AGRICA Herbs & Spices Catalogue Verification ---");

const expectedCounts = {
  herbs: 11,
  flowers: 3,
  seeds: 8,
  spices: 2,
  roots: 1,
  "dehydrated-vegetables": 2,
} as const;

assert.equal(HERBS_SPICES_CATALOGUE.length, 27);
assert.equal(HERBS_SPICES_FAMILIES.length, 6);
assert.equal(new Set(HERBS_SPICES_CATALOGUE.map((item) => item.id)).size, 27);
assert.equal(new Set(HERBS_SPICES_CATALOGUE.map((item) => item.slug)).size, 27);

for (const family of HERBS_SPICES_FAMILIES) {
  assert.equal(
    HERBS_SPICES_CATALOGUE.filter((item) => item.familyId === family.id).length,
    expectedCounts[family.id],
    `${family.label} count`,
  );
}

for (const name of ["Basil", "Chamomile", "Black Cumin", "Red Chilli Pepper", "Licorice Root", "Onion", "Garlic"]) {
  assert.ok(HERBS_SPICES_CATALOGUE.some((item) => item.name === name), `${name} must be present`);
}

assert.deepEqual(
  HERBS_SPICES_AVAILABLE_FORMS.map((form) => form.label),
  ["Whole", "Cut & Sifted", "TBC (Tea Bag Cut)", "Crushed", "Powder"],
);
assert.deepEqual(HERBS_SPICES_CATALOGUE.find((item) => item.name === "Onion")?.forms, ["Flakes", "Granules", "Powder"]);
assert.deepEqual(HERBS_SPICES_CATALOGUE.find((item) => item.name === "Garlic")?.forms, []);

assert.deepEqual(HERBS_SPICES_HOMEPAGE.families.map((family) => family.id), HERBS_SPICES_FAMILIES.map((family) => family.id));
assert.deepEqual(HERBS_SPICES_HOMEPAGE.forms.map((form) => form.name), HERBS_SPICES_AVAILABLE_FORMS.map((form) => form.label));

assert.equal(HERBS_SPICES_MEDIA_MANIFEST.length, 49);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.homepage).length, 5);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.families).length, 6);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.forms).length, 5);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.products).length, 27);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.process).length, 6);
assert.equal(new Set(HERBS_SPICES_MEDIA_MANIFEST.map((entry) => entry.key)).size, 49);
const manifestKeys = new Set(HERBS_SPICES_MEDIA_MANIFEST.map((entry) => entry.key));
for (const item of HERBS_SPICES_CATALOGUE) {
  assert.ok(item.id.startsWith("herbs-spices:"));
  assert.equal(item.mediaKey, `product-${item.slug}`);
  assert.equal(item.status, "source-backed");
  assert.equal(item.verified, true);
  assert.ok(manifestKeys.has(item.mediaKey), `${item.mediaKey} must have a future media slot`);
  for (const field of ["origin", "season", "packaging", "moq", "certifications", "incoterms", "availability"] as const) {
    assert.equal(field in item, false, `${item.id} must not fabricate ${field}`);
  }
}

const renamedHerb = { ...HERBS_SPICES_CATALOGUE[0], name: "Localized display name" };
assert.equal(renamedHerb.id, HERBS_SPICES_CATALOGUE[0].id);
assert.equal(renamedHerb.mediaKey, HERBS_SPICES_CATALOGUE[0].mediaKey);

assert.deepEqual(HERBS_SPICES_MEDIA_MANIFEST.filter((entry) => entry.status === "approved").map((entry) => entry.key), [
  "hero-primary",
  "family-herbs",
  "family-flowers",
  "family-seeds",
  "family-spices",
  "family-roots",
  "family-dehydrated-vegetables",
  "form-whole",
  "form-cut-sifted",
  "form-tbc",
  "form-crushed",
  "form-powder",
  "product-basil",
  "product-dill",
  "product-lemon-grass",
  "product-marjoram",
  "product-moringa",
  "product-oregano",
  "product-parsley",
  "product-peppermint",
  "product-rosemary",
  "product-spearmint",
  "product-chamomile",
  "product-black-cumin",
]);
for (const entry of HERBS_SPICES_MEDIA_MANIFEST) {
  assert.ok(entry.src.startsWith("/assets/herbs-spices/"));
  assert.ok(entry.src.endsWith(".webp"));
  assert.ok(entry.width > 0 && entry.height > 0);
  assert.ok(entry.sizes.length > 0);
  if (entry.status === "approved") assert.ok(existsSync(join(process.cwd(), "public", entry.src)), `${entry.key} approved asset must exist`);
}

console.log("✓ 27 source-backed records across 6 exact families");
console.log("✓ Division forms, Onion forms, stable IDs, and media slots verified");
console.log("✓ 49-slot homepage, family, form, product, and process media manifest verified");
