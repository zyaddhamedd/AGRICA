import "server-only";

import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaryLoaders = {
  en: () => import("./dictionaries/en").then((module) => module.default),
  ar: () => import("./dictionaries/ar").then((module) => module.default),
  ru: () => import("./dictionaries/ru").then((module) => module.default),
  de: () => import("./dictionaries/de").then((module) => module.default),
  fr: () => import("./dictionaries/fr").then((module) => module.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

/** Server-only loader: imports exactly one locale dictionary per call. */
export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaryLoaders[locale]();
}
