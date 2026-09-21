import { HERBS_SPICES_CATALOGUE, HERBS_SPICES_FAMILIES } from "./catalogue";
import { HERBS_SPICES_PROCESS_STAGES } from "./process";
import type {
  HerbsSpicesMediaKey,
  HerbsSpicesMediaManifestEntry,
} from "@/types/herbs-spices";

const awaiting = (
  entry: Omit<HerbsSpicesMediaManifestEntry, "status">,
): HerbsSpicesMediaManifestEntry => ({ ...entry, status: "awaiting-approved-asset" });

const approved = (
  entry: Omit<HerbsSpicesMediaManifestEntry, "status">,
): HerbsSpicesMediaManifestEntry => ({ ...entry, status: "approved" });

const homepage = {
  heroPrimary: approved({
    key: "hero-primary",
    src: "/assets/herbs-spices/home/hero-primary.webp",
    alt: "",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 960px) 100vw, 42vw",
    cropFocus: "50% 50%",
    kind: "hero",
    priority: "critical",
    preload: true,
  }),
  heroDetailOne: awaiting({
    key: "hero-detail-one",
    src: "/assets/herbs-spices/home/hero-detail-one.webp",
    alt: "",
    width: 1800,
    height: 1200,
    ratio: "3:2",
    orientation: "landscape",
    sizes: "(max-width: 960px) 100vw, 42vw",
    cropFocus: "50% 50%",
    kind: "hero",
    priority: "optional",
  }),
  heroDetailTwo: awaiting({
    key: "hero-detail-two",
    src: "/assets/herbs-spices/home/hero-detail-two.webp",
    alt: "",
    width: 1800,
    height: 1200,
    ratio: "3:2",
    orientation: "landscape",
    sizes: "(max-width: 960px) 100vw, 42vw",
    cropFocus: "50% 50%",
    kind: "hero",
    priority: "optional",
  }),
  processTeaser: awaiting({
    key: "process-teaser",
    src: "/assets/herbs-spices/home/process-teaser.webp",
    alt: "",
    width: 1920,
    height: 1080,
    ratio: "16:9",
    orientation: "landscape",
    sizes: "(max-width: 960px) 100vw, 60vw",
    cropFocus: "50% 50%",
    kind: "process",
    priority: "optional",
  }),
  trustPrimary: awaiting({
    key: "trust-primary",
    src: "/assets/herbs-spices/home/trust-primary.webp",
    alt: "",
    width: 1800,
    height: 1200,
    ratio: "3:2",
    orientation: "landscape",
    sizes: "(max-width: 960px) 100vw, 50vw",
    cropFocus: "50% 50%",
    kind: "trust",
    priority: "optional",
  }),
} as const;

const familyMediaPresentation = {
  herbs: {
    alt: "Assorted dried herbs including leafy and stemmed botanical material",
    cropFocus: "50% 54%",
  },
  flowers: {
    alt: "Dried chamomile, hibiscus, and calendula flower material",
    cropFocus: "50% 52%",
  },
  seeds: {
    alt: "Assorted agricultural seeds including fennel, coriander, and black cumin",
    cropFocus: "50% 52%",
  },
  spices: {
    alt: "Dried red chilli peppers and cumin seeds",
    cropFocus: "49% 50%",
  },
  roots: {
    alt: "Whole, split, and sliced dried licorice roots",
    cropFocus: "50% 49%",
  },
  "dehydrated-vegetables": {
    alt: "Dried onion pieces, garlic slices, and vegetable flakes",
    cropFocus: "50% 52%",
  },
} as const satisfies Record<(typeof HERBS_SPICES_FAMILIES)[number]["id"], { readonly alt: string; readonly cropFocus: string }>;

const families = Object.fromEntries(HERBS_SPICES_FAMILIES.map((family) => {
  const presentation = familyMediaPresentation[family.id];
  return [
    family.id,
    approved({
      key: `family-${family.id}`,
      src: `/assets/herbs-spices/families/${family.id}.webp`,
      alt: presentation.alt,
      width: 1120,
      height: 1400,
      ratio: "4:5",
      orientation: "portrait",
      sizes: "(max-width: 680px) 40vw, (max-width: 1099px) 26vw, (max-width: 1440px) 20vw, 280px",
      cropFocus: presentation.cropFocus,
      kind: "family",
      priority: "high",
    }),
  ];
})) as Record<(typeof HERBS_SPICES_FAMILIES)[number]["id"], HerbsSpicesMediaManifestEntry>;

const forms = {
  whole: approved({
    key: "form-whole",
    src: "/assets/herbs-spices/home/form-whole.webp",
    alt: "Whole hibiscus-inspired botanical material",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 900px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px",
    cropFocus: "50% 50%",
    kind: "form",
    priority: "high",
  }),
  "cut-sifted": approved({
    key: "form-cut-sifted",
    src: "/assets/herbs-spices/home/form-cut-sifted.webp",
    alt: "Cut and sifted hibiscus-inspired botanical material",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 900px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px",
    cropFocus: "50% 50%",
    kind: "form",
    priority: "high",
  }),
  tbc: approved({
    key: "form-tbc",
    src: "/assets/herbs-spices/home/form-tbc.webp",
    alt: "Tea bag cut hibiscus-inspired botanical material",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 900px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px",
    cropFocus: "50% 50%",
    kind: "form",
    priority: "high",
  }),
  crushed: approved({
    key: "form-crushed",
    src: "/assets/herbs-spices/home/form-crushed.webp",
    alt: "Crushed hibiscus-inspired botanical material",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 900px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px",
    cropFocus: "50% 50%",
    kind: "form",
    priority: "high",
  }),
  powder: approved({
    key: "form-powder",
    src: "/assets/herbs-spices/home/form-powder.webp",
    alt: "Powdered hibiscus-inspired botanical material",
    width: 1120,
    height: 1400,
    ratio: "4:5",
    orientation: "portrait",
    sizes: "(max-width: 900px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px",
    cropFocus: "50% 50%",
    kind: "form",
    priority: "high",
  }),
} as const;

const approvedProductSlugs = new Set([
  "basil",
  "dill",
  "lemon-grass",
  "marjoram",
  "moringa",
  "oregano",
  "parsley",
  "peppermint",
  "rosemary",
  "spearmint",
  "chamomile",
  "black-cumin",
]);

const products = Object.fromEntries(HERBS_SPICES_CATALOGUE.map((product) => {
  const withStatus = approvedProductSlugs.has(product.slug) ? approved : awaiting;

  return [
    product.slug,
    withStatus({
      key: product.mediaKey,
      src: `/assets/herbs-spices/products/${product.slug}.webp`,
      alt: `${product.name} ingredient material`,
      width: 1448,
      height: 1086,
      ratio: "4:3",
      orientation: "landscape",
      sizes: "(max-width: 760px) 38vw, (max-width: 1099px) 21vw, (max-width: 1440px) 15vw, 230px",
      cropFocus: "50% 50%",
      kind: "product",
      priority: "standard",
    }),
  ];
})) as Record<string, HerbsSpicesMediaManifestEntry>;

const process = Object.fromEntries(HERBS_SPICES_PROCESS_STAGES.map((stage) => {
  const slug = stage.id.replace("herbs-spices-process:", "");
  return [slug, awaiting({
    key: stage.mediaKey ?? `process-${slug}`,
    src: `/assets/herbs-spices/process/${slug}.webp`,
    alt: "",
    width: 1600,
    height: 1200,
    ratio: "4:3",
    orientation: "landscape",
    sizes: "(max-width: 860px) 100vw, 58vw",
    cropFocus: "50% 50%",
    kind: "process",
    priority: "optional",
  })];
})) as Record<string, HerbsSpicesMediaManifestEntry>;

/** Central media manifest. A planned src is rendered only when its status is approved. */
export const HERBS_SPICES_MEDIA = { homepage, families, forms, products, process } as const;

export const HERBS_SPICES_MEDIA_MANIFEST = [
  ...Object.values(homepage),
  ...Object.values(families),
  ...Object.values(forms),
  ...Object.values(products),
  ...Object.values(process),
] as const satisfies readonly HerbsSpicesMediaManifestEntry[];

const mediaByKey = new Map<HerbsSpicesMediaKey, HerbsSpicesMediaManifestEntry>(
  HERBS_SPICES_MEDIA_MANIFEST.map((entry) => [entry.key, entry]),
);

export function getHerbsSpicesMedia(key: HerbsSpicesMediaKey | undefined): HerbsSpicesMediaManifestEntry | undefined {
  return key ? mediaByKey.get(key) : undefined;
}

export function hasApprovedHerbsSpicesMedia(
  entry: HerbsSpicesMediaManifestEntry | undefined,
): entry is HerbsSpicesMediaManifestEntry {
  return entry?.status === "approved";
}
