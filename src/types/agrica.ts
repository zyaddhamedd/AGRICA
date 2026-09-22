export type WorldId = "fresh" | "frozen" | "dried";

export type ProduceFamilyId =
  | "citrus"
  | "fresh-fruits"
  | "vegetables-tubers"
  | "iqf-fruits"
  | "iqf-vegetables"
  | "frozen-potato-products"
  | "dried-fruits"
  | "dried-vegetables";

export type ProduceProductId = `produce:${string}`;

/** Language-independent product identity and catalogue relationships. */
export interface ProductCore {
  readonly id: ProduceProductId;
  readonly divisionId: "produce";
  readonly worldId: WorldId;
  readonly familyId: ProduceFamilyId;
  readonly mediaKey: string;
}

/** Future localized presentation contract. Phase 0 keeps English in ProductDefinition. */
export interface ProductTranslation {
  readonly productId: ProduceProductId;
  readonly name: string;
  readonly slug?: string;
  readonly shortDescription?: string;
  readonly imageAlt?: string;
}

export interface ProductDefinition extends ProductCore {
  readonly name: string;
}

export interface ProductFamily {
  readonly id: ProduceFamilyId;
  readonly name: string;
  readonly code: string;
  readonly products: readonly ProductDefinition[];
}

export interface WorldLibrary {
  readonly label: string;
  readonly families: readonly ProductFamily[];
}

export type ProductLibrary = Record<WorldId, WorldLibrary>;

export interface QuoteItem {
  readonly id: ProduceProductId;
  readonly name: string;
  readonly world: string;
  readonly family: string;
}

export interface ProductVariety {
  readonly id: string;
  readonly name: string;
  readonly specs?: ExportSpecification;
}

export interface ExportSpecification {
  readonly origin?: string;
  readonly harvestWindow?: string;
  readonly sizeCalibre?: string;
  readonly brix?: string;
  readonly acidity?: string;
  readonly averageWeight?: string;
  readonly seedStatus?: string;
  readonly shelfLife?: string;
  readonly temperature?: string;
  readonly packaging?: readonly string[];
  readonly grade?: string;
}

export interface ProductAtlasItem extends ProductCore {
  readonly name: string;
  readonly searchAliases?: readonly string[];
  readonly worldLabel: string;
  readonly familyCode: string;
  readonly familyName: string;
  readonly visual: string;
  readonly variety?: string;
  readonly packaging?: readonly string[];
  readonly temperature?: string;
  readonly grade?: string;
  readonly origin?: string;
  readonly availability?: string;
  readonly varieties?: readonly ProductVariety[];
  readonly exportSpecs?: ExportSpecification;
}

export type StageFact = readonly [term: string, value: string];

export interface JourneyStage {
  readonly id: string;
  readonly name: string;
  readonly kicker: string;
  readonly status: string;
  readonly stamp: string;
  readonly code: string;
  readonly coordinate: string;
  readonly copy: string;
  readonly headline?: string;
  readonly imageSrc?: string;
  readonly proofOutput?: string;
  readonly facts: readonly StageFact[];
}

/**
 * Seasonal availability types.
 * Official AGRICA season matrices are awaiting client confirmation.
 * These types establish the future contract without inventing business data.
 */
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MonthCode = "JAN" | "FEB" | "MAR" | "APR" | "MAY" | "JUN" | "JUL" | "AUG" | "SEP" | "OCT" | "NOV" | "DEC";
export type SeasonAvailability = "peak" | "available" | "limited" | "none";

export interface ProductSeasonAvailability {
  readonly productName: string;
  readonly worldId: WorldId;
  readonly familyCode: string;
  readonly monthlyAvailability?: Readonly<Record<MonthNumber, SeasonAvailability>>;
  readonly notes?: string;
}
