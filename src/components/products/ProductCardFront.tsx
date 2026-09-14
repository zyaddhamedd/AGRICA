import React from "react";
import Image from "next/image";
import type { ProductAtlasItem } from "@/types/agrica";
import { productImageFor } from "@/data/productImages";
import { QuoteMicroAction } from "./QuoteMicroAction";

interface ProductCardFrontProps {
  readonly item: ProductAtlasItem;
  readonly code: string;
  readonly varietyLine: string;
  readonly isAddedToQuote: boolean;
  readonly isFlipped: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductCardFront({
  item,
  code,
  varietyLine,
  isAddedToQuote,
  isFlipped,
  onToggleQuote,
}: ProductCardFrontProps): React.JSX.Element {
  const titleSize =
    item.name.length > 15
      ? "very-long"
      : item.name === "Pomegranates" || item.name.length > 12
        ? "long"
        : item.name.length > 8
          ? "medium"
          : "short";
  const dedicatedImage = productImageFor(item.id) ??
    (item.name === "Grapes" ? "/assets/grapes_card.png" : undefined);

  return (
    <section className="export-card-face export-card-front" aria-hidden={isFlipped}>
      <header className="export-card-topline">
        <span className="export-card-code">{code}</span>
        <QuoteMicroAction
          item={item}
          isAddedToQuote={isAddedToQuote}
          isCardFlipped={isFlipped}
          onToggleQuote={onToggleQuote}
        />
      </header>

      <div className="export-card-identity">
        <h3 className="export-card-title" data-title-size={titleSize}>{item.name}</h3>
        <p className="export-card-category">
          {item.worldLabel} <span aria-hidden="true">·</span> {item.familyName}
        </p>
        {varietyLine && <p className="export-card-varieties">{varietyLine}</p>}
      </div>

      <div
        className={`export-card-visual${dedicatedImage ? " has-dedicated-image" : ""}`}
        data-visual={item.visual}
        aria-hidden="true"
      >
        {dedicatedImage && (
          <Image
            src={dedicatedImage}
            alt=""
            fill
            sizes="(max-width: 640px) calc(100vw - 2.5rem), (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

    </section>
  );
}
