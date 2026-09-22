import React from "react";
import type { ExportSpecification, ProductAtlasItem } from "@/types/agrica";
import { ProductSpecTable } from "./ProductSpecTable";
import { ExportActionRail } from "./ExportActionRail";
import { useProductsDictionary } from "@/i18n/locale-context";

interface ProductCardBackProps {
  readonly item: ProductAtlasItem;
  readonly code: string;
  readonly specifications?: ExportSpecification;
  readonly varietyNames: readonly string[];
  readonly isFlipped: boolean;
  readonly isAddedToQuote: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductCardBack({
  item,
  code,
  specifications,
  varietyNames,
  isFlipped,
  isAddedToQuote,
  onToggleQuote,
}: ProductCardBackProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  return (
    <section className="export-card-face export-card-back" aria-hidden={!isFlipped}>
      <header className="export-card-back-head">
        <span className="export-card-code">{code}</span>
        <span className="export-card-back-cue" aria-hidden="true">↺</span>
      </header>
      <h3 className="export-card-back-title">{item.name}</h3>
      <p className="export-card-spec-kicker">{dictionary.ui.productSpecifications}</p>
      <ProductSpecTable
        item={item}
        specifications={specifications}
        varietyNames={varietyNames}
      />
      <ExportActionRail
        item={item}
        isAddedToQuote={isAddedToQuote}
        isCardFlipped={isFlipped}
        onToggleQuote={onToggleQuote}
      />
    </section>
  );
}
