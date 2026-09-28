import type { ProduceProductId, WorldId } from "@/types/agrica";

export type ProductCardConfidence = "HIGH" | "MEDIUM" | "LOW";
export type ClientReviewPriority = "HIGH" | "MEDIUM" | "LOW";

export type ProductCardFieldLabelKey =
  | "typicalEgyptianSeason"
  | "typicalEgyptianExportWindow"
  | "typicalEgyptianHarvest"
  | "typicalEgyptianFreshSeason"
  | "season"
  | "cropWindow"
  | "variety"
  | "varietyColour"
  | "productType"
  | "productForm"
  | "productStage"
  | "type"
  | "colourType"
  | "dispatchMaturity"
  | "intendedUse"
  | "sizeCalibre"
  | "berryCalibre"
  | "berryBunchSpecification"
  | "calibre"
  | "cut"
  | "cutCalibration"
  | "leafCutSpecification"
  | "leafParticleSize"
  | "particleSize"
  | "sizeCount"
  | "cutSize"
  | "componentCalibration"
  | "qualitySpecification"
  | "potatoSpecification"
  | "productComposition"
  | "preparation"
  | "processing"
  | "treatment"
  | "packFormat"
  | "storage"
  | "frozenStorage"
  | "relativeHumidity"
  | "handling"
  | "buyerNote"
  | "buyerSpecification";

export interface ProductCardField {
  readonly labelKey: ProductCardFieldLabelKey;
  readonly value: string;
  readonly assumed: boolean;
  readonly reviewRequired: boolean;
  readonly assumptionReason?: string;
  readonly sourceRefs: readonly string[];
  readonly confidence: ProductCardConfidence;
  readonly displayOrder: number;
}

export interface ProductCardClientReview {
  readonly required: boolean;
  readonly assumptions: readonly string[];
  readonly priority: ClientReviewPriority;
}

export interface ProductCardImageBrief {
  readonly readiness: "READY" | "PROVISIONAL";
  readonly brief: string;
  readonly dependencies: readonly string[];
}

export interface ProductCardContent {
  readonly productId: ProduceProductId;
  readonly publicName?: string;
  readonly category: WorldId;
  readonly fields: readonly ProductCardField[];
  readonly clientReview: ProductCardClientReview;
  readonly internalNote: string;
  readonly sourceRefs: readonly string[];
  readonly confidence: ProductCardConfidence;
  readonly imageBrief: ProductCardImageBrief;
}

/** Only this projection may be consumed by customer-facing components. */
export interface PublicProductCardField {
  readonly labelKey: ProductCardFieldLabelKey;
  readonly value: string;
  readonly displayOrder: number;
}

/** Governance, source, confidence, assumption, and image metadata are excluded. */
export interface PublicProductCardContent {
  readonly productId: ProduceProductId;
  readonly publicName?: string;
  readonly category: WorldId;
  readonly fields: readonly PublicProductCardField[];
}
