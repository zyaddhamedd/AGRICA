import type { MonthCode, MonthNumber, ProductSeasonAvailability } from "@/types/agrica";

export type SeasonType = "winter" | "spring" | "summer" | "autumn";

export interface MonthDefinition {
  readonly number: MonthNumber;
  readonly code: MonthCode;
  readonly name: string;
  readonly season: SeasonType;
  readonly seasonLabel: string;
  readonly bgTint: string;
}

export const MONTHS: readonly MonthDefinition[] = [
  { number: 1, code: "JAN", name: "January", season: "winter", seasonLabel: "Winter Harvest", bgTint: "#EEF2F4" },
  { number: 2, code: "FEB", name: "February", season: "winter", seasonLabel: "Winter Harvest", bgTint: "#EEF2F4" },
  { number: 3, code: "MAR", name: "March", season: "spring", seasonLabel: "Spring Harvest", bgTint: "#F1F5EB" },
  { number: 4, code: "APR", name: "April", season: "spring", seasonLabel: "Spring Harvest", bgTint: "#F1F5EB" },
  { number: 5, code: "MAY", name: "May", season: "spring", seasonLabel: "Spring Harvest", bgTint: "#F1F5EB" },
  { number: 6, code: "JUN", name: "June", season: "summer", seasonLabel: "Summer Harvest", bgTint: "#F5F3E8" },
  { number: 7, code: "JUL", name: "July", season: "summer", seasonLabel: "Summer Harvest", bgTint: "#F5F3E8" },
  { number: 8, code: "AUG", name: "August", season: "summer", seasonLabel: "Summer Harvest", bgTint: "#F5F3E8" },
  { number: 9, code: "SEP", name: "September", season: "autumn", seasonLabel: "Autumn Harvest", bgTint: "#F3ECE3" },
  { number: 10, code: "OCT", name: "October", season: "autumn", seasonLabel: "Autumn Harvest", bgTint: "#F3ECE3" },
  { number: 11, code: "NOV", name: "November", season: "autumn", seasonLabel: "Autumn Harvest", bgTint: "#F3ECE3" },
  { number: 12, code: "DEC", name: "December", season: "winter", seasonLabel: "Winter Harvest", bgTint: "#EEF2F4" },
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

/**
 * Structured Data Model for Seasonal Crops Presentation (Illustrative Demo Matrix)
 */
export interface SeasonalCrop {
  readonly id: string;
  readonly name: string;
  readonly category: "Fresh" | "Frozen" | "Dried";
  readonly visualKey: string;
  readonly imageSrc: string;
  readonly peakMonths: readonly number[]; // 1-12
  readonly availableMonths: readonly number[]; // 1-12
  readonly displayPriority: number; // 1 = highest
  readonly heroRole: "hero" | "secondary" | "tertiary";
  readonly preferredPosition: "left" | "center" | "right";
  readonly spec?: string;
}

export interface MonthCropStatus {
  readonly crop: SeasonalCrop;
  readonly status: "PEAK HARVEST" | "AVAILABLE";
  readonly statusColor: string;
}

export const SEASONAL_CROPS_REGISTRY: readonly SeasonalCrop[] = [
  {
    id: "crop-mango",
    name: "EGYPTIAN MANGOES",
    category: "Fresh",
    visualKey: "crop1",
    imageSrc: "/assets/season_crop_1.png",
    peakMonths: [6, 7, 8, 9, 10, 11, 12, 1],
    availableMonths: [2, 5],
    displayPriority: 1,
    heroRole: "hero",
    preferredPosition: "left",
  },
  {
    id: "crop-pomegranate",
    name: "FRESH POMEGRANATES",
    category: "Fresh",
    visualKey: "crop2",
    imageSrc: "/assets/season_crop_2.png",
    peakMonths: [8, 9, 10, 11, 12, 1, 2, 3],
    availableMonths: [4, 7],
    displayPriority: 2,
    heroRole: "secondary",
    preferredPosition: "right",
  },
  {
    id: "crop-citrus",
    name: "HERBS & BOTANICALS",
    category: "Dried",
    visualKey: "crop3",
    imageSrc: "/assets/season_crop_3.png",
    peakMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    availableMonths: [6, 9],
    displayPriority: 3,
    heroRole: "tertiary",
    preferredPosition: "center",
  },
  {
    id: "crop-atlas",
    name: "CITRUS SELECTION",
    category: "Fresh",
    visualKey: "crop4",
    imageSrc: "/assets/season_crop_4.png",
    peakMonths: [3, 4, 5, 6, 7, 8, 9],
    availableMonths: [2, 10],
    displayPriority: 1,
    heroRole: "hero",
    preferredPosition: "left",
  },
] as const;

/**
 * Returns crops active in a given month (sorted by priority).
 */
export function getCropsForMonth(monthNumber: number): MonthCropStatus[] {
  const result: MonthCropStatus[] = [];

  for (const crop of SEASONAL_CROPS_REGISTRY) {
    if (crop.peakMonths.includes(monthNumber)) {
      result.push({
        crop,
        status: "PEAK HARVEST",
        statusColor: "#50A010",
      });
    } else if (crop.availableMonths.includes(monthNumber)) {
      result.push({
        crop,
        status: "AVAILABLE",
        statusColor: "#B76A2B",
      });
    }
  }

  return result.sort((a, b) => a.crop.displayPriority - b.crop.displayPriority);
}


