"use client";

import React, { useState } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { DIVISION_REGISTRY } from "@/divisions/registry";
import styles from "./IngredientFamiliesSection.module.css";

export function IngredientFamiliesSection(): React.JSX.Element {
  const dictionary = useHerbsSpicesDictionary();
  const { familiesIntro, families } = dictionary.homepage;
  const staticFamilies = HERBS_SPICES_HOMEPAGE.families;
  const [activeFamilyIndex, setActiveFamilyIndex] = useState(0);

  const activeFamily = families[activeFamilyIndex] ?? families[0];
  const activeMedia = HERBS_SPICES_MEDIA.families[activeFamily.id];

  return (
    <section className={styles.section} id="ingredient-families" aria-labelledby="families-title">
      <div className={styles.inner}>
        {/* Editorial Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <p className={styles.eyebrow}>{familiesIntro.eyebrow || "01 / INGREDIENT FAMILIES"}</p>
            <span className={styles.scopeTag}>Botanical Atlas</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="families-title" className={styles.title}>{familiesIntro.title}</h2>
            <p className={styles.description}>{familiesIntro.description}</p>
          </div>
        </header>

        {/* Desktop Visual Atlas: Large Visual Anchor + Architectural Index */}
        <div className={styles.atlasLayout}>
          {/* Left / Center: Dominant Visual Anchor */}
          <div className={styles.visualAnchor} aria-hidden="true">
            <div className={styles.imageStage}>
              {families.map((family, index) => {
                const isCurrent = index === activeFamilyIndex;
                const mediaEntry = HERBS_SPICES_MEDIA.families[family.id];
                return (
                  <div
                    key={family.id}
                    className={`${styles.imageLayer} ${isCurrent ? styles.imageLayerActive : ""}`}
                  >
                    <HerbsSpicesMedia
                      className={styles.media}
                      entry={mediaEntry}
                      alt={`${family.name} botanical family`}
                      fallback={<span className={styles.mediaFallback} />}
                    />
                    <div className={styles.imageOverlay} />
                  </div>
                );
              })}
              <div className={styles.anchorMeta}>
                <span className={styles.anchorNumber}>{activeFamily.index}</span>
                <span className={styles.anchorDivider}>/</span>
                <span className={styles.anchorName}>{activeFamily.name}</span>
              </div>
            </div>
          </div>

          {/* Right: Architectural Editorial Index */}
          <nav className={styles.atlasNav} aria-label="Botanical families index">
            <ol className={styles.familyIndexList}>
              {families.map((family, index) => {
                const staticData = staticFamilies.find((item) => item.id === family.id);
                const sampleList = staticData?.sampleProducts?.slice(0, 4) ?? [];
                const isActive = index === activeFamilyIndex;

                return (
                  <li
                    key={family.id}
                    className={`${styles.indexItem} ${isActive ? styles.indexItemActive : ""}`}
                    onMouseEnter={() => setActiveFamilyIndex(index)}
                    onFocus={() => setActiveFamilyIndex(index)}
                  >
                    <Link
                      className={styles.familyLink}
                      href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(family.id)}`}
                      aria-label={formatMessage(dictionary.catalogue.exploreFamily, { name: family.name })}
                    >
                      <div className={styles.itemHeader}>
                        <span className={styles.itemNumber} aria-hidden="true">{family.index}</span>
                        <h3 className={styles.itemName}>{family.name}</h3>
                        <span className={styles.itemArrow} aria-hidden="true">↗</span>
                      </div>

                      {sampleList.length > 0 && (
                        <p className={styles.itemSamples}>
                          {sampleList.slice(0, 3).join(" · ")}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Mobile Vertical Sequence */}
        <div className={styles.mobileSequence}>
          {families.map((family) => {
            const staticData = staticFamilies.find((item) => item.id === family.id);
            const sampleList = staticData?.sampleProducts?.slice(0, 3) ?? [];
            const mediaEntry = HERBS_SPICES_MEDIA.families[family.id];

            return (
              <Link
                key={family.id}
                className={styles.mobileFamilyCard}
                href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(family.id)}`}
                aria-label={formatMessage(dictionary.catalogue.exploreFamily, { name: family.name })}
              >
                <div className={styles.mobileImageWrap}>
                  <HerbsSpicesMedia
                    className={styles.mobileMedia}
                    entry={mediaEntry}
                    alt={`${family.name} botanical family`}
                    fallback={<span className={styles.mediaFallback} />}
                  />
                  <span className={styles.mobileNumber}>{family.index}</span>
                </div>
                <div className={styles.mobileContent}>
                  <div className={styles.mobileTitleRow}>
                    <h3 className={styles.mobileName}>{family.name}</h3>
                    <span className={styles.mobileArrow} aria-hidden="true">↗</span>
                  </div>
                  {sampleList.length > 0 && (
                    <p className={styles.mobileSamples}>{sampleList.join(" · ")}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
