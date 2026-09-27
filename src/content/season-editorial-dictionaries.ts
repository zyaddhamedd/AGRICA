import type { Locale } from "@/i18n/config";
import type { SeasonDisplayStatus } from "@/data/seasons";

export interface SeasonEditorialDictionary {
  readonly eyebrow: string;
  readonly titleLead: string;
  readonly titleEmphasis: string;
  readonly introduction: string;
  readonly dataLabel: string;
  readonly reviewed: string;
  readonly selectMonth: string;
  readonly heroCrop: string;
  readonly typicalWindow: string;
  readonly supportingCrops: string;
  readonly nextMonth: string;
  readonly startsNextMonth: string;
  readonly exploreProducts: string;
  readonly disclaimer: string;
  readonly mediaPending: string;
  readonly yearRound: string;
  readonly status: Readonly<Record<SeasonDisplayStatus, string>>;
}

const COPY: Readonly<Record<Locale, SeasonEditorialDictionary>> = {
  en: {
    eyebrow: "Seasonal calendar",
    titleLead: "The Egyptian harvest,",
    titleEmphasis: "in orbit.",
    introduction: "Move through the year to explore typical harvest windows across AGRICA’s fresh produce range.",
    dataLabel: "Typical Egyptian harvest calendar",
    reviewed: "Research baseline · Sep 2026",
    selectMonth: "Select harvest month",
    heroCrop: "Featured crop",
    typicalWindow: "Typical window",
    supportingCrops: "Also in season",
    nextMonth: "Next month",
    startsNextMonth: "Starts next month",
    exploreProducts: "Explore fresh products",
    disclaimer: "Typical Egyptian harvest windows. Exact timing varies by crop, variety and season.",
    mediaPending: "Editorial media in production",
    yearRound: "Year-round crop",
    status: { peak: "Peak harvest", "in-season": "In season", opening: "Season opening", final: "Final month" },
  },
  ar: {
    eyebrow: "تقويم المواسم",
    titleLead: "الحصاد المصري،",
    titleEmphasis: "في مدار العام.",
    introduction: "تنقّل بين شهور السنة لاستكشاف فترات الحصاد المعتادة ضمن مجموعة أجريكا من المنتجات الطازجة.",
    dataLabel: "تقويم نموذجي للحصاد المصري",
    reviewed: "مرجع بحثي · سبتمبر 2026",
    selectMonth: "اختر شهر الحصاد",
    heroCrop: "المحصول المميز",
    typicalWindow: "الفترة المعتادة",
    supportingCrops: "أيضًا في الموسم",
    nextMonth: "الشهر القادم",
    startsNextMonth: "يبدأ الشهر القادم",
    exploreProducts: "استكشف المنتجات الطازجة",
    disclaimer: "فترات الحصاد المصرية المعتادة. يختلف التوقيت الدقيق حسب المحصول والصنف والموسم.",
    mediaPending: "الصورة التحريرية قيد الإعداد",
    yearRound: "محصول على مدار العام",
    status: { peak: "ذروة الحصاد", "in-season": "في الموسم", opening: "بداية الموسم", final: "الشهر الأخير" },
  },
  ru: {
    eyebrow: "Сезонный календарь",
    titleLead: "Египетский урожай,",
    titleEmphasis: "по кругу года.",
    introduction: "Выберите месяц, чтобы увидеть типичные периоды сбора свежей продукции AGRICA.",
    dataLabel: "Типовой календарь урожая Египта",
    reviewed: "Исследовательская база · сентябрь 2026",
    selectMonth: "Выберите месяц урожая",
    heroCrop: "Главная культура",
    typicalWindow: "Типичный период",
    supportingCrops: "Также в сезоне",
    nextMonth: "Следующий месяц",
    startsNextMonth: "Начинается в следующем месяце",
    exploreProducts: "Смотреть свежую продукцию",
    disclaimer: "Типичные сроки сбора урожая в Египте. Точные сроки зависят от культуры, сорта и сезона.",
    mediaPending: "Редакционное изображение готовится",
    yearRound: "Круглогодичная культура",
    status: { peak: "Пик урожая", "in-season": "В сезоне", opening: "Начало сезона", final: "Последний месяц" },
  },
  de: {
    eyebrow: "Saisonkalender",
    titleLead: "Die ägyptische Ernte,",
    titleEmphasis: "im Jahreskreis.",
    introduction: "Bewegen Sie sich durch das Jahr und entdecken Sie typische Erntefenster im AGRICA-Frischesortiment.",
    dataLabel: "Typischer ägyptischer Erntekalender",
    reviewed: "Recherchebasis · September 2026",
    selectMonth: "Erntemonat wählen",
    heroCrop: "Ausgewählte Kultur",
    typicalWindow: "Typisches Zeitfenster",
    supportingCrops: "Ebenfalls in Saison",
    nextMonth: "Nächster Monat",
    startsNextMonth: "Startet nächsten Monat",
    exploreProducts: "Frische Produkte entdecken",
    disclaimer: "Typische ägyptische Erntefenster. Der genaue Zeitpunkt variiert je nach Kultur, Sorte und Saison.",
    mediaPending: "Editorialbild in Vorbereitung",
    yearRound: "Ganzjährige Kultur",
    status: { peak: "Haupternte", "in-season": "In Saison", opening: "Saisonbeginn", final: "Letzter Monat" },
  },
  fr: {
    eyebrow: "Calendrier saisonnier",
    titleLead: "La récolte égyptienne,",
    titleEmphasis: "en orbite.",
    introduction: "Parcourez l’année pour découvrir les fenêtres de récolte habituelles de la gamme fraîche AGRICA.",
    dataLabel: "Calendrier type des récoltes égyptiennes",
    reviewed: "Base de recherche · septembre 2026",
    selectMonth: "Choisir le mois de récolte",
    heroCrop: "Culture à l’honneur",
    typicalWindow: "Fenêtre habituelle",
    supportingCrops: "Également de saison",
    nextMonth: "Mois suivant",
    startsNextMonth: "Commence le mois prochain",
    exploreProducts: "Découvrir les produits frais",
    disclaimer: "Périodes habituelles des récoltes égyptiennes. Le calendrier exact varie selon la culture, la variété et la saison.",
    mediaPending: "Visuel éditorial en préparation",
    yearRound: "Culture disponible toute l’année",
    status: { peak: "Pic de récolte", "in-season": "De saison", opening: "Début de saison", final: "Dernier mois" },
  },
};

export function seasonEditorialDictionary(locale: Locale): SeasonEditorialDictionary {
  return COPY[locale];
}
