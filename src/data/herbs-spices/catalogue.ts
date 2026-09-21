import type {
  HerbsSpicesAvailableForm,
  HerbsSpicesCatalogueItem,
  HerbsSpicesFamily,
  HerbsSpicesFamilyId,
} from "@/types/herbs-spices";

/** Internal source: client-provided AGRICA CP.pdf. */
export const HERBS_SPICES_FAMILIES = [
  { id: "herbs", label: "Herbs", status: "source-backed" },
  { id: "flowers", label: "Flowers", status: "source-backed" },
  { id: "seeds", label: "Seeds", status: "source-backed" },
  { id: "spices", label: "Spices", status: "source-backed" },
  { id: "roots", label: "Roots", status: "source-backed" },
  { id: "dehydrated-vegetables", label: "Dehydrated Vegetables", status: "source-backed" },
] as const satisfies readonly HerbsSpicesFamily[];

/** Division-level formats only; this is not a product-by-product availability matrix. */
export const HERBS_SPICES_AVAILABLE_FORMS = [
  { id: "whole", label: "Whole", status: "source-backed" },
  { id: "cut-sifted", label: "Cut & Sifted", status: "source-backed" },
  { id: "tbc", label: "TBC (Tea Bag Cut)", status: "source-backed" },
  { id: "crushed", label: "Crushed", status: "source-backed" },
  { id: "powder", label: "Powder", status: "source-backed" },
] as const satisfies readonly HerbsSpicesAvailableForm[];

const familyNames = Object.fromEntries(
  HERBS_SPICES_FAMILIES.map((family) => [family.id, family.label]),
) as Record<HerbsSpicesFamilyId, string>;

function product(
  slug: string,
  name: string,
  familyId: HerbsSpicesFamilyId,
  forms: readonly string[] = [],
): HerbsSpicesCatalogueItem {
  return {
    id: `herbs-spices:${slug}`,
    slug,
    name,
    familyId,
    familyName: familyNames[familyId],
    forms,
    mediaKey: `product-${slug}`,
    status: "source-backed",
    // Identity and family membership are verified by the PDF; unlisted fields stay absent.
    verified: true,
  };
}

/** Static, source-controlled catalogue. No CMS, database, admin panel, or product API. */
export const HERBS_SPICES_CATALOGUE = [
  product("basil", "Basil", "herbs"),
  product("dill", "Dill", "herbs"),
  product("lemon-grass", "Lemon Grass", "herbs"),
  product("marjoram", "Marjoram", "herbs"),
  product("moringa", "Moringa", "herbs"),
  product("oregano", "Oregano", "herbs"),
  product("parsley", "Parsley", "herbs"),
  product("peppermint", "Peppermint", "herbs"),
  product("rosemary", "Rosemary", "herbs"),
  product("spearmint", "Spearmint", "herbs"),
  product("thyme", "Thyme", "herbs"),
  product("calendula", "Calendula", "flowers"),
  product("chamomile", "Chamomile", "flowers"),
  product("hibiscus", "Hibiscus", "flowers"),
  product("anise", "Anise", "seeds"),
  product("black-cumin", "Black Cumin", "seeds"),
  product("caraway", "Caraway", "seeds"),
  product("coriander", "Coriander", "seeds"),
  product("fennel", "Fennel", "seeds"),
  product("fenugreek", "Fenugreek", "seeds"),
  product("flaxseed", "Flaxseed", "seeds"),
  product("sesame", "Sesame", "seeds"),
  product("cumin", "Cumin", "spices"),
  product("red-chilli-pepper", "Red Chilli Pepper", "spices"),
  product("licorice-root", "Licorice Root", "roots"),
  product("onion", "Onion", "dehydrated-vegetables", ["Flakes", "Granules", "Powder"]),
  product("garlic", "Garlic", "dehydrated-vegetables"),
] as const satisfies readonly HerbsSpicesCatalogueItem[];
