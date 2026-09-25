import { HERBS_SPICES_AVAILABLE_FORMS, HERBS_SPICES_FAMILIES } from "./catalogue";
import type { HerbsSpicesFamilyId } from "@/types/herbs-spices";

export interface HomepageFamily {
  readonly id: HerbsSpicesFamilyId;
  readonly index: string;
  readonly name: string;
  readonly description: string;
  readonly sampleProducts: readonly string[];
  readonly materialTone: "saffron" | "olive" | "clay" | "sand" | "ink";
  readonly status: "source-backed";
}

export interface HomepageSignatureIngredient {
  readonly slug: string;
  readonly name: string;
  readonly latinName?: string;
  readonly familyId: HerbsSpicesFamilyId;
  readonly familyName: string;
  readonly forms: readonly string[];
  readonly origin: string;
  readonly mediaKey: string;
  readonly note: string;
}

export interface HomepageForm {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly descriptor: string;
  readonly status: "source-backed";
}

export interface HomepageProcessStage {
  readonly index: string;
  readonly id: string;
  readonly title: string;
  readonly summary: string;
}

export interface HomepageWhyAgricaPillar {
  readonly index: string;
  readonly title: string;
  readonly statement: string;
}

export interface HomepageQualityDocItem {
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
}

export interface HomepageTradeContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly categoryLabel: string;
  readonly formatLabel: string;
  readonly volumeLabel: string;
  readonly destinationLabel: string;
  readonly companyLabel: string;
  readonly emailLabel: string;
  readonly selectPrompt: string;
  readonly submitLabel: string;
  readonly previewMessage: string;
  readonly reassuranceText: string;
}

const familyPresentation = {
  herbs: {
    description: "Egyptian culinary and aromatic leafy botanicals.",
    sampleProducts: ["Basil", "Peppermint", "Spearmint", "Marjoram", "Dill", "Thyme", "Rosemary", "Oregano"],
    materialTone: "ink",
  },
  flowers: {
    description: "Sun-dried whole flower heads, petals, and calyces.",
    sampleProducts: ["Chamomile", "Hibiscus", "Calendula"],
    materialTone: "clay",
  },
  seeds: {
    description: "Agricultural seeds machine-cleaned to high commercial purity.",
    sampleProducts: ["Black Cumin", "Fennel", "Coriander", "Anise", "Caraway", "Sesame"],
    materialTone: "sand",
  },
  spices: {
    description: "Pungent and warm whole and crushed Egyptian spices.",
    sampleProducts: ["Cumin", "Red Chilli Pepper"],
    materialTone: "saffron",
  },
  roots: {
    description: "Fibrous and cut root botanicals with natural sweetness.",
    sampleProducts: ["Licorice Root"],
    materialTone: "clay",
  },
  "dehydrated-vegetables": {
    description: "Cleanly dehydrated flakes, granules, and powders.",
    sampleProducts: ["Dehydrated Onion", "Dehydrated Garlic"],
    materialTone: "olive",
  },
} as const;

const formDescriptors: Record<string, string> = {
  whole: "Intact botanical structure",
  "cut-sifted": "Uniform sized cuts with fines removed",
  tbc: "Tea bag cut (0.5 – 2.0 mm particle sizing)",
  crushed: "Coarsely broken material for extraction",
  powder: "Finely milled powder for blending",
};

/** Product families derive from the verified catalogue source. */
const homepageFamilies = HERBS_SPICES_FAMILIES.map((family, position) => ({
  id: family.id,
  index: String(position + 1).padStart(2, "0"),
  name: family.label,
  description: familyPresentation[family.id].description,
  sampleProducts: familyPresentation[family.id].sampleProducts,
  materialTone: familyPresentation[family.id].materialTone,
  status: family.status,
})) satisfies readonly HomepageFamily[];

const homepageForms = HERBS_SPICES_AVAILABLE_FORMS.map((form, position) => ({
  id: form.id,
  index: String(position + 1).padStart(2, "0"),
  name: form.label,
  descriptor: formDescriptors[form.id],
  status: form.status,
})) satisfies readonly HomepageForm[];

export const HOMEPAGE_SIGNATURE_INGREDIENTS: readonly HomepageSignatureIngredient[] = [
  {
    slug: "chamomile",
    name: "Chamomile",
    latinName: "Matricaria chamomilla",
    familyId: "flowers",
    familyName: "Flowers",
    forms: ["Whole Flower", "Cut & Sifted", "TBC", "Powder"],
    origin: "Egypt",
    mediaKey: "product-chamomile",
    note: "Sun-dried whole flower heads harvested for tea and infusions.",
  },
  {
    slug: "basil",
    name: "Basil",
    latinName: "Ocimum basilicum",
    familyId: "herbs",
    familyName: "Herbs",
    forms: ["Whole Leaf", "Cut & Sifted", "Crushed", "Powder"],
    origin: "Egypt",
    mediaKey: "product-basil",
    note: "Aromatic Egyptian green leaf prepared for culinary seasoning and food blending.",
  },
  {
    slug: "black-cumin",
    name: "Black Cumin",
    latinName: "Nigella sativa",
    familyId: "seeds",
    familyName: "Seeds",
    forms: ["Whole Seed", "Crushed", "Powder"],
    origin: "Egypt",
    mediaKey: "product-black-cumin",
    note: "Cleaned Egyptian nigella seeds offering high purity and characteristic aroma.",
  },
  {
    slug: "peppermint",
    name: "Peppermint",
    latinName: "Mentha piperita",
    familyId: "herbs",
    familyName: "Herbs",
    forms: ["Whole Leaf", "Cut & Sifted", "TBC", "Powder"],
    origin: "Egypt",
    mediaKey: "product-peppermint",
    note: "Shade-dried Egyptian peppermint leaves sized for herbal infusion blends.",
  },
  {
    slug: "rosemary",
    name: "Rosemary",
    latinName: "Rosmarinus officinalis",
    familyId: "herbs",
    familyName: "Herbs",
    forms: ["Whole Needle", "Cut & Sifted", "Crushed", "Powder"],
    origin: "Egypt",
    mediaKey: "product-rosemary",
    note: "Needle-form dried rosemary sorted for uniform appearance and seasoning extracts.",
  },
];

export const HOMEPAGE_PROCESS_STAGES: readonly HomepageProcessStage[] = [
  {
    index: "01",
    id: "sourcing",
    title: "Sourcing",
    summary: "From Egyptian origin.",
  },
  {
    index: "02",
    id: "processing",
    title: "Processing",
    summary: "Prepared to required form.",
  },
  {
    index: "03",
    id: "quality-control",
    title: "Quality Control",
    summary: "Checked against specification.",
  },
  {
    index: "04",
    id: "logistics",
    title: "Logistics",
    summary: "Prepared for international movement.",
  },
  {
    index: "05",
    id: "documentation",
    title: "Documentation",
    summary: "Export paperwork support.",
  },
  {
    index: "06",
    id: "customization",
    title: "Customization",
    summary: "Aligned to buyer requirements.",
  },
];

export const HOMEPAGE_WHY_AGRICA: readonly HomepageWhyAgricaPillar[] = [
  {
    index: "01",
    title: "Direct Sourcing",
    statement: "Built around trusted Egyptian supply relationships.",
  },
  {
    index: "02",
    title: "Consistent Quality",
    statement: "Preparation focused on repeatable specifications.",
  },
  {
    index: "03",
    title: "Flexible Supply",
    statement: "From sample evaluation to commercial volumes.",
  },
  {
    index: "04",
    title: "Reliable Partnership",
    statement: "A dedicated desk managing contracts and schedules.",
  },
  {
    index: "05",
    title: "Compliance & Traceability",
    statement: "Traceable origin with comprehensive export documentation.",
  },
  {
    index: "06",
    title: "International Presence",
    statement: "Supplying tea, spice, and food buyers worldwide.",
  },
];

export const HOMEPAGE_QUALITY_DOCS: readonly HomepageQualityDocItem[] = [
  {
    index: "01",
    title: "Phytosanitary Certificate",
    summary: "Export health / agricultural clearance",
    detail: "Official health verification issued for plant export compliance.",
  },
  {
    index: "02",
    title: "Certificate of Origin",
    summary: "Origin documentation",
    detail: "Authenticated documentation certifying Egyptian origin.",
  },
  {
    index: "03",
    title: "Export Documentation",
    summary: "Shipment and commercial documents",
    detail: "Clean ocean Bills of Lading, packing lists, and commercial invoices.",
  },
  {
    index: "04",
    title: "Technical Specifications",
    summary: "Product specification support",
    detail: "Physical parameter sheets, purity thresholds, and mesh cut details on request.",
  },
  {
    index: "05",
    title: "Samples",
    summary: "Evaluation support on request",
    detail: "Representative production batch samples dispatched for buyer evaluation.",
  },
];

export const HERBS_SPICES_HOMEPAGE = {
  hero: {
    eyebrow: "AGRICA / HERBS & SPICES",
    titleLead: "From origin",
    titleEmphasis: "to ingredient.",
    introduction: "An AGRICA world shaped around dried agricultural ingredients and international supply.",
    primaryAction: "Explore ingredients",
    secondaryAction: "Start a trade",
    mediaLabel: "Material study / future approved imagery",
  },
  familiesIntro: {
    eyebrow: "01 / INGREDIENT FAMILIES",
    title: "Materials, shaped by origin.",
    description: "Six distinct botanical families sourced across Egypt and prepared for international food, tea, and spice applications.",
  },
  families: homepageFamilies,
  signatureIntro: {
    eyebrow: "02 / BOTANICAL SPECIMENS",
    title: "From plant to commercial ingredient.",
    description: "A representative selection of Egyptian botanicals demonstrating the transition from raw harvest to export grade.",
  },
  signatureIngredients: HOMEPAGE_SIGNATURE_INGREDIENTS,
  formsIntro: {
    eyebrow: "03 / PROCESSING FORMS",
    title: "One ingredient. Five expressions.",
    description: "Standardized physical forms tailored to tea bagging, culinary packing, seasoning, and extraction.",
  },
  forms: homepageForms,
  processIntro: {
    eyebrow: "04 / OPERATIONAL DISCIPLINE",
    title: "Source to specification.",
    description: "A structured, transparent supply methodology connecting Egyptian agricultural cultivation with global commercial trade.",
  },
  processStages: HOMEPAGE_PROCESS_STAGES,
  whyAgricaIntro: {
    eyebrow: "05 / WHY AGRICA",
    title: "Precision in trade. Rooted in origin.",
    description: "How AGRICA combines farm-level direct sourcing with consistency, compliance, and international reliability.",
  },
  whyAgrica: HOMEPAGE_WHY_AGRICA,
  qualityIntro: {
    eyebrow: "06 / EXPORT READINESS",
    title: "Quality control & buyer documentation.",
    description: "Export documents and technical support for international buyers.",
  },
  qualityDocs: HOMEPAGE_QUALITY_DOCS,
  trade: {
    eyebrow: "07 / COMMERCIAL ENQUIRY",
    title: "Source your next ingredient from Egypt.",
    description: "Tell us the ingredient, format and destination.",
    categoryLabel: "Ingredient Family",
    formatLabel: "Preferred Processing Form",
    volumeLabel: "Estimated Volume",
    destinationLabel: "Destination Market",
    companyLabel: "Company Name",
    emailLabel: "Work Email",
    selectPrompt: "Select an option",
    submitLabel: "Submit Export Enquiry",
    previewMessage: "Enquiry recorded — our export desk will respond promptly.",
    reassuranceText: "Technical specifications and samples available on request.",
  } satisfies HomepageTradeContent,
} as const;
