"use client";

import React, { useState } from "react";
import AccordionGallery, {
  AccordionGalleryItem,
} from "@/components/ui/AccordionGallery/AccordionGallery";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { DIVISION_REGISTRY } from "@/divisions/registry";
import styles from "./IngredientFamiliesSection.module.css";

const emptyFallback = <span className={styles.mediaFallback} />;

export function IngredientFamiliesSection(): React.JSX.Element {
  const dictionary = useHerbsSpicesDictionary();
  const { familiesIntro, families } = dictionary.homepage;
  const staticFamilies = HERBS_SPICES_HOMEPAGE.families;
  const [activeFamilyIndex, setActiveFamilyIndex] = useState(0);

  const galleryItems: AccordionGalleryItem[] = families.map((family) => {
    const staticData = staticFamilies.find((item) => item.id === family.id);
    const sampleList = staticData?.sampleProducts?.slice(0, 3) ?? [];
    const mediaEntry = HERBS_SPICES_MEDIA.families[family.id];
    const link = `${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(family.id)}`;

    return {
      image: mediaEntry?.src || `/assets/herbs-spices/families/${family.id}.webp`,
      label: family.name,
      sublabel: sampleList.join(" · "),
      index: family.index,
      alt: `${family.name} botanical family`,
      link,
    };
  });

  const activeFamily = families[activeFamilyIndex] ?? families[0];
  const activeStatic = staticFamilies.find((item) => item.id === activeFamily.id);
  const activeSamples = activeStatic?.sampleProducts ?? [];

  return (
    <section
      className={styles.section}
      id="ingredient-families"
      aria-label={familiesIntro.eyebrow || "01 / INGREDIENT FAMILIES"}
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            {familiesIntro.eyebrow || "01 / INGREDIENT FAMILIES"}
          </span>
        </div>

        {/* DESKTOP ONLY: Accordion Gallery Component from React Bits */}
        <div className={styles.desktopGalleryWrapper}>
          <AccordionGallery
            items={galleryItems}
            defaultIndex={0}
            expandRatio={0.42}
            trigger="hover"
            height={500}
            gap={12}
            radius={18}
            accentColor="#8FA889"
            overlayColor="#0E2319"
            textColor="#ffffff"
            grayscale={true}
            showLabels={true}
            onSelect={(idx) => setActiveFamilyIndex(idx)}
          />

          {/* Active Family Editorial Footer Strip (Desktop) */}
          <div className={styles.activeStrip}>
            <div className={styles.stripInfo}>
              <div className={styles.stripHeader}>
                <span className={styles.stripIndex}>{activeFamily.index}</span>
                <h3 className={styles.stripTitle}>{activeFamily.name}</h3>
              </div>
              <p className={styles.stripDesc}>{activeFamily.description}</p>
              {activeSamples.length > 0 && (
                <p className={styles.stripSamples}>
                  <span className={styles.samplesLabel}>Key Ingredients:</span>{" "}
                  {activeSamples.join(", ")}
                </p>
              )}
            </div>

            <div className={styles.stripAction}>
              <Link
                className={styles.exploreLink}
                href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(activeFamily.id)}`}
                aria-label={formatMessage(dictionary.catalogue.exploreFamily, {
                  name: activeFamily.name,
                })}
              >
                <span>Explore {activeFamily.name}</span>
                <span className={styles.exploreArrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* MOBILE ONLY: Clean, Polished Editorial Botanical Family Cards */}
        <div className={styles.mobileSequence}>
          {families.map((family) => {
            const staticData = staticFamilies.find(
              (item) => item.id === family.id
            );
            const sampleList = staticData?.sampleProducts?.slice(0, 4) ?? [];
            const mediaEntry = HERBS_SPICES_MEDIA.families[family.id];

            return (
              <Link
                key={family.id}
                className={styles.mobileFamilyCard}
                href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(family.id)}`}
                aria-label={formatMessage(dictionary.catalogue.exploreFamily, {
                  name: family.name,
                })}
              >
                {/* Media Image Frame */}
                <div className={styles.mobileMediaWrapper}>
                  <HerbsSpicesMedia
                    className={styles.mobileMedia}
                    entry={mediaEntry}
                    alt={`${family.name} botanical family`}
                    fallback={emptyFallback}
                  />
                  <div className={styles.mobileMediaOverlay} />
                  <div className={styles.mobileBadge}>
                    <span className={styles.mobileBadgeNum}>
                      {family.index}
                    </span>
                    <span className={styles.mobileBadgeName}>
                      {family.name}
                    </span>
                  </div>
                </div>

                {/* Card Body Information */}
                <div className={styles.mobileCardBody}>
                  <div className={styles.mobileTextGroup}>
                    <p className={styles.mobileDescription}>
                      {family.description}
                    </p>
                    {sampleList.length > 0 && (
                      <p className={styles.mobileSamples}>
                        {sampleList.join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className={styles.mobileArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
