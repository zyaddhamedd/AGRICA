"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import type { HerbsSpicesCatalogueItem, HerbsSpicesFamily } from "@/types/herbs-spices";
import { EnquiryDrawer } from "./EnquiryDrawer";
import { FamilyRail, type FamilySelection } from "./FamilyRail";
import { IngredientSearch } from "./IngredientSearch";
import { MaterialGrid } from "./MaterialGrid";
import styles from "./HerbsSpicesProductsExplorer.module.css";

export interface HerbsSpicesProductsExplorerProps {
  readonly catalogue: readonly HerbsSpicesCatalogueItem[];
  readonly families: readonly HerbsSpicesFamily[];
}

function itemMatchesView(item: HerbsSpicesCatalogueItem, family: FamilySelection, query: string): boolean {
  if (family !== "all" && item.familyId !== family) return false;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  return [item.name, item.familyName, ...item.forms].join(" ").toLocaleLowerCase().includes(normalizedQuery);
}

export function HerbsSpicesProductsExplorer({ catalogue, families }: HerbsSpicesProductsExplorerProps): React.JSX.Element {
  const [activeFamily, setActiveFamily] = useState<FamilySelection>("all");
  const [query, setQuery] = useState("");
  const [closingItems, setClosingItems] = useState<readonly HerbsSpicesCatalogueItem[] | null>(null);
  const [expandedId, setExpandedId] = useState<HerbsSpicesCatalogueItem["id"] | null>(null);
  const [revealClosing, setRevealClosing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<readonly HerbsSpicesCatalogueItem["id"][]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dockRef = useRef<HTMLButtonElement>(null);
  const afterCloseRef = useRef<{ readonly action?: () => void; readonly restoreFocus: boolean; readonly triggerId: HerbsSpicesCatalogueItem["id"] | null }>({ restoreFocus: false, triggerId: null });

  const visibleItems = useMemo(() => {
    return catalogue.filter((item) => itemMatchesView(item, activeFamily, query));
  }, [activeFamily, catalogue, query]);

  const selectedItems = useMemo(() => catalogue.filter((item) => selectedIds.includes(item.id)), [catalogue, selectedIds]);
  const expandedItem = useMemo(() => catalogue.find((item) => item.id === expandedId) ?? null, [catalogue, expandedId]);
  const displayedItems = closingItems ?? visibleItems;
  const toggleSelection = (id: HerbsSpicesCatalogueItem["id"]) => setSelectedIds((current) => current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]);

  const beginClose = useCallback((action?: () => void, restoreFocus = false) => {
    if (!expandedId) { action?.(); return; }
    afterCloseRef.current = { action, restoreFocus, triggerId: expandedId };
    setRevealClosing(true);
  }, [expandedId]);

  const handleRevealClosed = useCallback(() => {
    const task = afterCloseRef.current;
    afterCloseRef.current = { restoreFocus: false, triggerId: null };
    setExpandedId(null);
    setRevealClosing(false);
    window.requestAnimationFrame(() => {
      task.action?.();
      if (task.restoreFocus && task.triggerId) document.getElementById(`view-material-${task.triggerId.replace("herbs-spices:", "")}`)?.focus();
    });
  }, []);

  const toggleDetails = (id: HerbsSpicesCatalogueItem["id"]) => {
    if (!expandedId) { setExpandedId(id); return; }
    if (expandedId === id) { beginClose(); return; }
    beginClose(() => setExpandedId(id));
  };

  const changeFamily = (family: FamilySelection) => {
    if (expandedItem && !itemMatchesView(expandedItem, family, query)) {
      if (!closingItems) setClosingItems(visibleItems);
      setActiveFamily(family);
      beginClose(() => setClosingItems(null));
    } else setActiveFamily(family);
  };

  const changeQuery = (value: string) => {
    if (expandedItem && !itemMatchesView(expandedItem, activeFamily, value)) {
      if (!closingItems) setClosingItems(visibleItems);
      setQuery(value);
      beginClose(() => setClosingItems(null));
    } else setQuery(value);
  };

  return <section className={styles.explorer} aria-labelledby="catalogue-controls-title">
    <h2 className={styles.visuallyHidden} id="catalogue-controls-title">Browse ingredient catalogue</h2>
    <div className={styles.controls}>
      <FamilyRail families={families} activeFamily={activeFamily} onChange={changeFamily} />
      <IngredientSearch value={query} onChange={changeQuery} />
      <p className={styles.count} aria-live="polite">{visibleItems.length} {visibleItems.length === 1 ? "material" : "materials"}</p>
    </div>
    {displayedItems.length > 0 ? <MaterialGrid items={displayedItems} expandedItem={expandedItem} selectedIds={selectedIds} revealClosing={revealClosing} onToggleDetails={toggleDetails} onToggleSelection={toggleSelection} onRequestClose={(restoreFocus) => beginClose(undefined, restoreFocus)} onRevealClosed={handleRevealClosed} /> : <div className={styles.empty}><p>No materials match this view.</p><button type="button" onClick={() => { setActiveFamily("all"); setQuery(""); }}>Reset catalogue</button></div>}
    {selectedItems.length > 0 && <button ref={dockRef} className={styles.dock} type="button" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="herbs-spices-enquiry"><span>Enquiry list</span><strong>{selectedItems.length}</strong></button>}
    {drawerOpen && <EnquiryDrawer items={selectedItems} onClose={() => setDrawerOpen(false)} onRemove={toggleSelection} triggerRef={dockRef} />}
  </section>;
}
