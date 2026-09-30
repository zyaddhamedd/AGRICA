import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import type { PublicProductCardField } from "@/types/product-card-content";
import { ProductSpecTable } from "./ProductSpecTable";
import { ExportActionRail } from "./ExportActionRail";
import { useProductsDictionary } from "@/i18n/locale-context";

export interface ProductCardBackProps {
  readonly item: ProductAtlasItem;
  readonly code: string;
  readonly fields: readonly PublicProductCardField[];
  readonly isFlipped: boolean;
  readonly isAddedToQuote: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
  readonly onClose?: () => void;
}

export function ProductCardBack({
  item,
  code,
  fields,
  isFlipped,
  isAddedToQuote,
  onToggleQuote,
  onClose,
}: ProductCardBackProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  return (
    <section className="export-card-face export-card-back" aria-hidden={!isFlipped}>
      <header className="export-card-back-head">
        <span className="export-card-code">{code}</span>
        {onClose ? (
          <button
            type="button"
            className="export-card-flight-close"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close card"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <span className="export-card-back-cue" aria-hidden="true">↺</span>
        )}
      </header>
      <h3 className="export-card-back-title">{item.name}</h3>
      <p className="export-card-spec-kicker">{dictionary.ui.productSpecifications}</p>
      <ProductSpecTable item={item} fields={fields} />
      <ExportActionRail
        item={item}
        isAddedToQuote={isAddedToQuote}
        isCardFlipped={isFlipped}
        onToggleQuote={onToggleQuote}
      />
    </section>
  );
}
