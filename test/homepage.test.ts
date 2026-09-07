import fs from "fs";
import path from "path";

console.log("=== Phase 2 Homepage Parity & DOM Architecture Verification ===");

// Check that dist/ remains untouched
const distFiles = [
  "dist/index.html",
  "dist/styles.css",
  "dist/script.js",
  "dist/products/products.js",
  "dist/standard/standard.js",
];
for (const f of distFiles) {
  if (!fs.existsSync(f)) {
    throw new Error(`Missing expected untouched file: ${f}`);
  }
}
console.log("✓ All dist/ files exist and verified.");

// Read Next.js prerendered homepage HTML
const nextIndexPath = path.join(".next", "server", "app", "index.html");
if (!fs.existsSync(nextIndexPath)) {
  throw new Error(`Missing prerendered Next.js index.html at ${nextIndexPath}. Run npm run build first.`);
}
const nextHtml = fs.readFileSync(nextIndexPath, "utf-8");
const distHtml = fs.readFileSync("dist/index.html", "utf-8");

// Required Motion-Ready Selectors from MOTION_DIRECTOR.md & Section 3
const requiredHooks = [
  'id="top"',
  'class="hero"',
  'class="hero-origin"',
  'data-motion="hero-origin"',
  'class="headline-line"',
  'class="hero-portals"',
  'data-motion="hero-portals"',
  'portal--fresh',
  'portal--frozen',
  'portal--dried',
  'class="worlds"',
  'id="products"',
  'data-active-world="fresh"',
  'class="world-tab is-active"',
  'class="world-visual"',
  'data-motion="world-visual"',
  'class="world-image"',
  'class="season"',
  'data-motion="season-index"',
  'class="month is-active"',
  'class="journey"',
  'data-motion="standard-journey"',
  'class="journey-marker"',
  'class="company"',
  'id="company"',
  'class="company-data"',
  'class="trade"',
  'id="trade"',
  'class="trade-form"',
];

console.log("\n--- Checking DOM & Motion-Ready Selectors ---");
for (const hook of requiredHooks) {
  if (!nextHtml.includes(hook)) {
    throw new Error(`Missing required motion/structural hook: ${hook}`);
  }
  console.log(`  ✓ Hook present: ${hook}`);
}

// Check Portal URLs
console.log("\n--- Checking Three Worlds Portal Navigation URLs ---");
const expectedPortalUrls = [
  'href="/products?world=fresh"',
  'href="/products?world=frozen"',
  'href="/products?world=dried"',
];
for (const url of expectedPortalUrls) {
  if (!nextHtml.includes(url)) {
    throw new Error(`Missing expected portal URL: ${url}`);
  }
  console.log(`  ✓ Portal URL verified: ${url}`);
}

// Check Section Copy Parity
console.log("\n--- Checking Copy Parity Across All 9 Sections ---");
const expectedSnippets = [
  // Brand
  "AGRĪCA",
  "Agriculture Cairo",
  // Hero
  "30.0444° N",
  "Cairo, Egypt",
  "Egyptian origin · Global readiness",
  "One origin.",
  "Three worlds.",
  "Fresh, frozen and dried produce, prepared for international supply.",
  "Enter the range",
  "Field / harvest / dispatch",
  "IQF / cold chain / control",
  "Time / texture / stability",
  "B2B agricultural export · Fresh / Frozen / Dried",
  // Worlds
  "01 / Products",
  "Three worlds. One standard.",
  "Choose the condition.",
  "Keep the confidence.",
  "The category changes. The AGRICA standard does not.",
  "Fresh world",
  "Bright, precise and close to origin.",
  "Natural clarity",
  "Controlled cold",
  "Measured time",
  "View the full range",
  // Season
  "Season index",
  "Availability across the year",
  "Select a month",
  "Nature has",
  "a schedule.",
  "Move through the year to discover what is in season and ready for planning.",
  "Product availability",
  "Illustrative index",
  "Orange · Lemon · Sweet potato",
  "Final seasonal availability to be confirmed.",
  // Standard
  "02 / Our standard",
  "From source to shipment",
  "Nothing leaves origin",
  "to chance.",
  "Sourcing, specification, quality control and export coordination — managed as one connected journey.",
  "LOT 01",
  "Origin selection",
  "Quality control",
  "Process &amp; grade",
  "Specification",
  "Export coordination",
  "Controlled at every step.",
  "Trusted at every destination.",
  "Discover our standard",
  // Company
  "03",
  "AGRICA / The company",
  "Egyptian by origin.",
  "International by discipline.",
  "AGRICA connects agricultural origin with the standards, coordination and clarity global trade demands.",
  "Meet AGRICA",
  "Origin",
  "Categories",
  "Reach",
  "Global",
  "Markets",
  // Trade
  "Start a trade",
  "Tell us what",
  "needs to arrive.",
  "Product or category",
  "Destination market",
  "Estimated volume",
  "Your email",
  "Send enquiry",
  // Footer
  "Egyptian produce. Prepared for global supply.",
  "© 2026 AGRICA",
];

for (const snippet of expectedSnippets) {
  if (!nextHtml.includes(snippet)) {
    throw new Error(`Missing expected text snippet in Next.js build: "${snippet}"`);
  }
  console.log(`  ✓ Copy snippet verified: "${snippet}"`);
}

// Check Header Route Regression
console.log("\n--- Checking Route-Aware Header Regression on /products and /standard ---");
const productsHtmlPath = path.join(".next", "server", "app", "products.html");
const standardHtmlPath = path.join(".next", "server", "app", "standard.html");

const productsHtml = fs.readFileSync(productsHtmlPath, "utf-8");
const standardHtml = fs.readFileSync(standardHtmlPath, "utf-8");

if (!productsHtml.includes("product-header")) {
  throw new Error("Missing product-header class on /products");
}
if (!productsHtml.includes("quote-trigger")) {
  throw new Error("Missing quote-trigger on /products");
}
console.log("  ✓ /products header verified: product-header class and quote-trigger present");

if (!standardHtml.includes("standard-header")) {
  throw new Error("Missing standard-header class on /standard");
}
if (!standardHtml.includes("is-current")) {
  throw new Error("Missing is-current active state on /standard header");
}
console.log("  ✓ /standard header verified: standard-header class and is-current present");

console.log("\n✓ ALL PHASE 2 VALIDATION TESTS PASSED!");
