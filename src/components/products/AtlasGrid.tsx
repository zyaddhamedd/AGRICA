import React, { useEffect, useState } from "react";
import type { ProductAtlasItem, QuoteItem } from "@/types/agrica";
import { ProductFlipCard } from "./ProductFlipCard";

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
  const [flippedKey, setFlippedKey] = useState<string | null>(null);

  useEffect(() => {
    if (flippedKey && !items.some((item) => item.key === flippedKey)) {
      setFlippedKey(null);
    }
  }, [flippedKey, items]);

  if (items.length === 0) {
    return (
      <div className="atlas-empty-state">
        <p className="empty-eyebrow">No matching produce found</p>
        <h3 className="empty-title">Refine your search or switch category</h3>
        <p className="empty-copy">
          Try searching for &ldquo;Orange&rdquo;, &ldquo;Garlic&rdquo;, &ldquo;Pomegranate&rdquo;, or switch condition tabs above.
        </p>
      </div>
    );
  }

  return (
    <div className="atlas-grid">
      {items.map((item) => {
        const isAddedToQuote = quoteItems.some((q) => q.key === item.key);

        return (
          <ProductFlipCard
            key={item.key}
            item={item}
            isFlipped={flippedKey === item.key}
            isAddedToQuote={isAddedToQuote}
            onFlip={(selected) => {
              setFlippedKey((current) => current === selected.key ? null : selected.key);
            }}
            onToggleQuote={onToggleQuote}
          />
        );
      })}
    </div>
  );
}
