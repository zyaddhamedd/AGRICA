"use client";

import React from "react";
import ScrollStack, {
  ScrollStackItem,
} from "@/components/ui/ScrollStack/ScrollStack";
import {
  HOMEPAGE_PROCESS_STAGES,
  HERBS_SPICES_HOMEPAGE,
} from "@/data/herbs-spices/homepage";
import styles from "./SourceToSpecificationSection.module.css";

export function SourceToSpecificationSection(): React.JSX.Element {
  const stages = HOMEPAGE_PROCESS_STAGES;
  const intro = HERBS_SPICES_HOMEPAGE.processIntro;
  const totalStagesFormatted = String(stages.length).padStart(2, "0");

  return (
    <section
      className={styles.section}
      id="source-to-specification"
      aria-labelledby="process-title"
    >
      <div className={styles.inner}>
        {/* Section Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.eyebrow}>{intro.eyebrow}</span>
            <span className={styles.scopeTag}>Process Journey</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="process-title" className={styles.title}>
              {intro.title}
            </h2>
            <p className={styles.description}>{intro.description}</p>
          </div>
        </header>

        {/* ScrollStack Component from React Bits */}
        <div className={styles.stackWrapper}>
          <ScrollStack
            className={styles.stackScroller}
            itemDistance={70}
            itemScale={0.035}
            itemStackDistance={24}
            stackPosition="15%"
            scaleEndPosition="5%"
            baseScale={0.88}
            rotationAmount={0}
            blurAmount={1}
            useWindowScroll={false}
          >
            {stages.map((stage) => (
              <ScrollStackItem
                key={stage.id}
                itemClassName={styles.processCard}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIndex}>
                    {stage.index} / {totalStagesFormatted}
                  </span>
                  <span className={styles.cardTag}>Operational Phase</span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{stage.title}</h3>
                  <p className={styles.cardStatement}>{stage.summary}</p>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.cardAccentLine} aria-hidden="true" />
                  <span className={styles.cardOriginLabel}>
                    AGRICA Quality Standard
                  </span>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
