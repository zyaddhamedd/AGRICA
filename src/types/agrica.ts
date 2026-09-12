export type WorldId = "fresh" | "frozen" | "dried";

export interface ProductFamily {
  readonly name: string;
  readonly code: string;
  readonly products: readonly string[];
}

export interface WorldLibrary {
  readonly label: string;
  readonly families: readonly ProductFamily[];
}

export type ProductLibrary = Record<WorldId, WorldLibrary>;

export interface QuoteItem {
  readonly key: string;
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

export interface ProductAtlasItem {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly worldId: WorldId;
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
