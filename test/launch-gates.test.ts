import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("--- AGRICA Launch Gates & SEO Preservation Verification ---");

// Gate 1: Business Division Switcher MUST be strictly false
const switcherSource = fs.readFileSync(
  path.join(rootDir, "src/components/common/BusinessDivisionSwitcher.tsx"),
  "utf8"
);
assert.match(
  switcherSource,
  /export\s+const\s+SHOW_BUSINESS_DIVISION_SWITCHER\s*=\s*false;/,
  "FATAL LAUNCH GATE VIOLATION: SHOW_BUSINESS_DIVISION_SWITCHER must remain false in public release"
);

// Gate 2: Herbs layout robots metadata MUST be { index: false, follow: false }
const layoutSource = fs.readFileSync(
  path.join(rootDir, "src/app/[lang]/herbs-spices/layout.tsx"),
  "utf8"
);
assert.match(
  layoutSource,
  /robots:\s*\{\s*index:\s*false,\s*follow:\s*false,?\s*\}/,
  "FATAL SEO VIOLATION: Herbs & Spices layout robots must be { index: false, follow: false }"
);

// Gate 3: Herbs products metadata robots MUST be { index: false, follow: false }
const productsSource = fs.readFileSync(
  path.join(rootDir, "src/app/[lang]/herbs-spices/products/page.tsx"),
  "utf8"
);
assert.match(
  productsSource,
  /robots:\s*\{\s*index:\s*false,\s*follow:\s*false,?\s*\}/,
  "FATAL SEO VIOLATION: Herbs & Spices products robots must be { index: false, follow: false }"
);

console.log("✓ SHOW_BUSINESS_DIVISION_SWITCHER is strictly false");
console.log("✓ Herbs layout & products robots metadata are strictly noindex, nofollow");
