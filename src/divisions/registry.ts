import type { DivisionDefinition, DivisionId } from "./types";

/**
 * Lightweight division metadata. Keep this registry free of components,
 * product data, media, animation libraries, and styles.
 */
export const DIVISION_REGISTRY = {
  produce: {
    id: "produce",
    label: "AGRICA Produce",
    basePath: "/",
    routes: {
      home: "/",
      products: "/products",
      standard: "/standard",
    },
  },
  "herbs-spices": {
    id: "herbs-spices",
    label: "AGRICA Herbs & Spices",
    basePath: "/herbs-spices",
    routes: {
      home: "/herbs-spices",
      products: "/herbs-spices/products",
      standard: "/herbs-spices/standard",
    },
  },
} as const satisfies Readonly<Record<DivisionId, DivisionDefinition>>;

export const DIVISIONS = Object.values(DIVISION_REGISTRY) as readonly DivisionDefinition[];
