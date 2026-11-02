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
  const [isVisible, setIsVisible] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const materialPositionClasses = {
    whole: styles.specimenImageWhole,
    "cut-sifted": styles.specimenImageCutSifted,
    tbc: styles.specimenImageTbc,
    crushed: styles.specimenImageCrushed,
    powder: styles.specimenImagePowder,
  } as const;

  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Viewport intersection and document visibility listener
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let observer: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          setIsVisible(entry.isIntersecting);
        },
        { rootMargin: "100px 0px" }
      );
      observer.observe(section);
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(typeof document !== "undefined" ? !document.hidden : true);
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  // Auto-switch processes every 2 seconds (2000ms)
  // Suspended when offscreen, document hidden, user paused, or reduced motion active
  // Uses setTimeout driven by activeIndex to guarantee full 2000ms interval and avoid catchup ticks
  useEffect(() => {
    if (isPaused || !isVisible || !isDocumentVisible || prefersReduced || formItems.length <= 1) {
      return;
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % formItems.length);
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, isVisible, isDocumentVisible, prefersReduced, formItems.length]);

  // Touch Swipe for mobile without scroll-jacking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
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
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = setTimeout(() => setIsPaused(false), 2500);
  };

  // Clean up any pending touch resume timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      ref={sectionRef}
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
                    onKeyDown={handleKeyDown}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.alt}
                      className={`${styles.specimenImage} ${styles.specimenImageMaterial} ${materialPositionClasses[item.id as keyof typeof materialPositionClasses]}`}
                      loading={idx === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

