import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { getProductSpecData } from "@/data/productSpecs";

export interface ProductAtlasCardProps {
  readonly item: ProductAtlasItem;
  readonly isAddedToQuote: boolean;
  readonly onOpenDetail: (item: ProductAtlasItem) => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductAtlasCard({
  item,
  isAddedToQuote,
  onOpenDetail,
  onToggleQuote,
}: ProductAtlasCardProps): React.JSX.Element {
  const codeStr = `${item.worldId.slice(0, 2).toUpperCase()} / ${item.familyCode}`;
  const specEntry = getProductSpecData(item);

  // Compute variety text summary line (e.g., "Valencia · Navel")
  const varietyLineText =
    specEntry.varieties && specEntry.varieties.length > 0
      ? specEntry.varieties.map((v) => v.name).join(" · ")
      : item.variety;

  const handleCardClick = () => {
    onOpenDetail(item);
  };

  const handleQuoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleQuote(item);
  };

  return (
    <article
      className={`atlas-card${isAddedToQuote ? " is-added" : ""}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      aria-label={`View details for ${item.name}`}
    >
      {/* Large Editorial Image Frame */}
      <div className="atlas-card-media" data-visual={item.visual}>
        <span className="atlas-card-code">{codeStr}</span>
        <div className="atlas-card-art" />
      </div>

      {/* Editorial Card Anatomy */}
      <div className="atlas-card-body">
        <div className="atlas-card-meta">
          <span className="atlas-card-category">
            {item.worldLabel.toUpperCase()} · {item.familyName.toUpperCase()}
          </span>
        </div>

        <div className="atlas-card-title-row">
          <h3 className="atlas-card-title">{item.name}</h3>
          <button
            type="button"
            className={`atlas-card-micro-action${isAddedToQuote ? " is-selected" : ""}`}
            onClick={handleQuoteClick}
            aria-label={
              isAddedToQuote
                ? `Remove ${item.name} from enquiry`
                : `Add ${item.name} to enquiry`
            }
          >
            <span>{isAddedToQuote ? "✓" : "+"}</span>
          </button>
        </div>

        <p className="atlas-card-variety-summary" title={varietyLineText || undefined}>
          {varietyLineText || "\u00A0"}
        </p>
      </div>
    </article>
  );
}

