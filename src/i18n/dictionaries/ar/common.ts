import type { CommonDictionary } from "../../types";

const common = {
  navigation: {
    primaryLabel: "التنقل الرئيسي", siteDialogLabel: "قائمة الموقع", sitePagesLabel: "صفحات الموقع",
    home: "الرئيسية", products: "المنتجات", standard: "معاييرنا", company: "الشركة", startTrade: "ابدأ تعاوناً تجارياً",
    menu: "القائمة", close: "إغلاق", openMenu: "فتح قائمة التنقل", closeMenu: "إغلاق قائمة التنقل",
    agricaHome: "الصفحة الرئيسية لأجريكا", cairoEgypt: "القاهرة، مصر", agricultureCairo: "الزراعة من القاهرة",
    exportStatement: "محاصيل مصرية مُهيّأة للأسواق العالمية.", b2bExport: "تصدير زراعي للشركات",
    produceWorlds: "طازج / مجمّد / مجفف",
  },
  footer: {
    navigationLabel: "روابط التذييل", oneOriginThreeWorlds: "منشأ واحد · ثلاثة عوالم",
    nextExportProgramme: "برنامج التصدير القادم", controlledFromOrigin: "رقابة تبدأ من المنشأ",
    originGlobalReadiness: "منشأ مصري · جاهزية عالمية", exploreProduce: "استكشف منتجاتنا الزراعية",
    buildQuotation: "أنشئ طلب تسعير", discoverProducts: "اكتشف منتجاتنا",
    originHeadline: "منشأ مصري.", worldHeadline: "جاهز للعالم.",
    description: "منتجات زراعية طازجة ومجمّدة ومجففة، مُهيّأة للتوريد العالمي.", beginHere: "ابدأ من هنا",
    tradeDesk: "مكتب التجارة", exportConversation: "ابدأ محادثة تصدير", backToTop: "العودة إلى الأعلى",
  },
  languageSwitcher: {
    label: "اللغة", openLabel: "اختر اللغة", closeLabel: "إغلاق قائمة اللغات",
    optionsLabel: "اللغات المتاحة", currentLanguage: "اللغة الحالية",
  },
  divisions: {
    navigationLabel: "قطاعات أعمال أجريكا", produce: "الحاصلات الزراعية", herbsSpices: "الأعشاب والتوابل",
    current: "{division}، قطاع الأعمال الحالي", switchTo: "الانتقال إلى {division}",
    herbsMenuOpen: "فتح قائمة الأعشاب والتوابل", herbsMenuClose: "إغلاق قائمة الأعشاب والتوابل",
    herbsPagesLabel: "صفحات الأعشاب والتوابل", businessDivision: "أحد قطاعات أعمال أجريكا.", process: "مراحل العمل",
  },
  accessibility: {
    skipMain: "انتقل إلى المحتوى الرئيسي", skipProducts: "انتقل إلى مستكشف المنتجات",
    skipStandard: "انتقل إلى رحلة المعايير", footerHome: "الصفحة الرئيسية لأجريكا",
    openProductSearch: "فتح البحث عن المنتجات", searchProducts: "البحث عن المنتجات",
    clearSearch: "مسح عبارة البحث", closeSearch: "إغلاق شريط البحث", filterFamilies: "التصفية حسب فئة المنتج",
    filterHerbsFamilies: "تصفية الكتالوج حسب فئة المكونات", clearIngredientSearch: "مسح بحث المكونات",
  },
  actions: {
    back: "رجوع", close: "إغلاق", explore: "استكشف", contact: "تواصل معنا", enquire: "أرسل استفساراً", remove: "إزالة",
    addToEnquiry: "أضف إلى الاستفسار", addedToEnquiry: "أُضيف إلى الاستفسار", viewMaterial: "عرض المادة",
    hideMaterial: "إخفاء المادة", clear: "مسح", resetCatalogue: "إعادة ضبط الكتالوج", buildQuote: "أنشئ طلب تسعير",
    reviewEnquiry: "مراجعة الاستفسار", prepareEnquiry: "إعداد الاستفسار", previewEnquiry: "معاينة الاستفسار",
  },
  enquiry: {
    exportEnquiry: "استفسار تصدير", buildQuotationTitle: "أنشئ طلب التسعير.", closeQuotation: "إغلاق طلب التسعير",
    removeItem: "إزالة {name}", empty: "اختر منتجات من القائمة للبدء.",
    destinationMarket: "سوق الوجهة", destinationPlaceholder: "الدولة / الميناء", destination: "الوجهة",
    estimatedVolume: "الكمية التقديرية", volumePlaceholder: "الاحتياج الشهري", company: "الشركة",
    companyPlaceholder: "اسم الشركة", workEmail: "البريد الإلكتروني للعمل", email: "البريد الإلكتروني",
    addProductFirst: "أضف منتجاً واحداً على الأقل قبل إعداد الاستفسار.",
    prepared: "تم إعداد الاستفسار. في النسخة التشغيلية سيُرسل مباشرةً إلى فريق التصدير في أجريكا.",
    cropSelected: "تم اختيار محصول واحد", cropsSelected: "تم اختيار {count} محاصيل",
    reviewItems: "مراجعة {count} عناصر في استفسار التصدير", addItem: "إضافة {name} إلى الاستفسار",
    removeItemFromEnquiry: "إزالة {name} من الاستفسار", localPreview: "معاينة الاستفسار محلياً",
    selectedMaterials: "المواد المختارة", closeEnquiry: "إغلاق الاستفسار",
    selectedMaterialsLabel: "المواد المختارة", previewNotice: "معاينة الاستفسار — سيتم ربط الإرسال لاحقاً.",
    enquiryList: "قائمة الاستفسار",
  },
  catalogue: {
    searchMaterials: "البحث في المواد", searchMaterialsPlaceholder: "الاسم أو الفئة أو الشكل", all: "الكل",
    allFamilies: "كل الفئات", browseIngredients: "تصفح كتالوج المكونات", material: "مادة",
    materials: "مواد", noMaterials: "لا توجد مواد مطابقة لهذا العرض.",
  },
} satisfies CommonDictionary;

export default common;
