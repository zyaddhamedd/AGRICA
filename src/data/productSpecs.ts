import type { ExportSpecification, ProductVariety, ProductAtlasItem } from "@/types/agrica";

export interface CropSpecEntry {
  readonly defaultSpecs?: ExportSpecification;
  readonly varieties?: readonly ProductVariety[];
}

/**
 * Verified AGRICA Commercial & Export Specifications Registry.
 * Fields without approved data are omitted. No fabricated placeholders are used.
 */
export const VERIFIED_PRODUCT_SPECS: Record<string, CropSpecEntry> = {
  Oranges: {
    varieties: [
      { id: "valencia", name: "Valencia" },
      { id: "navel", name: "Navel" },
      { id: "baladi", name: "Baladi" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Nov – May",
      temperature: "+4°C to +6°C",
      packaging: ["Telescopic Cartons (15kg)", "Open-Top Cartons (10kg)", "Net Bags (5kg)"],
      grade: "Class I / GlobalG.A.P.",
    },
  },
  Lemons: {
    varieties: [
      { id: "eureka", name: "Eureka" },
      { id: "verna", name: "Verna" },
      { id: "adalia", name: "Adalia" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Oct – Mar",
      temperature: "+8°C to +10°C",
      packaging: ["Telescopic Cartons (15kg)", "Plastic Boxes (10kg)"],
      grade: "Class I / GlobalG.A.P.",
    },
  },
  Grapes: {
    varieties: [
      { id: "flame", name: "Flame Seedless" },
      { id: "superior", name: "Superior Seedless" },
      { id: "crimson", name: "Crimson Seedless" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "May – Aug",
      temperature: "0°C to +1°C",
      packaging: ["Carry Bags in Cartons (5kg)", "Punnets (500g x 10)"],
      seedStatus: "Seedless",
      grade: "Class I / GlobalG.A.P.",
    },
  },
  Potatoes: {
    varieties: [
      { id: "spunta", name: "Spunta" },
      { id: "hermes", name: "Hermes" },
      { id: "lady-rosetta", name: "Lady Rosetta" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Jan – Jun",
      temperature: "+4°C to +8°C",
      packaging: ["Jumbo Bags (1000kg)", "Mesh Bags (25kg/10kg)"],
      grade: "Class I / Phytosanitary Certified",
    },
  },
  Strawberries: {
    varieties: [
      { id: "fortuna", name: "Florida Fortuna" },
      { id: "sensation", name: "Sensation" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Nov – Apr",
      temperature: "0°C to +1°C",
      packaging: ["Punnets in Cartons (250g x 8 / 250g x 10)"],
      grade: "Class I / GlobalG.A.P.",
    },
  },
  Pomegranates: {
    varieties: [
      { id: "wonderful", name: "Wonderful" },
      { id: "116", name: "116" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Aug – Nov",
      temperature: "+5°C to +7°C",
      packaging: ["Cartons (4.5kg / 5kg)"],
      grade: "Class I / GlobalG.A.P.",
    },
  },
  Onions: {
    varieties: [
      { id: "red", name: "Red Onion" },
      { id: "yellow", name: "Golden/Yellow Onion" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Feb – Jun",
      temperature: "Ambient / Controlled Cool",
      packaging: ["Mesh Bags (10kg / 25kg)", "Jumbo Bags (1000kg)"],
    },
  },
  Garlic: {
    varieties: [
      { id: "white", name: "Egyptian White" },
      { id: "red", name: "Egyptian Red" },
    ],
    defaultSpecs: {
      origin: "Egypt",
      harvestWindow: "Feb – May",
      temperature: "-1°C to 0°C",
      packaging: ["Mesh Bags (5kg / 10kg)", "Cartons (10kg)"],
    },
  },
};

/**
 * Gets verified specs & variety list for a given product item.
 */
export function getProductSpecData(item: ProductAtlasItem): CropSpecEntry {
  const entry = VERIFIED_PRODUCT_SPECS[item.name];
  if (entry) return entry;

  // Fallback to verified item properties if present
  const defaultSpecs: ExportSpecification = {
    origin: item.origin ?? "Egypt",
    temperature: item.temperature,
    packaging: item.packaging,
    grade: item.grade,
  };

  return {
    defaultSpecs,
    varieties: undefined,
  };
}
