import React, { memo, useCallback, useMemo, useRef } from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { getPublicProductCardContent } from "@/data/productCardContent";
import { ProductCardFront } from "./ProductCardFront";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";

export interface ProductFlipCardProps {
  readonly item: ProductAtlasItem;
  readonly isExpanded: boolean;
  readonly isAddedToQuote: boolean;
  readonly onOpen: (
    item: ProductAtlasItem,
    originElement: HTMLElement,
    triggerElement: HTMLButtonElement,
  ) => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export const ProductFlipCard = memo(function ProductFlipCard({
  item,
  isExpanded,
  isAddedToQuote,
  onOpen,
  onToggleQuote,
}: ProductFlipCardProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const locale = useLocale();
  const cardRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const worldPrefix = item.worldId === "fresh" ? "FR" : item.worldId === "frozen" ? "FZ" : "DR";
  const code = `${worldPrefix} / ${item.familyCode}`;
  const content = getPublicProductCardContent(item.id);
  const displayItem = useMemo(() => {
    return locale === "en" && content.publicName
      ? { ...item, name: content.publicName }
      : item;
  }, [item, locale, content.publicName]);

  const open = useCallback(() => {
    if (!cardRef.current || !triggerRef.current || isExpanded) return;
    onOpen(displayItem, cardRef.current, triggerRef.current);
  }, [displayItem, isExpanded, onOpen]);

  return (
    <div className="export-card-scene" data-world={item.worldId} data-product-id={item.id}>
      <article
        ref={cardRef}
        className="export-card"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          open();
        }}
      >
        <ProductCardFront
          item={displayItem}
          code={code}
          varietyLine=""
          isAddedToQuote={isAddedToQuote}
          isFlipped={false}
          onToggleQuote={onToggleQuote}
        />
        <button
          type="button"
          ref={triggerRef}
          className="export-card-keyboard-toggle"
          aria-haspopup="dialog"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? "product-card-flight-dialog" : undefined}
          aria-label={`${displayItem.name}: ${dictionary.ui.showSpecifications}`}
          onClick={(event) => {
            event.stopPropagation();
            open();
          }}
        />
      </article>
    </div>
  );
});
