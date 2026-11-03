import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { pageMetadata, type PageCopy } from "@/seo/metadata";
import { DIVISION_REGISTRY } from "./registry";
import type { DivisionId, SemanticPageKind } from "./types";

export function divisionPageMetadata(locale: Locale, division: DivisionId, page: SemanticPageKind, copy: PageCopy = { title: "AGRICA", description: "Egyptian agricultural exports." }): Metadata {
  const route = DIVISION_REGISTRY[division].routes[page];
  // Business verification is required before this process narrative is indexed.
  const indexable = !(division === "herbs-spices" && page === "standard");
  return pageMetadata(locale, route, copy, { indexable });
}
