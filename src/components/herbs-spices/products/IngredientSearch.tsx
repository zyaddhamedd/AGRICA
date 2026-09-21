import React from "react";
import styles from "./IngredientSearch.module.css";

export interface IngredientSearchProps { readonly value: string; readonly onChange: (value: string) => void; }
export function IngredientSearch({ value, onChange }: IngredientSearchProps): React.JSX.Element {
  return <div className={styles.search}>
    <label htmlFor="herbs-spices-search">Search materials</label>
    <div><input id="herbs-spices-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Name, family, or form" />{value && <button type="button" onClick={() => onChange("")} aria-label="Clear ingredient search">Clear</button>}</div>
  </div>;
}
