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
