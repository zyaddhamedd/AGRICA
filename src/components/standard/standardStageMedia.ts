// Sized, modern WebP derivatives for Standard Journey stages.
// Regenerate with: node scripts/optimize-standard-stages.mjs

export interface StageMediaDescriptor {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly fallbackSrc: string;
  readonly srcSet: string;
  readonly sizes: string;
}

interface StageStaticMeta {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly fallback: string;
}

const STAGE_META: Readonly<Record<string, StageStaticMeta>> = {
  source: {
    name: "stage-01-source",
    width: 1376,
    height: 768,
    fallback: "/assets/standard_stage_01_source.jpg",
  },
  inspect: {
    name: "stage-02-inspect",
    width: 1376,
    height: 768,
    fallback: "/assets/standard_stage_02_inspect.jpg",
  },
  prepare: {
    name: "stage-03-prepare",
    width: 1376,
    height: 768,
    fallback: "/assets/standard_stage_03_prepare.jpg",
  },
  pack: {
    name: "stage-04-pack",
    width: 1672,
    height: 941,
    fallback: "/assets/stage_04.png",
  },
  store: {
    name: "stage-05-control",
    width: 1672,
    height: 941,
    fallback: "/assets/stage_05.png",
  },
  deliver: {
    name: "stage-06-handover",
    width: 1672,
    height: 941,
    fallback: "/assets/stage_06.png",
  },
};

const PATH_TO_ID: Readonly<Record<string, string>> = {
  "/assets/standard_stage_01_source.jpg": "source",
  "/assets/standard_stage_02_inspect.jpg": "inspect",
  "/assets/standard_stage_03_prepare.jpg": "prepare",
  "/assets/stage_04.png": "pack",
  "/assets/standard_stage_04_pack.jpg": "pack",
  "/assets/stage_05.png": "store",
  "/assets/standard_stage_05_control.jpg": "store",
  "/assets/stage_06.png": "deliver",
  "/assets/standard_stage_06_export_handover.jpg": "deliver",
};

const STAGE_WIDTHS = [640, 1024, 1376] as const;
const STAGE_SIZES = "(max-width: 1024px) 100vw, 640px";

export function getStageMedia(
  stageId?: string,
  explicitSrc?: string
): StageMediaDescriptor {
  const resolvedKey =
    (stageId && STAGE_META[stageId] ? stageId : undefined) ??
    (explicitSrc ? PATH_TO_ID[explicitSrc] : undefined);

  const meta = resolvedKey ? STAGE_META[resolvedKey] : undefined;

  if (!meta) {
    const fallback = explicitSrc ?? "/assets/product-atlas.png";
    return {
      id: stageId ?? "unknown",
      name: stageId ?? "unknown",
      width: 1376,
      height: 768,
      fallbackSrc: fallback,
      srcSet: "",
      sizes: STAGE_SIZES,
    };
  }

  const srcSet = STAGE_WIDTHS.map(
    (w) => `/assets/standard_stages/webp/${meta.name}-${w}.webp ${w}w`
  ).join(", ");

  return {
    id: resolvedKey ?? "unknown",
    name: meta.name,
    width: meta.width,
    height: meta.height,
    fallbackSrc: explicitSrc ?? meta.fallback,
    srcSet,
    sizes: STAGE_SIZES,
  };
}
