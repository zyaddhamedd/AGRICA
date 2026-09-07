import type { ProductLibrary, WorldId } from "@/types/agrica";

export const PRODUCT_LIBRARY: ProductLibrary = {
  fresh: {
    label: "Fresh produce",
    families: [
      {
        name: "Citrus",
        code: "CIT",
        products: ["Oranges", "Lemons", "Egyptian Limes", "Mandarins", "Grapefruit"],
      },
      {
        name: "Fresh Fruits",
        code: "FRT",
        products: ["Grapes", "Pomegranates", "Strawberries", "Mangoes", "Watermelon", "Melons", "Guava", "Dates"],
      },
      {
        name: "Vegetables & Tubers",
        code: "VEG",
        products: [
          "Potatoes",
          "Sweet Potatoes",
          "Onions",
          "Garlic",
          "Green Beans",
          "Tomatoes",
          "Bell Peppers",
          "Chili Peppers",
          "Cucumbers",
          "Zucchini",
          "Eggplant",
          "Artichokes",
          "Carrots",
          "Broccoli",
          "Cauliflower",
          "Cabbage",
        ],
      },
    ],
  },
  frozen: {
    label: "Frozen produce",
    families: [
      {
        name: "IQF Fruits",
        code: "IQF",
        products: ["Strawberries", "Mango", "Pomegranate Arils", "Guava"],
      },
      {
        name: "IQF Vegetables",
        code: "IQV",
        products: [
          "Green Beans",
          "Green Peas",
          "Okra",
          "Molokhia",
          "Spinach",
          "Artichokes",
          "Broccoli",
          "Cauliflower",
          "Carrots",
          "Bell Peppers",
          "Sweet Corn",
          "Broad Beans",
          "Peas & Carrots",
          "Mixed Vegetables",
        ],
      },
    ],
  },
  dried: {
    label: "Dried produce",
    families: [
      {
        name: "Dried Fruits",
        code: "DRF",
        products: ["Orange", "Lemon", "Grapefruit", "Mango", "Strawberry", "Pomegranate", "Dates"],
      },
      {
        name: "Dehydrated Vegetables",
        code: "DRV",
        products: ["Onion", "Garlic", "Tomato", "Carrot", "Bell Pepper", "Molokhia"],
      },
    ],
  },
} as const;

/**
 * Visual key helper reproducing exact prototype sprite/fallback mapping logic:
 * Oranges -> "orange", Lemons -> "lemon", Sweet potatoes -> "potato"
 * Otherwise fallback: `${world}-${familyCode.toLowerCase()}`
 */
export function visualFor(name: string, world: WorldId, familyCode: string): string {
  const value = name.toLowerCase();
  if (value === "oranges" || (world === "fresh" && value === "orange")) return "orange";
  if (value === "lemons" || (world === "fresh" && value === "lemon")) return "lemon";
  if (value === "sweet potatoes") return "potato";
  return `${world}-${familyCode.toLowerCase()}`;
}

/**
 * Counts all products across all families in a world.
 */
export function countProductsInWorld(world: WorldId): number {
  return PRODUCT_LIBRARY[world].families.reduce((sum, family) => sum + family.products.length, 0);
}

/**
 * Total catalogue count across all three worlds.
 */
export function totalCatalogueCount(): number {
  return (
    countProductsInWorld("fresh") +
    countProductsInWorld("frozen") +
    countProductsInWorld("dried")
  );
}
