import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl, INDEXABLE_LOCALIZED_PATHS, languageAlternates, localizedUrl } from "@/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...INDEXABLE_LOCALIZED_PATHS.flatMap((path) => locales.map((locale) => ({ url: localizedUrl(locale, path), alternates: { languages: languageAlternates(path) } }))),
    // Company main content and standalone Contact currently exist in English only.
    { url: localizedUrl("en", "/company") },
    { url: absoluteUrl("/contact") },
  ];
}
