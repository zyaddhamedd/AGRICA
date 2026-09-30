"use client";

import React, { useState } from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import type { SeasonEditorialDictionary } from "@/content/season-editorial-dictionaries";
import { ProductCardFront } from "@/components/products/ProductCardFront";
import { SeasonalCardFlightOverlay } from "./SeasonalCardFlightOverlay";
import styles from "./SeasonalCardCollection.module.css";

export interface SeasonalCardCollectionProps {
  readonly monthName: string;
  readonly items: readonly ProductAtlasItem[];
  readonly copy: SeasonEditorialDictionary;
  readonly isAddedToQuote: (item: ProductAtlasItem) => boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

interface ActiveFlightState {
  readonly item: ProductAtlasItem;
  readonly originElement: HTMLElement;
  readonly originRect: DOMRect;
}

export function SeasonalCardCollection({
  monthName,
  items,
  copy,
  isAddedToQuote,
  onToggleQuote,
}: SeasonalCardCollectionProps): React.JSX.Element {
  const [flightState, setFlightState] = useState<ActiveFlightState | null>(null);

  const handleCardClick = (item: ProductAtlasItem, slotElement: HTMLElement) => {
    const visualCard = slotElement.querySelector<HTMLElement>(".export-card") ?? slotElement;
    const originRect = visualCard.getBoundingClientRect();
    setFlightState({ item, originElement: slotElement, originRect });
  };

  return (
    <aside
      className={styles.monthPanel}
      aria-labelledby="season-selected-month"
      data-supporting-count="0"
      data-product-count={items.length}
    >
      <header className={styles.panelHeader}>
        <div className={styles.headerTitles}>
          <p id="season-selected-month" className={styles.panelMonth}>
            {monthName}
          </p>
          <h3 className={styles.panelHeading}>{copy.supportingCrops}</h3>
        </div>

        <span className={styles.productCountBadge}>
          {items.length} · {copy.status["in-season"]}
        </span>
      </header>

      <div
        className={styles.cardTrack}
        data-count={items.length}
        data-scrollable={items.length > 3 ? "true" : undefined}
      >
        {items.map((item) => {
          const worldPrefix = item.worldId === "fresh" ? "FR" : item.worldId === "frozen" ? "FZ" : "DR";
          const code = `${worldPrefix} / ${item.familyCode}`;
          const isItemAdded = isAddedToQuote(item);

          return (
            <button
              key={item.id}
              type="button"
              className={`${styles.cardSlot} export-card-scene is-compact`}
              data-world={item.worldId}
              data-product-id={item.id}
              onClick={(event) => handleCardClick(item, event.currentTarget)}
              aria-label={`${item.name} (${code}): View specifications`}
            >
              <div className="export-card is-compact">
                <ProductCardFront
                  item={item}
                  code={code}
                  varietyLine=""
                  isAddedToQuote={isItemAdded}
                  isFlipped={false}
                  onToggleQuote={onToggleQuote}
                  isCompact={true}
                />
              </div>
            </button>
          );
        })}
      </div>

      {items.length > 3 && (
        <p className={styles.mobileSwipeCue} aria-hidden="true">
          <span>←</span> Swipe to explore all {items.length} crops <span>→</span>
        </p>
      )}

      {flightState && (
        <SeasonalCardFlightOverlay
          key={flightState.item.id}
          item={flightState.item}
          originElement={flightState.originElement}
          originRect={flightState.originRect}
          isAddedToQuote={isAddedToQuote(flightState.item)}
          onToggleQuote={onToggleQuote}
          onClose={() => setFlightState(null)}
        />
      )}
    </aside>
  );
}
