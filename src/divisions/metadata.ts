import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { localePath } from "@/i18n/navigation";
import { DIVISION_REGISTRY } from "./registry";
import type { DivisionId, SemanticPageKind } from "./types";

// Same public origin as the existing /contact canonical.
const SITE_ORIGIN = "https://www.agriculturecairo.com";

export function divisionPageMetadata(locale: Locale, division: DivisionId, page: SemanticPageKind): Metadata {
  if (!isLocale(locale)) notFound();
  const route = DIVISION_REGISTRY[division].routes[page];
  return {
    alternates: { canonical: new URL(localePath(locale, route), SITE_ORIGIN).href },
    // The process narrative is explicitly unverified. Keep it out of search
    // until the business approves the underlying stages, independently of launch.
    robots: division === "herbs-spices" && page === "standard"
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
