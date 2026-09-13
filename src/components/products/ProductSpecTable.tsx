import React from "react";
import type { ExportSpecification, ProductAtlasItem } from "@/types/agrica";

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
): ProductSpecRow[] {
  const rows: ProductSpecRow[] = [];
  const add = (label: string, value: string | undefined) => {
    if (value?.trim()) rows.push({ label, value });
  };

  add("Origin", specifications?.origin ?? item.origin);
  add("Condition", item.worldLabel);
  add("Varieties", varietyNames.length > 0 ? varietyNames.join(" / ") : item.variety);
  add("Harvest Window", specifications?.harvestWindow);
  add("Size / Calibre", specifications?.sizeCalibre);
  add("Brix", specifications?.brix);
  add("Acidity", specifications?.acidity);
  add("Average Weight", specifications?.averageWeight);
  add("Seed Status", specifications?.seedStatus);
  add("Grade Standard", specifications?.grade);
  add("Packaging", specifications?.packaging?.join(" / "));
  add("Shipping Temperature", specifications?.temperature);
  add("Shelf Life", specifications?.shelfLife);

  if (rows.length <= 5) return rows;

  const commercialPriority = [
    "Origin",
    "Harvest Window",
    "Grade Standard",
    "Packaging",
    "Shipping Temperature",
  ];

  return commercialPriority
    .map((label) => rows.find((row) => row.label === label))
    .filter((row): row is ProductSpecRow => Boolean(row));
}

export function ProductSpecTable({
  item,
  specifications,
  varietyNames,
}: ProductSpecTableProps): React.JSX.Element {
  const rows = buildProductSpecRows(item, specifications, varietyNames);

  return (
    <dl className="export-spec-table" aria-label={`${item.name} product specifications`}>
      {rows.map((row) => (
        <div className="export-spec-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
