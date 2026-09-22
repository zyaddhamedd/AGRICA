import React from "react";
import type { HerbsSpicesFamily, HerbsSpicesFamilyId } from "@/types/herbs-spices";
import styles from "./FamilyRail.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";

export type FamilySelection = "all" | HerbsSpicesFamilyId;
export interface FamilyRailProps { readonly families: readonly HerbsSpicesFamily[]; readonly activeFamily: FamilySelection; readonly onChange: (family: FamilySelection) => void; }

export function FamilyRail({ families, activeFamily, onChange }: FamilyRailProps): React.JSX.Element {
  const common = useCommonDictionary();
  return <div className={styles.scroller}><div className={styles.rail} role="group" aria-label={common.accessibility.filterHerbsFamilies}>
    <button type="button" aria-pressed={activeFamily === "all"} onClick={() => onChange("all")}>{common.catalogue.all}</button>
    {families.map((family) => <button type="button" key={family.id} aria-pressed={activeFamily === family.id} onClick={() => onChange(family.id)}>{family.label}</button>)}
  </div></div>;
}
