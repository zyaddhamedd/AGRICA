import { localePath } from "@/i18n/navigation";
import { seoProductById } from "@/seo/products";
import styles from "./ProductCardBack.module.css";
import React from "react";
import type { ProductAtlasItem } from "@/types/agrica";
import type { PublicProductCardField } from "@/types/product-card-content";
import { ProductSpecTable } from "./ProductSpecTable";
import { ExportActionRail } from "./ExportActionRail";
import { useCommonDictionary, useProductsDictionary, useLocale } from "@/i18n/locale-context";

export interface ProductCardBackProps {
  readonly item: ProductAtlasItem;
  readonly code: string;
  readonly fields: readonly PublicProductCardField[];
  readonly isFlipped: boolean;
  readonly isAddedToQuote: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
  readonly onClose?: () => void;
  readonly onExplore?: React.MouseEventHandler<HTMLAnchorElement>;
  readonly expanded?: boolean;
  readonly headingId?: string;
}

export function ProductCardBack({
  item,
  code,
  fields,
  isFlipped,
  isAddedToQuote,
  onToggleQuote,
  onClose,
  onExplore,
  expanded = false,
  headingId,
}: ProductCardBackProps): React.JSX.Element {
  const locale = useLocale();
  const dictionary = useProductsDictionary();
  const common = useCommonDictionary();
  const detailPage = expanded ? seoProductById(item.id) : undefined;
  return (
    <section
      className={`export-card-face export-card-back${expanded ? " is-expanded" : ""}`}
      aria-hidden={!isFlipped}
    >
      <header className="export-card-back-head">
        <span className="export-card-code">{code}</span>
        {onClose ? (
          <button
            type="button"
            className="export-card-flight-close"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label={common.actions.close}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <span className="export-card-back-cue" aria-hidden="true">↺</span>
        )}
      </header>
      <div className="export-card-back-identity">
        <h3 id={headingId} className="export-card-back-title">{item.name}</h3>
        <p className="export-card-spec-kicker">{dictionary.ui.productSpecifications}</p>
      </div>
      <ProductSpecTable item={item} fields={fields} expanded={expanded} />
      {detailPage ? (
        <div className={styles.actions}>
          <a
            className={styles.explore}
            data-explore-product
            href={localePath(locale, `/products/${detailPage.slug}`)}
            onClick={(event) => { event.stopPropagation(); onExplore?.(event); }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {dictionary.ui.exploreProduct} <span aria-hidden="true">↗</span>
          </a>
          <ExportActionRail
            item={item}
            isAddedToQuote={isAddedToQuote}
            isCardFlipped={isFlipped}
            onToggleQuote={onToggleQuote}
          />
        </div>
      ) : (
        <ExportActionRail
          item={item}
          isAddedToQuote={isAddedToQuote}
          isCardFlipped={isFlipped}
          onToggleQuote={onToggleQuote}
        />
      )}
    </section>
  );
}
