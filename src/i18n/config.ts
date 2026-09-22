export const locales = ["en", "ar", "ru", "de", "fr"] as const;

export type Locale = (typeof locales)[number];
export type TextDirection = "ltr" | "rtl";

export const defaultLocale: Locale = "en";
export const rtlLocales = ["ar"] as const satisfies readonly Locale[];

export interface LocaleFlagMetadata {
  readonly src: `/assets/flags/${string}.svg`;
  readonly alt: string;
  readonly countryCode: "EG" | "GB" | "RU" | "DE" | "FR";
}

export interface LocaleMetadata {
  readonly code: Locale;
  readonly label: string;
  readonly direction: TextDirection;
  /** Visual selector cue only. Locale code remains the language identity. */
  readonly flag: LocaleFlagMetadata;
}

export const localeRegistry = {
  en: {
    code: "en",
    label: "English",
    direction: "ltr",
    flag: { src: "/assets/flags/gb.svg", alt: "United Kingdom flag", countryCode: "GB" },
  },
  ar: {
    code: "ar",
    label: "العربية",
    direction: "rtl",
    flag: { src: "/assets/flags/eg.svg", alt: "Egyptian flag", countryCode: "EG" },
  },
  ru: {
    code: "ru",
    label: "Русский",
    direction: "ltr",
    flag: { src: "/assets/flags/ru.svg", alt: "Russian flag", countryCode: "RU" },
  },
  de: {
    code: "de",
    label: "Deutsch",
    direction: "ltr",
    flag: { src: "/assets/flags/de.svg", alt: "German flag", countryCode: "DE" },
  },
  fr: {
    code: "fr",
    label: "Français",
    direction: "ltr",
    flag: { src: "/assets/flags/fr.svg", alt: "French flag", countryCode: "FR" },
  },
} as const satisfies Readonly<Record<Locale, LocaleMetadata>>;

/** Ordered registry entries for the future language switcher. */
export const languageOptions: readonly LocaleMetadata[] = locales.map(
  (locale) => localeRegistry[locale],
);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function isRtlLocale(locale: Locale): boolean {
  return (rtlLocales as readonly Locale[]).includes(locale);
}

export function directionForLocale(locale: Locale): TextDirection {
  return localeRegistry[locale].direction;
}
