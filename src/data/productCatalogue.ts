import type { ProductAtlasItem, ProduceFamilyId, QuoteItem, WorldId } from "@/types/agrica";
import type { ProductsDictionary } from "@/i18n/types";
import { PRODUCT_LIBRARY } from "./products";

export interface ProductCatalogueFilter {
  readonly activeWorld: WorldId;
  readonly activeFamilyId: ProduceFamilyId | null;
  readonly searchQuery: string;
}

export function buildProductAtlasItems(dictionary?: ProductsDictionary): ProductAtlasItem[] {
  const items: ProductAtlasItem[] = [];
  const worldIds: readonly WorldId[] = ["fresh", "frozen", "dried"];

  for (const worldId of worldIds) {
    const world = PRODUCT_LIBRARY[worldId];

    for (const family of world.families) {
      for (const product of family.products) {
        items.push({
          ...product,
          name: dictionary?.products[product.id].name ?? product.name,
          searchAliases: dictionary?.products[product.id].aliases,
          worldId,
          worldLabel: dictionary?.worlds[worldId].label ?? world.label,
          familyCode: family.code,
          familyName: dictionary?.families[family.id] ?? family.name,
          visual: product.mediaKey,
          origin: dictionary?.ui.egypt ?? "Egypt",
        });
      }
    }
  }

  return items;
}

export function filterProductAtlasItems(
  items: readonly ProductAtlasItem[],
  filter: ProductCatalogueFilter,
): ProductAtlasItem[] {
  const query = filter.searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    if (query) {
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesAlias = item.searchAliases?.some((alias) => alias.toLocaleLowerCase().includes(query)) ?? false;
      const matchesWorld =
        item.worldLabel.toLowerCase().includes(query) || item.worldId.includes(query);
      const matchesFamily =
        item.familyName.toLowerCase().includes(query) ||
        item.familyCode.toLowerCase().includes(query);
      const matchesVariety = item.variety?.toLowerCase().includes(query) ?? false;

      return matchesName || matchesAlias || matchesWorld || matchesFamily || matchesVariety;
    }

    if (item.worldId !== filter.activeWorld) return false;
    if (
      filter.activeFamilyId !== null &&
      item.familyId !== filter.activeFamilyId
    ) {
      return false;
    }

    return true;
  });
}

export function toggleQuoteItem(
  quoteItems: readonly QuoteItem[],
  item: ProductAtlasItem,
): QuoteItem[] {
  if (quoteItems.some((quoteItem) => quoteItem.id === item.id)) {
    return quoteItems.filter((quoteItem) => quoteItem.id !== item.id);
  }

  return [
    ...quoteItems,
    {
      id: item.id,
      name: item.name,
      world: item.worldLabel,
      family: item.familyName,
    },
  ];
}
