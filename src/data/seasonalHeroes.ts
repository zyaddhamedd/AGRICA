import type { ProduceProductId } from "@/types/agrica";

export interface SeasonalHeroDefinition {
  readonly productId: ProduceProductId;
  readonly defaultName: string;
  readonly botanicalName: string;
  readonly accentColor: string;
  readonly secondaryColor: string;
  readonly shadowTone: string;
  readonly silhouetteType:
    | "pomegranate"
    | "orange"
    | "strawberry"
    | "grape"
    | "mango"
    | "date"
    | "potato"
    | "sweet-potato";
  /** Path to future transparent botanical cutout (AVIF/WebP) */
  readonly imagePath: string;
  /** Set to false once the final Higgsfield asset is placed in public directory */
  readonly isPlaceholder: boolean;
}

/**
 * Centralized registry for the 8 unique Seasonal Hero Crops.
 * Keyed by ProduceProductId.
 *
 * Once final Higgsfield photography cutouts are approved,
 * update the `imagePath` and set `isPlaceholder: false`.
 */
export const SEASONAL_HERO_CATALOGUE: Readonly<Record<ProduceProductId, SeasonalHeroDefinition>> = {
  "produce:orange": {
    productId: "produce:orange",
    defaultName: "Egyptian Orange",
    botanicalName: "Citrus sinensis",
    accentColor: "#c8762d",
    secondaryColor: "#e8b257",
    shadowTone: "rgba(200, 118, 45, 0.22)",
    silhouetteType: "orange",
    imagePath: "/assets/seasons/heroes/hero-orange.webp",
    isPlaceholder: false,
  },
  "produce:fresh-strawberry": {
    productId: "produce:fresh-strawberry",
    defaultName: "Winter Strawberry",
    botanicalName: "Fragaria × ananassa",
    accentColor: "#8e2f35",
    secondaryColor: "#d77a6f",
    shadowTone: "rgba(142, 47, 53, 0.22)",
    silhouetteType: "strawberry",
    imagePath: "/assets/seasons/heroes/hero-strawberry.webp",
    isPlaceholder: false,
  },
  "produce:potato": {
    productId: "produce:potato",
    defaultName: "Export Potato",
    botanicalName: "Solanum tuberosum",
    accentColor: "#8b7656",
    secondaryColor: "#cab789",
    shadowTone: "rgba(139, 118, 86, 0.22)",
    silhouetteType: "potato",
    imagePath: "/assets/seasons/heroes/hero-potato.avif",
    isPlaceholder: false,
  },
  "produce:grape": {
    productId: "produce:grape",
    defaultName: "Table Grape",
    botanicalName: "Vitis vinifera",
    accentColor: "#872033",
    secondaryColor: "#4f7236",
    shadowTone: "rgba(135, 32, 51, 0.22)",
    silhouetteType: "grape",
    imagePath: "/assets/seasons/heroes/hero-grape.webp",
    isPlaceholder: false,
  },
  "produce:fresh-mango": {
    productId: "produce:fresh-mango",
    defaultName: "Egyptian Mango",
    botanicalName: "Mangifera indica",
    accentColor: "#d97824",
    secondaryColor: "#4e7c3b",
    shadowTone: "rgba(217, 120, 36, 0.22)",
    silhouetteType: "mango",
    imagePath: "/assets/seasons/heroes/hero-mango.webp",
    isPlaceholder: false,
  },
  "produce:pomegranate": {
    productId: "produce:pomegranate",
    defaultName: "Wonderful Pomegranate",
    botanicalName: "Punica granatum",
    accentColor: "#672a38",
    secondaryColor: "#a75863",
    shadowTone: "rgba(103, 42, 56, 0.24)",
    silhouetteType: "pomegranate",
    imagePath: "/assets/seasons/heroes/hero-pomegranate.webp",
    isPlaceholder: false,
  },
  "produce:date": {
    productId: "produce:date",
    defaultName: "Fresh Date",
    botanicalName: "Phoenix dactylifera",
    accentColor: "#7c4424",
    secondaryColor: "#d99742",
    shadowTone: "rgba(124, 68, 36, 0.22)",
    silhouetteType: "date",
    imagePath: "/assets/seasons/heroes/hero-date.webp",
    isPlaceholder: false,
  },
  "produce:sweet-potato": {
    productId: "produce:sweet-potato",
    defaultName: "Beauregard Sweet Potato",
    botanicalName: "Ipomoea batatas",
    accentColor: "#c45b28",
    secondaryColor: "#59733d",
    shadowTone: "rgba(196, 91, 40, 0.22)",
    silhouetteType: "sweet-potato",
    imagePath: "/assets/seasons/heroes/hero-sweet-potato.webp",
    isPlaceholder: false,
  },
};

export function getSeasonalHeroAsset(productId: ProduceProductId): SeasonalHeroDefinition {
  return (
    SEASONAL_HERO_CATALOGUE[productId] ?? {
      productId,
      defaultName: "Agricultural Produce",
      botanicalName: "Egyptian Export Produce",
      accentColor: "#405366",
      secondaryColor: "#8b9aa5",
      shadowTone: "rgba(64, 83, 102, 0.2)",
      silhouetteType: "orange",
      imagePath: "",
      isPlaceholder: true,
    }
  );
}

/**
 * Returns all active production hero image paths for intelligent idle preloading.
 */
export function getActiveSeasonalHeroImagePaths(): readonly string[] {
  return Object.values(SEASONAL_HERO_CATALOGUE)
    .filter((hero) => !hero.isPlaceholder && Boolean(hero.imagePath))
    .map((hero) => hero.imagePath);
}

