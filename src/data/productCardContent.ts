import type { ProduceProductId, WorldId } from "@/types/agrica";
import type { ProductCardContent, ProductCardFieldLabelKey, PublicProductCardContent } from "@/types/product-card-content";

type SpecData = Partial<Record<ProductCardFieldLabelKey, string>>;
const FRESH = "AGRICA Fresh product specifications (client-approved, 2026-10-09)";
const FROZEN = "AGRICA Frozen product specifications (client-approved, 2026-10-09)";

function approved(productId: ProduceProductId, category: WorldId, sourceRef: string, data: SpecData): ProductCardContent {
  return {
    productId, category,
    fields: Object.entries(data).map(([labelKey, value], index) => ({
      labelKey: labelKey as ProductCardFieldLabelKey, value: value!, displayOrder: index + 1,
      assumed: false, reviewRequired: false, sourceRefs: [sourceRef], confidence: "HIGH",
    })),
    clientReview: { required: false, assumptions: [], priority: "LOW" },
    internalNote: "Verbatim normalized from the approved AGRICA client specification table.",
    sourceRefs: [sourceRef], confidence: "HIGH",
    imageBrief: { readiness: "READY", brief: "Preserve the existing catalogue visual.", dependencies: [] },
  };
}

export const PRODUCT_CARD_CONTENT: Readonly<Record<string, ProductCardContent>> = {
  "produce:orange": approved("produce:orange", "fresh", FRESH, {
    product:"Fresh Egyptian Oranges", origin:"Egypt", mainVarieties:"Navel · Valencia · Baladi", season:"Nov – Aug", sizeCalibre:"48 · 56 · 64 · 72 · 80 · 88 · 100 · 113 · 125", grade:"Class I / Export Grade", packing:"15 kg Telescopic or Open-Top Cartons · 8 kg option available", storage:"Typically 3–8°C · Programme dependent", shelfLife:"Approx. 4–8 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice Processing",
  }),
  "produce:lemon": approved("produce:lemon", "fresh", FRESH, {
    product:"Fresh Egyptian Lemons", origin:"Egypt", mainVarieties:"Adalia · Eureka · Meyer", season:"Oct – Jun", sizeCalibre:"72 · 80 · 88 · 100 · 113 · 125 · 138 . 150", grade:"Class I / Export Grade", packing:"15 kg Telescopic or Open-Top Cartons · Other packing options available", storage:"Typically 8 –10°C · Programme dependent", shelfLife:"Approx. 4–8 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice Processing",
  }),
  "produce:egyptian-lime": approved("produce:egyptian-lime", "fresh", FRESH, {
    product:"Fresh Egyptian Limes", origin:"Egypt", mainVarieties:"Benzahiri · Persian Lime", season:"Aug – Feb", sizeCalibre:"36 · 42 · 48 · 54 · 60 · 63 · 72", grade:"Class I / Export Grade", packing:"4 kg · 5 kg · 10 kg Cartons · Other packing options available", storage:"Typically 8–12°C · Programme dependent", shelfLife:"Approx. 3–6 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight · Air Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice & Beverage Processing",
  }),
  "produce:grapefruit": approved("produce:grapefruit", "fresh", FRESH, {
    product:"Fresh Egyptian Grapefruit", origin:"Egypt", mainVarieties:"Star Ruby (Dark Red Seedless)", season:"Nov – April", sizeCalibre:"30 · 35 · 40 · 45 · 50 · 55 · 60 · 65", grade:"Class I / Export Grade", packing:"14 kg · 15 kg Cartons · Other packing options available", storage:"Typically 8–12°C · Programme dependent", shelfLife:"Approx. 4–8 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice Processing",
  }),
  "produce:mandarin": approved("produce:mandarin", "fresh", FRESH, {
    product:"Fresh Egyptian Mandarins", origin:"Egypt", mainVarieties:"Murcott · Fremont · Clementine . Mirav", season:"Nov – Mar", sizeCalibre:"36 · 42 · 45 · 54 · 63 · 70 · 80 · 90 · 100", grade:"Class I / Export Grade", packing:"8 kg · 10 kg · 15 kg Cartons · Other packing options available", storage:"Typically 4–8°C · Programme dependent", shelfLife:"Approx. 3–6 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice Processing",
  }),
  "produce:grape": approved("produce:grape", "fresh", FRESH, {
    product:"Fresh Egyptian Grapes", origin:"Egypt", hsCode:"080610", mainVarieties:"Superior · Early Sweet · Prime · Thompson · Red Flame · Starlight · Crimson · Red Globe · Black Magic · Autumn Royal", colors:"Green · Red · Black", sizeCalibre:"15–22 mm · Depending on variety", grade:"Class I / Export Grade", packing:"4.5 kg · 5 kg Cartons · Punnets / Bags · Other packing options available", storage:"0–1°C · 90–95% Relative Humidity", shelfLife:"Approx. 45–60 days depending on variety, with SO₂ pads and proper cold chain", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight · Air Freight", qualityStandard:"International Export Standards · EU Market Requirements", applications:"Fresh Retail · Wholesale · Foodservice",
  }),
  "produce:pomegranate": approved("produce:pomegranate", "fresh", FRESH, {
    product:"Fresh Egyptian Pomegranates", origin:"Egypt", hsCode:"081090", mainVarieties:"Wonderful · Early 116 · Manfaluti · Baladi", season:"Aug – Dec", sizeCalibre:"6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 fruits per carton", grade:"Class I / Export Grade", packing:"4.5 kg Open-Top Cartons · Plastic Trays · Other packing options available", storage:"Typically 5–7°C · Humidity controlled", shelfLife:"Approx. 6–10 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice Processing",
  }),
  "produce:fresh-strawberry": approved("produce:fresh-strawberry", "fresh", FRESH, {
    product:"Fresh Egyptian Strawberries", origin:"Egypt", hsCode:"081010", mainVarieties:"Festival · Fortuna · Sensation", season:"Nov – Apr", sizeCalibre:"Approx. 18–35+ mm · Depending on variety and customer specification", grade:"Class I / Export Grade", packing:"5.0 kg Carton: 20 High Punnets × 250 g · 4.8 kg Carton: 12 High Punnets × 400 g · 2.5 kg Carton: 10 Flat Punnets × 250 g · 2.0 kg Carton: 8 Flat Punnets × 250 g", storage:"Typically 0–2°C · High relative humidity", shelfLife:"Approx. 7–14 days under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Mainly Air Freight · MOQ: 1 MT · 40’ Reefer: Approx. 20 MT palletized", applications:"Fresh Retail · Wholesale · Foodservice",
  }),
  "produce:blueberry": approved("produce:blueberry", "fresh", FRESH, {
    product:"Fresh Egyptian Blueberries", origin:"Egypt", hsCode:"081040", mainVarieties:"Atlasblue · Keplerblue · Olympusblue · Azurblue · Gladiator · Maverick · Sweet Duchess · Manila · Maldiva · Madeira", season:"Jan – May", sizeCalibre:"Typically 12–20+ mm · Depending on variety and customer specification", grade:"Premium / Export Grade", packing:"125 g · 170 g · 250 g Punnets · Export cartons according to programme", storage:"Typically 0–2°C · 90–95% Relative Humidity", shelfLife:"Approx. 2–4 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Air Freight · Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice",
  }),
  "produce:fresh-mango": approved("produce:fresh-mango", "fresh", FRESH, {
    product:"Fresh Egyptian Mangoes", origin:"Egypt", hsCode:"080450", mainVarieties:"Keitt · Kent · Naomi · Ewais · Zebdia · Tommy Atkins · Sedeeka · Fagr Kelan . R2E2", season:"Jul – Nov", sizeCalibre:"Approx. 250–900 g · Depending on variety and customer specification", grade:"Class I / Export Grade", packing:"2.5 kg · 3 kg · 4 kg · 5 kg Cartons · Foam Nets / Molded Trays available", storage:"Typically 10 –13°C · Variety and maturity dependent", shelfLife:"Approx. 2–4 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight · Air Freight", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:guava": approved("produce:guava", "fresh", FRESH, {
    product:"Fresh Egyptian Guava", origin:"Egypt", hsCode:"080450", mainVarieties:"Egyptian White Guava · Seedless / Low-Seed Types", season:"Aug – Jan", sizeCalibre:"Approx. 150–350 g · Depending on variety and customer specification", grade:"Class I / Export Grade", packing:"4 kg · 5 kg Open-Top Cartons · Telescopic Cartons available upon request", storage:"Typically 8–10°C · High relative humidity", shelfLife:"Approx. 2–3 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Air Freight · Reefer Sea Freight for suitable programmes", applications:"Fresh Retail · Wholesale · Foodservice · Juice & Processing",
  }),
  "produce:date": approved("produce:date", "fresh", FRESH, {
    product:"Fresh Egyptian Dates", origin:"Egypt", hsCode:"080410", mainVarieties:"Barhi · Hayani · Zaghloul · Samani", season:"Aug – Nov", sizeCalibre:"Size and weight specifications agreed per variety and order", grade:"Class I / Export Grade", packing:"2 kg · 5 kg Open-Top or Telescopic Cartons · Retail packs available", storage:"Typically 0–4°C · Variety and maturity dependent", shelfLife:"Approx. 2–6 weeks under proper cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight · Air Freight", applications:"Fresh Retail · Wholesale · Foodservice",
  }),
  "produce:watermelon": approved("produce:watermelon", "fresh", FRESH, {
    product:"Fresh Egyptian Watermelon", origin:"Egypt", hsCode:"080711", mainVarieties:"Skata · Giza / New Giza · Crimson Sweet · Sugar Baby · Seedless Varieties", season:"Apr – Aug", sizeCalibre:"Approx. 4–6 kg · 6–9 kg · 9–14 kg per fruit", grade:"Class I / Export Grade", packing:"10 kg · 20 kg Cartons · Approx. 550–600 kg Bulk Bins · Other packing options available", storage:"Typically 10–15°C · Programme dependent", shelfLife:"Approx. 2–4 weeks under proper handling and cold-chain conditions", availability:"Seasonal, subject to variety and crop", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice",
  }),
  "produce:potato": approved("produce:potato", "fresh", FRESH, {
    product:"Fresh Egyptian Potatoes", origin:"Egypt", hsCode:"070190", mainVarieties:"Spunta · Cara · Nicola · Diamond / Diamante · Lady Rosetta · Hermes · Mondial", season:"Jan – Jul", sizeCalibre:"40 mm · 45 mm · 50 mm · 55 mm · +55 mm · Other sizing specifications available", grade:"Class I / Export Grade", packing:"5 kg · 10 kg · 25 kg Mesh / PP Bags · Jumbo Bags available", storage:"Cool, dry and well-ventilated conditions · Temperature programme depends on variety and intended use", shelfLife:"Several weeks to several months depending on variety, curing and storage conditions", availability:"Seasonal, with extended availability subject to storage", shipment:"Dry Container · Reefer Container depending on destination and programme", applications:"Fresh Retail · Wholesale · Foodservice · French Fries · Chips / Crisps · Processing",
  }),
  "produce:sweet-potato": approved("produce:sweet-potato", "fresh", FRESH, {
    product:"Fresh Egyptian Sweet Potatoes", origin:"Egypt", hsCode:"071420", mainVarieties:"Bellevue · Beauregard . White Fleshed", season:"Aug – Mar", sizeCalibre:"S: 80–150 g · M: 150–250 g · L1: 250–400 g · L2: 400–600 g · XL: 600 g+", grade:"Class I / Export Grade", packing:"6 kg Cartons · 14 kg Cartons · 550–600 kg Bulk Bins · Other packing options available", storage:"Typically 13–15°C · Avoid chilling", shelfLife:"Approx. 1–3 months depending on curing, variety and storage conditions", availability:"Seasonal, with extended availability subject to storage", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:onion": approved("produce:onion", "fresh", FRESH, {
    product:"Fresh Egyptian Onions", origin:"Egypt", hsCode:"070310", mainVarieties:"Red Onion · Golden / Yellow Onion · White Onion", season:"Mar – Sep", sizeCalibre:"40–60 mm · 50–70 mm · 60–80 mm · 80 mm+ · Other sizes available", grade:"Class I / Export Grade", packing:"10 kg · 15 kg · 20 kg · 25 kg Mesh Bags · Cartons available upon request", storage:"Cool, dry and well-ventilated conditions · Typically 0–5°C for longer storage", shelfLife:"Approx. 1–4 months depending on variety, curing and storage conditions", availability:"Seasonal, with extended availability subject to storage", shipment:"Dry Container · Reefer Container depending on destination and programme", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:garlic": approved("produce:garlic", "fresh", FRESH, {
    product:"Fresh Egyptian Garlic", origin:"Egypt", hsCode:"070320", mainVarieties:"White Garlic · Purple / Red Garlic", season:"Feb – Jun", sizeCalibre:"40–45 mm · 45–50 mm · 50–55 mm · 55–60 mm · 60 mm+", grade:"Class I / Export Grade", packing:"5 kg · 10 kg · 20 kg Mesh Bags / Cartons · Other packing options available", storage:"Cool, dry and well-ventilated conditions · Typically 0–2°C for longer storage", shelfLife:"Approx. 3–6 months depending on curing and storage conditions", availability:"Seasonal, with extended availability subject to storage", shipment:"Dry Container · Reefer Container depending on destination and programme", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:fresh-green-bean": approved("produce:fresh-green-bean", "fresh", FRESH, {
    product:"Fresh Egyptian Green Beans / French Beans", origin:"Egypt", hsCode:"070820", season:"Oct – May", sizeCalibre:"Extra Fine: <6.5 mm · Fine: 6.5–9 mm · Other grades according to customer specification", length:"Typically 12–16 cm for French Beans", grade:"Class I / Export Grade", packing:"200 g · 250 g · 500 g Retail Packs · 4 kg · 5 kg Bulk Cartons", storage:"Typically 5–7°C · 90–95% Relative Humidity", shelfLife:"Approx. 10–14 days under proper cold-chain conditions", availability:"Seasonal, subject to crop and programme", shipment:"Air Freight · Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:fresh-artichoke": approved("produce:fresh-artichoke", "fresh", FRESH, {
    product:"Fresh Egyptian Artichokes", origin:"Egypt", hsCode:"070991", season:"Nov – Apr", sizeCalibre:"Small · Medium · Large · Count and head size according to customer specification", grade:"Class I / Export Grade", packing:"5 kg · 10 kg Cartons · Other packing options available", storage:"Typically 0–2°C · 90–95% Relative Humidity", shelfLife:"Approx. 2–4 weeks under proper cold-chain conditions", availability:"Seasonal, subject to crop and programme", shipment:"Reefer Sea Freight · Air Freight", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:carrot": approved("produce:carrot", "fresh", FRESH, {
    product:"Fresh Egyptian Carrots", origin:"Egypt", hsCode:"070610", season:"Nov – Apr", sizeCalibre:"20–40 mm diameter · Length and sizing according to customer specification", grade:"Class I / Export Grade", packing:"5 kg · 10 kg · 20 kg Bags / Cartons · Retail packs available", storage:"Typically 0–2°C · 95–100% Relative Humidity", shelfLife:"Approx. 4–8 weeks under proper cold-chain conditions", availability:"Seasonal, with extended availability subject to storage", shipment:"Reefer Sea Freight", applications:"Fresh Retail · Wholesale · Foodservice · Juice & Processing",
  }),
  "produce:taro": approved("produce:taro", "fresh", FRESH, {
    product:"Fresh Egyptian Taro (Colocasia)", origin:"Egypt", hsCode:"071440", mainVarieties:"Egyptian Baladi / Local Taro Types", season:"Sep – Mar", sizeCalibre:"Small · Medium · Large · Weight specifications agreed per order", grade:"Class I / Export Grade", packing:"5 kg · 10 kg · 20 kg Mesh / PP Bags · Cartons available upon request", storage:"Typically 10–14°C · Dry, well-ventilated conditions", shelfLife:"Approx. 2–6 weeks depending on maturity, handling and storage conditions", availability:"Seasonal, subject to crop and programme", shipment:"Reefer Sea Freight · Dry Container depending on programme", applications:"Fresh Retail · Wholesale · Foodservice · Processing",
  }),
  "produce:iqf-strawberry": approved("produce:iqf-strawberry", "frozen", FROZEN, {
    product:"IQF Frozen Strawberries", origin:"Egypt", availableForms:"Whole · Halves · Slices · Diced", varieties:"Festival - Fortuna - Sensation", sizeGrade:"Calibrated or uncalibrated · Sizes and quality specifications agreed per order", ingredients:"100% strawberries*", packing:"Bags:400 g · 1 kg · 2.5 kg · 5 kg - Cartons:10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer sea freight", applications:"Smoothies · Desserts · Jams · Bakery · Dairy products",
  }),
  "produce:iqf-mango": approved("produce:iqf-mango", "frozen", FROZEN, {
    product:"IQF Frozen Mango", origin:"Egypt", availableForms:"Chunks · Cubes · Slices", varieties:"According to sourcing programme", sizeGrade:"Cut sizes and quality specifications agreed per order", ingredients:"100% Mango", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg; Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 -24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Smoothies · Desserts · Bakery · Dairy Products · Toppings",
  }),
  "produce:iqf-pomegranate-arils": approved("produce:iqf-pomegranate-arils", "frozen", FROZEN, {
    product:"IQF Frozen Pomegranate Arils", origin:"Egypt", availableForms:"Individual arils (seeds with juice sacs intact) 100% Pomegranate", varieties:"Wonderful - Early 116", sizeGrade:"According to agreed specifications", ingredients:"100% Pomegranate Arils", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg; Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Salads · Desserts · Smoothies · Dairy Products · Garnishes",
  }),
  "produce:iqf-green-pea": approved("produce:iqf-green-pea", "frozen", FROZEN, {
    product:"IQF Frozen Green Peas", origin:"Egypt", availableForms:"Whole Shelled Peas", sizeGrade:"Extra Fine (<7.5mm) Fine (7.5–8.5mm) Standard (8.5–10mm)", ingredients:"100% Green Peas", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg -  Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Soups · Stews · Rice Dishes · Side Dishes · Vegetable Mixes",
  }),
  "produce:iqf-broccoli": approved("produce:iqf-broccoli", "frozen", FROZEN, {
    product:"IQF Frozen Broccoli Florets", origin:"Egypt", availableForms:"Broccoli Florets", sizeGrade:"Floret sizes and quality specifications agreed per order", ingredients:"100% Broccoli", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Soups · Stir-Fries · Ready Meals · Vegetable Mixes",
  }),
  "produce:iqf-okra": approved("produce:iqf-okra", "frozen", FROZEN, {
    product:"IQF Frozen Okra Extra Grade", origin:"Egypt", availableForms:"Whole Okra", sizeGrade:"Extra Grade · Up to 2.5 - 5 cm", ingredients:"100% Okra", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Soups · Stews · Side Dishes · Ready Meals · Vegetable Mixes",
  }),
  "produce:iqf-green-bean": approved("produce:iqf-green-bean", "frozen", FROZEN, {
    product:"IQF Frozen Green Beans — French Beans", origin:"Egypt", availableForms:"Whole · Cut", sizeGrade:"Fine / Extra Fine · Size specifications agreed per order", ingredients:"100% Green Beans", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Soups · Stir-Fries · Ready Meals · Vegetable Mixes",
  }),
  "produce:iqf-molokhia": approved("produce:iqf-molokhia", "frozen", FROZEN, {
    product:"IQF Frozen Molokhia (Jew’s Mallow)", origin:"Egypt", availableForms:"Minced · Whole Leaves", sizeGrade:"Export Grade A · Specifications agreed per order", ingredients:"100% Molokhia (Jew’s Mallow)", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Soups · Traditional Dishes · Ready Meals · Foodservice",
  }),
  "produce:iqf-artichoke": approved("produce:iqf-artichoke", "frozen", FROZEN, {
    product:"IQF Frozen Artichokes", origin:"Egypt", availableForms:"Hearts · Bottoms · Quarters", sizeGrade:"Export Grade A · Size specifications agreed per order", ingredients:"100% Artichokes", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Salads · Pizza Toppings · Ready Meals · Foodservice",
  }),
  "produce:mixed-vegetables": approved("produce:mixed-vegetables", "frozen", FROZEN, {
    product:"IQF Frozen Mixed Vegetables", origin:"Egypt", availableForms:"Mixed Vegetables", sizeGrade:"Export Grade A · Mix composition and cut sizes agreed per order", ingredients:"Green Peas · Carrots · Green Beans · Sweet Corn", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Soups · Stir-Fries · Ready Meals · Foodservice",
  }),
  "produce:iqf-cauliflower": approved("produce:iqf-cauliflower", "frozen", FROZEN, {
    product:"IQF Frozen Cauliflower", origin:"Egypt", availableForms:"Cauliflower Florets", sizeGrade:"Floret sizes and quality specifications agreed per order", ingredients:"100% Cauliflower", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Soups · Stir-Fries · Ready Meals · Vegetable Mixes",
  }),
  "produce:iqf-sweet-corn": approved("produce:iqf-sweet-corn", "frozen", FROZEN, {
    product:"IQF Frozen Sweet Corn", origin:"Egypt", availableForms:"Sweet Corn Kernels", sizeGrade:"Export Grade · Kernel size and quality specifications agreed per order", ingredients:"100% Sweet Corn", packing:"Bags: 400 g · 1 kg · 2.5 kg · 5 kg - Cartons: 10 kg bulk", storage:"Keep frozen at −18°C or below", shelfLife:"18 - 24 months", availability:"Year-round, subject to stock", shipment:"Reefer Sea Freight", applications:"Side Dishes · Salads · Soups · Ready Meals · Vegetable Mixes",
  }),
  "produce:half-fried-french-fries": {
    productId:"produce:half-fried-french-fries", publicName:"Pre-fried Frozen French Fries", category:"frozen",
    fields: [
      ["productForm", "Pre-fried frozen potato fries"], ["cut", "Buyer specification"],
      ["potatoSpecification", "According to buyer programme"], ["processing", "Oil and coating specification confirmed per programme"],
      ["packFormat", "Buyer-specific format"], ["frozenStorage", "−18°C or colder"],
      ["buyerSpecification", "Colour, defects, texture and cooking-performance criteria agreed per programme"],
    ].map(([labelKey, value], index) => ({ labelKey: labelKey as ProductCardFieldLabelKey, value, displayOrder:index+1, assumed:true, reviewRequired:true, assumptionReason:"No approved specification for this catalogue product was supplied.", sourceRefs:["Existing catalogue; unmatched by official documents"], confidence:"LOW" as const })),
    clientReview:{ required:true, assumptions:["Awaiting an approved client specification."], priority:"HIGH" },
    internalNote:"Unmatched catalogue product retained in the catalogue and enquiry flows.", sourceRefs:["Existing catalogue; unmatched by official documents"], confidence:"LOW",
    imageBrief:{ readiness:"READY", brief:"Preserve the existing catalogue visual.", dependencies:[] },
  },
};

export const PUBLIC_PRODUCT_CARD_CONTENT: Readonly<Record<string, PublicProductCardContent>> = Object.fromEntries(
  Object.values(PRODUCT_CARD_CONTENT).map((content) => [content.productId, {
    productId:content.productId, ...(content.publicName ? { publicName:content.publicName } : {}), category:content.category,
    fields:content.fields.map(({ labelKey, value, displayOrder }) => ({ labelKey, value, displayOrder })),
  }]),
);

export function getPublicProductCardContent(productId: ProduceProductId): PublicProductCardContent {
  const content = PUBLIC_PRODUCT_CARD_CONTENT[productId];
  if (!content) throw new Error(`Missing finalized product-card content for ${productId}`);
  return content;
}
