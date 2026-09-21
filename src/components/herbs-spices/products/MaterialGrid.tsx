"use client";

import React from "react";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import { MaterialReveal } from "./MaterialReveal";
import { MaterialSpecimen } from "./MaterialSpecimen";
import styles from "./MaterialGrid.module.css";

export interface MaterialGridProps {
  readonly items: readonly HerbsSpicesCatalogueItem[];
  readonly expandedItem: HerbsSpicesCatalogueItem | null;
  readonly selectedIds: readonly HerbsSpicesCatalogueItem["id"][];
  readonly revealClosing: boolean;
  readonly onToggleDetails: (id: HerbsSpicesCatalogueItem["id"]) => void;
  readonly onToggleSelection: (id: HerbsSpicesCatalogueItem["id"]) => void;
  readonly onRequestClose: (restoreFocus?: boolean) => void;
  readonly onRevealClosed: () => void;
}

export function MaterialGrid({ items, expandedItem, selectedIds, revealClosing, onToggleDetails, onToggleSelection, onRequestClose, onRevealClosed }: MaterialGridProps): React.JSX.Element {
  return (
    <ol className={styles.grid} data-material-grid>
      {items.map((item) => {
        const expanded = expandedItem?.id === item.id;
        return (
          <MaterialSpecimen key={item.id} item={item} expanded={expanded} selected={selectedIds.includes(item.id)} onToggleDetails={() => onToggleDetails(item.id)} onToggleSelection={() => onToggleSelection(item.id)}>
            {expanded && (
              <MaterialReveal
                item={item}
                closing={revealClosing}
                onRequestClose={onRequestClose}
                onClosed={onRevealClosed}
              />
            )}
          </MaterialSpecimen>
        );
      })}
    </ol>
  );
}
