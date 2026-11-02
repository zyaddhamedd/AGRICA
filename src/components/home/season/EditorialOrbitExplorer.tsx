"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { MonthNumber, ProduceProductId, ProductAtlasItem, QuoteItem } from "@/types/agrica";
import type { SeasonEditorialDictionary } from "@/content/season-editorial-dictionaries";
import {
  getHeroForMonth,
  getSeasonDisplayStatus,
  getSeasonalProductsForMonth,
} from "@/data/seasons";
import { buildProductAtlasItems, toggleQuoteItem } from "@/data/productCatalogue";
import { useProductsDictionary } from "@/i18n/locale-context";
import { MonthOrbit } from "./MonthOrbit";
import { SeasonalCardCollection } from "./SeasonalCardCollection";
import styles from "../SeasonSection.module.css";

export interface EditorialOrbitExplorerProps {
  readonly monthNames: readonly string[];
  readonly productNames: Readonly<Record<ProduceProductId, string>>;
  readonly copy: SeasonEditorialDictionary;
}

function currentCairoMonth(): MonthNumber {
  const month = Number(
    new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: "Africa/Cairo" }).format(new Date()),
  );
  return Math.min(12, Math.max(1, month)) as MonthNumber;
}

export function EditorialOrbitExplorer({
  monthNames,
  productNames,
  copy,
}: EditorialOrbitExplorerProps): React.JSX.Element {
  // January is the stable SSR default. Cairo's current month is selected after hydration.
  const [selectedMonth, setSelectedMonth] = useState<MonthNumber>(1);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const productsDictionary = useProductsDictionary();

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setSelectedMonth(currentCairoMonth());
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const hero = getHeroForMonth(selectedMonth);
  const heroName = productNames[hero.productId] ?? hero.productId;
  const heroStatus = getSeasonDisplayStatus(hero, selectedMonth);
  const monthName = monthNames[selectedMonth - 1];

  const allAtlasItems = useMemo(
    () => buildProductAtlasItems(productsDictionary),
    [productsDictionary],
  );

  const atlasMap = useMemo(
    () => new Map(allAtlasItems.map((item) => [item.id, item])),
    [allAtlasItems],
  );

  // All approved in-season products for selectedMonth, capped at maximum 8 for presentation
  const seasonalItems = useMemo(() => {
    const seasonalEntries = getSeasonalProductsForMonth(selectedMonth);
    return seasonalEntries
      .slice(0, 8)
      .map((entry) => atlasMap.get(entry.productId))
      .filter((item): item is ProductAtlasItem => Boolean(item));
  }, [selectedMonth, atlasMap]);

  return (
    <section
      id="seasons"
      className={styles.section}
      aria-labelledby="season-orbit-title"
      data-motion="season-index"
      data-selected-month={selectedMonth}
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <div className={styles.headerTitle}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h2 id="season-orbit-title">
              {copy.titleLead} <em>{copy.titleEmphasis}</em>
            </h2>
          </div>
        </header>

        <div className={styles.editorialLayout}>
          <MonthOrbit
            monthNames={monthNames}
            selectedMonth={selectedMonth}
            heroProductId={hero.productId}
            heroName={heroName}
            statusLabel={copy.status[heroStatus]}
            selectMonthLabel={copy.selectMonth}
            mediaPendingLabel={copy.mediaPending}
            onSelectMonth={setSelectedMonth}
          />

          <SeasonalCardCollection
            monthName={monthName}
            items={seasonalItems}
            copy={copy}
            isAddedToQuote={(item) => quoteItems.some((q) => q.id === item.id)}
            onToggleQuote={(item) =>
              setQuoteItems((previous) => toggleQuoteItem(previous, item))
            }
          />
        </div>

        <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">
          {monthName}: {seasonalItems.map((i) => i.name).join(", ")}
        </p>
      </div>
    </section>
  );
}
