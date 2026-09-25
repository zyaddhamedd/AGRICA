import React from "react";
import styles from "./IngredientSearch.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";

export interface IngredientSearchProps { readonly value: string; readonly onChange: (value: string) => void; }
export function IngredientSearch({ value, onChange }: IngredientSearchProps): React.JSX.Element {
  const common = useCommonDictionary();

  return (
    <div className={styles.search}>
      <label htmlFor="herbs-spices-search" className={styles.label}>
        {common.catalogue.searchMaterials}
      </label>
      <div className={styles.inputWrap}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          id="herbs-spices-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={common.catalogue.searchMaterialsPlaceholder}
          className={styles.input}
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onChange("")}
            aria-label={common.accessibility.clearIngredientSearch}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
