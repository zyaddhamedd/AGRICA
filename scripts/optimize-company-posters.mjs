// Run from the repository root: node scripts/optimize-company-posters.mjs
// Uses the Sharp already provided by Next.js; originals are never overwritten.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const sources = [
  ["origin", "public/assets/company/hero_01_origin_start_keyframe.png"],
  ["sorting", "public/assets/company/facility_reveal.png"],
  ["packing", "public/assets/standard_stage_04_pack.jpg"],
  ["quality", "public/assets/company/human_qc.png"],
  ["shipping", "public/assets/REF_HERO/Agrica Loading Dock Operations (1).png"],
];
const destination = "public/assets/company/posters";
await mkdir(destination, { recursive: true });
for (const [name, source] of sources) {
  // Preserve the entire original frame, aspect ratio and sRGB appearance.
  const { width: sourceWidth } = await sharp(source).metadata();
  const widths = [...new Set([640, 1024, Math.min(1672, sourceWidth)])];
  for (const width of widths) {
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(`${destination}/${name}-${width}.webp`);
  }
}
