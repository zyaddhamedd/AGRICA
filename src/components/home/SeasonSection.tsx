"use client";

import React from "react";
import type { ProduceProductId } from "@/types/agrica";
import { seasonEditorialDictionary } from "@/content/season-editorial-dictionaries";
import { useHomeDictionary, useLocale, useProductsDictionary } from "@/i18n/locale-context";
import { EditorialOrbitExplorer } from "./season/EditorialOrbitExplorer";

export function SeasonSection(): React.JSX.Element {
  const locale = useLocale();
  const homeSeason = useHomeDictionary().season;
  const products = useProductsDictionary();
  const copy = seasonEditorialDictionary(locale);
  const productNames = Object.fromEntries(
    Object.entries(products.products).map(([productId, product]) => [productId, product.name]),
  ) as Readonly<Record<ProduceProductId, string>>;

  return (
    <EditorialOrbitExplorer
      monthNames={homeSeason.months}
      productNames={productNames}
      copy={copy}
    />
  );
}

export default SeasonSection;
