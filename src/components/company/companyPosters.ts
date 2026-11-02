// Same-frame, uncropped WebP derivatives. Regenerate with scripts/optimize-company-posters.mjs.
const posterFrames: Readonly<Record<string, { name: string; width: number; height: number }>> = {
  "/assets/company/hero_01_origin_start_keyframe.png": { name: "origin", width: 1672, height: 941 },
  "/assets/company/facility_reveal.png": { name: "sorting", width: 1677, height: 938 },
  "/assets/standard_stage_04_pack.jpg": { name: "packing", width: 1672, height: 941 },
  "/assets/company/human_qc.png": { name: "quality", width: 1672, height: 941 },
  "/assets/REF_HERO/Agrica Loading Dock Operations (1).png": { name: "shipping", width: 1024, height: 1536 },
};

export function companyPoster(source: string) {
  const frame = posterFrames[source];
  if (!frame) return { src: source, srcSet: undefined, width: undefined, height: undefined };
  const widths = [...new Set([640, 1024, Math.min(1672, frame.width)])];
  const path = (width: number) => `/assets/company/posters/${frame.name}-${width}.webp`;
  return {
    src: path(widths[widths.length - 1]),
    srcSet: widths.map((width) => `${path(width)} ${width}w`).join(", "),
    width: frame.width,
    height: frame.height,
  };
}
