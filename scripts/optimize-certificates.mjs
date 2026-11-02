// Run from repository root: node scripts/optimize-certificates.mjs
// Generates sized WebP derivatives (160w and 240w) in public/certificates/webp/
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const certFiles = [
  { name: "cert-01-phytosanitary", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_20_55 PM-1.png" },
  { name: "cert-02-iso", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_20_57 PM-2.png" },
  { name: "cert-03-organic", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_21_05 PM-1.png" },
  { name: "cert-04-food-safety", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_21_07 PM-2.png" },
  { name: "cert-05-origin-coa", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_21_08 PM-3.png" },
  { name: "cert-06-botanical-purity", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_21_12 PM.png" },
  { name: "cert-07-global-export", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_21_19 PM.png" },
  { name: "cert-08-egyptian-origin", src: "public/certificates/ChatGPT Image Sep 27, 2026, 08_23_17 PM.png" },
];

const destination = "public/certificates/webp";
await mkdir(destination, { recursive: true });

const targetWidths = [160, 240];

for (const { name, src } of certFiles) {
  const meta = await sharp(src).metadata();
  for (const width of targetWidths) {
    const resizedWidth = Math.min(width, meta.width ?? width);
    await sharp(src)
      .resize({ width: resizedWidth, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(`${destination}/${name}-${resizedWidth}.webp`);
  }
}

console.log("Certificate WebP derivatives generated successfully in public/certificates/webp/.");
