import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { getProductSpecData } from "@/data/productSpecs";

export interface ProductAtlasCardProps {
  readonly item: ProductAtlasItem;
  readonly isAddedToQuote: boolean;
  readonly index?: number;
  readonly onOpenDetail: (item: ProductAtlasItem) => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductAtlasCard({
  item,
  isAddedToQuote,
  index = 0,
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

  // Alternate between user's 2 temporary high-res images (Lemons & Grapes)
  const cardImgSrc =
    index % 2 === 0 ? "/assets/lemon_card.png" : "/assets/grapes_card.png";

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
      {/* Top Editorial Bar: Code Caption + Micro Action */}
      <div className="atlas-card-header-bar">
        <span className="atlas-card-code">{codeStr}</span>
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

      {/* Massive Magazine Cover Headline Title */}
      <h3 className="atlas-card-title">{item.name}</h3>

      {/* Asymmetric Editorial Image Frame */}
      <div className="atlas-card-media" data-visual={item.visual}>
        <img
          src={cardImgSrc}
          alt={item.name}
          className="atlas-card-img"
          loading="lazy"
        />
      </div>

      {/* Quiet Editorial Footer */}
      <div className="atlas-card-body">
        <div className="atlas-card-meta">
          <span className="atlas-card-category">
            {item.worldLabel.toUpperCase()} · {item.familyName.toUpperCase()}
          </span>
        </div>

        <p className="atlas-card-variety-summary" title={varietyLineText || undefined}>
          {varietyLineText || "\u00A0"}
        </p>
      </div>
    </article>
  );
}

