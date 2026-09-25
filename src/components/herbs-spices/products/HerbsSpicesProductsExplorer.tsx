"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HerbsSpicesCatalogueItem, HerbsSpicesFamily } from "@/types/herbs-spices";
import { DIVISION_REGISTRY } from "@/divisions/registry";
import { useCommonDictionary, useHerbsSpicesDictionary, useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/navigation";
import { EnquiryDrawer } from "./EnquiryDrawer";
import { FamilyRail, type FamilySelection } from "./FamilyRail";
import { IngredientSearch } from "./IngredientSearch";
import { MaterialGrid } from "./MaterialGrid";
import { MaterialReveal } from "./MaterialReveal";
import styles from "./HerbsSpicesProductsExplorer.module.css";

export interface HerbsSpicesProductsExplorerProps {
  readonly catalogue: readonly HerbsSpicesCatalogueItem[];
  readonly families: readonly HerbsSpicesFamily[];
  readonly initialFamily: FamilySelection;
}

function itemMatchesView(
  item: HerbsSpicesCatalogueItem,
  family: FamilySelection,
  query: string
): boolean {
  if (family !== "all" && item.familyId !== family) return false;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  return [item.name, item.familyName, ...item.forms, ...(item.searchAliases ?? [])]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalizedQuery);
}

export function HerbsSpicesProductsExplorer({
  catalogue,
  families,
  initialFamily,
}: HerbsSpicesProductsExplorerProps): React.JSX.Element {
  const router = useRouter();
  const locale = useLocale();
  const common = useCommonDictionary();
  const dictionary = useHerbsSpicesDictionary();

  const localizedFamilies = useMemo(
    () => families.map((family) => ({ ...family, label: dictionary.families[family.id] })),
    [dictionary, families]
  );

  const localizedCatalogue = useMemo(
    () =>
      catalogue.map((item) => ({
        ...item,
        name: dictionary.products[item.id].name,
        searchAliases: dictionary.products[item.id].aliases,
        familyName: dictionary.families[item.familyId],
        forms: item.forms.map((form) => dictionary.forms[form] ?? form),
      })),
    [catalogue, dictionary]
  );

  const [activeFamily, setActiveFamily] = useState<FamilySelection>(initialFamily);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<HerbsSpicesCatalogueItem["id"] | null>(null);
  const [selectedIds, setSelectedIds] = useState<readonly HerbsSpicesCatalogueItem["id"][]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dockRef = useRef<HTMLButtonElement>(null);
  const activeTriggerRef = useRef<string | null>(null);

  useEffect(() => {
    setActiveFamily(initialFamily);
  }, [initialFamily]);

  const visibleItems = useMemo(() => {
    return localizedCatalogue.filter((item) => itemMatchesView(item, activeFamily, query));
  }, [activeFamily, localizedCatalogue, query]);

  const selectedItems = useMemo(
    () => localizedCatalogue.filter((item) => selectedIds.includes(item.id)),
    [localizedCatalogue, selectedIds]
  );

  const expandedItem = useMemo(
    () => localizedCatalogue.find((item) => item.id === expandedId) ?? null,
    [localizedCatalogue, expandedId]
  );

  const toggleSelection = (id: HerbsSpicesCatalogueItem["id"]) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]
    );

  const openInspection = (id: HerbsSpicesCatalogueItem["id"]) => {
    const item = localizedCatalogue.find((candidate) => candidate.id === id);
    if (item) {
      activeTriggerRef.current = item.slug;
    }
    setExpandedId(id);
  };

  const closeInspection = useCallback((restoreFocus = false) => {
    const triggerSlug = activeTriggerRef.current;
    setExpandedId(null);
    if (restoreFocus && triggerSlug) {
      window.requestAnimationFrame(() => {
        document.getElementById(`material-plate-${triggerSlug}`)?.focus();
      });
    }
  }, []);

  const changeFamily = (family: FamilySelection) => {
    setActiveFamily(family);
    const productsPath = DIVISION_REGISTRY["herbs-spices"].routes.products;
    const semanticPath =
      family === "all" ? productsPath : `${productsPath}?family=${encodeURIComponent(family)}`;
    router.push(localePath(locale, semanticPath), { scroll: false });
  };

  const changeQuery = (value: string) => {
    setQuery(value);
  };

  return (
    <section className={styles.explorer} aria-labelledby="catalogue-controls-title">
      <h2 className={styles.visuallyHidden} id="catalogue-controls-title">
        {common.catalogue.browseIngredients}
      </h2>

      {/* Sourcing Index Controls */}
      <div className={styles.controls}>
        <FamilyRail
          families={localizedFamilies}
          activeFamily={activeFamily}
          onChange={changeFamily}
        />
        <IngredientSearch value={query} onChange={changeQuery} />
        <p className={styles.count} aria-live="polite">
          {visibleItems.length}{" "}
          {visibleItems.length === 1 ? common.catalogue.material : common.catalogue.materials}
        </p>
      </div>

      {/* Material Plates Library Grid */}
      {visibleItems.length > 0 ? (
        <MaterialGrid
          items={visibleItems}
          expandedItem={expandedItem}
          selectedIds={selectedIds}
          onToggleDetails={openInspection}
          onToggleSelection={toggleSelection}
        />
      ) : (
        <div className={styles.empty}>
          <p>{common.catalogue.noMaterials}</p>
          <button
            type="button"
            onClick={() => {
              changeFamily("all");
              setQuery("");
            }}
          >
            {common.actions.resetCatalogue}
          </button>
        </div>
      )}

      {/* Material Dossier - Phase 4 Deep Product Detail & Sourcing Record */}
      {expandedItem && (
        <MaterialReveal
          item={expandedItem}
          selected={selectedIds.includes(expandedItem.id)}
          onToggleSelection={() => toggleSelection(expandedItem.id)}
          onClose={closeInspection}
          onOpenEnquiryDrawer={() => setDrawerOpen(true)}
        />
      )}

      {/* Selected Materials Dock & Enquiry Drawer */}
      {selectedItems.length > 0 && (
        <button
          ref={dockRef}
          className={styles.dock}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="herbs-spices-enquiry"
        >
          <span>{common.enquiry.enquiryList}</span>
          <strong>{selectedItems.length}</strong>
        </button>
      )}

      {drawerOpen && (
        <EnquiryDrawer
          items={selectedItems}
          onClose={() => setDrawerOpen(false)}
          onRemove={toggleSelection}
          triggerRef={dockRef}
        />
      )}
    </section>
  );
}
