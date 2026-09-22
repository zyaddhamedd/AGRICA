import React, { useRef } from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { getProductSpecData } from "@/data/productSpecs";
import { ProductCardFront } from "./ProductCardFront";
import { ProductCardBack } from "./ProductCardBack";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";
import { localizeProduceTechnicalValue } from "@/content/produce/technical-terms";

export interface ProductFlipCardProps {
  readonly item: ProductAtlasItem;
  readonly isFlipped: boolean;
  readonly isAddedToQuote: boolean;
  readonly onFlip: (item: ProductAtlasItem) => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductFlipCard({
  item,
  isFlipped,
  isAddedToQuote,
  onFlip,
  onToggleQuote,
}: ProductFlipCardProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const locale = useLocale();
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);
  const worldPrefix = item.worldId === "fresh" ? "FR" : item.worldId === "frozen" ? "FZ" : "DR";
  const code = `${worldPrefix} / ${item.familyCode}`;
  const specEntry = getProductSpecData(item);
  const varietyNames = specEntry.varieties?.map((variety) => localizeProduceTechnicalValue(locale, variety.name)) ?? [];
  const varietyLine = varietyNames.join(" · ") || item.variety || "";

  const toggle = () => onFlip(item);

  return (
    <div className="export-card-scene" data-world={item.worldId}>
      <article
        className={`export-card${isFlipped ? " is-flipped" : ""}`}
        onPointerDown={(event) => {
          pointerOrigin.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const origin = pointerOrigin.current;
          pointerOrigin.current = null;
          if (!origin) return;
          const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
          if (distance <= 8) toggle();
        }}
        onPointerCancel={() => {
          pointerOrigin.current = null;
        }}
      >
        <ProductCardFront
          item={item}
          code={code}
          varietyLine={varietyLine}
          isAddedToQuote={isAddedToQuote}
          isFlipped={isFlipped}
          onToggleQuote={onToggleQuote}
        />
        <ProductCardBack
          item={item}
          code={code}
          specifications={specEntry.defaultSpecs}
          varietyNames={varietyNames}
          isFlipped={isFlipped}
          isAddedToQuote={isAddedToQuote}
          onToggleQuote={onToggleQuote}
        />
        <button
          type="button"
          className="export-card-keyboard-toggle"
          aria-pressed={isFlipped}
          aria-label={`${item.name}: ${isFlipped ? dictionary.ui.showFront : dictionary.ui.showSpecifications}`}
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
        />
      </article>
    </div>
  );
}
