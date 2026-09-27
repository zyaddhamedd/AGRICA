"use client";

import React, { useEffect, useState } from "react";
import type { MonthNumber, ProduceProductId } from "@/types/agrica";
import type { SeasonEditorialDictionary } from "@/content/season-editorial-dictionaries";
import {
  getHeroForMonth,
  getSeasonDisplayStatus,
  getSeasonalProductsForMonth,
} from "@/data/seasons";
import { MonthOrbit } from "./MonthOrbit";
import { SelectedMonthPanel, type SeasonListItem } from "./SelectedMonthPanel";
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

function abbreviatedMonth(name: string): string {
  return Array.from(name).slice(0, 3).join("");
}

export function EditorialOrbitExplorer({
  monthNames,
  productNames,
  copy,
}: EditorialOrbitExplorerProps): React.JSX.Element {
  // January is the stable SSR default. Cairo's current month is selected after hydration.
  const [selectedMonth, setSelectedMonth] = useState<MonthNumber>(1);

  useEffect(() => {
    setSelectedMonth(currentCairoMonth());
  }, []);

  const hero = getHeroForMonth(selectedMonth);
  const heroName = productNames[hero.productId] ?? hero.productId;
  const heroStatus = getSeasonDisplayStatus(hero, selectedMonth);
  const monthName = monthNames[selectedMonth - 1];
  const supporting: readonly SeasonListItem[] = getSeasonalProductsForMonth(selectedMonth)
    .filter((entry) => entry.productId !== hero.productId)
    .slice(0, 3)
    .map((entry) => {
      const status = getSeasonDisplayStatus(entry, selectedMonth);
      return {
        id: entry.productId,
        name: productNames[entry.productId] ?? entry.productId,
        status,
        statusLabel: copy.status[status],
      };
    });
  const windowLabel = hero.yearRound
    ? copy.yearRound
    : `${abbreviatedMonth(monthNames[hero.windowStart - 1])} — ${abbreviatedMonth(monthNames[hero.windowEnd - 1])}`;

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

          <SelectedMonthPanel
            monthName={monthName}
            heroName={heroName}
            heroStatus={heroStatus}
            heroStatusLabel={copy.status[heroStatus]}
            windowLabel={windowLabel}
            supportingLabel={copy.supportingCrops}
            supporting={supporting}
          />
        </div>

        <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">
          {monthName}: {heroName}, {copy.status[heroStatus]}, {windowLabel}
        </p>
      </div>
    </section>
  );
}
