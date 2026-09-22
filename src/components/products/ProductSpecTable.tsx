import React from "react";
import type { ExportSpecification, ProductAtlasItem } from "@/types/agrica";
import { useLocale, useProductsDictionary } from "@/i18n/locale-context";
import { localizeProduceTechnicalValue } from "@/content/produce/technical-terms";
import type { ProductsDictionary } from "@/i18n/types";

export interface ProductSpecRow {
  readonly label: string;
  readonly value: string;
}

interface ProductSpecTableProps {
  readonly item: ProductAtlasItem;
  readonly specifications?: ExportSpecification;
  readonly varietyNames: readonly string[];
}

export function buildProductSpecRows(
  item: ProductAtlasItem,
  specifications: ExportSpecification | undefined,
  varietyNames: readonly string[],
  labels?: ProductsDictionary["specifications"],
): ProductSpecRow[] {
  const rows: ProductSpecRow[] = [];
  const add = (label: string, value: string | undefined) => {
    if (value?.trim()) rows.push({ label, value });
  };

  const text = labels ?? { origin:"Origin", condition:"Condition", varieties:"Varieties", harvestWindow:"Harvest Window", sizeCalibre:"Size / Calibre", brix:"Brix", acidity:"Acidity", averageWeight:"Average Weight", seedStatus:"Seed Status", grade:"Grade Standard", packaging:"Packaging", temperature:"Shipping Temperature", shelfLife:"Shelf Life" };
  add(text.origin, specifications?.origin ?? item.origin);
  add(text.condition, item.worldLabel);
  add(text.varieties, varietyNames.length > 0 ? varietyNames.join(" / ") : item.variety);
  add(text.harvestWindow, specifications?.harvestWindow);
  add(text.sizeCalibre, specifications?.sizeCalibre);
  add(text.brix, specifications?.brix);
  add(text.acidity, specifications?.acidity);
  add(text.averageWeight, specifications?.averageWeight);
  add(text.seedStatus, specifications?.seedStatus);
  add(text.grade, specifications?.grade);
  add(text.packaging, specifications?.packaging?.join(" / "));
  add(text.temperature, specifications?.temperature);
  add(text.shelfLife, specifications?.shelfLife);

  if (rows.length <= 5) return rows;

  const commercialPriority = [text.origin, text.harvestWindow, text.grade, text.packaging, text.temperature];

  return commercialPriority
    .map((label) => rows.find((row) => row.label === label))
    .filter((row): row is ProductSpecRow => Boolean(row));
}

export function ProductSpecTable({
  item,
  specifications,
  varietyNames,
}: ProductSpecTableProps): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const locale = useLocale();
  const rows = buildProductSpecRows(item, specifications, varietyNames, dictionary.specifications);

  return (
    <dl className="export-spec-table" aria-label={`${item.name} ${dictionary.ui.specsFor}`}>
      {rows.map((row) => (
        <div className="export-spec-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{localizeProduceTechnicalValue(locale, row.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
