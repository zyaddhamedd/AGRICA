import type { CommonDictionary } from "../../types";

const common = {
  navigation: {
    primaryLabel: "Hauptnavigation", siteDialogLabel: "Seitennavigation", sitePagesLabel: "Seitenbereiche",
    home: "Startseite", products: "Produkte", standard: "Unser Standard", company: "Unternehmen", startTrade: "Geschäftsanfrage starten",
    menu: "Menü", close: "Schließen", openMenu: "Navigationsmenü öffnen", closeMenu: "Navigationsmenü schließen",
    agricaHome: "AGRICA Startseite", cairoEgypt: "Kairo, Ägypten", agricultureCairo: "Landwirtschaft aus Kairo",
    exportStatement: "Ägyptische Erzeugnisse. Bereit für die weltweite Versorgung.", b2bExport: "Agrarischer B2B-Export",
    produceWorlds: "Frisch / Tiefgekühlt / Getrocknet",
  },
  footer: {
    navigationLabel: "Fußzeilennavigation", oneOriginThreeWorlds: "Ein Ursprung · Drei Welten",
    nextExportProgramme: "Ihr nächstes Exportprogramm", controlledFromOrigin: "Kontrolliert ab Ursprung",
    originGlobalReadiness: "Ägyptischer Ursprung · Weltweit lieferbereit", exploreProduce: "Unser Sortiment entdecken",
    buildQuotation: "Anfrage zusammenstellen", discoverProducts: "Produkte entdecken",
    originHeadline: "Ägyptischer Ursprung.", worldHeadline: "Bereit für die Welt.",
    description: "Frische, tiefgekühlte und getrocknete Erzeugnisse für die weltweite Versorgung.", beginHere: "Hier beginnen",
    tradeDesk: "Exportteam", exportConversation: "Exportgespräch beginnen", backToTop: "Nach oben",
  },
  languageSwitcher: {
    label: "Sprache", openLabel: "Sprache auswählen", closeLabel: "Sprachmenü schließen",
    optionsLabel: "Verfügbare Sprachen", currentLanguage: "Aktuelle Sprache",
  },
  divisions: {
    navigationLabel: "AGRICA Geschäftsbereiche", produce: "Agrarprodukte", herbsSpices: "Kräuter & Gewürze",
    current: "{division}, aktueller Geschäftsbereich", switchTo: "Zu {division} wechseln",
    herbsMenuOpen: "Menü Kräuter & Gewürze öffnen", herbsMenuClose: "Menü Kräuter & Gewürze schließen",
    herbsPagesLabel: "Seiten für Kräuter & Gewürze", businessDivision: "Ein Geschäftsbereich von AGRICA.", process: "Prozess",
  },
  accessibility: {
    skipMain: "Zum Hauptinhalt springen", skipProducts: "Zum Produktkatalog springen",
    skipStandard: "Zum Standardprozess springen", footerHome: "AGRICA Startseite",
    openProductSearch: "Produktsuche öffnen", searchProducts: "Produkte suchen",
    clearSearch: "Suchanfrage löschen", closeSearch: "Suchleiste schließen", filterFamilies: "Nach Produktfamilie filtern",
    filterHerbsFamilies: "Katalog nach Zutatenfamilie filtern", clearIngredientSearch: "Zutatensuche löschen",
  },
  actions: {
    back: "Zurück", close: "Schließen", explore: "Entdecken", contact: "Kontakt", enquire: "Anfragen", remove: "Entfernen",
    addToEnquiry: "Zur Anfrage hinzufügen", addedToEnquiry: "Zur Anfrage hinzugefügt", viewMaterial: "Material ansehen",
    hideMaterial: "Material ausblenden", clear: "Löschen", resetCatalogue: "Katalog zurücksetzen", buildQuote: "Anfrage erstellen",
    reviewEnquiry: "Anfrage prüfen", prepareEnquiry: "Anfrage vorbereiten", previewEnquiry: "Anfragevorschau",
  },
  enquiry: {
    exportEnquiry: "Exportanfrage", buildQuotationTitle: "Stellen Sie Ihre Anfrage zusammen.", closeQuotation: "Anfrage schließen",
    removeItem: "{name} entfernen", empty: "Wählen Sie zunächst Produkte aus dem Sortiment.",
    destinationMarket: "Zielmarkt", destinationPlaceholder: "Land / Hafen", destination: "Zielmarkt",
    estimatedVolume: "Geschätztes Volumen", volumePlaceholder: "Monatlicher Bedarf", company: "Unternehmen",
    companyPlaceholder: "Unternehmensname", workEmail: "Geschäftliche E-Mail", email: "E-Mail",
    addProductFirst: "Fügen Sie mindestens ein Produkt hinzu, bevor Sie die Anfrage vorbereiten.",
    prepared: "Anfrage vorbereitet. In der Produktivversion wird sie direkt an das AGRICA Exportteam gesendet.",
    cropSelected: "1 Erzeugnis ausgewählt", cropsSelected: "{count} Erzeugnisse ausgewählt",
    reviewItems: "{count} Positionen Ihrer Exportanfrage prüfen", addItem: "{name} zur Anfrage hinzufügen",
    removeItemFromEnquiry: "{name} aus der Anfrage entfernen", localPreview: "Lokale Anfragevorschau",
    selectedMaterials: "Ausgewählte Materialien", closeEnquiry: "Anfrage schließen",
    selectedMaterialsLabel: "Ausgewählte Materialien", previewNotice: "Anfragevorschau — die Übermittlung wird später angebunden.",
    enquiryList: "Anfrageliste",
  },
  catalogue: {
    searchMaterials: "Materialien suchen", searchMaterialsPlaceholder: "Name, Familie oder Form", all: "Alle",
    allFamilies: "Alle Familien", browseIngredients: "Zutatenkatalog durchsuchen", material: "Material",
    materials: "Materialien", noMaterials: "Für diese Auswahl wurden keine Materialien gefunden.",
  },
} satisfies CommonDictionary;

export default common;
