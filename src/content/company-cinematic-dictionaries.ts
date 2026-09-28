import type { Locale } from "@/i18n/config";
import type { HomeDictionary } from "@/i18n/types";

const companyCinematicCopy = {
  en: {
    eyebrow: "THE COMPANY",
    chapterLabel: "CHAPTER",
    progressLabel: "Company film progress",
    videoLabel: "AGRICA company film: Origin, Clarity and Connection",
    chapters: [
      { number: "01", title: "Origin", headline: "Egyptian by origin.", supporting: "Citrus shaped by Egypt’s land, season and light." },
      { number: "02", title: "Clarity", headline: "Clear by design.", supporting: "Product, format and destination—defined from the start." },
      { number: "03", title: "Connection", headline: "Made for global business.", supporting: "Egyptian citrus, presented with clarity." },
    ],
  },
  ar: {
    eyebrow: "الشركة",
    chapterLabel: "الفصل",
    progressLabel: "تقدم فيلم الشركة",
    videoLabel: "فيلم أجريكا: المنشأ والوضوح والتواصل",
    chapters: [
      { number: "01", title: "المنشأ", headline: "مصرية المنشأ.", supporting: "حمضيات تصوغها أرض مصر وموسمها ونورها." },
      { number: "02", title: "الوضوح", headline: "وضوح من البداية.", supporting: "المنتج والصيغة والوجهة—محددة منذ البداية." },
      { number: "03", title: "التواصل", headline: "مهيأة للأعمال العالمية.", supporting: "حمضيات مصرية، مقدمة بوضوح." },
    ],
  },
  ru: {
    eyebrow: "КОМПАНИЯ",
    chapterLabel: "ГЛАВА",
    progressLabel: "Ход фильма о компании",
    videoLabel: "Фильм AGRICA: происхождение, ясность и связь",
    chapters: [
      { number: "01", title: "Происхождение", headline: "Египетское происхождение.", supporting: "Цитрусовые, сформированные землёй, сезоном и светом Египта." },
      { number: "02", title: "Ясность", headline: "Ясность по замыслу.", supporting: "Продукт, формат и назначение определены с самого начала." },
      { number: "03", title: "Связь", headline: "Для глобального бизнеса.", supporting: "Египетские цитрусовые, представленные ясно." },
    ],
  },
  de: {
    eyebrow: "DAS UNTERNEHMEN",
    chapterLabel: "KAPITEL",
    progressLabel: "Fortschritt des Unternehmensfilms",
    videoLabel: "AGRICA Unternehmensfilm: Ursprung, Klarheit und Verbindung",
    chapters: [
      { number: "01", title: "Ursprung", headline: "Ägyptisch im Ursprung.", supporting: "Zitrusfrüchte, geprägt von Ägyptens Boden, Saison und Licht." },
      { number: "02", title: "Klarheit", headline: "Klarheit mit System.", supporting: "Produkt, Format und Bestimmung—von Anfang an definiert." },
      { number: "03", title: "Verbindung", headline: "Für globales Geschäft.", supporting: "Ägyptische Zitrusfrüchte, klar präsentiert." },
    ],
  },
  fr: {
    eyebrow: "L’ENTREPRISE",
    chapterLabel: "CHAPITRE",
    progressLabel: "Progression du film d’entreprise",
    videoLabel: "Film AGRICA : Origine, Clarté et Connexion",
    chapters: [
      { number: "01", title: "Origine", headline: "Égyptienne par son origine.", supporting: "Des agrumes façonnés par la terre, la saison et la lumière d’Égypte." },
      { number: "02", title: "Clarté", headline: "La clarté par conception.", supporting: "Produit, format et destination—définis dès le départ." },
      { number: "03", title: "Connexion", headline: "Pensée pour le commerce mondial.", supporting: "Des agrumes égyptiens, présentés avec clarté." },
    ],
  },
} as const satisfies Record<Locale, HomeDictionary["company"]>;

export function companyCinematicDictionary(locale: Locale): HomeDictionary["company"] {
  return companyCinematicCopy[locale];
}
