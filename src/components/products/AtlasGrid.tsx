import React, { useEffect, useState } from "react";
import type { ProductAtlasItem, QuoteItem } from "@/types/agrica";
import { ProductFlipCard } from "./ProductFlipCard";
import { useProductsDictionary } from "@/i18n/locale-context";

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
  const [flippedKey, setFlippedKey] = useState<string | null>(null);

  useEffect(() => {
    if (flippedKey && !items.some((item) => item.id === flippedKey)) {
      setFlippedKey(null);
    }
  }, [flippedKey, items]);

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
            isFlipped={flippedKey === item.id}
            isAddedToQuote={isAddedToQuote}
            onFlip={(selected) => {
              setFlippedKey((current) => current === selected.id ? null : selected.id);
            }}
            onToggleQuote={onToggleQuote}
          />
        );
      })}
    </div>
  );
}
