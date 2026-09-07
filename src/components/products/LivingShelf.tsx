import React, { useRef, useEffect } from "react";

export interface LivingShelfProps {
  readonly shelfLabel: string;
  readonly familyName: string;
  readonly products: readonly string[];
  readonly activeProductIndex: number;
  readonly onSelectProduct: (index: number, reveal: boolean) => void;
}

export function LivingShelf({
  shelfLabel,
  familyName,
  products,
  activeProductIndex,
  onSelectProduct,
}: LivingShelfProps): React.JSX.Element {
  const railRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    railRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const handleNext = () => {
    railRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onSelectProduct(Math.min(activeProductIndex + 1, products.length - 1), true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSelectProduct(Math.max(activeProductIndex - 1, 0), true);
    }
  };

  useEffect(() => {
    // Reveal active item on family or product change if needed
    const activeItem = railRef.current?.querySelector<HTMLElement>(".rail-product.is-active");
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeProductIndex, familyName]);

  return (
    <div className="living-shelf">
      <div className="shelf-head">
        <span id="shelf-label">{shelfLabel}</span>
        <div>
          <button id="shelf-prev" type="button" aria-label="Previous products" onClick={handlePrev}>
            ←
          </button>
          <button id="shelf-next" type="button" aria-label="Next products" onClick={handleNext}>
            →
          </button>
        </div>
      </div>
      <div
        className="product-rail"
        id="product-rail"
        role="listbox"
        aria-label="Products in selected family"
        tabIndex={0}
        ref={railRef}
        onKeyDown={handleKeyDown}
      >
        {products.map((name, index) => {
          const isActive = index === activeProductIndex;
          const numStr = String(index + 1).padStart(2, "0");
          return (
            <button
              key={name}
              type="button"
              className={`rail-product${isActive ? " is-active" : ""}`}
              role="option"
              aria-selected={isActive}
              onClick={() => onSelectProduct(index, true)}
            >
              <span>{numStr}</span>
              <strong>{name}</strong>
              <small>{familyName}</small>
            </button>
          );
        })}
      </div>
      <div className="shelf-line" aria-hidden="true"></div>
    </div>
  );
}
