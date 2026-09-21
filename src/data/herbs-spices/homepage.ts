import { HERBS_SPICES_AVAILABLE_FORMS, HERBS_SPICES_FAMILIES } from "./catalogue";

export interface HomepageFamily {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly description: string;
  readonly materialTone: "saffron" | "olive" | "clay" | "sand" | "ink";
  readonly status: "source-backed";
}

export interface HomepageForm {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly descriptor: string;
  readonly status: "source-backed";
}

export interface PlaceholderProcessStage {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly status: "placeholder";
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
}

const familyPresentation = {
  herbs: { description: "Basil, dill, marjoram, mint varieties, and more.", materialTone: "ink" },
  flowers: { description: "Calendula, chamomile, and hibiscus.", materialTone: "clay" },
  seeds: { description: "Anise, caraway, coriander, fennel, and related seeds.", materialTone: "sand" },
  spices: { description: "Cumin and red chilli pepper.", materialTone: "saffron" },
  roots: { description: "Licorice root.", materialTone: "clay" },
  "dehydrated-vegetables": { description: "Onion and garlic.", materialTone: "olive" },
} as const;

const formDescriptors: Record<string, string> = {
  whole: "Whole format",
  "cut-sifted": "Cut and sifted",
  tbc: "Tea bag cut",
  crushed: "Crushed format",
  powder: "Powder format",
};

/** Product families and formats derive from the PDF-backed catalogue source. */
const homepageFamilies = HERBS_SPICES_FAMILIES.map((family, position) => ({
  id: family.id,
  index: String(position + 1).padStart(2, "0"),
  name: family.label,
  description: familyPresentation[family.id].description,
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
    eyebrow: "Ingredient families",
    title: "Materials, shaped by origin.",
    description: "Explore the source-backed product families in the AGRICA Herbs & Spices catalogue.",
  },
  families: homepageFamilies,
  formsIntro: {
    eyebrow: "Material expression",
    title: "One ingredient. Different expressions.",
    description: "Available division-level formats. Product-specific availability is confirmed on request.",
  },
  forms: homepageForms,
  processIntro: {
    eyebrow: "Process preview",
    title: "A controlled path from source to export.",
    description: "A provisional sequence for homepage storytelling. The verified process will be documented separately.",
  },
  process: [
    { id: "source", index: "01", name: "Source", status: "placeholder" },
    { id: "prepare", index: "02", name: "Prepare", status: "placeholder" },
    { id: "dry", index: "03", name: "Dry", status: "placeholder" },
    { id: "grade", index: "04", name: "Grade", status: "placeholder" },
    { id: "pack", index: "05", name: "Pack", status: "placeholder" },
    { id: "export", index: "06", name: "Export", status: "placeholder" },
  ] satisfies readonly PlaceholderProcessStage[],
  trust: {
    eyebrow: "One AGRICA",
    title: "A different product world. The same AGRICA discipline.",
    description: "Herbs & Spices is being shaped as a distinct commercial division within the wider AGRICA identity: focused, considered, and built for clear business conversations.",
    parentLabel: "AGRICA business division",
  },
  trade: {
    eyebrow: "Start a trade",
    title: "Begin with your brief.",
    description: "Share the shape of your requirement. This preview records nothing and does not send data to a server.",
    categoryLabel: "Ingredient / Category",
    formatLabel: "Preferred Format",
    volumeLabel: "Estimated Volume",
    destinationLabel: "Destination Market",
    companyLabel: "Company Name",
    emailLabel: "Work Email",
    selectPrompt: "Select an option",
    submitLabel: "Review enquiry",
    previewMessage: "Enquiry form preview - submission integration coming next.",
  } satisfies HomepageTradeContent,
} as const;
