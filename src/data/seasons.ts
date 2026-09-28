import type { MonthCode, MonthNumber, ProduceProductId } from "@/types/agrica";

export type SeasonType = "winter" | "spring" | "summer" | "autumn";
export type SeasonPhase = "peak" | "main" | "shoulder" | "off";
export type SeasonSupplyMode = "fresh-harvest" | "cold-stored" | "none";
export type SeasonConfidence = "high" | "medium" | "low";
export type SeasonDisplayStatus = "peak" | "in-season" | "opening" | "final";

export interface MonthDefinition {
  readonly number: MonthNumber;
  readonly code: MonthCode;
  readonly name: string;
  readonly season: SeasonType;
}

export interface SeasonalMonthState {
  readonly phase: SeasonPhase;
  readonly supplyMode: SeasonSupplyMode;
}

export interface SeasonSource {
  readonly id: string;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  readonly sourceTier: "government" | "research" | "trade";
}

export interface SeasonProductEntry {
  readonly productId: ProduceProductId;
  readonly heroEligible: boolean;
  readonly orbitPriority: number;
  readonly windowStart: MonthNumber;
  readonly windowEnd: MonthNumber;
  readonly yearRound?: boolean;
  readonly monthly: Readonly<Record<MonthNumber, SeasonalMonthState>>;
  readonly confidence: SeasonConfidence;
  readonly sourceIds: readonly string[];
  readonly lastReviewed: string;
  readonly agricaApproved: boolean;
  readonly internalNote?: string;
}

export const MONTHS: readonly MonthDefinition[] = [
  { number: 1, code: "JAN", name: "January", season: "winter" },
  { number: 2, code: "FEB", name: "February", season: "winter" },
  { number: 3, code: "MAR", name: "March", season: "spring" },
  { number: 4, code: "APR", name: "April", season: "spring" },
  { number: 5, code: "MAY", name: "May", season: "spring" },
  { number: 6, code: "JUN", name: "June", season: "summer" },
  { number: 7, code: "JUL", name: "July", season: "summer" },
  { number: 8, code: "AUG", name: "August", season: "summer" },
  { number: 9, code: "SEP", name: "September", season: "autumn" },
  { number: 10, code: "OCT", name: "October", season: "autumn" },
  { number: 11, code: "NOV", name: "November", season: "autumn" },
  { number: 12, code: "DEC", name: "December", season: "winter" },
] as const;

const MONTH_NUMBERS = MONTHS.map(({ number }) => number);
const LAST_REVIEWED = "2026-09-26";
const OFF_MONTH: SeasonalMonthState = { phase: "off", supplyMode: "none" };

function monthlyCalendar({
  peak = [],
  main = [],
  shoulder = [],
  coldStored = [],
}: {
  readonly peak?: readonly MonthNumber[];
  readonly main?: readonly MonthNumber[];
  readonly shoulder?: readonly MonthNumber[];
  readonly coldStored?: readonly MonthNumber[];
}): Readonly<Record<MonthNumber, SeasonalMonthState>> {
  const peakSet = new Set<MonthNumber>(peak);
  const mainSet = new Set<MonthNumber>(main);
  const shoulderSet = new Set<MonthNumber>(shoulder);
  const coldStoredSet = new Set<MonthNumber>(coldStored);

  return Object.fromEntries(
    MONTH_NUMBERS.map((month) => {
      const phase: SeasonPhase = peakSet.has(month)
        ? "peak"
        : mainSet.has(month)
          ? "main"
          : shoulderSet.has(month)
            ? "shoulder"
            : "off";

      if (phase === "off") return [month, OFF_MONTH];
      return [
        month,
        {
          phase,
          supplyMode: coldStoredSet.has(month) ? "cold-stored" : "fresh-harvest",
        } satisfies SeasonalMonthState,
      ];
    }),
  ) as unknown as Readonly<Record<MonthNumber, SeasonalMonthState>>;
}

export const SEASON_SOURCES: readonly SeasonSource[] = [
  {
    id: "usda-citrus-2025",
    title: "Egypt Citrus Annual",
    publisher: "USDA Foreign Agricultural Service",
    url: "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Citrus+Annual_Cairo_Egypt_EG2025-0031.pdf",
    sourceTier: "government",
  },
  {
    id: "usda-grapes-2025",
    title: "Egypt Fresh Deciduous Fruit Annual",
    publisher: "USDA Foreign Agricultural Service",
    url: "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Fresh+Deciduous+Fruit+Annual_Cairo_Egypt_EG2025-0029.pdf",
    sourceTier: "government",
  },
  {
    id: "expo-nivex-calendar",
    title: "Egyptian crop calendar",
    publisher: "Egyptian Export Portal / Nivex Farms",
    url: "https://www.expoegypt.gov.eg/uploads/2020/11/5fa91bd880564.pdf",
    sourceTier: "trade",
  },
  {
    id: "expo-production-calendar",
    title: "Season of production",
    publisher: "Egyptian Export Portal",
    url: "https://www.expoegypt.gov.eg/uploads/2020/11/5fa9196f42295.pdf",
    sourceTier: "trade",
  },
  {
    id: "expo-dates-profile",
    title: "Egyptian dates profile",
    publisher: "Egyptian Export Portal",
    url: "https://www.expoegypt.gov.eg/uploads/2020/11/5fa26b2961ae0.pdf",
    sourceTier: "trade",
  },
] as const;

export const SEASONAL_PRODUCTS: readonly SeasonProductEntry[] = [
  {
    productId: "produce:orange",
    heroEligible: true,
    orbitPriority: 1,
    windowStart: 11,
    windowEnd: 6,
    monthly: monthlyCalendar({ peak: [12, 1, 2, 3, 4], main: [11, 5], shoulder: [6], coldStored: [6] }),
    confidence: "high",
    sourceIds: ["usda-citrus-2025"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
    internalNote: "Aggregate Navel, Valencia and Baladi planning window; variety timing differs.",
  },
  {
    productId: "produce:lemon",
    heroEligible: false,
    orbitPriority: 9,
    windowStart: 10,
    windowEnd: 5,
    monthly: monthlyCalendar({ peak: [11, 12, 1, 2], main: [10, 3, 4], shoulder: [5] }),
    confidence: "medium",
    sourceIds: ["usda-citrus-2025"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:egyptian-lime",
    heroEligible: false,
    orbitPriority: 20,
    windowStart: 1,
    windowEnd: 12,
    yearRound: true,
    monthly: monthlyCalendar({ peak: [9, 10], main: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12] }),
    confidence: "medium",
    sourceIds: ["usda-citrus-2025"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
    internalNote: "Crop-level planning window; exact AGRICA export programme requires annual confirmation.",
  },
  {
    productId: "produce:mandarin",
    heroEligible: false,
    orbitPriority: 10,
    windowStart: 10,
    windowEnd: 4,
    monthly: monthlyCalendar({ peak: [12, 1, 2], main: [11, 3], shoulder: [10, 4] }),
    confidence: "medium",
    sourceIds: ["usda-citrus-2025"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:grape",
    heroEligible: true,
    orbitPriority: 2,
    windowStart: 5,
    windowEnd: 11,
    monthly: monthlyCalendar({ peak: [6, 7], main: [5, 8, 9], shoulder: [10, 11] }),
    confidence: "high",
    sourceIds: ["usda-grapes-2025", "expo-nivex-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
    internalNote: "Early and late table-grape varieties are combined for the editorial calendar.",
  },
  {
    productId: "produce:pomegranate",
    heroEligible: true,
    orbitPriority: 3,
    windowStart: 8,
    windowEnd: 1,
    monthly: monthlyCalendar({ peak: [9, 10], main: [8, 11], shoulder: [12, 1], coldStored: [12, 1] }),
    confidence: "medium",
    sourceIds: ["expo-nivex-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:fresh-strawberry",
    heroEligible: true,
    orbitPriority: 4,
    windowStart: 11,
    windowEnd: 5,
    monthly: monthlyCalendar({ peak: [12, 1, 2, 3], main: [11, 4], shoulder: [5] }),
    confidence: "high",
    sourceIds: ["expo-nivex-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:blueberry",
    heroEligible: false,
    orbitPriority: 18,
    windowStart: 1,
    windowEnd: 5,
    monthly: monthlyCalendar({ peak: [2, 3], main: [1, 4], shoulder: [5] }),
    confidence: "low",
    sourceIds: [],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: false,
    internalNote: "Emerging Egyptian category. Keep hidden until AGRICA confirms an active sourcing programme.",
  },
  {
    productId: "produce:fresh-mango",
    heroEligible: true,
    orbitPriority: 5,
    windowStart: 7,
    windowEnd: 11,
    monthly: monthlyCalendar({ peak: [8, 9], main: [7, 10], shoulder: [11] }),
    confidence: "medium",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:guava",
    heroEligible: false,
    orbitPriority: 19,
    windowStart: 7,
    windowEnd: 12,
    monthly: monthlyCalendar({ peak: [9, 10, 11], main: [8, 12], shoulder: [7] }),
    confidence: "low",
    sourceIds: [],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: false,
    internalNote: "Regional public calendars conflict. Keep hidden until source region and variety are confirmed.",
  },
  {
    productId: "produce:date",
    heroEligible: true,
    orbitPriority: 6,
    windowStart: 8,
    windowEnd: 11,
    monthly: monthlyCalendar({ peak: [9, 10], main: [8, 11] }),
    confidence: "medium",
    sourceIds: ["expo-dates-profile"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
    internalNote: "Fresh-date window only; semi-dry stored dates are a different commercial programme.",
  },
  {
    productId: "produce:watermelon",
    heroEligible: false,
    orbitPriority: 14,
    windowStart: 4,
    windowEnd: 10,
    monthly: monthlyCalendar({ peak: [5, 6, 7], main: [4, 8, 9], shoulder: [10] }),
    confidence: "medium",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:potato",
    heroEligible: true,
    orbitPriority: 7,
    windowStart: 1,
    windowEnd: 7,
    monthly: monthlyCalendar({ peak: [2, 3, 4, 5], main: [1, 6], shoulder: [7] }),
    confidence: "high",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:sweet-potato",
    heroEligible: true,
    orbitPriority: 8,
    windowStart: 7,
    windowEnd: 4,
    monthly: monthlyCalendar({ peak: [9, 10, 11, 12, 1], main: [8, 2, 3], shoulder: [7, 4] }),
    confidence: "medium",
    sourceIds: ["expo-nivex-calendar", "expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:onion",
    heroEligible: false,
    orbitPriority: 11,
    windowStart: 3,
    windowEnd: 12,
    monthly: monthlyCalendar({ peak: [4, 5, 6], main: [3, 7, 8, 9], shoulder: [10, 11, 12], coldStored: [10, 11, 12] }),
    confidence: "medium",
    sourceIds: ["expo-nivex-calendar", "expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:garlic",
    heroEligible: false,
    orbitPriority: 12,
    windowStart: 12,
    windowEnd: 4,
    monthly: monthlyCalendar({ peak: [2, 3], main: [1, 4, 12] }),
    confidence: "medium",
    sourceIds: ["expo-nivex-calendar", "expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
    internalNote: "Fresh garlic only; dry/dehydrated garlic belongs to a separate catalogue product.",
  },
  {
    productId: "produce:fresh-green-bean",
    heroEligible: false,
    orbitPriority: 13,
    windowStart: 10,
    windowEnd: 6,
    monthly: monthlyCalendar({ peak: [11, 12, 1, 2, 3, 4], main: [10, 5, 6] }),
    confidence: "medium",
    sourceIds: ["expo-nivex-calendar", "expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:fresh-artichoke",
    heroEligible: false,
    orbitPriority: 15,
    windowStart: 11,
    windowEnd: 5,
    monthly: monthlyCalendar({ peak: [12, 1, 2, 3], main: [11, 4], shoulder: [5] }),
    confidence: "medium",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:carrot",
    heroEligible: false,
    orbitPriority: 16,
    windowStart: 12,
    windowEnd: 5,
    monthly: monthlyCalendar({ peak: [1, 2, 3, 4], main: [12, 5] }),
    confidence: "medium",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
  {
    productId: "produce:taro",
    heroEligible: false,
    orbitPriority: 17,
    windowStart: 9,
    windowEnd: 3,
    monthly: monthlyCalendar({ peak: [11, 12, 1, 2], main: [9, 10, 3] }),
    confidence: "medium",
    sourceIds: ["expo-production-calendar"],
    lastReviewed: LAST_REVIEWED,
    agricaApproved: true,
  },
] as const;

export const HERO_BY_MONTH: Readonly<Record<MonthNumber, ProduceProductId>> = {
  1: "produce:orange",
  2: "produce:fresh-strawberry",
  3: "produce:potato",
  4: "produce:potato",
  5: "produce:grape",
  6: "produce:grape",
  7: "produce:fresh-mango",
  8: "produce:fresh-mango",
  9: "produce:pomegranate",
  10: "produce:date",
  11: "produce:sweet-potato",
  12: "produce:orange",
} as const;

const SEASONAL_PRODUCT_BY_ID = new Map(SEASONAL_PRODUCTS.map((entry) => [entry.productId, entry]));

export function nextMonthNumber(month: MonthNumber): MonthNumber {
  return (month === 12 ? 1 : month + 1) as MonthNumber;
}

export function previousMonthNumber(month: MonthNumber): MonthNumber {
  return (month === 1 ? 12 : month - 1) as MonthNumber;
}

export function isSeasonActive(state: SeasonalMonthState): boolean {
  return state.phase !== "off";
}

export function getSeasonProduct(productId: ProduceProductId): SeasonProductEntry | undefined {
  return SEASONAL_PRODUCT_BY_ID.get(productId);
}

export function getHeroForMonth(month: MonthNumber): SeasonProductEntry {
  const entry = getSeasonProduct(HERO_BY_MONTH[month]);
  if (!entry || !entry.heroEligible || !entry.agricaApproved || !isSeasonActive(entry.monthly[month])) {
    throw new Error(`Invalid seasonal hero configured for month ${month}`);
  }
  return entry;
}

export function getSeasonDisplayStatus(entry: SeasonProductEntry, month: MonthNumber): SeasonDisplayStatus {
  const current = entry.monthly[month];
  if (current.phase === "peak") return "peak";
  if (!isSeasonActive(entry.monthly[previousMonthNumber(month)])) return "opening";
  if (!isSeasonActive(entry.monthly[nextMonthNumber(month)])) return "final";
  return "in-season";
}

export function getSeasonalProductsForMonth(month: MonthNumber): readonly SeasonProductEntry[] {
  const phaseOrder: Readonly<Record<SeasonPhase, number>> = { peak: 0, main: 1, shoulder: 2, off: 3 };
  return SEASONAL_PRODUCTS
    .filter((entry) => entry.agricaApproved && isSeasonActive(entry.monthly[month]))
    .sort((a, b) => phaseOrder[a.monthly[month].phase] - phaseOrder[b.monthly[month].phase] || a.orbitPriority - b.orbitPriority);
}

export function getProductsStartingNextMonth(month: MonthNumber): readonly SeasonProductEntry[] {
  const next = nextMonthNumber(month);
  return SEASONAL_PRODUCTS
    .filter((entry) => entry.agricaApproved && !isSeasonActive(entry.monthly[month]) && isSeasonActive(entry.monthly[next]))
    .sort((a, b) => a.orbitPriority - b.orbitPriority);
}
