import React from "react";
import type { ProductAtlasItem, QuoteItem } from "@/types/agrica";
import { ProductAtlasCard } from "./ProductAtlasCard";

export interface AtlasGridProps {
  readonly items: readonly ProductAtlasItem[];
  readonly quoteItems: readonly QuoteItem[];
  readonly onOpenDetail: (item: ProductAtlasItem) => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function AtlasGrid({
  items,
  quoteItems,
  onOpenDetail,
  onToggleQuote,
}: AtlasGridProps): React.JSX.Element {
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
      {items.map((item, idx) => {
        const isAddedToQuote = quoteItems.some((q) => q.key === item.key);

        return (
          <ProductAtlasCard
            key={item.key}
            item={item}
            index={idx}
            isAddedToQuote={isAddedToQuote}
            onOpenDetail={onOpenDetail}
            onToggleQuote={onToggleQuote}
          />
        );
      })}
    </div>
  );
}
