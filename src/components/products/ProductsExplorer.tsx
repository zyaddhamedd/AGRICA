"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import type { WorldId, QuoteItem } from "@/types/agrica";
import { PRODUCT_LIBRARY, visualFor } from "@/data/products";
import { SiteHeader } from "@/components/common/SiteHeader";
import { WorldSwitch } from "./WorldSwitch";
import { FamilyPanel } from "./FamilyPanel";
import { ProductStage } from "./ProductStage";
import { LivingShelf } from "./LivingShelf";
import { SeasonStrip } from "./SeasonStrip";
import { QuoteDrawer } from "./QuoteDrawer";
import { MobileQuoteBar } from "./MobileQuoteBar";

export function ProductsExplorer(): React.JSX.Element {
  const [activeWorld, setActiveWorld] = useState<WorldId>("fresh");
  const [activeFamilyIndex, setActiveFamilyIndex] = useState<number>(0);
  const [activeProductIndex, setActiveProductIndex] = useState<number>(0);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isChangingMedia, setIsChangingMedia] = useState<boolean>(false);
  const [addFeedback, setAddFeedback] = useState<string>("");
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

  // Sync body dataset and class for CSS theme variables
  useEffect(() => {
    document.body.dataset.world = activeWorld;
    document.body.classList.add("products-page");
    return () => {
      delete document.body.dataset.world;
      document.body.classList.remove("products-page");
    };
  }, [activeWorld]);

  // Derived current library, family, and product
  const currentWorld = PRODUCT_LIBRARY[activeWorld];
  const currentFamily = currentWorld.families[activeFamilyIndex] || currentWorld.families[0];
  const currentProduct = currentFamily.products[activeProductIndex] || currentFamily.products[0];
  const worldFormat = currentWorld.label.replace(" produce", "");

  const visual = visualFor(currentProduct, activeWorld, currentFamily.code);
  const stageCode = `${activeWorld.slice(0, 2).toUpperCase()} / ${currentFamily.code} / ${String(
    activeProductIndex + 1
  ).padStart(2, "0")}`;
  const currentKey = `${activeWorld}::${currentFamily.name}::${currentProduct}`;
  const isAddedToQuote = quoteItems.some((item) => item.key === currentKey);

  // Switch world without page reload
  const handleSelectWorld = (world: WorldId) => {
    if (world === activeWorld) return;
    setIsChangingMedia(true);
    setActiveWorld(world);
    setActiveFamilyIndex(0);
    setActiveProductIndex(0);
    setAddFeedback("");

    startTransition(() => {
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `?world=${world}`);
      }
    });

    window.setTimeout(() => {
      setIsChangingMedia(false);
    }, 120);
  };

  // Switch family
  const handleSelectFamily = (index: number) => {
    if (index === activeFamilyIndex) return;
    setIsChangingMedia(true);
    setActiveFamilyIndex(index);
    setActiveProductIndex(0);
    setAddFeedback("");

    window.setTimeout(() => {
      setIsChangingMedia(false);
    }, 120);
  };

  // Switch product
  const handleSelectProduct = (index: number, _reveal: boolean) => {
    if (index === activeProductIndex) return;
    setIsChangingMedia(true);
    setActiveProductIndex(index);
    setAddFeedback("");

    window.setTimeout(() => {
      setIsChangingMedia(false);
    }, 120);
  };

  // Add product to quotation
  const handleAddToQuote = () => {
    if (!isAddedToQuote) {
      setQuoteItems((prev) => [
        ...prev,
        {
          key: currentKey,
          name: currentProduct,
          world: currentWorld.label,
          family: currentFamily.name,
        },
      ]);
      setAddFeedback("Added. Continue browsing or open your quotation.");
    } else {
      setAddFeedback("This product is already in your quotation.");
    }
  };

  // Remove product from quotation
  const handleRemoveQuoteItem = (key: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <div className="products-page" data-world={activeWorld}>
      <a className="skip-link" href="#product-explorer">
        Skip to product explorer
      </a>

      <SiteHeader
        variant="products"
        quoteCount={quoteItems.length}
        onOpenQuote={() => setIsDrawerOpen(true)}
      />

      <main>
        <section className="explorer" id="product-explorer" aria-labelledby="explorer-title">
          <div className="explorer-head">
            <div>
              <p className="eyebrow">AGRICA product library</p>
              <h1 id="explorer-title">
                Produce,
                <br />
                <em>organised.</em>
              </h1>
            </div>
            <p>
              Browse by condition and family. Select any product to inspect it here, then add it
              directly to one export enquiry.
            </p>
          </div>

          <WorldSwitch activeWorld={activeWorld} onSelectWorld={handleSelectWorld} />

          <div className="explorer-workspace">
            <FamilyPanel
              families={currentWorld.families}
              activeFamilyIndex={activeFamilyIndex}
              activeConditionLabel={currentWorld.label}
              onSelectFamily={handleSelectFamily}
            />

            <ProductStage
              visual={visual}
              isChanging={isChangingMedia}
              stageCode={stageCode}
              familyName={currentFamily.name}
              worldFormat={worldFormat}
              productName={currentProduct}
              isAddedToQuote={isAddedToQuote}
              addFeedback={addFeedback}
              onAddToQuote={handleAddToQuote}
            />
          </div>

          <LivingShelf
            shelfLabel={`${currentWorld.label} / ${currentFamily.name}`}
            familyName={currentFamily.name}
            products={currentFamily.products}
            activeProductIndex={activeProductIndex}
            onSelectProduct={handleSelectProduct}
          />
        </section>

        <SeasonStrip
          seasonFamily={`${currentWorld.label} · ${currentFamily.name}`}
          seasonProducts={currentFamily.products.join(" · ")}
        />
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

      <QuoteDrawer
        isOpen={isDrawerOpen}
        items={quoteItems}
        onClose={() => setIsDrawerOpen(false)}
        onRemoveItem={handleRemoveQuoteItem}
      />

      <MobileQuoteBar count={quoteItems.length} onOpen={() => setIsDrawerOpen(true)} />
    </div>
  );
}
