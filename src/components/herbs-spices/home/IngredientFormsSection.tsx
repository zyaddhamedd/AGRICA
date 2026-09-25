"use client";

import React, { useState } from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./IngredientFormsSection.module.css";

const emptyFallback = <span className={styles.fallback} />;

export function IngredientFormsSection(): React.JSX.Element {
  const { formsIntro, forms } = useHerbsSpicesDictionary().homepage;
  const staticIntro = HERBS_SPICES_HOMEPAGE.formsIntro;
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const stageItems = forms.map((form) => ({
    id: form.id,
    index: form.index,
    name: form.name,
    descriptor: form.descriptor,
    media: HERBS_SPICES_MEDIA.forms[form.id as keyof typeof HERBS_SPICES_MEDIA.forms],
  }));

  const activeItem = stageItems[activeIndex] ?? stageItems[0];
  const totalCountFormatted = String(stageItems.length).padStart(2, "0");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % stageItems.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + stageItems.length) % stageItems.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = stageItems.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      const targetBtn = document.getElementById(`form-sequence-${stageItems[nextIndex].id}`);
      targetBtn?.focus();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % stageItems.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + stageItems.length) % stageItems.length);
      }
    }
    setTouchStart(null);
  };

  return (
    <section className={styles.section} id="ingredient-forms" aria-labelledby="forms-title">
      <div className={styles.inner}>
        <div className={styles.composition}>
          {/* LEFT COLUMN: Narrative & Vertical Transformation Index */}
          <div className={styles.storyColumn}>
            <header className={styles.header}>
              <div className={styles.headerMeta}>
                <span className={styles.eyebrow}>
                  {formsIntro.eyebrow || staticIntro.eyebrow}
                </span>
                <span className={styles.scopeTag}>5 Processing Formats</span>
              </div>
              <h2 id="forms-title" className={styles.title}>
                {formsIntro.title || staticIntro.title}
              </h2>
              <p className={styles.description}>
                {formsIntro.description || staticIntro.description}
              </p>
            </header>

            {/* Desktop Vertical Transformation Sequence Index */}
            <nav className={styles.transformationIndex} aria-label="Transformation Sequence">
              <ol className={styles.indexList} role="tablist">
                {stageItems.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li key={item.id} className={styles.indexItem} role="presentation">
                      <button
                        id={`form-sequence-${item.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`form-panel-${item.id}`}
                        className={`${styles.sequenceBtn} ${isActive ? styles.sequenceBtnActive : ""}`}
                        onClick={() => setActiveIndex(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      >
                        <span className={styles.sequenceIndex}>{item.index}</span>
                        <span className={styles.sequenceName}>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          {/* RIGHT COLUMN: Material Metamorphosis Stage */}
          <div className={styles.stageColumn}>
            <div
              id={`form-panel-${activeItem.id}`}
              role="tabpanel"
              aria-labelledby={`form-sequence-${activeItem.id}`}
              className={styles.specimenStage}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Dominant Specimen Image */}
              <div className={styles.imageStage}>
                <div key={activeItem.id} className={styles.imageFade}>
                  <HerbsSpicesMedia
                    entry={activeItem.media}
                    className={styles.media}
                    fallback={emptyFallback}
                    alt={`${activeItem.name} processing format`}
                  />
                </div>
                <div className={styles.chapterMarker} aria-hidden="true">
                  <span>{activeItem.index} / {totalCountFormatted}</span>
                </div>
              </div>

              {/* Editorial Format Identification */}
              <div key={`meta-${activeItem.id}`} className={styles.activeDetails}>
                <div className={styles.detailsHeader}>
                  <span className={styles.detailsIndex}>{activeItem.index}</span>
                  <h3 className={styles.detailsTitle}>{activeItem.name}</h3>
                </div>
                <p className={styles.detailsDesc}>{activeItem.descriptor}</p>
              </div>
            </div>

            {/* Mobile Editorial Transformation Sequence Index (01 — 02 — 03 — 04 — 05) */}
            <div className={styles.mobileSequenceWrapper}>
              <div className={styles.mobileSequence} role="tablist" aria-label="Transformation Sequence">
                {stageItems.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <React.Fragment key={item.id}>
                      {index > 0 && <span className={styles.mobileSequenceDash} aria-hidden="true">—</span>}
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`${item.index} ${item.name}`}
                        aria-controls={`form-panel-${item.id}`}
                        className={`${styles.mobileSeqBtn} ${isActive ? styles.mobileSeqBtnActive : ""}`}
                        onClick={() => setActiveIndex(index)}
                      >
                        {item.index}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
