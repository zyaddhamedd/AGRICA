import assert from "node:assert/strict";
import {
  buildProductAtlasItems,
  filterProductAtlasItems,
  toggleQuoteItem,
} from "../src/data/productCatalogue";
import type { ProductAtlasItem, QuoteItem, WorldId } from "../src/types/agrica";

const items = buildProductAtlasItems();

function search(searchQuery: string): ProductAtlasItem[] {
  return filterProductAtlasItems(items, {
    activeWorld: "fresh",
    activeFamilyId: null,
    searchQuery,
  });
}

function family(activeWorld: WorldId, activeFamilyId: ProductAtlasItem["familyId"]): ProductAtlasItem[] {
  return filterProductAtlasItems(items, {
    activeWorld,
    activeFamilyId,
    searchQuery: "",
  });
}

assert.deepEqual(
  search("IQF").map((item) => item.name),
  [
    "IQF Strawberries",
    "IQF Mango",
    "IQF Pomegranate Arils",
    "IQF Green Beans",
    "IQF Green Peas",
    "IQF Okra",
    "IQF Molokhia",
    "IQF Artichokes",
    "IQF Broccoli",
    "Mixed Vegetables",
  ],
);
assert.deepEqual(search("Dried").map((item) => item.name), [
  "Dried Lemon",
  "Raisins",
  "Sun-Dried Tomatoes",
  "Dehydrated Onion",
  "Dehydrated Garlic",
  "Dried Molokhia",
]);
assert.deepEqual(search("Dehydrated").map((item) => item.name), [
  "Dehydrated Onion",
  "Dehydrated Garlic",
]);

for (const renamedProduct of [
  "IQF Strawberries",
  "IQF Mango",
  "IQF Pomegranate Arils",
  "IQF Green Beans",
  "IQF Green Peas",
  "IQF Okra",
  "IQF Molokhia",
  "IQF Artichokes",
  "IQF Broccoli",
  "Dried Lemon",
  "Sun-Dried Tomatoes",
  "Dehydrated Onion",
  "Dehydrated Garlic",
  "Dried Molokhia",
]) {
  assert.ok(search(renamedProduct).some((item) => item.name === renamedProduct));
}

assert.equal(family("fresh", "citrus").length, 4);
assert.equal(family("fresh", "fresh-fruits").length, 8);
assert.equal(family("fresh", "vegetables-tubers").length, 8);
assert.equal(family("frozen", "iqf-fruits").length, 3);
assert.equal(family("frozen", "iqf-vegetables").length, 7);
assert.deepEqual(family("frozen", "frozen-potato-products").map((item) => item.name), ["Half-Fried French Fries"]);
assert.equal(family("dried", "dried-fruits").length, 2);
assert.equal(family("dried", "dried-vegetables").length, 4);

const oranges = items.find((item) => item.id === "produce:orange");
const iqfMango = items.find((item) => item.id === "produce:iqf-mango");
assert.ok(oranges && iqfMango);

let quoteItems: QuoteItem[] = [];
quoteItems = toggleQuoteItem(quoteItems, oranges);
assert.deepEqual(quoteItems, [
  {
    id: "produce:orange",
    name: "Oranges",
    world: "Fresh produce",
    family: "Citrus",
  },
]);
quoteItems = toggleQuoteItem(quoteItems, iqfMango);
assert.equal(quoteItems.length, 2);
assert.equal(quoteItems[1]?.name, "IQF Mango");
const renamedOranges = { ...oranges, name: "Localized display name" };
quoteItems = toggleQuoteItem(quoteItems, renamedOranges);
assert.deepEqual(quoteItems.map((item) => item.id), ["produce:iqf-mango"]);
quoteItems = toggleQuoteItem(quoteItems, renamedOranges);
assert.deepEqual(quoteItems.map((item) => item.id), ["produce:iqf-mango", "produce:orange"]);
quoteItems = toggleQuoteItem(quoteItems, oranges);
assert.deepEqual(quoteItems.map((item) => item.name), ["IQF Mango"]);
quoteItems = toggleQuoteItem(quoteItems, iqfMango);
assert.deepEqual(quoteItems, []);

console.log("✓ Search, exact family filtering, and quote add/remove behavior verified");
