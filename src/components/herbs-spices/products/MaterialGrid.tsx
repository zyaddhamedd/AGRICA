"use client";

import React from "react";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import { MaterialSpecimen } from "./MaterialSpecimen";
import styles from "./MaterialGrid.module.css";

export interface MaterialGridProps {
  readonly items: readonly HerbsSpicesCatalogueItem[];
  readonly expandedItem: HerbsSpicesCatalogueItem | null;
  readonly selectedIds: readonly HerbsSpicesCatalogueItem["id"][];
  readonly onToggleDetails: (id: HerbsSpicesCatalogueItem["id"]) => void;
  readonly onToggleSelection: (id: HerbsSpicesCatalogueItem["id"]) => void;
}

const FAMILY_INDICES: Record<string, string> = {
  herbs: "01",
  flowers: "02",
  seeds: "03",
  spices: "04",
  roots: "05",
  "dehydrated-vegetables": "06",
};

export function MaterialGrid({
  items,
  expandedItem,
  selectedIds,
  onToggleDetails,
  onToggleSelection,
}: MaterialGridProps): React.JSX.Element {
  let previousFamilyId: string | null = null;

  // Compute item count per family in current filtered view
  const familyCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.familyId] = (acc[item.familyId] || 0) + 1;
    return acc;
  }, {});

  return (
    <ol className={styles.grid} data-material-grid>
      {items.map((item) => {
        const isExpanded = expandedItem?.id === item.id;
        const isSelected = selectedIds.includes(item.id);
        const isNewFamily = item.familyId !== previousFamilyId;
        previousFamilyId = item.familyId;
        const count = familyCounts[item.familyId] ?? 1;
        const familyIndex = FAMILY_INDICES[item.familyId] ?? "01";

        return (
          <React.Fragment key={item.id}>
            {isNewFamily && (
              <li
                className={styles.familyTransition}
                aria-hidden="true"
                data-family-marker={item.familyId}
              >
                <div className={styles.familyMarkerInner}>
                  <span className={styles.familyIndex}>{familyIndex}</span>
                  <span className={styles.familyTitle}>{item.familyName}</span>
                  <span className={styles.familyCount}>
                    {count} {count === 1 ? "material" : "materials"}
                  </span>
                </div>
                <div className={styles.familyDivider} />
              </li>
            )}
            <MaterialSpecimen
              item={item}
              expanded={isExpanded}
              selected={isSelected}
              onToggleDetails={() => onToggleDetails(item.id)}
              onToggleSelection={() => onToggleSelection(item.id)}
            />
          </React.Fragment>
        );
      })}
    </ol>
  );
}
