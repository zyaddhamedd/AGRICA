// Run from repository root: node scripts/optimize-fallback-sprites.mjs
// Generates dedicated modern WebP fallbacks and optimized sprite atlases.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/assets/products/frozen", { recursive: true });

// 1. Generate dedicated frozen card fallback derivative (735x490 WebP)
// Middle panel of three-worlds.png corresponds to frozen produce
await sharp("public/assets/three-worlds.png")
  .extract({ left: 512, top: 180, width: 512, height: 680 })
  .resize({ width: 735, height: 490, fit: "cover" })
  .webp({ quality: 80, effort: 6 })
  .toFile("public/assets/products/frozen/iqf-vegetables-fallback.webp");

// 2. Generate optimized WebP versions of the full sprite atlases
await sharp("public/assets/three-worlds.png")
  .webp({ quality: 75, effort: 6 })
  .toFile("public/assets/three-worlds.webp");

await sharp("public/assets/product-atlas.png")
  .webp({ quality: 80, effort: 6 })
  .toFile("public/assets/product-atlas.webp");

console.log("Fallback sprites and derivatives generated successfully.");
