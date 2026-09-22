import React from "react";
import styles from "./IngredientSearch.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";

export interface IngredientSearchProps { readonly value: string; readonly onChange: (value: string) => void; }
export function IngredientSearch({ value, onChange }: IngredientSearchProps): React.JSX.Element {
  const common = useCommonDictionary();
  return <div className={styles.search}>
    <label htmlFor="herbs-spices-search">{common.catalogue.searchMaterials}</label>
    <div><input id="herbs-spices-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={common.catalogue.searchMaterialsPlaceholder} />{value && <button type="button" onClick={() => onChange("")} aria-label={common.accessibility.clearIngredientSearch}>{common.actions.clear}</button>}</div>
  </div>;
}
