import React from "react";
import { productCardFieldLabel } from "@/content/produce/product-card-labels";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";
import type { ProductAtlasItem } from "@/types/agrica";
import type { PublicProductCardField } from "@/types/product-card-content";

export interface ProductSpecRow {
  readonly label: string;
  readonly value: string;
}

interface ProductSpecTableProps {
  readonly item: ProductAtlasItem;
  readonly fields: readonly PublicProductCardField[];
}

export function buildProductSpecRows(
  fields: readonly PublicProductCardField[],
  labelFor: (field: PublicProductCardField) => string,
): ProductSpecRow[] {
  return [...fields]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((field) => ({ label: labelFor(field), value: field.value }));
}

export function ProductSpecTable({ item, fields }: ProductSpecTableProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const locale = useLocale();
  const rows = buildProductSpecRows(fields, (field) => productCardFieldLabel(locale, field.labelKey));

  return (
    <dl
      className="export-spec-table"
      data-field-count={rows.length}
      aria-label={`${item.name} ${dictionary.ui.specsFor}`}
    >
      {rows.map((row) => (
        <div className="export-spec-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd dir={locale === "ar" ? "ltr" : undefined}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
