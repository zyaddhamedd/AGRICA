import React from "react";
import type { HerbsSpicesFamily, HerbsSpicesFamilyId } from "@/types/herbs-spices";
import styles from "./FamilyRail.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";

export type FamilySelection = "all" | HerbsSpicesFamilyId;

export interface FamilyRailProps {
  readonly families: readonly HerbsSpicesFamily[];
  readonly activeFamily: FamilySelection;
  readonly onChange: (family: FamilySelection) => void;
}

export function FamilyRail({ families, activeFamily, onChange }: FamilyRailProps): React.JSX.Element {
  const common = useCommonDictionary();

  return (
    <nav className={styles.scroller} aria-label={common.accessibility.filterHerbsFamilies}>
      <div className={styles.rail} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeFamily === "all"}
          className={`${styles.tabBtn} ${activeFamily === "all" ? styles.tabBtnActive : ""}`}
          onClick={() => onChange("all")}
        >
          <span className={styles.tabLabel}>{common.catalogue.all}</span>
        </button>

        {families.map((family) => {
          const isActive = activeFamily === family.id;
          return (
            <button
              type="button"
              key={family.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
              onClick={() => onChange(family.id)}
            >
              <span className={styles.tabLabel}>{family.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

