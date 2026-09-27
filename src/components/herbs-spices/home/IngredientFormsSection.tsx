"use client";

import React, { useState, useRef, useEffect } from "react";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./IngredientFormsSection.module.css";

export function IngredientFormsSection(): React.JSX.Element {
  const { formsIntro, forms } = useHerbsSpicesDictionary().homepage;
  const staticIntro = HERBS_SPICES_HOMEPAGE.formsIntro;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const formItems = forms.map((form) => {
    const media =
      HERBS_SPICES_MEDIA.forms[
        form.id as keyof typeof HERBS_SPICES_MEDIA.forms
      ];
    return {
      id: form.id,
      image: media?.src || "/assets/herbs-spices/home/form-whole.webp",
      alt: `${form.name} botanical processing state`,
      index: form.index,
      name: form.name,
      descriptor: form.descriptor,
    };
  });

  const activeItem = formItems[activeIndex] ?? formItems[0];
  const totalCountFormatted = String(formItems.length).padStart(2, "0");

  // Auto-switch processes every 2 seconds (2000ms)
  useEffect(() => {
    if (isPaused || formItems.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % formItems.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, formItems.length]);

  // Touch Swipe for mobile without scroll-jacking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        setActiveIndex((prev) => (prev + 1) % formItems.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + formItems.length) % formItems.length);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    // Resume auto-cycling after swipe
    setTimeout(() => setIsPaused(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % formItems.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + formItems.length) % formItems.length);
    }
  };

  const rawEyebrow = formsIntro.eyebrow || staticIntro.eyebrow || "MATERIAL EXPRESSION";
  const cleanedEyebrow = rawEyebrow.replace(/^\d+\s*\/\s*/, "");
  const displayEyebrow = `02 / ${cleanedEyebrow}`;

  return (
    <section
      className={styles.section}
      id="ingredient-forms"
      aria-label={displayEyebrow}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.inner}>
        {/* 2-Part Horizontal Editorial Transformation Strip */}
        <div className={styles.stripGrid}>
          {/* Left: Technical Chapter Rail & Vertical State Index */}
          <aside className={styles.leftRail}>
            <div className={styles.railHeader}>
              <span className={styles.chapterLabel}>{displayEyebrow}</span>
              <span className={styles.counter}>
                {activeItem.index} / {totalCountFormatted}
              </span>
            </div>

            <nav
              className={styles.formatNav}
              aria-label="Botanical transformation states"
              role="tablist"
            >
              {formItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.formatNavItem} ${isActive ? styles.formatNavItemActive : ""}`}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <span className={styles.navItemIndex}>{item.index}</span>
                    <span className={styles.navItemName}>{item.name}</span>
                    <span className={styles.navItemIndicator} aria-hidden="true" />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right: Dominant Specimen Visual with Attached Title Edge Plate */}
          <div className={styles.stageCol}>
            <div
              className={styles.visualFrame}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {formItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={item.id}
                    className={`${styles.imageLayer} ${isActive ? styles.imageLayerActive : ""}`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={item.image}
                      alt={item.alt}
                      className={styles.specimenImage}
                      loading={idx === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                );
              })}

              {/* Attached Editorial Title Edge Plate */}
              <div
                key={`attached-plate-${activeItem.id}`}
                className={styles.attachedPlate}
                aria-live="polite"
              >
                <div className={styles.plateHeader}>
                  <span className={styles.plateNumber}>{activeItem.index}</span>
                  <span className={styles.plateDivider}>/</span>
                  <span className={styles.plateTotal}>{totalCountFormatted}</span>
                </div>
                <h3 className={styles.plateTitle}>{activeItem.name}</h3>
                {activeItem.descriptor && (
                  <p className={styles.plateDescriptor}>{activeItem.descriptor}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

