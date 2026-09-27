import React from "react";
import type { SeasonDisplayStatus } from "@/data/seasons";
import styles from "../SeasonSection.module.css";

export interface SeasonListItem {
  readonly id: string;
  readonly name: string;
  readonly status: SeasonDisplayStatus;
  readonly statusLabel: string;
}

export interface SelectedMonthPanelProps {
  readonly monthName: string;
  readonly heroName: string;
  readonly heroStatus: SeasonDisplayStatus;
  readonly heroStatusLabel: string;
  readonly windowLabel: string;
  readonly supportingLabel: string;
  readonly supporting: readonly SeasonListItem[];
}

export function SelectedMonthPanel({
  monthName,
  heroName,
  heroStatus,
  heroStatusLabel,
  windowLabel,
  supportingLabel,
  supporting,
}: SelectedMonthPanelProps): React.JSX.Element {
  return (
    <aside
      className={styles.monthPanel}
      aria-labelledby="season-selected-product"
      data-supporting-count={supporting.length}
    >
      <p id="season-selected-month" className={styles.panelMonth}>{monthName}</p>
      <h3 id="season-selected-product">{heroName}</h3>

      <p className={styles.panelMeta}>
        <span className={styles.panelStatus} data-status={heroStatus}>
          <i aria-hidden="true" /> {heroStatusLabel}
        </span>
        <span className={styles.metaSeparator} aria-hidden="true">·</span>
        <span>{windowLabel}</span>
      </p>

      {supporting.length > 0 && (
        <p className={styles.supportingLine}>
          <span>{supportingLabel}:</span>{" "}
          <b>{supporting.map((item) => item.name).join(" · ")}</b>
        </p>
      )}
    </aside>
  );
}
