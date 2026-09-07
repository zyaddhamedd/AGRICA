import type { MonthCode, MonthNumber, ProductSeasonAvailability } from "@/types/agrica";

export interface MonthDefinition {
  readonly number: MonthNumber;
  readonly code: MonthCode;
  readonly name: string;
}

export const MONTHS: readonly MonthDefinition[] = [
  { number: 1, code: "JAN", name: "January" },
  { number: 2, code: "FEB", name: "February" },
  { number: 3, code: "MAR", name: "March" },
  { number: 4, code: "APR", name: "April" },
  { number: 5, code: "MAY", name: "May" },
  { number: 6, code: "JUN", name: "June" },
  { number: 7, code: "JUL", name: "July" },
  { number: 8, code: "AUG", name: "August" },
  { number: 9, code: "SEP", name: "September" },
  { number: 10, code: "OCT", name: "October" },
  { number: 11, code: "NOV", name: "November" },
  { number: 12, code: "DEC", name: "December" },
] as const;

/**
 * Notice preserved from prototype:
 * Seasonal availability in the prototype is explicitly illustrative and awaiting client confirmation.
 * No representative or assumed production season matrix is invented here.
 */
export const SEASON_ILLUSTRATIVE_NOTICE =
  "Indicative seasonal reference awaiting confirmed export calendar. Subject to regional harvest cycles and buyer specifications.";

/**
 * Placeholder for future confirmed AGRICA season matrix.
 * Type contracts established without inventing production business data.
 */
export const CONFIRMED_SEASON_MATRIX: readonly ProductSeasonAvailability[] = [];
