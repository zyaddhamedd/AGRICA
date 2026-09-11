import React, { useState, useEffect } from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import { getProductSpecData } from "@/data/productSpecs";

export interface ProductDetailSheetProps {
  readonly item: ProductAtlasItem | null;
  readonly isAddedToQuote: boolean;
  readonly onClose: () => void;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
}

export function ProductDetailSheet({
  item,
  isAddedToQuote,
  onClose,
  onToggleQuote,
}: ProductDetailSheetProps): React.JSX.Element | null {
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (item) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Reset selected variety when opening new item
      setSelectedVarietyId(null);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const codeStr = `${item.worldId.slice(0, 2).toUpperCase()} / ${item.familyCode}`;
  const specEntry = getProductSpecData(item);
  const varieties = specEntry.varieties;
  const activeVariety =
    varieties && varieties.length > 0
      ? varieties.find((v) => v.id === selectedVarietyId) ?? varieties[0]
      : null;

  const effectiveSpecs = activeVariety?.specs ?? specEntry.defaultSpecs;

  // Build single unified specification list of approved real data fields only
  const specRows: Array<{ label: string; value: string }> = [];

  if (effectiveSpecs?.origin) {
    specRows.push({ label: "Origin", value: effectiveSpecs.origin });
  }
  specRows.push({
    label: "Condition",
    value: `${item.worldLabel.charAt(0).toUpperCase() + item.worldLabel.slice(1)} produce`,
  });

  if (effectiveSpecs?.temperature) {
    specRows.push({ label: "Shipping Temperature", value: effectiveSpecs.temperature });
  }
  if (effectiveSpecs?.grade) {
    specRows.push({ label: "Grade Standard", value: effectiveSpecs.grade });
  }
  if (effectiveSpecs?.packaging && effectiveSpecs.packaging.length > 0) {
    specRows.push({ label: "Packaging", value: effectiveSpecs.packaging.join(", ") });
  }
  if (effectiveSpecs?.harvestWindow) {
    specRows.push({ label: "Harvest Window", value: effectiveSpecs.harvestWindow });
  }
  if (effectiveSpecs?.sizeCalibre) {
    specRows.push({ label: "Size / Calibre", value: effectiveSpecs.sizeCalibre });
  }
  if (effectiveSpecs?.brix) {
    specRows.push({ label: "Brix", value: effectiveSpecs.brix });
  }
  if (effectiveSpecs?.acidity) {
    specRows.push({ label: "Acidity", value: effectiveSpecs.acidity });
  }
  if (effectiveSpecs?.averageWeight) {
    specRows.push({ label: "Average Weight", value: effectiveSpecs.averageWeight });
  }
  if (effectiveSpecs?.seedStatus) {
    specRows.push({ label: "Seed Status", value: effectiveSpecs.seedStatus });
  }
  if (effectiveSpecs?.shelfLife) {
    specRows.push({ label: "Shelf Life", value: effectiveSpecs.shelfLife });
  }

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet-drawer">
        <div className="sheet-grab-bar" aria-hidden="true" />

        <button
          type="button"
          className="sheet-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          ✕
        </button>

        <div className="sheet-content">
          {/* Media Header */}
          <div className="sheet-media" data-visual={item.visual}>
            <span className="sheet-tag">{codeStr}</span>
            <div className="sheet-media-art" />
          </div>

          <div className="sheet-details">
            {/* Identity Header */}
            <div className="sheet-meta">
              <span className="sheet-world">{item.worldLabel.toUpperCase()}</span>
              <span className="sheet-dot">·</span>
              <span className="sheet-family">{item.familyName.toUpperCase()}</span>
            </div>

            <h2 id="sheet-title" className="sheet-title">
              {item.name}
            </h2>

            <p className="sheet-subtitle">Egyptian Agricultural Export Selection</p>

            {/* Variety Selector */}
            {varieties && varieties.length > 0 ? (
              <div className="sheet-varieties-wrap" role="tablist" aria-label="Product varieties">
                {varieties.map((v) => {
                  const isVarActive = (activeVariety?.id ?? varieties[0].id) === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`variety-chip${isVarActive ? " is-active" : ""}`}
                      onClick={() => setSelectedVarietyId(v.id)}
                      role="tab"
                      aria-selected={isVarActive}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="sheet-varieties-spacer" aria-hidden="true" />
            )}

            {/* Unified Specification Table */}
            {specRows.length > 0 && (
              <dl className="unified-spec-table">
                {specRows.map((row) => (
                  <div key={row.label} className="unified-spec-row">
                    <dt className="unified-spec-label">{row.label}</dt>
                    <dd className="unified-spec-value">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Primary Action */}
            <div className="sheet-actions">
              <button
                type="button"
                className={`sheet-cta${isAddedToQuote ? " is-added" : ""}`}
                onClick={() => onToggleQuote(item)}
              >
                {isAddedToQuote ? (
                  <>
                    <span>✓ IN YOUR EXPORT ENQUIRY</span>
                    <small>Click to remove</small>
                  </>
                ) : (
                  <>
                    <span>+ ADD TO EXPORT ENQUIRY</span>
                    <small>Include in quote build</small>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

