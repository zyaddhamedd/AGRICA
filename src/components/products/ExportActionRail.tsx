import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";

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
          ? `Remove ${item.name} from export enquiry`
          : `Add ${item.name} to export enquiry`
      }
    >
      <span className="enquiry-notch-label">
        {isAddedToQuote ? "Added" : "Add to enquiry"}
      </span>
      <span className="enquiry-notch-mark" aria-hidden="true">
        {isAddedToQuote ? "✓" : "+"}
      </span>
    </button>
  );
}
