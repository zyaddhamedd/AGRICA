"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import type { WorldId, QuoteItem, ProductAtlasItem } from "@/types/agrica";
import { PRODUCT_LIBRARY, visualFor, countProductsInWorld, totalCatalogueCount } from "@/data/products";
import { SiteHeader } from "@/components/common/SiteHeader";
import { WorldSwitch } from "./WorldSwitch";
import { FamilyPanel } from "./FamilyPanel";
import { LiveSearchInput } from "./LiveSearchInput";
import { AtlasGrid } from "./AtlasGrid";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { FloatingEnquiryDock } from "./FloatingEnquiryDock";
import { SeasonSection } from "@/components/home/SeasonSection";
import { QuoteDrawer } from "./QuoteDrawer";

export function ProductsExplorer(): React.JSX.Element {
  const [activeWorld, setActiveWorld] = useState<WorldId>("fresh");
  const [activeFamilyCode, setActiveFamilyCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItemDetail, setSelectedItemDetail] = useState<ProductAtlasItem | null>(null);

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Read initial world query parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const requestedWorld = params.get("world") as WorldId | null;
      if (requestedWorld && PRODUCT_LIBRARY[requestedWorld]) {
        setActiveWorld(requestedWorld);
      }
    }
  }, []);

  // Sync body dataset for CSS theme styling
  useEffect(() => {
    document.body.dataset.world = activeWorld;
    document.body.classList.add("products-page");
    return () => {
      delete document.body.dataset.world;
      document.body.classList.remove("products-page");
    };
  }, [activeWorld]);

  // Construct full flat list of all atlas items in current library
  const allAtlasItems = useMemo(() => {
    const items: ProductAtlasItem[] = [];
    const worldKeys: WorldId[] = ["fresh", "frozen", "dried"];

    for (const wId of worldKeys) {
      const worldObj = PRODUCT_LIBRARY[wId];
      for (const fam of worldObj.families) {
        for (const prodName of fam.products) {
          const visual = visualFor(prodName, wId, fam.code);
          const key = `${wId}::${fam.name}::${prodName}`;
          items.push({
            id: key,
            key,
            name: prodName,
            worldId: wId,
            worldLabel: worldObj.label,
            familyCode: fam.code,
            familyName: fam.name,
            visual,
            origin: "Egypt",
          });
        }
      }
    }
    return items;
  }, []);

  // Filter items based on searchQuery, activeWorld, and activeFamilyCode
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allAtlasItems.filter((item) => {
      // If search query is entered, search across name, world, family, variety
      if (query) {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesWorld = item.worldLabel.toLowerCase().includes(query) || item.worldId.includes(query);
        const matchesFamily = item.familyName.toLowerCase().includes(query) || item.familyCode.toLowerCase().includes(query);
        const matchesVariety = item.variety ? item.variety.toLowerCase().includes(query) : false;
        return matchesName || matchesWorld || matchesFamily || matchesVariety;
      }

      // Otherwise filter by active world and active family code
      if (item.worldId !== activeWorld) return false;
      if (activeFamilyCode !== null && item.familyCode !== activeFamilyCode) return false;

      return true;
    });
  }, [allAtlasItems, searchQuery, activeWorld, activeFamilyCode]);

  // World switcher
  const handleSelectWorld = (world: WorldId) => {
    if (world === activeWorld && !searchQuery) return;
    setActiveWorld(world);
    setActiveFamilyCode(null);

    startTransition(() => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("world", world);
        window.history.replaceState(null, "", url.toString());
      }
    });
  };

  // Family switcher
  const handleSelectFamily = (code: string | null) => {
    setActiveFamilyCode(code);
  };

  // Quote item toggle
  const handleToggleQuote = (item: ProductAtlasItem) => {
    setQuoteItems((prev) => {
      const exists = prev.some((q) => q.key === item.key);
      if (exists) {
        return prev.filter((q) => q.key !== item.key);
      } else {
        return [
          ...prev,
          {
            key: item.key,
            name: item.name,
            world: item.worldLabel,
            family: item.familyName,
          },
        ];
      }
    });
  };

  const handleRemoveQuoteItem = (key: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.key !== key));
  };

  const currentWorldObj = PRODUCT_LIBRARY[activeWorld];
  const totalWorldCount = countProductsInWorld(activeWorld);
  const catalogueCount = totalCatalogueCount();

  return (
    <div className="products-page" data-world={activeWorld}>
      <a className="skip-link" href="#product-atlas-main">
        Skip to product atlas
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
              Egyptian produce. <em>Prepared for export.</em>
            </h1>

            {/* Editorial World Selector */}
            <WorldSwitch activeWorld={activeWorld} onSelectWorld={handleSelectWorld} />
          </div>
        </section>

        {/* Seamless Catalogue Handoff Bar */}
        <section className="catalogue-handoff-bar">
          <div className="handoff-inner">
            <div className="handoff-meta">
              <span className="handoff-world-name">{currentWorldObj.label}</span>
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
            families={currentWorldObj.families}
            activeFamilyCode={activeFamilyCode}
            onSelectFamily={handleSelectFamily}
            totalWorldCount={totalWorldCount}
          />
        </section>

        {/* Asymmetric Product Atlas Grid */}
        <section className="atlas-content">
          <AtlasGrid
            items={filteredItems}
            quoteItems={quoteItems}
            onOpenDetail={(item) => setSelectedItemDetail(item)}
            onToggleQuote={handleToggleQuote}
          />
        </section>

        {/* Homepage Season Section (Copied / Reused Directly) */}
        <SeasonSection />
      </main>

      <footer className="products-footer">
        <Link className="brand brand--footer" href="/" aria-label="AGRICA home">
          <strong>AGRĪCA</strong>
          <small>Agriculture Cairo</small>
        </Link>
        <p>Egyptian produce. Prepared for global supply.</p>
        <div>
          <span>Cairo, Egypt</span>
          <span>© 2026 AGRICA</span>
        </div>
      </footer>

      {/* Mobile Editorial Bottom Sheet Detail Drawer */}
      <ProductDetailSheet
        item={selectedItemDetail}
        isAddedToQuote={Boolean(selectedItemDetail && quoteItems.some((q) => q.key === selectedItemDetail.key))}
        onClose={() => setSelectedItemDetail(null)}
        onToggleQuote={handleToggleQuote}
      />

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
