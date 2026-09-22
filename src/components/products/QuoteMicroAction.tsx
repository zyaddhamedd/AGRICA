import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

interface QuoteMicroActionProps {
  readonly item: ProductAtlasItem;
  readonly isAddedToQuote: boolean;
  readonly isCardFlipped: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function QuoteMicroAction({
  item,
  isAddedToQuote,
  isCardFlipped,
  onToggleQuote,
}: QuoteMicroActionProps): React.JSX.Element {
  const common = useCommonDictionary();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleQuote(item);
  };

  return (
    <button
      type="button"
      className={`export-card-quote${isAddedToQuote ? " is-selected" : ""}`}
      onClick={handleClick}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      tabIndex={isCardFlipped ? -1 : 0}
      aria-pressed={isAddedToQuote}
      aria-label={
        isAddedToQuote
          ? formatMessage(common.enquiry.removeItemFromEnquiry, { name: item.name })
          : formatMessage(common.enquiry.addItem, { name: item.name })
      }
    >
      <span aria-hidden="true">{isAddedToQuote ? "✓" : "+"}</span>
    </button>
  );
}
