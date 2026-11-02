// Run from repository root: node scripts/optimize-standard-stages.mjs
// Generates sized modern WebP derivatives (640w, 1024w, 1376w) in public/assets/standard_stages/webp/
// and public/assets/standard/stages/.
// Preserves entire frames, aspect ratios, and visual fidelity using sharp.
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const STAGE_SOURCES = [
  {
    id: "source",
    name: "stage-01-source",
    src: "public/assets/standard_stage_01_source.jpg",
  },
  {
    id: "inspect",
    name: "stage-02-inspect",
    src: "public/assets/standard_stage_02_inspect.jpg",
  },
  {
    id: "prepare",
    name: "stage-03-prepare",
    src: "public/assets/standard_stage_03_prepare.jpg",
  },
  {
    id: "pack",
    name: "stage-04-pack",
    src: existsSync("public/assets/stage_04.png")
      ? "public/assets/stage_04.png"
      : "public/assets/standard_stage_04_pack.jpg",
  },
  {
    id: "store",
    name: "stage-05-control",
    src: existsSync("public/assets/stage_05.png")
      ? "public/assets/stage_05.png"
      : "public/assets/standard_stage_05_control.jpg",
  },
  {
    id: "deliver",
    name: "stage-06-handover",
    src: existsSync("public/assets/stage_06.png")
      ? "public/assets/stage_06.png"
      : "public/assets/standard_stage_06_export_handover.jpg",
  },
];

const primaryDestination = "public/assets/standard_stages/webp";
const mirrorDestination = "public/assets/standard/stages";
await mkdir(primaryDestination, { recursive: true });
await mkdir(mirrorDestination, { recursive: true });

const targetWidths = [640, 1024, 1376];

console.log("Optimizing standard stage imagery into modern WebP derivatives...");

let totalOriginalBytes = 0;
let totalGeneratedBytes = 0;

for (const { name, src } of STAGE_SOURCES) {
  const meta = await sharp(src).metadata();
  totalOriginalBytes += meta.size ?? 0;

  for (const width of targetWidths) {
    const resizedWidth = Math.min(width, meta.width ?? width);
    const fileName = `${name}-${resizedWidth}.webp`;
    const primaryPath = `${primaryDestination}/${fileName}`;
    const mirrorPath = `${mirrorDestination}/${fileName}`;

    const info = await sharp(src)
      .resize({ width: resizedWidth, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6, smartSubsample: true })
      .toFile(primaryPath);

    await copyFile(primaryPath, mirrorPath);

    totalGeneratedBytes += info.size;
    console.log(`  ✓ ${fileName} (${(info.size / 1024).toFixed(1)} KB)`);
  }
}

console.log(
  `\nOptimization complete! Generated 18 WebP derivatives in ${primaryDestination}/ and ${mirrorDestination}/.`
);
console.log(
  `Total generated size: ${(totalGeneratedBytes / 1024 / 1024).toFixed(2)} MB across all 3 breakpoints.`
);
