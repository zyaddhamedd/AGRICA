import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { getHerbsSpicesMedia } from "@/data/herbs-spices/media";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import styles from "./MaterialCard.module.css";

export interface MaterialCardProps { readonly item: HerbsSpicesCatalogueItem; readonly expanded: boolean; readonly selected: boolean; readonly onToggleDetails: () => void; readonly onToggleSelection: () => void; }
export function MaterialCard({ item, expanded, selected, onToggleDetails, onToggleSelection }: MaterialCardProps): React.JSX.Element {
  const detailsId = `material-details-${item.slug}`;
  const media = getHerbsSpicesMedia(item.mediaKey);
  return <article className={styles.card} data-family={item.familyId}>
    <HerbsSpicesMedia className={styles.specimen} entry={media} fallback={<><span /><span /><i /></>} />
    <div className={styles.body}>
      <p className={styles.family}>{item.familyName}</p><h2>{item.name}</h2>
      {item.shortDescription && <p className={styles.description}>{item.shortDescription}</p>}
      {item.forms.length > 0 && <ul className={styles.forms} aria-label={`${item.name} available forms`}>{item.forms.map((form) => <li key={form}>{form}</li>)}</ul>}
      <div className={styles.actions}>
        <button type="button" aria-expanded={expanded} aria-controls={detailsId} onClick={onToggleDetails}>{expanded ? "Hide material" : "View material"}</button>
        <button className={styles.enquiryAction} type="button" aria-pressed={selected} onClick={onToggleSelection}>{selected ? "Remove from enquiry" : "Add to enquiry"}</button>
      </div>
      {expanded && <div className={styles.details} id={detailsId}><dl><div><dt>Family</dt><dd>{item.familyName}</dd></div>{item.forms.length > 0 && <div><dt>Forms</dt><dd>{item.forms.join(", ")}</dd></div>}</dl><p>Technical specifications and samples are available upon request.</p></div>}
    </div>
  </article>;
}
