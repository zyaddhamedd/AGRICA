import type { CommonDictionary } from "../../types";

const common = {
  navigation: {
    primaryLabel: "Navigation principale", siteDialogLabel: "Navigation du site", sitePagesLabel: "Pages du site",
    home: "Accueil", products: "Produits", standard: "Notre standard", company: "Entreprise", startTrade: "Démarrer un échange commercial",
    menu: "Menu", close: "Fermer", openMenu: "Ouvrir le menu de navigation", closeMenu: "Fermer le menu de navigation",
    agricaHome: "Accueil AGRICA", cairoEgypt: "Le Caire, Égypte", agricultureCairo: "Agriculture du Caire",
    exportStatement: "Produits agricoles égyptiens, préparés pour les marchés internationaux.", b2bExport: "Export agricole B2B",
    produceWorlds: "Frais / Surgelés / Séchés",
  },
  footer: {
    navigationLabel: "Navigation de pied de page", oneOriginThreeWorlds: "Une origine · Trois univers",
    nextExportProgramme: "Votre prochain programme d’exportation", controlledFromOrigin: "Maîtrisé dès l’origine",
    originGlobalReadiness: "Origine égyptienne · Prêt pour l’international", exploreProduce: "Découvrir nos produits",
    buildQuotation: "Préparer votre demande", discoverProducts: "Découvrir nos produits",
    originHeadline: "Origine égyptienne.", worldHeadline: "Prêt pour le monde.",
    description: "Produits frais, surgelés et séchés, préparés pour l’approvisionnement international.", beginHere: "Commencer ici",
    tradeDesk: "Service export", exportConversation: "Démarrer un échange export", backToTop: "Retour en haut",
  },
  languageSwitcher: {
    label: "Langue", openLabel: "Choisir la langue", closeLabel: "Fermer le menu des langues",
    optionsLabel: "Langues disponibles", currentLanguage: "Langue actuelle",
  },
  divisions: {
    navigationLabel: "Divisions AGRICA", produce: "Produits agricoles", herbsSpices: "Herbes & Épices",
    current: "{division}, division actuelle", switchTo: "Passer à {division}",
    herbsMenuOpen: "Ouvrir le menu Herbes & Épices", herbsMenuClose: "Fermer le menu Herbes & Épices",
    herbsPagesLabel: "Pages Herbes & Épices", businessDivision: "Une division d’AGRICA.", process: "Processus",
  },
  accessibility: {
    skipMain: "Aller au contenu principal", skipProducts: "Aller au catalogue de produits",
    skipStandard: "Aller au parcours qualité", footerHome: "Accueil AGRICA",
    openProductSearch: "Ouvrir la recherche de produits", searchProducts: "Rechercher des produits",
    clearSearch: "Effacer la recherche", closeSearch: "Fermer la barre de recherche", filterFamilies: "Filtrer par famille de produits",
    filterHerbsFamilies: "Filtrer le catalogue par famille d’ingrédients", clearIngredientSearch: "Effacer la recherche d’ingrédients",
  },
  actions: {
    back: "Retour", close: "Fermer", explore: "Découvrir", contact: "Contact", enquire: "Demander", remove: "Retirer",
    addToEnquiry: "Ajouter à la demande", addedToEnquiry: "Ajouté à la demande", viewMaterial: "Voir la matière",
    hideMaterial: "Masquer la matière", clear: "Effacer", resetCatalogue: "Réinitialiser le catalogue", buildQuote: "Créer une demande",
    reviewEnquiry: "Vérifier la demande", prepareEnquiry: "Préparer la demande", previewEnquiry: "Aperçu de la demande",
  },
  enquiry: {
    exportEnquiry: "Demande export", buildQuotationTitle: "Préparez votre demande.", closeQuotation: "Fermer la demande",
    removeItem: "Retirer {name}", empty: "Sélectionnez des produits dans le catalogue pour commencer.",
    destinationMarket: "Marché de destination", destinationPlaceholder: "Pays / port", destination: "Destination",
    estimatedVolume: "Volume estimé", volumePlaceholder: "Besoin mensuel", company: "Entreprise",
    companyPlaceholder: "Nom de l’entreprise", workEmail: "E-mail professionnel", email: "E-mail",
    addProductFirst: "Ajoutez au moins un produit avant de préparer votre demande.",
    prepared: "Demande préparée. Dans la version opérationnelle, elle sera envoyée directement à l’équipe export AGRICA.",
    cropSelected: "1 produit sélectionné", cropsSelected: "{count} produits sélectionnés",
    reviewItems: "Vérifier les {count} éléments de votre demande export", addItem: "Ajouter {name} à la demande",
    removeItemFromEnquiry: "Retirer {name} de la demande", localPreview: "Aperçu local de la demande",
    selectedMaterials: "Matières sélectionnées", closeEnquiry: "Fermer la demande",
    selectedMaterialsLabel: "Matières sélectionnées", previewNotice: "Aperçu de la demande — l’envoi sera intégré ultérieurement.",
    enquiryList: "Liste de demande",
  },
  catalogue: {
    searchMaterials: "Rechercher des matières", searchMaterialsPlaceholder: "Nom, famille ou forme", all: "Tous",
    allFamilies: "Toutes les familles", browseIngredients: "Parcourir le catalogue d’ingrédients", material: "matière",
    materials: "matières", noMaterials: "Aucune matière ne correspond à cette sélection.",
  },
} satisfies CommonDictionary;

export default common;
