import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { getHerbsSpicesMedia } from "@/data/herbs-spices/media";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import styles from "./MaterialSpecimen.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface MaterialSpecimenProps {
  readonly item: HerbsSpicesCatalogueItem;
  readonly expanded: boolean;
  readonly selected: boolean;
  readonly onToggleDetails: () => void;
  readonly onToggleSelection: () => void;
  readonly children?: React.ReactNode;
}

export function MaterialSpecimen({ item, expanded, selected, onToggleDetails, onToggleSelection, children }: MaterialSpecimenProps): React.JSX.Element {
  const common = useCommonDictionary();
  const detailsId = `material-details-${item.slug}`;
  const media = getHerbsSpicesMedia(item.mediaKey);

  return (
    <li className={styles.specimen} data-family={item.familyId} data-material-specimen={item.slug} data-expanded={expanded || undefined}>
      <HerbsSpicesMedia className={styles.media} entry={media} alt={item.name} fallback={<><span /><span /><i /></>} />
      <div className={styles.identity}>
        <p>{item.familyName}</p>
        <h3>{item.name}</h3>
      </div>
      <div className={styles.actions}>
        <button
          id={`view-material-${item.slug}`}
          className={styles.viewAction}
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggleDetails}
        >
          {expanded ? common.actions.hideMaterial : common.actions.viewMaterial}
        </button>
        <button
          className={styles.enquiryAction}
          type="button"
          aria-pressed={selected}
          aria-label={selected ? formatMessage(common.enquiry.removeItemFromEnquiry, { name: item.name }) : formatMessage(common.enquiry.addItem, { name: item.name })}
          onClick={onToggleSelection}
        >
          {selected ? common.actions.addedToEnquiry : common.actions.addToEnquiry}
        </button>
      </div>
      {children}
    </li>
  );
}
