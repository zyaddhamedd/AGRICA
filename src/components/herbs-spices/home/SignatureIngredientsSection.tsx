"use client";

import React, { useState } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HOMEPAGE_SIGNATURE_INGREDIENTS, HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { DIVISION_REGISTRY } from "@/divisions/registry";
import styles from "./SignatureIngredientsSection.module.css";

export function SignatureIngredientsSection(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const ingredients = HOMEPAGE_SIGNATURE_INGREDIENTS;
  const activeItem = ingredients[activeIndex] ?? ingredients[0];
  const intro = HERBS_SPICES_HOMEPAGE.signatureIntro;

  return (
    <section className={styles.section} id="signature-ingredients" aria-labelledby="signature-title">
      <div className={styles.inner}>
        {/* Editorial Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <span className={styles.scopeTag}>Living Specimen Stage</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="signature-title" className={styles.title}>{intro.title}</h2>
            <p className={styles.description}>{intro.description}</p>
          </div>
        </header>

        {/* Living Specimen Showcase */}
        <div className={styles.stageGrid}>
          {/* Left: Interactive Specimen Index */}
          <nav className={styles.specimenNav} aria-label="Curated botanical specimens">
            <div className={styles.navHeader}>
              <span className={styles.navLabel}>Selected Specimens</span>
              <span className={styles.navCounter}>{String(activeIndex + 1).padStart(2, "0")} / {String(ingredients.length).padStart(2, "0")}</span>
            </div>
            <ol className={styles.specimenList}>
              {ingredients.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={item.slug} className={styles.specimenItem}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      className={`${styles.specimenBtn} ${isActive ? styles.specimenBtnActive : ""}`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className={styles.itemNum}>{String(index + 1).padStart(2, "0")}</span>
                      <div className={styles.itemMeta}>
                        <strong className={styles.itemName}>{item.name}</strong>
                        {item.latinName && <span className={styles.itemLatin}>{item.latinName}</span>}
                      </div>
                      <span className={styles.itemFamily}>{item.familyName}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Right / Center: Large Dominant Specimen Presentation */}
          <div className={styles.specimenDisplay} role="region" aria-label={`${activeItem.name} specimen details`}>
            <div className={styles.imageStage}>
              {ingredients.map((item, index) => {
                const isCurrent = index === activeIndex;
                const mediaEntry = HERBS_SPICES_MEDIA.products[item.slug];
                return (
                  <div
                    key={item.slug}
                    className={`${styles.imageLayer} ${isCurrent ? styles.imageLayerActive : ""}`}
                  >
                    <HerbsSpicesMedia
                      className={styles.media}
                      entry={mediaEntry}
                      alt={`${item.name} botanical specimen`}
                      fallback={<span className={styles.mediaFallback} />}
                    />
                  </div>
                );
              })}
              <div className={styles.originBadge}>
                <span>ORIGIN: {activeItem.origin.toUpperCase()}</span>
              </div>
            </div>

            <div className={styles.specimenInfo}>
              <div className={styles.infoHeader}>
                <div className={styles.tagGroup}>
                  <span className={styles.familyBadge}>{activeItem.familyName} Family</span>
                  <span className={styles.sepDot}>·</span>
                  <span className={styles.originLabel}>Egypt</span>
                </div>
                <h3 className={styles.displayName}>{activeItem.name}</h3>
                {activeItem.latinName && <em className={styles.displayLatin}>{activeItem.latinName}</em>}
              </div>

              <div className={styles.formsRow}>
                <span className={styles.formsLabel}>Available Processing Forms:</span>
                <div className={styles.formsList}>
                  {activeItem.forms.map((form) => (
                    <span key={form} className={styles.formTag}>
                      <span className={styles.formDot} aria-hidden="true" />
                      {form}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.actionRow}>
                <Link
                  href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(activeItem.familyId)}`}
                  className={styles.primaryLink}
                >
                  <span>Explore in Catalogue</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
