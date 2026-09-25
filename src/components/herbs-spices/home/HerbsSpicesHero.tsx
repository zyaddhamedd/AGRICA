"use client";

import { LocaleLink as Link } from "@/components/common/LocaleLink";
import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import styles from "./HerbsSpicesHero.module.css";

export function HerbsSpicesHero(): React.JSX.Element {
  const { hero } = useHerbsSpicesDictionary().homepage;

  return (
    <section className={styles.hero} aria-labelledby="herbs-spices-home-title">
      <div className={styles.canvasGrid} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Top Editorial Kicker & Technical Meta Bar */}
        <div className={styles.topMeta}>
          <div className={styles.kicker}>
            <span className={styles.originTag}>EGYPT</span>
            <span className={styles.kickerDivider} aria-hidden="true">/</span>
            <span>{hero.eyebrow}</span>
          </div>
          <div className={styles.specMeta} aria-hidden="true">
            <span>MEDICINAL &amp; AROMATIC PLANTS</span>
            <span className={styles.metaDivider}>·</span>
            <span>DIRECT B2B SUPPLY</span>
          </div>
        </div>

        {/* Main Asymmetrical Editorial Stage */}
        <div className={styles.mainStage}>
          {/* Left / Center Typography Block */}
          <div className={styles.copyBlock}>
            <div className={styles.headlineWrapper}>
              <h1 className={styles.title} id="herbs-spices-home-title">
                <span className={styles.titleLine}>{hero.titleLead}</span>
                <span className={styles.titleEmphasisLine}>
                  <em>{hero.titleEmphasis}</em>
                </span>
              </h1>
            </div>

            <p className={styles.introduction}>
              {hero.introduction}
            </p>

            {/* Architectural Actions Cluster */}
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="/herbs-spices/products">
                <span>{hero.primaryAction}</span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </Link>
              <a className={styles.secondaryAction} href="#start-a-trade">
                <span>{hero.secondaryAction}</span>
              </a>
            </div>
          </div>

          {/* Center-Right Botanical Hero Specimen */}
          <div className={styles.visualStage}>
            <div className={styles.specimenCard}>
              <div className={styles.specimenHeader} aria-hidden="true">
                <span className={styles.specimenCode}>EXP // BOTANICAL NO. 01</span>
              </div>

              <div className={styles.mediaContainer}>
                <HerbsSpicesMedia
                  className={styles.mediaSlot}
                  entry={HERBS_SPICES_MEDIA.homepage.heroPrimary}
                  decorative
                  fallback={
                    <div className={styles.botanicalFallback}>
                      <span className={styles.fallbackCircle} />
                      <span className={styles.fallbackAccent} />
                      <span className={styles.fallbackLabel}>{hero.mediaLabel}</span>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Technical Annotations Strip */}
        <div className={styles.bottomAnnotations}>
          <div className={styles.annotationCol}>
            <span className={styles.annotIndex}>01</span>
            <div className={styles.annotBody}>
              <strong>ORIGIN</strong>
              <span>Egypt</span>
            </div>
          </div>

          <div className={styles.annotationCol}>
            <span className={styles.annotIndex}>02</span>
            <div className={styles.annotBody}>
              <strong>PROCESSING</strong>
              <span>Whole · Cut &amp; Sifted · TBC · Powder</span>
            </div>
          </div>

          <div className={styles.annotationCol}>
            <span className={styles.annotIndex}>03</span>
            <div className={styles.annotBody}>
              <strong>DISCIPLINE</strong>
              <span>Direct Sourcing &amp; Quality Control</span>
            </div>
          </div>

          <div className={styles.annotationCol}>
            <span className={styles.annotIndex}>04</span>
            <div className={styles.annotBody}>
              <strong>TRADE</strong>
              <span>International B2B Supply</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
