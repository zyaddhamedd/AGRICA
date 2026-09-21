import assert from "node:assert/strict";
import { DIVISION_REGISTRY } from "../src/divisions/registry";
import {
  mapPathnameToDivision,
  resolveDivisionFromPathname,
  resolvePageKindFromPathname,
  resolveRouteForDivision,
} from "../src/divisions/routing";
import type { DivisionDefinition } from "../src/divisions/types";

console.log("--- AGRICA Division Routing Verification ---");

const divisionCases = [
  ["/", "produce"],
  ["/products", "produce"],
  ["/standard", "produce"],
  ["/herbs-spices", "herbs-spices"],
  ["/herbs-spices/products", "herbs-spices"],
  ["/herbs-spices/standard", "herbs-spices"],
  ["/herbs-spices/products/", "herbs-spices"],
] as const;

for (const [pathname, expected] of divisionCases) {
  assert.equal(resolveDivisionFromPathname(pathname), expected);
}

const pageKindCases = [
  ["/", "home"],
  ["/products", "products"],
  ["/standard", "standard"],
  ["/herbs-spices", "home"],
  ["/herbs-spices/products", "products"],
  ["/herbs-spices/standard", "standard"],
  ["/dried-spices", null],
  ["/dried-spices/products", null],
  ["/dried-spices/standard", null],
  ["/products/?world=frozen", "products"],
  ["/not-registered", null],
] as const;

for (const [pathname, expected] of pageKindCases) {
  assert.equal(resolvePageKindFromPathname(pathname), expected);
}

assert.equal(mapPathnameToDivision("/", "herbs-spices"), "/herbs-spices");
assert.equal(
  mapPathnameToDivision("/products", "herbs-spices"),
  "/herbs-spices/products",
);
assert.equal(
  mapPathnameToDivision("/standard", "herbs-spices"),
  "/herbs-spices/standard",
);
assert.equal(mapPathnameToDivision("/herbs-spices", "produce"), "/");
assert.equal(
  mapPathnameToDivision("/products?world=dried#catalogue", "herbs-spices"),
  "/herbs-spices/products",
);
assert.equal(mapPathnameToDivision("/herbs-spices/products", "produce"), "/products");
assert.equal(mapPathnameToDivision("/herbs-spices/standard", "produce"), "/standard");
assert.equal(
  mapPathnameToDivision("/standard?preview=true#process", "herbs-spices"),
  "/herbs-spices/standard",
);
assert.equal(
  mapPathnameToDivision("/herbs-spices?preview=true#top", "produce"),
  "/",
);

const futureDivisionWithoutStandard = {
  id: "produce",
  label: "Test division",
  basePath: "/test",
  routes: {
    home: "/test",
    products: "/test/products",
  },
} satisfies DivisionDefinition;

assert.equal(
  resolveRouteForDivision(futureDivisionWithoutStandard, "standard"),
  "/test",
  "unsupported page kinds must fall back to the target division homepage",
);

assert.deepEqual(Object.keys(DIVISION_REGISTRY), ["produce", "herbs-spices"]);

console.log("✓ Division resolution cases passed");
console.log("✓ Semantic page-kind cases passed");
console.log("✓ Cross-division route mapping passed");
console.log("✓ Unsupported page-kind fallback passed");
