"use client";

import React, { useState } from "react";
import { HOMEPAGE_WHY_AGRICA, HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./WhyAgricaSection.module.css";

export function WhyAgricaSection(): React.JSX.Element {
  const pillars = HOMEPAGE_WHY_AGRICA;
  const intro = HERBS_SPICES_HOMEPAGE.whyAgricaIntro;
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section className={styles.section} id="why-agrica" aria-labelledby="why-agrica-title">
      <div className={styles.inner}>
        {/* Concise Header on Botanical Green */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <span className={styles.scopeTag}>Confidence Interruption</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="why-agrica-title" className={styles.title}>{intro.title}</h2>
            <p className={styles.description}>{intro.description}</p>
          </div>
        </header>

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
