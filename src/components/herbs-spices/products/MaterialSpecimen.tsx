import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { getHerbsSpicesMedia } from "@/data/herbs-spices/media";
import { BOTANICAL_LATIN_NAMES } from "@/data/herbs-spices/catalogue";
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
}

export function MaterialSpecimen({
  item,
  expanded,
  selected,
  onToggleDetails,
  onToggleSelection,
}: MaterialSpecimenProps): React.JSX.Element {
  const common = useCommonDictionary();
  const media = getHerbsSpicesMedia(item.mediaKey);
  const latinName = BOTANICAL_LATIN_NAMES[item.slug];

  return (
    <li
      className={`${styles.specimen} ${expanded ? styles.specimenExpanded : ""}`}
      data-family={item.familyId}
      data-material-specimen={item.slug}
    >
      <article
        id={`material-plate-${item.slug}`}
        className={styles.plate}
        onClick={onToggleDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleDetails();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-haspopup="dialog"
        aria-label={`${item.name} · ${item.familyName} - Click to inspect`}
      >
        {/* Image Frame */}
        <div className={styles.mediaWrap}>
          <HerbsSpicesMedia
            className={styles.media}
            entry={media}
            alt={`${item.name} botanical specimen`}
            fallback={<span className={styles.fallback} />}
          />
          <span className={styles.inspectHint} aria-hidden="true">
            Inspect ↗
          </span>
        </div>

        {/* Content Details */}
        <div className={styles.identity}>
          <div className={styles.metaRow}>
            <span className={styles.familyTag}>{item.familyName}</span>
            <span className={styles.originTag}>Egypt</span>
          </div>

          <h3 className={styles.name}>{item.name}</h3>

          {latinName && (
            <em className={styles.latinName}>{latinName}</em>
          )}

          {item.formsConfidence === "product-specific" && item.forms.length > 0 ? (
            <p className={styles.forms}>
              {item.forms.join(" · ")}
            </p>
          ) : (
            <p className={styles.formsQuiet}>
              Formats confirmed on request
            </p>
          )}
        </div>
      </article>

      {/* Distinct Lightweight Enquiry Action */}
      <div className={styles.actionRow}>
        <button
          className={`${styles.enquiryBtn} ${selected ? styles.enquiryBtnSelected : ""}`}
          type="button"
          aria-pressed={selected}
          aria-label={
            selected
              ? formatMessage(common.enquiry.removeItemFromEnquiry, { name: item.name })
              : formatMessage(common.enquiry.addItem, { name: item.name })
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection();
          }}
        >
          <span className={styles.enquiryIcon} aria-hidden="true">
            {selected ? "✓" : "+"}
          </span>
          <span>{selected ? common.actions.addedToEnquiry : common.actions.addToEnquiry}</span>
        </button>
      </div>
    </li>
  );
}
