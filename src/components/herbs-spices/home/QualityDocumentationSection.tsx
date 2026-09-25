"use client";

import React, { useState } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { HOMEPAGE_QUALITY_DOCS, HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./QualityDocumentationSection.module.css";

export function QualityDocumentationSection(): React.JSX.Element {
  const docs = HOMEPAGE_QUALITY_DOCS;
  const intro = HERBS_SPICES_HOMEPAGE.qualityIntro;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={styles.section} id="quality-documentation" aria-labelledby="quality-title">
      <div className={styles.inner}>
        {/* Concise Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <span className={styles.scopeTag}>Export Desk Register</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="quality-title" className={styles.title}>{intro.title}</h2>
            <p className={styles.description}>{intro.description}</p>
          </div>
        </header>

        {/* Technical Document Register with Tap-to-Reveal */}
        <div className={styles.register}>
          <ol className={styles.registerList}>
            {docs.map((doc, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <li key={doc.index} className={styles.registerItem}>
                  <button
                    type="button"
                    className={`${styles.rowButton} ${isExpanded ? styles.rowButtonActive : ""}`}
                    onClick={() => toggleRow(index)}
                    aria-expanded={isExpanded}
                  >
                    <div className={styles.rowMain}>
                      <span className={styles.docCode}>{doc.index}</span>
                      <h3 className={styles.docTitle}>{doc.title}</h3>
                    </div>

                    <div className={styles.rowSummary}>
                      <span>{doc.summary}</span>
                      <span className={styles.expandIcon} aria-hidden="true">
                        {isExpanded ? "−" : "+"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.rowDetail}>
                      <p>{doc.detail}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Quiet Reassurance Strip */}
        <div className={styles.footerStrip}>
          <p className={styles.footerNote}>
            Technical specification sheets and courier evaluation samples are dispatched upon request.
          </p>
          <Link href="#start-a-trade" className={styles.actionBtn}>
            <span>Request Specifications</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
