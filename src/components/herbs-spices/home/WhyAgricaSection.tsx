"use client";

import React, { useState } from "react";
import { HOMEPAGE_WHY_AGRICA, HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./WhyAgricaSection.module.css";

export function WhyAgricaSection(): React.JSX.Element {
  const pillars = HOMEPAGE_WHY_AGRICA;
  const intro = HERBS_SPICES_HOMEPAGE.whyAgricaIntro;
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section className={styles.section} id="why-agrica" aria-label="04 / WHY AGRICA">
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            04 / WHY AGRICA
          </span>
        </div>

        {/* Typographic Confidence Wall: 2-Column Staggered Statements (No Cards) */}
        <div className={styles.wallGrid}>
          {pillars.map((pillar, index) => {
            const isActive = index === activePillar;
            return (
              <article
                key={pillar.index}
                className={`${styles.statementItem} ${isActive ? styles.statementActive : ""}`}
                onMouseEnter={() => setActivePillar(index)}
                onFocus={() => setActivePillar(index)}
                tabIndex={0}
              >
                <div className={styles.statementHeader}>
                  <span className={styles.statementNumber}>{pillar.index}</span>
                  <span className={styles.statementAccentLine} aria-hidden="true" />
                </div>
                <h3 className={styles.statementTitle}>{pillar.title}</h3>
                <p className={styles.statementText}>{pillar.statement}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
