import type { CommonDictionary } from "../../types";

const common = {
  navigation: {
    primaryLabel: "Primary navigation", siteDialogLabel: "Site navigation", sitePagesLabel: "Site pages",
    home: "Home", products: "Products", standard: "Our standard", company: "Company", startTrade: "Start a trade",
    menu: "Menu", close: "Close", openMenu: "Open navigation menu", closeMenu: "Close navigation menu",
    agricaHome: "AGRICA home", cairoEgypt: "Cairo, Egypt", agricultureCairo: "Agriculture Cairo",
    exportStatement: "Egyptian produce. Prepared for global supply.", b2bExport: "B2B agricultural export",
    produceWorlds: "Fresh / Frozen / Dried",
  },
  footer: {
    navigationLabel: "Footer navigation", oneOriginThreeWorlds: "One origin · Three worlds",
    nextExportProgramme: "Your next export programme", controlledFromOrigin: "Controlled from origin",
    originGlobalReadiness: "Egyptian origin · Global readiness", exploreProduce: "Explore our produce",
    buildQuotation: "Build your quotation", discoverProducts: "Discover our products",
    originHeadline: "Egyptian origin.", worldHeadline: "Ready for the world.",
    description: "Fresh, frozen and dried produce prepared for global supply.", beginHere: "Begin here",
    tradeDesk: "Trade desk", exportConversation: "Start an export conversation", backToTop: "Back to top",
  },
  languageSwitcher: {
    label: "Language", openLabel: "Choose language", closeLabel: "Close language menu",
    optionsLabel: "Available languages", currentLanguage: "Current language",
  },
  divisions: {
    navigationLabel: "AGRICA business divisions", produce: "Produce", herbsSpices: "Herbs & Spices",
    current: "{division}, current business division", switchTo: "Switch to {division}",
    herbsMenuOpen: "Open Herbs & Spices menu", herbsMenuClose: "Close Herbs & Spices menu",
    herbsPagesLabel: "Herbs & Spices pages", businessDivision: "An AGRICA business division.", process: "Process",
  },
  accessibility: {
    skipMain: "Skip to main content", skipProducts: "Skip to product explorer",
    skipStandard: "Skip to the standard journey", footerHome: "AGRICA home",
    openProductSearch: "Open product search", searchProducts: "Search products",
    clearSearch: "Clear search query", closeSearch: "Close search bar", filterFamilies: "Filter by product family",
    filterHerbsFamilies: "Filter catalogue by ingredient family", clearIngredientSearch: "Clear ingredient search",
  },
  actions: {
    back: "Back", close: "Close", explore: "Explore", contact: "Contact", enquire: "Enquire", remove: "Remove",
    addToEnquiry: "Add to enquiry", addedToEnquiry: "Added to enquiry", viewMaterial: "View material",
    hideMaterial: "Hide material", clear: "Clear", resetCatalogue: "Reset catalogue", buildQuote: "Build a quote",
    reviewEnquiry: "Review enquiry", prepareEnquiry: "Prepare enquiry", previewEnquiry: "Preview enquiry",
  },
  enquiry: {
    exportEnquiry: "Export enquiry", buildQuotationTitle: "Build your quotation.", closeQuotation: "Close quotation",
    removeItem: "Remove {name}", empty: "Select products from the shelf to begin.",
    destinationMarket: "Destination market", destinationPlaceholder: "Country / port", destination: "Destination",
    estimatedVolume: "Estimated volume", volumePlaceholder: "Monthly requirement", company: "Company",
    companyPlaceholder: "Company name", workEmail: "Work email", email: "Email",
    addProductFirst: "Add at least one product before preparing your enquiry.",
    prepared: "Enquiry prepared. In production, this will be sent directly to the AGRICA export team.",
    cropSelected: "1 crop selected", cropsSelected: "{count} crops selected",
    reviewItems: "Review {count} items in your export enquiry", addItem: "Add {name} to enquiry",
    removeItemFromEnquiry: "Remove {name} from enquiry", localPreview: "Local enquiry preview",
    selectedMaterials: "Selected materials", closeEnquiry: "Close enquiry",
    selectedMaterialsLabel: "Selected materials", previewNotice: "Enquiry preview — submission integration coming next.",
    enquiryList: "Enquiry list",
  },
  catalogue: {
    searchMaterials: "Search materials", searchMaterialsPlaceholder: "Name, family, or form", all: "All",
    allFamilies: "All Families", browseIngredients: "Browse ingredient catalogue", material: "material",
    materials: "materials", noMaterials: "No materials match this view.",
  },
} satisfies CommonDictionary;

export default common;
