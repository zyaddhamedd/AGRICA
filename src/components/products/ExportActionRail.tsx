import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { useProductsDictionary } from "@/i18n/locale-context";

interface ExportActionRailProps {
  readonly item: ProductAtlasItem;
  readonly isAddedToQuote: boolean;
  readonly isCardFlipped: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ExportActionRail({
  item,
  isAddedToQuote,
  isCardFlipped,
  onToggleQuote,
}: ExportActionRailProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  return (
    <button
      type="button"
      className={`enquiry-notch${isAddedToQuote ? " is-selected" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onToggleQuote(item);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      tabIndex={isCardFlipped ? 0 : -1}
      aria-pressed={isAddedToQuote}
      aria-label={
        isAddedToQuote
          ? `${dictionary.ui.removeFromEnquiry}: ${item.name}`
          : `${dictionary.ui.add}: ${item.name}`
      }
    >
      <span className="enquiry-notch-label">
        {isAddedToQuote ? dictionary.ui.added : dictionary.ui.add}
      </span>
      <span className="enquiry-notch-mark" aria-hidden="true">
        {isAddedToQuote ? "✓" : "+"}
      </span>
    </button>
  );
}
