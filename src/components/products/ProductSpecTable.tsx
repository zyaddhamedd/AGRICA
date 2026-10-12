import React from "react";
import { productCardFieldLabel } from "@/content/produce/product-card-labels";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";
import type { ProductAtlasItem } from "@/types/agrica";
import type { PublicProductCardField } from "@/types/product-card-content";

export interface ProductSpecRow {
  readonly key: PublicProductCardField["labelKey"];
  readonly label: string;
  readonly value: string;
}

interface ProductSpecTableProps {
  readonly item: ProductAtlasItem;
  readonly fields: readonly PublicProductCardField[];
  readonly expanded?: boolean;
}

export function buildProductSpecRows(
  fields: readonly PublicProductCardField[],
  labelFor: (field: PublicProductCardField) => string,
): ProductSpecRow[] {
  return [...fields]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((field) => ({ key: field.labelKey, label: labelFor(field), value: field.value }));
}

const profileFields = new Set<PublicProductCardField["labelKey"]>([
  "product", "origin", "hsCode", "mainVarieties", "varieties", "colors", "season",
  "cropWindow", "typicalEgyptianSeason", "typicalEgyptianExportWindow",
  "typicalEgyptianHarvest", "typicalEgyptianFreshSeason", "variety", "varietyColour",
]);

const handlingFields = new Set<PublicProductCardField["labelKey"]>([
  "storage", "frozenStorage", "relativeHumidity", "handling", "shelfLife", "availability",
  "shipment", "qualityStandard", "applications", "buyerNote",
]);

export function ProductSpecTable({ item, fields, expanded = false }: ProductSpecTableProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const locale = useLocale();
  const rows = buildProductSpecRows(fields, (field) => productCardFieldLabel(locale, field.labelKey));

  if (expanded) {
    const groups = [
      {
        key: "profile",
        index: "01",
        title: dictionary.ui.productProfile,
        rows: rows.filter((row) => profileFields.has(row.key)),
      },
      {
        key: "commercial",
        index: "02",
        title: dictionary.ui.commercialSpecification,
        rows: rows.filter((row) => !profileFields.has(row.key) && !handlingFields.has(row.key)),
      },
      {
        key: "handling",
        index: "03",
        title: dictionary.ui.handlingSupply,
        rows: rows.filter((row) => handlingFields.has(row.key)),
      },
    ].filter((group) => group.rows.length > 0);

    return (
      <div
        className="export-spec-table is-expanded"
        data-field-count={rows.length}
        aria-label={`${item.name} ${dictionary.ui.specsFor}`}
      >
        {groups.map((group) => (
          <section className="export-spec-group" data-group={group.key} key={group.key}>
            <header className="export-spec-group-head">
              <span aria-hidden="true">{group.index}</span>
              <h4>{group.title}</h4>
            </header>
            <dl>
              {group.rows.map((row) => (
                <div className="export-spec-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd dir={locale === "ar" ? "ltr" : undefined}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    );
  }

  return (
    <dl
      className={`export-spec-table${expanded ? " is-expanded" : ""}`}
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
