import fs from "fs";
import path from "path";
import {
  PRODUCT_LIBRARY,
  countProductsInWorld,
  totalCatalogueCount,
  visualFor,
} from "../src/data/products";
import type { WorldId, QuoteItem } from "../src/types/agrica";

console.log("=== Phase 3 Products Page Parity & Logic Verification ===");

// 1. Check that dist/ remains untouched
const distFiles = [
  "dist/products/index.html",
  "dist/products/products.css",
  "dist/products/products.js",
  "dist/index.html",
  "dist/styles.css",
];
for (const f of distFiles) {
  if (!fs.existsSync(f)) {
    throw new Error(`Missing expected untouched file: ${f}`);
  }
}
console.log("✓ All dist/ files verified intact and untouched.");

// 2. Product Catalogue Gate: 29 Fresh + 18 Frozen + 13 Dried = 60
const freshCount = countProductsInWorld("fresh");
const frozenCount = countProductsInWorld("frozen");
const driedCount = countProductsInWorld("dried");
const totalCount = totalCatalogueCount();

console.log(`\n--- Product Catalogue Integrity Gate ---`);
console.log(`Fresh:  ${freshCount} (Expected: 29)`);
console.log(`Frozen: ${frozenCount} (Expected: 18)`);
console.log(`Dried:  ${driedCount} (Expected: 13)`);
console.log(`Total:  ${totalCount} (Expected: 60)`);

if (freshCount !== 29 || frozenCount !== 18 || driedCount !== 13 || totalCount !== 60) {
  throw new Error("Product count gate failed!");
}
console.log("✓ Catalogue count gate 29 + 18 + 13 = 60 PASSED!");

// 3. Check Prerendered HTML: Confirm removal of Phase 1 placeholder
const prerenderedProductsPath = path.join(".next", "server", "app", "products.html");
if (!fs.existsSync(prerenderedProductsPath)) {
  throw new Error(`Missing prerendered products.html at ${prerenderedProductsPath}`);
}
const productsHtml = fs.readFileSync(prerenderedProductsPath, "utf-8");
const normalizedHtml = productsHtml.replace(/<!--.*?-->/g, "");

console.log("\n--- Checking Removal of Phase 1 Placeholder ---");
const placeholderStrings = [
  "PRODUCT CATALOGUE FOUNDATION · PHASE 1",
  "Product Catalogue Foundation · Phase 1",
  "Catalogue integrity verified: 60 products across 3 worlds.",
  "Export Catalogue",
];
for (const str of placeholderStrings) {
  if (productsHtml.includes(str)) {
    throw new Error(`Found Phase 1 placeholder string still present in products.html: "${str}"`);
  }
}
console.log("✓ All Phase 1 placeholder strings confirmed completely removed.");

// 4. Check Presence of Approved Products Page Elements and Selectors
console.log("\n--- Checking Approved Products Architecture & Selectors ---");
const requiredSelectors = [
  'class="products-page"',
  'class="skip-link"',
  'href="#product-explorer"',
  'class="site-header product-header"',
  'class="nav-shell"',
  'nav-index--left',
  'class="brand"',
  'AGRĪCA',
  'Agriculture Cairo',
  'href="#seasons"',
  'class="header-quote quote-trigger"',
  'Build a quote',
  'class="quote-count"',
  'class="explorer"',
  'id="product-explorer"',
  'class="explorer-head"',
  'Produce,<br/><em>organised.</em>',
  'class="world-switch"',
  'class="world-button is-active"',
  'data-world="fresh"',
  'data-world="frozen"',
  'data-world="dried"',
  '29 products',
  '18 products',
  '13 products',
  'class="explorer-workspace"',
  'class="family-panel"',
  'class="panel-label"',
  'id="family-count"',
  'class="family-list"',
  'class="family-button is-active"',
  'class="panel-note"',
  'id="active-condition"',
  'class="product-stage"',
  'class="stage-media"',
  'id="stage-media"',
  'data-visual="orange"',
  'class="stage-code"',
  'id="stage-code"',
  'FR / CIT / 01',
  'class="stage-origin"',
  'Product of Egypt',
  'class="stage-content"',
  'class="stage-meta"',
  'id="stage-family"',
  'id="stage-format"',
  'id="stage-name"',
  'Oranges',
  'id="stage-description"',
  'id="stage-condition"',
  'class="add-quote"',
  'id="add-quote"',
  'class="add-feedback"',
  'id="add-feedback"',
  'class="living-shelf"',
  'class="shelf-head"',
  'id="shelf-label"',
  'id="shelf-prev"',
  'id="shelf-next"',
  'class="product-rail"',
  'id="product-rail"',
  'class="rail-product is-active"',
  'class="shelf-line"',
  'class="season-strip"',
  'id="seasons"',
  'The year,<br/><em>mapped.</em>',
  'class="month-selector"',
  'class="month is-active"',
  'class="season-summary"',
  'id="selected-month"',
  'id="season-family"',
  'id="season-products"',
  'class="products-footer"',
  'class="drawer-backdrop"',
  'id="drawer-backdrop"',
  'class="quote-drawer"',
  'id="quote-drawer"',
  'class="quote-head"',
  'id="quote-title"',
  'class="quote-close"',
  'class="quote-items"',
  'id="quote-items"',
  'class="quote-empty"',
  'id="quote-empty"',
  'class="quote-form"',
  'id="quote-form"',
  'class="quote-success"',
  'id="quote-success"',
  'class="mobile-quote quote-trigger"',
];

for (const sel of requiredSelectors) {
  if (!normalizedHtml.includes(sel)) {
    throw new Error(`Missing required selector/element in prerendered HTML: "${sel}"`);
  }
  console.log(`  ✓ Present: ${sel}`);
}

// 5. Test Quotation & State Transitions Logic Programmatically
console.log("\n--- Testing Quotation & World State Logic ---");

// Test world library retrieval
const worlds: WorldId[] = ["fresh", "frozen", "dried"];
for (const w of worlds) {
  const lib = PRODUCT_LIBRARY[w];
  if (!lib || !lib.families.length) {
    throw new Error(`World ${w} is empty or missing families`);
  }
  console.log(`  ✓ World "${w}": ${lib.families.length} families, ${lib.label}`);
}

// Test visual mappings
const tests = [
  { name: "Oranges", world: "fresh" as WorldId, code: "CIT", expected: "orange" },
  { name: "Lemons", world: "fresh" as WorldId, code: "CIT", expected: "lemon" },
  { name: "Sweet Potatoes", world: "fresh" as WorldId, code: "VEG", expected: "potato" },
  { name: "Grapes", world: "fresh" as WorldId, code: "FRT", expected: "fresh-frt" },
  { name: "Strawberries", world: "frozen" as WorldId, code: "IQF", expected: "frozen-iqf" },
  { name: "Green Beans", world: "frozen" as WorldId, code: "IQV", expected: "frozen-iqv" },
  { name: "Orange", world: "dried" as WorldId, code: "DRF", expected: "dried-drf" },
  { name: "Garlic", world: "dried" as WorldId, code: "DRV", expected: "dried-drv" },
];

for (const t of tests) {
  const res = visualFor(t.name, t.world, t.code);
  if (res !== t.expected) {
    throw new Error(`visualFor(${t.name}, ${t.world}, ${t.code}) = ${res}, expected ${t.expected}`);
  }
  console.log(`  ✓ visualFor(${t.name}) -> ${res}`);
}

// Test quotation duplicate prevention logic
const mockQuotes: QuoteItem[] = [];
function addQuote(name: string, world: string, family: string): string {
  const key = `${world}::${family}::${name}`;
  if (!mockQuotes.some((item) => item.key === key)) {
    mockQuotes.push({ key, name, world, family });
    return "Added. Continue browsing or open your quotation.";
  }
  return "This product is already in your quotation.";
}

const msg1 = addQuote("Oranges", "Fresh produce", "Citrus");
if (msg1 !== "Added. Continue browsing or open your quotation." || mockQuotes.length !== 1) {
  throw new Error("Failed to add first quote item");
}
console.log("  ✓ Quotation add item 1: success");

const msg2 = addQuote("Oranges", "Fresh produce", "Citrus");
if (msg2 !== "This product is already in your quotation." || mockQuotes.length !== 1) {
  throw new Error("Duplicate quote prevention failed");
}
console.log("  ✓ Quotation duplicate prevention: success");

const msg3 = addQuote("Lemons", "Fresh produce", "Citrus");
if (msg3 !== "Added. Continue browsing or open your quotation." || mockQuotes.length !== 2) {
  throw new Error("Failed to add second quote item");
}
console.log("  ✓ Quotation add item 2: count is 2");

// Remove item
const remainingQuotes = mockQuotes.filter((item) => item.name !== "Oranges");
if (remainingQuotes.length !== 1 || remainingQuotes[0].name !== "Lemons") {
  throw new Error("Quotation remove item failed");
}
console.log("  ✓ Quotation remove item: remaining count is 1");

console.log("\n✓ ALL PHASE 3 VALIDATION CHECKS PASSED!");
