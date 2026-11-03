import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { absoluteUrl, languageAlternates, localizedUrl, SITE_LOGO } from "./site";

export interface PageCopy { readonly title: string; readonly description: string }
const socialLocale: Record<Locale, string> = { en: "en_GB", ar: "ar_EG", ru: "ru_RU", de: "de_DE", fr: "fr_FR" };

export function pageMetadata(locale: Locale, path: string, copy: PageCopy, options: { indexable?: boolean; translated?: boolean; canonicalLocale?: Locale } = {}): Metadata {
  if (!isLocale(locale)) notFound();
  const { indexable = true, translated = true, canonicalLocale = locale } = options;
  const canonical = localizedUrl(canonicalLocale, path);
  const title = /\bAGRICA\b/i.test(copy.title) ? copy.title : `${copy.title} — AGRICA`;
  return {
    title: { absolute: title },
    description: copy.description,
    alternates: { canonical, ...(indexable && translated ? { languages: languageAlternates(path) } : {}) },
    robots: { index: indexable, follow: indexable },
    openGraph: {
      type: "website", siteName: "AGRICA", title, description: copy.description,
      url: canonical, locale: socialLocale[canonicalLocale],
      ...(indexable && translated ? { alternateLocale: locales.filter((l) => l !== locale).map((l) => socialLocale[l]) } : {}),
      images: [{ url: absoluteUrl(SITE_LOGO), alt: "AGRICA" }],
    },
    twitter: { card: "summary", title, description: copy.description, images: [absoluteUrl(SITE_LOGO)] },
  };
}
