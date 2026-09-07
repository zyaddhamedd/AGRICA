import { PRODUCT_LIBRARY, countProductsInWorld, totalCatalogueCount, visualFor } from "../src/data/products";

console.log("--- AGRICA Product Catalogue Integrity Gate Verification ---");

const freshCount = countProductsInWorld("fresh");
const frozenCount = countProductsInWorld("frozen");
const driedCount = countProductsInWorld("dried");
const totalCount = totalCatalogueCount();

console.log(`Fresh products:  ${freshCount} (Expected: 29)`);
console.log(`Frozen products: ${frozenCount} (Expected: 18)`);
console.log(`Dried products:  ${driedCount} (Expected: 13)`);
console.log(`Total products:  ${totalCount} (Expected: 60)`);

if (freshCount !== 29) {
  throw new Error(`Fresh products count mismatch: got ${freshCount}, expected 29`);
}
if (frozenCount !== 18) {
  throw new Error(`Frozen products count mismatch: got ${frozenCount}, expected 18`);
}
if (driedCount !== 13) {
  throw new Error(`Dried products count mismatch: got ${driedCount}, expected 13`);
}
if (totalCount !== 60) {
  throw new Error(`Total products count mismatch: got ${totalCount}, expected 60`);
}

// Verify visual mapping helper
console.log("Checking sprite visual mappings:");
console.log(" - Oranges ->", visualFor("Oranges", "fresh", "CIT"), "(Expected: orange)");
console.log(" - Lemons ->", visualFor("Lemons", "fresh", "CIT"), "(Expected: lemon)");
console.log(" - Sweet Potatoes ->", visualFor("Sweet Potatoes", "fresh", "VEG"), "(Expected: potato)");
console.log(" - Green Beans (IQF Vegetables / code IQV) ->", visualFor("Green Beans", "frozen", "IQV"), "(Expected: frozen-iqv)");

if (
  visualFor("Oranges", "fresh", "CIT") !== "orange" ||
  visualFor("Lemons", "fresh", "CIT") !== "lemon" ||
  visualFor("Sweet Potatoes", "fresh", "VEG") !== "potato" ||
  visualFor("Green Beans", "frozen", "IQV") !== "frozen-iqv"
) {
  throw new Error("Visual mapping mismatch");
}

console.log("✓ All catalogue integrity checks PASSED!");
