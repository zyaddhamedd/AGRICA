import React, { useEffect } from "react";
import { productCardFieldLabel } from "@/content/produce/product-card-labels";
import { getPublicProductCardContent } from "@/data/productCardContent";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";
import type { ProductAtlasItem } from "@/types/agrica";

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
  const locale = useLocale();
  const dictionary = useProductsDictionary();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (item) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  const content = getPublicProductCardContent(item.id);
  const displayItem = locale === "en" && content.publicName
    ? { ...item, name: content.publicName }
    : item;
  const code = `${item.worldId.slice(0, 2).toUpperCase()} / ${item.familyCode}`;
  const fields = [...content.fields].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet-drawer">
        <div className="sheet-grab-bar" aria-hidden="true" />
        <button type="button" className="sheet-close-btn" onClick={onClose} aria-label="Close product details">
          ×
        </button>

        <div className="sheet-content">
          <div className="sheet-media" data-visual={item.visual}>
            <span className="sheet-tag">{code}</span>
            <div className="sheet-media-art" />
          </div>

          <div className="sheet-details">
            <div className="sheet-meta">
              <span className="sheet-world">{item.worldLabel.toUpperCase()}</span>
              <span className="sheet-dot">·</span>
              <span className="sheet-family">{item.familyName.toUpperCase()}</span>
            </div>

            <h2 id="sheet-title" className="sheet-title">{displayItem.name}</h2>
            <p className="sheet-subtitle">{dictionary.ui.productSpecifications}</p>

            <dl className="unified-spec-table">
              {fields.map((field) => (
                <div key={field.labelKey} className="unified-spec-row">
                  <dt className="unified-spec-label">{productCardFieldLabel(locale, field.labelKey)}</dt>
                  <dd className="unified-spec-value" dir={locale === "ar" ? "ltr" : undefined}>{field.value}</dd>
                </div>
              ))}
            </dl>

            <div className="sheet-actions">
              <button
                type="button"
                className={`sheet-cta${isAddedToQuote ? " is-added" : ""}`}
                onClick={() => onToggleQuote(displayItem)}
              >
                {isAddedToQuote ? (
                  <><span>✓ IN YOUR EXPORT ENQUIRY</span><small>Click to remove</small></>
                ) : (
                  <><span>+ ADD TO EXPORT ENQUIRY</span><small>Include in quote build</small></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
