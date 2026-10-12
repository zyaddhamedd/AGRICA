import React, { useCallback, useEffect, useState } from "react";
import type { ProductAtlasItem, QuoteItem } from "@/types/agrica";
import { ProductFlipCard } from "./ProductFlipCard";
import { ProductCardFlightOverlay } from "./ProductCardFlightOverlay";
import { useProductsDictionary } from "@/i18n/locale-context";

interface ActiveProductFlight {
  readonly item: ProductAtlasItem;
  readonly originElement: HTMLElement;
  readonly triggerElement: HTMLButtonElement;
  readonly originRect: DOMRect;
}

export interface AtlasGridProps {
  readonly items: readonly ProductAtlasItem[];
  readonly quoteItems: readonly QuoteItem[];
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function AtlasGrid({
  items,
  quoteItems,
  onToggleQuote,
}: AtlasGridProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const [activeFlight, setActiveFlight] = useState<ActiveProductFlight | null>(null);

  useEffect(() => {
    if (activeFlight && !items.some((item) => item.id === activeFlight.item.id)) {
      setActiveFlight(null);
    }
  }, [activeFlight, items]);

  const closeFlight = useCallback(() => setActiveFlight(null), []);

  const handleOpen = useCallback(
    (selected: ProductAtlasItem, originElement: HTMLElement, triggerElement: HTMLButtonElement) => {
      setActiveFlight({
        item: selected,
        originElement,
        triggerElement,
        originRect: originElement.getBoundingClientRect(),
      });
    },
    [],
  );

  if (items.length === 0) {
    return (
      <div className="atlas-empty-state">
        <p className="empty-eyebrow">{dictionary.ui.noMatches}</p>
        <h3 className="empty-title">{dictionary.ui.refineSearch}</h3>
        <p className="empty-copy">
          {dictionary.ui.searchHint}
        </p>
      </div>
    );
  }

  return (
    <div className="atlas-grid">
      {items.map((item) => {
        const isAddedToQuote = quoteItems.some((q) => q.id === item.id);

        return (
          <ProductFlipCard
            key={item.id}
            item={item}
            isExpanded={activeFlight?.item.id === item.id}
            isAddedToQuote={isAddedToQuote}
            onOpen={handleOpen}
            onToggleQuote={onToggleQuote}
          />
        );
      })}
      {activeFlight && (
        <ProductCardFlightOverlay
          item={activeFlight.item}
          originElement={activeFlight.originElement}
          triggerElement={activeFlight.triggerElement}
          originRect={activeFlight.originRect}
          isAddedToQuote={quoteItems.some((item) => item.id === activeFlight.item.id)}
          onToggleQuote={onToggleQuote}
          onClose={closeFlight}
        />
      )}
    </div>
  );
}
