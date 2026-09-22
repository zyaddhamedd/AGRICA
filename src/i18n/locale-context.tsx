"use client";

import React, { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { CommonDictionary, Dictionary, HerbsSpicesDictionary, HomeDictionary, ProductsDictionary, StandardDictionary } from "./types";

interface LocaleContextValue {
  readonly locale: Locale;
  readonly common: CommonDictionary;
  readonly home: HomeDictionary;
  readonly products: ProductsDictionary;
  readonly herbsSpices: HerbsSpicesDictionary;
  readonly standard: StandardDictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  locale,
  dictionary,
}: {
  readonly children: React.ReactNode;
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}): React.JSX.Element {
  const { common, home, products, herbsSpices, standard } = dictionary;
  return <LocaleContext.Provider value={{ locale, common, home, products, herbsSpices, standard }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value.locale;
}

export function useCommonDictionary(): CommonDictionary {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useCommonDictionary must be used within LocaleProvider");
  return value.common;
}

export function useHomeDictionary(): HomeDictionary {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useHomeDictionary must be used within LocaleProvider");
  return value.home;
}

export function useProductsDictionary(): ProductsDictionary {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useProductsDictionary must be used within LocaleProvider");
  return value.products;
}

export function useHerbsSpicesDictionary(): HerbsSpicesDictionary {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useHerbsSpicesDictionary must be used within LocaleProvider");
  return value.herbsSpices;
}

export function useStandardDictionary(): StandardDictionary {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useStandardDictionary must be used within LocaleProvider");
  return value.standard;
}
