import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildProductAtlasItems } from "../src/data/productCatalogue";
import { productImageFor } from "../src/data/productImages";
import { getProductSpecData } from "../src/data/productSpecs";
import {
  PRODUCT_LIBRARY,
  countProductsInWorld,
  totalCatalogueCount,
} from "../src/data/products";

const EXPECTED_CATALOGUE = {
  fresh: {
    label: "Fresh produce",
    families: [
      {
        id: "citrus",
        name: "Citrus",
        code: "CIT",
        products: ["Oranges", "Lemons", "Egyptian Limes", "Mandarins"],
      },
      {
        id: "fresh-fruits",
        name: "Fresh Fruits",
        code: "FRT",
        products: [
          "Grapes",
          "Pomegranates",
          "Strawberries",
          "Blueberries",
          "Mangoes",
          "Guava",
          "Dates",
          "Watermelon",
        ],
      },
      {
        id: "vegetables-tubers",
        name: "Vegetables & Tubers",
        code: "VEG",
        products: [
          "Potatoes",
          "Sweet Potatoes",
          "Onions",
          "Garlic",
          "Green Beans",
          "Artichokes",
          "Carrots",
          "Taro",
        ],
      },
    ],
  },
  frozen: {
    label: "Frozen produce",
    families: [
      {
        id: "iqf-fruits",
        name: "IQF Fruits",
        code: "IQF",
        products: ["IQF Strawberries", "IQF Mango", "IQF Pomegranate Arils"],
      },
      {
        id: "iqf-vegetables",
        name: "IQF Vegetables",
        code: "IQV",
        products: [
          "IQF Green Beans",
          "IQF Green Peas",
          "IQF Okra",
          "IQF Molokhia",
          "IQF Artichokes",
          "IQF Broccoli",
          "Mixed Vegetables",
        ],
      },
      {
        id: "frozen-potato-products",
        name: "Frozen Potato Products",
        code: "FPP",
        products: ["Half-Fried French Fries"],
      },
    ],
  },
  dried: {
    label: "Dried produce",
    families: [
      {
        id: "dried-fruits",
        name: "Dried Fruits",
        code: "DRF",
        products: ["Dried Lemon", "Raisins"],
      },
      {
        id: "dried-vegetables",
        name: "Dried Vegetables",
        code: "DRV",
        products: [
          "Sun-Dried Tomatoes",
          "Dehydrated Onion",
          "Dehydrated Garlic",
          "Dried Molokhia",
        ],
      },
    ],
  },
} as const;

const visibleCatalogue = Object.fromEntries(
  Object.entries(PRODUCT_LIBRARY).map(([worldId, world]) => [
    worldId,
    {
      label: world.label,
      families: world.families.map((family) => ({
        id: family.id,
        name: family.name,
        code: family.code,
        products: family.products.map((product) => product.name),
      })),
    },
  ]),
);
assert.deepEqual(visibleCatalogue, EXPECTED_CATALOGUE, "visible catalogue structure or ordering changed");
assert.equal(countProductsInWorld("fresh"), 20);
assert.equal(countProductsInWorld("frozen"), 11);
assert.equal(countProductsInWorld("dried"), 6);
assert.equal(totalCatalogueCount(), 37);

const atlasItems = buildProductAtlasItems();
assert.equal(atlasItems.length, 37);
assert.equal(new Set(atlasItems.map((item) => item.id)).size, 37, "product identities must be unique");
assert.ok(atlasItems.every((item) => item.id.startsWith("produce:")));
assert.ok(atlasItems.every((item) => item.divisionId === "produce"));
assert.ok(atlasItems.every((item) => item.familyId.length > 0 && item.mediaKey.length > 0));
const families = Object.values(PRODUCT_LIBRARY).flatMap((world) => world.families);
assert.equal(new Set(families.map((family) => family.id)).size, families.length, "family identities must be unique");

const obsoleteNames = [
  "Grapefruit",
  "Melons",
  "Tomatoes",
  "Bell Peppers",
  "Chili Peppers",
  "Cucumbers",
  "Zucchini",
  "Eggplant",
  "Cauliflower",
  "Cabbage",
  "Spinach",
  "Sweet Corn",
  "Broad Beans",
  "Peas & Carrots",
];
for (const obsoleteName of obsoleteNames) {
  assert.equal(
    atlasItems.some((item) => item.name === obsoleteName),
    false,
    `${obsoleteName} must not remain in the canonical catalogue`,
  );
}

const expectedDedicatedImages = new Map<string, string>([
  ["produce:orange", "/assets/products/fresh/oranges.avif"],
  ["produce:lemon", "/assets/products/fresh/lemons.avif"],
  ["produce:egyptian-lime", "/assets/products/fresh/egyptian-limes.avif"],
  ["produce:mandarin", "/assets/products/fresh/mandarins.avif"],
  ["produce:iqf-strawberry", "/assets/products/frozen/strawberries.avif"],
  ["produce:iqf-mango", "/assets/products/frozen/mango.avif"],
  ["produce:iqf-pomegranate-arils", "/assets/products/frozen/pomegranate-arils.avif"],
  ["produce:iqf-green-bean", "/assets/products/frozen/green-beans.avif"],
  ["produce:iqf-green-pea", "/assets/products/frozen/green-peas.avif"],
  ["produce:iqf-okra", "/assets/products/frozen/okra.avif"],
  ["produce:iqf-molokhia", "/assets/products/frozen/molokhia.avif"],
  ["produce:iqf-artichoke", "/assets/products/frozen/artichokes.avif"],
]);

for (const [productId, imageSrc] of expectedDedicatedImages) {
  assert.equal(productImageFor(productId), imageSrc, `${productId} image mapping changed`);
  assert.ok(
    fs.existsSync(path.join("public", imageSrc.replace(/^\//, ""))),
    `${imageSrc} is missing from public assets`,
  );
}

assert.equal(productImageFor("produce:blueberry"), undefined);

const freshStrawberries = atlasItems.find((item) => item.id === "produce:fresh-strawberry");
const iqfStrawberries = atlasItems.find((item) => item.id === "produce:iqf-strawberry");
assert.ok(freshStrawberries && iqfStrawberries);
assert.ok(getProductSpecData(freshStrawberries).varieties?.length);
assert.equal(getProductSpecData(iqfStrawberries).varieties, undefined);
assert.equal(getProductSpecData(iqfStrawberries).defaultSpecs?.harvestWindow, undefined);

const oranges = atlasItems.find((item) => item.id === "produce:orange");
assert.ok(oranges);
const renamedOranges = { ...oranges, name: "Localized display name" };
assert.equal(productImageFor(renamedOranges.id), "/assets/products/fresh/oranges.avif");
assert.deepEqual(getProductSpecData(renamedOranges), getProductSpecData(oranges));

console.log("✓ Canonical catalogue: Fresh 20 + Frozen 11 + Dried 6 = 37");
console.log("✓ Exact families, ordering, identities, image mappings, fallbacks, and spec isolation verified");
