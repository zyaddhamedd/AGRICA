export const HERBS_SPICES_FAMILY_IDS = [
  "herbs",
  "flowers",
  "seeds",
  "spices",
  "roots",
  "dehydrated-vegetables",
] as const;

export type HerbsSpicesFamilyId = (typeof HERBS_SPICES_FAMILY_IDS)[number];
export type HerbsSpicesRecordStatus = "source-backed" | "verified";
export type HerbsSpicesMediaKey =
  | `hero-${string}`
  | `family-${HerbsSpicesFamilyId}`
  | `form-${string}`
  | `product-${string}`
  | `process-${string}`
  | `trust-${string}`;
export type HerbsSpicesMediaStatus = "awaiting-approved-asset" | "approved";
export type HerbsSpicesMediaKind = "hero" | "family" | "form" | "product" | "process" | "trust";
export type HerbsSpicesMediaPriority = "critical" | "high" | "standard" | "optional";
export type HerbsSpicesMediaRatio = "4:5" | "4:3" | "3:2" | "16:9";

export interface HerbsSpicesFamily {
  readonly id: HerbsSpicesFamilyId;
  readonly label: string;
  readonly status: "source-backed";
}

export interface HerbsSpicesAvailableForm {
  readonly id: string;
  readonly label: string;
  readonly status: "source-backed";
}

export interface HerbsSpicesMediaManifestEntry {
  readonly key: HerbsSpicesMediaKey;
  /** Planned public path. Rendered only after status becomes approved. */
  readonly src: `/assets/herbs-spices/${string}.webp`;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly ratio: HerbsSpicesMediaRatio;
  readonly orientation: "portrait" | "landscape";
  readonly sizes: string;
  readonly cropFocus: string;
  readonly kind: HerbsSpicesMediaKind;
  readonly priority: HerbsSpicesMediaPriority;
  readonly preload?: boolean;
  readonly status: HerbsSpicesMediaStatus;
}

export interface HerbsSpicesSpecification {
  readonly label: string;
  readonly value: string;
  readonly verified: true;
}

export interface HerbsSpicesCatalogueItem {
  readonly id: `herbs-spices:${string}`;
  readonly slug: string;
  readonly name: string;
  readonly searchAliases?: readonly string[];
  readonly familyId: HerbsSpicesFamilyId;
  readonly familyName: string;
  readonly forms: readonly string[];
  readonly shortDescription?: string;
  readonly mediaKey: HerbsSpicesMediaKey;
  readonly specifications?: readonly HerbsSpicesSpecification[];
  readonly origin?: string | null;
  readonly season?: string | null;
  readonly packaging?: string | null;
  readonly moq?: string | null;
  readonly certifications?: readonly string[] | null;
  readonly incoterms?: readonly string[] | null;
  readonly availability?: string | null;
  readonly status: HerbsSpicesRecordStatus;
  readonly verified: boolean;
}
