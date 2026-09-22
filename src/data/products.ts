import type {
  ProductDefinition,
  ProductLibrary,
  ProduceFamilyId,
  ProduceProductId,
  WorldId,
} from "@/types/agrica";

const WORLD_IDS: readonly WorldId[] = ["fresh", "frozen", "dried"];

export function isWorldId(value: unknown): value is WorldId {
  return typeof value === "string" && (WORLD_IDS as readonly string[]).includes(value);
}

const product = (
  id: ProduceProductId,
  name: string,
  worldId: WorldId,
  familyId: ProduceFamilyId,
  mediaKey: string,
): ProductDefinition => ({
  id,
  divisionId: "produce",
  worldId,
  familyId,
  mediaKey,
  name,
});

export const PRODUCT_LIBRARY: ProductLibrary = {
  fresh: {
    label: "Fresh produce",
    families: [
      {
        id: "citrus",
        name: "Citrus",
        code: "CIT",
        products: [
          product("produce:orange", "Oranges", "fresh", "citrus", "orange"),
          product("produce:lemon", "Lemons", "fresh", "citrus", "lemon"),
          product("produce:egyptian-lime", "Egyptian Limes", "fresh", "citrus", "fresh-cit"),
          product("produce:mandarin", "Mandarins", "fresh", "citrus", "fresh-cit"),
        ],
      },
      {
        id: "fresh-fruits",
        name: "Fresh Fruits",
        code: "FRT",
        products: [
          product("produce:grape", "Grapes", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:pomegranate", "Pomegranates", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:fresh-strawberry", "Strawberries", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:blueberry", "Blueberries", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:fresh-mango", "Mangoes", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:guava", "Guava", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:date", "Dates", "fresh", "fresh-fruits", "fresh-frt"),
          product("produce:watermelon", "Watermelon", "fresh", "fresh-fruits", "fresh-frt"),
        ],
      },
      {
        id: "vegetables-tubers",
        name: "Vegetables & Tubers",
        code: "VEG",
        products: [
          product("produce:potato", "Potatoes", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:sweet-potato", "Sweet Potatoes", "fresh", "vegetables-tubers", "potato"),
          product("produce:onion", "Onions", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:garlic", "Garlic", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:fresh-green-bean", "Green Beans", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:fresh-artichoke", "Artichokes", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:carrot", "Carrots", "fresh", "vegetables-tubers", "fresh-veg"),
          product("produce:taro", "Taro", "fresh", "vegetables-tubers", "fresh-veg"),
        ],
      },
    ],
  },
  frozen: {
    label: "Frozen produce",
    families: [
      {
        id: "iqf-fruits",
        name: "IQF Fruits",
        code: "IQF",
        products: [
          product("produce:iqf-strawberry", "IQF Strawberries", "frozen", "iqf-fruits", "frozen-iqf"),
          product("produce:iqf-mango", "IQF Mango", "frozen", "iqf-fruits", "frozen-iqf"),
          product("produce:iqf-pomegranate-arils", "IQF Pomegranate Arils", "frozen", "iqf-fruits", "frozen-iqf"),
        ],
      },
      {
        id: "iqf-vegetables",
        name: "IQF Vegetables",
        code: "IQV",
        products: [
          product("produce:iqf-green-bean", "IQF Green Beans", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:iqf-green-pea", "IQF Green Peas", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:iqf-okra", "IQF Okra", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:iqf-molokhia", "IQF Molokhia", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:iqf-artichoke", "IQF Artichokes", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:iqf-broccoli", "IQF Broccoli", "frozen", "iqf-vegetables", "frozen-iqv"),
          product("produce:mixed-vegetables", "Mixed Vegetables", "frozen", "iqf-vegetables", "frozen-iqv"),
        ],
      },
      {
        id: "frozen-potato-products",
        name: "Frozen Potato Products",
        code: "FPP",
        products: [
          product("produce:half-fried-french-fries", "Half-Fried French Fries", "frozen", "frozen-potato-products", "frozen-fpp"),
        ],
      },
    ],
  },
  dried: {
    label: "Dried produce",
    families: [
      {
        id: "dried-fruits",
        name: "Dried Fruits",
        code: "DRF",
        products: [
          product("produce:dried-lemon", "Dried Lemon", "dried", "dried-fruits", "dried-drf"),
          product("produce:raisin", "Raisins", "dried", "dried-fruits", "dried-drf"),
        ],
      },
      {
        id: "dried-vegetables",
        name: "Dried Vegetables",
        code: "DRV",
        products: [
          product("produce:sun-dried-tomato", "Sun-Dried Tomatoes", "dried", "dried-vegetables", "dried-drv"),
          product("produce:dehydrated-onion", "Dehydrated Onion", "dried", "dried-vegetables", "dried-drv"),
          product("produce:dehydrated-garlic", "Dehydrated Garlic", "dried", "dried-vegetables", "dried-drv"),
          product("produce:dried-molokhia", "Dried Molokhia", "dried", "dried-vegetables", "dried-drv"),
        ],
      },
    ],
  },
} as const;

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
