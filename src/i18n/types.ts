import type { ProduceFamilyId, ProduceProductId, WorldId } from "@/types/agrica";
import type { HerbsSpicesFamilyId } from "@/types/herbs-spices";

export type EmptyDictionaryDomain = Readonly<Record<string, never>>;

export type TechnicalTermKey = "source" | "preparation" | "sorting" | "grading" | "packing" | "qualityControl" | "lot" | "batch" | "traceability" | "inspection" | "specification" | "condition" | "packaging" | "harvest" | "handling" | "storage" | "export" | "documentation" | "commercialHandover";

export interface StandardStageTranslation {
  readonly name: string;
  readonly kicker: string;
  readonly status: string;
  readonly stamp: string;
  readonly headline: string;
  readonly copy: string;
  readonly proofOutput: string;
  readonly imageAlt: string;
  readonly facts: readonly (readonly [term: string, value: string])[];
}

export interface StandardDictionary {
  readonly terms: Readonly<Record<TechnicalTermKey, string>>;
  readonly produce: {
    readonly hero: { readonly titleLead: string; readonly titleEmphasis: string; readonly titleClose: string; readonly description: string };
    readonly stages: Readonly<Record<string, StandardStageTranslation>>;
    readonly controls: readonly { readonly number: string; readonly title: string; readonly description: string }[];
    readonly ui: { readonly progressLabel: string; readonly handover: string; readonly exportHandover: string; readonly controlledSpecification: string; readonly destinationTitle: string; readonly proofPillars: readonly string[]; readonly journeyStatus: string; readonly completionSteps: readonly string[]; readonly exportCleared: string; readonly fullSpecificationCertified: string; readonly oneShipment: string; readonly discussProgramme: string; readonly exportProgramme: string; readonly egypt: string; readonly of: string; readonly selectorLabel: string; readonly closeEyebrow: string; readonly closeTitle: string; readonly closeEmphasis: string; readonly closeDescription: string; readonly registerEyebrow: string; readonly registerStrap: string; readonly registerLead: string; readonly registerEmphasis: string; readonly registerDescription: string };
  };
  readonly herbs: {
    readonly hero: { readonly eyebrow: string; readonly titleLead: string; readonly titleEmphasis: string; readonly description: string };
    readonly stages: Readonly<Record<`herbs-spices-process:${string}`, { readonly title: string; readonly shortLabel: string; readonly description: string }>>;
    readonly interlude: { readonly eyebrow: string; readonly title: string; readonly emphasis: string; readonly description: string };
    readonly progress: { readonly label: string; readonly stage: string; readonly current: string };
    readonly final: { readonly eyebrow: string; readonly title: string; readonly description: string };
  };
}

export interface HomeDictionary {
  readonly hero: { readonly mobileLead: string; readonly mobileVerb: string; readonly mobileClose: string; readonly desktopLead: string; readonly desktopEmphasis: string; readonly mobileLabel: string; readonly desktopLabel: string; readonly ribbonsLabel: string };
  readonly worlds: { readonly eyebrow: string; readonly rangeLabel: string; readonly heading: string; readonly emphasis: string; readonly wheelLabel: string; readonly items: Readonly<Record<WorldId, { readonly label: string; readonly title: string; readonly action: string; readonly imageAlt: string; readonly lines: readonly [string, string] }>> };
  readonly season: { readonly rhythm: string; readonly calendar: string; readonly heading: string; readonly emphasis: string; readonly availability: string; readonly selectMonth: string; readonly selectMonthLabel: string; readonly monthsLabel: string; readonly productAvailability: string; readonly illustrativeIndex: string; readonly illustrativeProducts: string; readonly notice: string; readonly cropNames: Readonly<Record<string, string>>; readonly categories: { readonly Fresh: string; readonly Frozen: string; readonly Dried: string }; readonly statuses: { readonly peak: string; readonly available: string }; readonly months: readonly string[] };
  readonly company: { readonly eyebrow: string; readonly heading: string; readonly emphasis: string; readonly statement: string; readonly origin: string; readonly egypt: string; readonly operatingModel: string; readonly operatingValue: string; readonly action: string; readonly imageAlt: string };
  readonly trade: { readonly eyebrow: string; readonly heading: string; readonly emphasis: string; readonly description: string; readonly product: string; readonly productPlaceholder: string; readonly destination: string; readonly destinationPlaceholder: string; readonly volume: string; readonly volumePlaceholder: string; readonly company: string; readonly companyPlaceholder: string; readonly email: string; readonly send: string; readonly sent: string; readonly success: string };
  readonly standardPreview: { readonly eyebrow: string; readonly strap: string; readonly heading: string; readonly emphasis: string; readonly origin: string; readonly quality: string; readonly coordination: string; readonly controlled: string; readonly trusted: string; readonly action: string };
}

export interface ProductsDictionary {
  readonly skipAtlas: string;
  readonly heroLead: string;
  readonly heroEmphasis: string;
  readonly worldNavigation: string;
  readonly worlds: Readonly<Record<WorldId, { readonly short: string; readonly label: string }>>;
  readonly families: Readonly<Record<ProduceFamilyId, string>>;
  readonly products: Readonly<Record<ProduceProductId, { readonly name: string; readonly aliases: readonly string[]; readonly imageAlt: string }>>;
  readonly specifications: Readonly<Record<"origin" | "condition" | "varieties" | "harvestWindow" | "sizeCalibre" | "brix" | "acidity" | "averageWeight" | "seedStatus" | "grade" | "packaging" | "temperature" | "shelfLife", string>>;
  readonly ui: { readonly productSpecifications: string; readonly specsFor: string; readonly noMatches: string; readonly refineSearch: string; readonly searchHint: string; readonly showFront: string; readonly showSpecifications: string; readonly produceSuffix: string; readonly egypt: string; readonly add: string; readonly added: string; readonly removeFromEnquiry: string };
}

export interface HerbsSpicesDictionary {
  readonly homepage: {
    readonly hero: { readonly eyebrow: string; readonly titleLead: string; readonly titleEmphasis: string; readonly introduction: string; readonly primaryAction: string; readonly secondaryAction: string; readonly mediaLabel: string };
    readonly familiesIntro: { readonly eyebrow: string; readonly title: string; readonly description: string };
    readonly families: readonly { readonly id: HerbsSpicesFamilyId; readonly index: string; readonly name: string; readonly description: string; readonly materialTone: "saffron" | "olive" | "clay" | "sand" | "ink"; readonly status: "source-backed" }[];
    readonly formsIntro: { readonly eyebrow: string; readonly title: string; readonly description: string };
    readonly forms: readonly { readonly id: string; readonly index: string; readonly name: string; readonly descriptor: string; readonly status: "source-backed" }[];
    readonly trust: { readonly eyebrow: string; readonly title: string; readonly description: string; readonly pillars: readonly { readonly index: string; readonly title: string; readonly description: string }[]; readonly parentLabel: string };
    readonly trade: { readonly eyebrow: string; readonly title: string; readonly description: string; readonly categoryLabel: string; readonly formatLabel: string; readonly volumeLabel: string; readonly destinationLabel: string; readonly companyLabel: string; readonly emailLabel: string; readonly selectPrompt: string; readonly submitLabel: string; readonly previewMessage: string };
  };
  readonly catalogue: { readonly eyebrow: string; readonly titleLead: string; readonly titleEmphasis: string; readonly description: string; readonly availableForms: string; readonly technicalNote: string; readonly detailsLabel: string; readonly exploreFamily: string; readonly currentForm: string; readonly reelControls: string; readonly previousForm: string; readonly nextForm: string; readonly formsLabel: string; readonly illustrativeStudy: string };
  readonly families: Readonly<Record<HerbsSpicesFamilyId, string>>;
  readonly products: Readonly<Record<`herbs-spices:${string}`, { readonly name: string; readonly aliases: readonly string[]; readonly imageAlt: string }>>;
  readonly forms: Readonly<Record<string, string>>;
}

export interface CommonDictionary {
  readonly navigation: {
    readonly primaryLabel: string;
    readonly siteDialogLabel: string;
    readonly sitePagesLabel: string;
    readonly home: string;
    readonly products: string;
    readonly standard: string;
    readonly company: string;
    readonly startTrade: string;
    readonly menu: string;
    readonly close: string;
    readonly openMenu: string;
    readonly closeMenu: string;
    readonly agricaHome: string;
    readonly cairoEgypt: string;
    readonly agricultureCairo: string;
    readonly exportStatement: string;
    readonly b2bExport: string;
    readonly produceWorlds: string;
  };
  readonly footer: {
    readonly navigationLabel: string;
    readonly oneOriginThreeWorlds: string;
    readonly nextExportProgramme: string;
    readonly controlledFromOrigin: string;
    readonly originGlobalReadiness: string;
    readonly exploreProduce: string;
    readonly buildQuotation: string;
    readonly discoverProducts: string;
    readonly originHeadline: string;
    readonly worldHeadline: string;
    readonly description: string;
    readonly beginHere: string;
    readonly tradeDesk: string;
    readonly exportConversation: string;
    readonly backToTop: string;
  };
  readonly languageSwitcher: {
    readonly label: string;
    readonly openLabel: string;
    readonly closeLabel: string;
    readonly optionsLabel: string;
    readonly currentLanguage: string;
  };
  readonly divisions: {
    readonly navigationLabel: string;
    readonly produce: string;
    readonly herbsSpices: string;
    readonly current: string;
    readonly switchTo: string;
    readonly herbsMenuOpen: string;
    readonly herbsMenuClose: string;
    readonly herbsPagesLabel: string;
    readonly businessDivision: string;
    readonly process: string;
  };
  readonly accessibility: {
    readonly skipMain: string;
    readonly skipProducts: string;
    readonly skipStandard: string;
    readonly footerHome: string;
    readonly openProductSearch: string;
    readonly searchProducts: string;
    readonly clearSearch: string;
    readonly closeSearch: string;
    readonly filterFamilies: string;
    readonly filterHerbsFamilies: string;
    readonly clearIngredientSearch: string;
  };
  readonly actions: {
    readonly back: string;
    readonly close: string;
    readonly explore: string;
    readonly contact: string;
    readonly enquire: string;
    readonly remove: string;
    readonly addToEnquiry: string;
    readonly addedToEnquiry: string;
    readonly viewMaterial: string;
    readonly hideMaterial: string;
    readonly clear: string;
    readonly resetCatalogue: string;
    readonly buildQuote: string;
    readonly reviewEnquiry: string;
    readonly prepareEnquiry: string;
    readonly previewEnquiry: string;
  };
  readonly enquiry: {
    readonly exportEnquiry: string;
    readonly buildQuotationTitle: string;
    readonly closeQuotation: string;
    readonly removeItem: string;
    readonly empty: string;
    readonly destinationMarket: string;
    readonly destinationPlaceholder: string;
    readonly destination: string;
    readonly estimatedVolume: string;
    readonly volumePlaceholder: string;
    readonly company: string;
    readonly companyPlaceholder: string;
    readonly workEmail: string;
    readonly email: string;
    readonly addProductFirst: string;
    readonly prepared: string;
    readonly cropSelected: string;
    readonly cropsSelected: string;
    readonly reviewItems: string;
    readonly addItem: string;
    readonly removeItemFromEnquiry: string;
    readonly localPreview: string;
    readonly selectedMaterials: string;
    readonly closeEnquiry: string;
    readonly selectedMaterialsLabel: string;
    readonly previewNotice: string;
    readonly enquiryList: string;
  };
  readonly catalogue: {
    readonly searchMaterials: string;
    readonly searchMaterialsPlaceholder: string;
    readonly all: string;
    readonly allFamilies: string;
    readonly browseIngredients: string;
    readonly material: string;
    readonly materials: string;
    readonly noMaterials: string;
  };
}

export interface Dictionary {
  readonly common: CommonDictionary;
  readonly home: HomeDictionary;
  readonly products: ProductsDictionary;
  readonly standard: StandardDictionary;
  readonly herbsSpices: HerbsSpicesDictionary;
}
