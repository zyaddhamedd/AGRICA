import { locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";

export const SITE_ORIGIN = "https://www.agriculturecairo.com";
export const SITE_LOGO = "/assets/agrica-logo-brand.png";
export const INDEXABLE_LOCALIZED_PATHS = ["/", "/products", "/standard", "/herbs-spices", "/herbs-spices/products"] as const;

export function absoluteUrl(path: string): string {
  const url = new URL(path, SITE_ORIGIN);
  url.search = "";
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

export function localizedUrl(locale: Locale, path: string): string {
  return absoluteUrl(localePath(locale, path));
}

export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, localizedUrl(locale, path)])),
    "x-default": localizedUrl("en", path),
  };
}
