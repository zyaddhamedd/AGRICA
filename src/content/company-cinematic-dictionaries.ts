import type { Locale } from "@/i18n/config";
import type { HomeDictionary } from "@/i18n/types";

const companyCinematicCopy = {
  en: {
    eyebrow: "AGRICA / THE COMPANY",
    headline: "From Egyptian soil to global supply.",
    supporting: "Real agricultural work. Careful selection. Cold-chain precision. One company controlling the journey.",
    action: "Discover AGRICA",
    videoLabel: "AGRICA company film: Egyptian strawberries from field to frozen export readiness",
  },
  ar: {
    eyebrow: "أجريكا / الشركة",
    headline: "من أرض مصر إلى الأسواق العالمية.",
    supporting: "عمل زراعي حقيقي. اختيار دقيق. تحكم في سلسلة التبريد. شركة واحدة تدير الرحلة كاملة.",
    action: "اكتشف أجريكا",
    videoLabel: "فيلم شركة أجريكا: الفراولة المصرية من الحقل إلى منتج مجمد جاهز للتصدير",
  },
  ru: {
    eyebrow: "AGRICA / КОМПАНИЯ",
    headline: "От египетской земли — к мировым рынкам.",
    supporting: "Настоящее сельское хозяйство. Точный отбор. Контроль холодовой цепи. Одна компания управляет всем путем.",
    action: "Узнать об AGRICA",
    videoLabel: "Фильм о компании AGRICA: египетская клубника от поля до готового к экспорту замороженного продукта",
  },
  de: {
    eyebrow: "AGRICA / DAS UNTERNEHMEN",
    headline: "Von ägyptischem Boden in die Welt.",
    supporting: "Echte Landwirtschaft. Sorgfältige Auswahl. Präzise Kühlkette. Ein Unternehmen steuert den gesamten Weg.",
    action: "AGRICA entdecken",
    videoLabel: "AGRICA Unternehmensfilm: Ägyptische Erdbeeren vom Feld bis zum exportfertigen Tiefkühlprodukt",
  },
  fr: {
    eyebrow: "AGRICA / L’ENTREPRISE",
    headline: "De la terre d’Égypte aux marchés mondiaux.",
    supporting: "Un vrai travail agricole. Une sélection rigoureuse. Une chaîne du froid maîtrisée. Une entreprise contrôle tout le parcours.",
    action: "Découvrir AGRICA",
    videoLabel: "Film AGRICA : des fraises égyptiennes au produit surgelé prêt à l’export",
  },
} as const satisfies Record<Locale, HomeDictionary["company"]>;

export function companyCinematicDictionary(locale: Locale): HomeDictionary["company"] {
  return companyCinematicCopy[locale];
}
