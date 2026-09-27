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
      aria-label="03 / PROCESS JOURNEY"
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            03 / PROCESS JOURNEY
          </span>
        </div>

        {/* ScrollStack Component in Page Flow */}
        <ScrollStack
          className={styles.stackScroller}
          itemDistance={50}
          itemScale={0.03}
          itemStackDistance={20}
          stackPosition="20%"
          scaleEndPosition="10%"
          baseScale={0.9}
          rotationAmount={0}
          blurAmount={0}
          useWindowScroll={true}
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
                <span className={styles.cardHeaderRule} aria-hidden="true" />
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
    </section>
  );
}
