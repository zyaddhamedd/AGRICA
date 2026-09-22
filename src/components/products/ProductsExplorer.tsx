"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import type { WorldId, QuoteItem, ProductAtlasItem, ProduceFamilyId } from "@/types/agrica";
import { PRODUCT_LIBRARY, countProductsInWorld } from "@/data/products";
import {
  buildProductAtlasItems,
  filterProductAtlasItems,
  toggleQuoteItem,
} from "@/data/productCatalogue";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { WorldSwitch } from "./WorldSwitch";
import { FamilyPanel } from "./FamilyPanel";
import { LiveSearchInput } from "./LiveSearchInput";
import { AtlasGrid } from "./AtlasGrid";
import { FloatingEnquiryDock } from "./FloatingEnquiryDock";
import { SeasonSection } from "@/components/home/SeasonSection";
import { QuoteDrawer } from "./QuoteDrawer";
import { useProductsDictionary } from "@/i18n/locale-context";

export function ProductsExplorer({
  initialWorld,
}: {
  readonly initialWorld: WorldId;
}): React.JSX.Element {
  const dictionary = useProductsDictionary();
  const [activeWorld, setActiveWorld] = useState<WorldId>(initialWorld);
  const [activeFamilyId, setActiveFamilyId] = useState<ProduceFamilyId | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setActiveWorld(initialWorld);
  }, [initialWorld]);

  // Sync body dataset for CSS theme styling
  useEffect(() => {
    document.body.dataset.world = activeWorld;
    document.body.classList.add("products-page");
    return () => {
      delete document.body.dataset.world;
      document.body.classList.remove("products-page");
    };
  }, [activeWorld]);

  const allAtlasItems = useMemo(() => buildProductAtlasItems(dictionary), [dictionary]);

  // Filter items based on searchQuery, activeWorld, and stable activeFamilyId.
  const filteredItems = useMemo(() => {
    return filterProductAtlasItems(allAtlasItems, {
      activeWorld,
      activeFamilyId,
      searchQuery,
    });
  }, [allAtlasItems, searchQuery, activeWorld, activeFamilyId]);

  // World switcher
  const handleSelectWorld = (world: WorldId) => {
    if (world === activeWorld && !searchQuery) return;
    setActiveWorld(world);
    setActiveFamilyId(null);

    startTransition(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("world", world);
        window.history.replaceState(null, "", url.toString());
      }
    });
  };

  // Family switcher
  const handleSelectFamily = (familyId: ProduceFamilyId | null) => {
    setActiveFamilyId(familyId);
  };

  // Quote item toggle
  const handleToggleQuote = (item: ProductAtlasItem) => {
    setQuoteItems((previousItems) => toggleQuoteItem(previousItems, item));
  };

  const handleRemoveQuoteItem = (key: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== key));
  };

  const currentWorldObj = PRODUCT_LIBRARY[activeWorld];
  const localizedFamilies = useMemo(() => currentWorldObj.families.map((family) => ({ ...family, name: dictionary.families[family.id] })), [currentWorldObj, dictionary]);
  const totalWorldCount = countProductsInWorld(activeWorld);

  return (
    <div className="products-page" data-world={activeWorld}>
      <a className="skip-link" href="#product-atlas-main">
        {dictionary.skipAtlas}
      </a>

      <SiteHeader
        variant="products"
        theme="navy"
        quoteCount={quoteItems.length}
        onOpenQuote={() => setIsDrawerOpen(true)}
      />

      <main id="product-atlas-main">
        {/* Unified Hero Surface Canvas */}
        <section className="products-hero-canvas">
          <div className="hero-compact-content">
            <h1 className="hero-compact-title">
              {dictionary.heroLead} <em>{dictionary.heroEmphasis}</em>
            </h1>

            {/* Editorial World Selector */}
            <WorldSwitch activeWorld={activeWorld} onSelectWorld={handleSelectWorld} />
          </div>
        </section>

        {/* Seamless Catalogue Handoff Bar */}
        <section className="catalogue-handoff-bar">
          <div className="handoff-inner">
            <div className="handoff-meta">
              <span className="handoff-world-name">{dictionary.worlds[activeWorld].label}</span>
            </div>
            <div className="handoff-search-wrap">
              <LiveSearchInput
                query={searchQuery}
                onChange={setSearchQuery}
                totalMatches={filteredItems.length}
              />
            </div>
          </div>
          <FamilyPanel
            families={localizedFamilies}
            activeFamilyId={activeFamilyId}
            onSelectFamily={handleSelectFamily}
            totalWorldCount={totalWorldCount}
          />
        </section>

        {/* Premium Product Atlas Grid */}
        <section className="atlas-content">
          <AtlasGrid
            items={filteredItems}
            quoteItems={quoteItems}
            onToggleQuote={handleToggleQuote}
          />
        </section>

        {/* Homepage Season Section (Copied / Reused Directly) */}
        <SeasonSection />
      </main>

      <SiteFooter variant="products" onPrimaryAction={() => setIsDrawerOpen(true)} />

      {/* Quote Drawer */}
      <QuoteDrawer
        isOpen={isDrawerOpen}
        items={quoteItems}
        onClose={() => setIsDrawerOpen(false)}
        onRemoveItem={handleRemoveQuoteItem}
      />

      {/* Floating Enquiry Dock (Replaces MobileQuoteBar) */}
      <FloatingEnquiryDock
        count={quoteItems.length}
        onOpenQuote={() => setIsDrawerOpen(true)}
      />
    </div>
  );
}
