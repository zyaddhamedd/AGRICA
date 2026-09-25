"use client";

import Image from "next/image";
import React, { useState } from "react";
import { HOMEPAGE_PROCESS_STAGES, HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./SourceToSpecificationSection.module.css";

const visualMoments = {
  source: {
    src: "/assets/standard_stage_01_source.jpg",
    alt: "Egyptian agricultural cultivation and botanical harvest fields",
    caption: "Origin Harvest · Egypt",
  },
  quality: {
    src: "/assets/herbs-spices/products/chamomile.webp",
    alt: "Botanical material physical purity inspection",
    caption: "Physical Inspection",
  },
  export: {
    src: "/assets/standard_stage_06_export_handover.jpg",
    alt: "Export packaging and container preparation",
    caption: "Container Dispatch",
  },
};

export function SourceToSpecificationSection(): React.JSX.Element {
  const stages = HOMEPAGE_PROCESS_STAGES;
  const intro = HERBS_SPICES_HOMEPAGE.processIntro;
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section className={styles.section} id="source-to-specification" aria-labelledby="process-title">
      <div className={styles.inner}>
        {/* Concise Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <p className={styles.eyebrow}>{intro.eyebrow}</p>
            <span className={styles.scopeTag}>Process Journey</span>
          </div>
          <div className={styles.headerContent}>
            <h2 id="process-title" className={styles.title}>{intro.title}</h2>
            <p className={styles.description}>{intro.description}</p>
          </div>
        </header>

        {/* Desktop Process Journey with Interspersed Visual Moments */}
        <div className={styles.journeyDesktop}>
          {/* Phase 1: Stages 01 & 02 + Field Visual */}
          <div className={styles.journeySegment}>
            <div className={styles.stageBlock}>
              <div
                className={`${styles.step} ${activeStage === 0 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(0)}
              >
                <span className={styles.stepNum}>{stages[0].index}</span>
                <h3 className={styles.stepTitle}>{stages[0].title}</h3>
                <p className={styles.stepSummary}>{stages[0].summary}</p>
              </div>

              <div
                className={`${styles.step} ${activeStage === 1 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(1)}
              >
                <span className={styles.stepNum}>{stages[1].index}</span>
                <h3 className={styles.stepTitle}>{stages[1].title}</h3>
                <p className={styles.stepSummary}>{stages[1].summary}</p>
              </div>
            </div>

            <div className={styles.visualMoment}>
              <div className={styles.imageFrame}>
                <Image
                  src={visualMoments.source.src}
                  alt={visualMoments.source.alt}
                  fill
                  sizes="(max-width: 960px) 100vw, 32vw"
                  className={styles.momentImg}
                />
                <span className={styles.momentCaption}>{visualMoments.source.caption}</span>
              </div>
            </div>
          </div>

          {/* Connective Thread */}
          <div className={styles.trackDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot} />
          </div>

          {/* Phase 2: Stages 03 & 04 + Quality Inspection Visual */}
          <div className={styles.journeySegment}>
            <div className={styles.visualMoment}>
              <div className={styles.imageFrame}>
                <Image
                  src={visualMoments.quality.src}
                  alt={visualMoments.quality.alt}
                  fill
                  sizes="(max-width: 960px) 100vw, 32vw"
                  className={styles.momentImg}
                />
                <span className={styles.momentCaption}>{visualMoments.quality.caption}</span>
              </div>
            </div>

            <div className={styles.stageBlock}>
              <div
                className={`${styles.step} ${activeStage === 2 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(2)}
              >
                <span className={styles.stepNum}>{stages[2].index}</span>
                <h3 className={styles.stepTitle}>{stages[2].title}</h3>
                <p className={styles.stepSummary}>{stages[2].summary}</p>
              </div>

              <div
                className={`${styles.step} ${activeStage === 3 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(3)}
              >
                <span className={styles.stepNum}>{stages[3].index}</span>
                <h3 className={styles.stepTitle}>{stages[3].title}</h3>
                <p className={styles.stepSummary}>{stages[3].summary}</p>
              </div>
            </div>
          </div>

          {/* Connective Thread */}
          <div className={styles.trackDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot} />
          </div>

          {/* Phase 3: Stages 05 & 06 + Export Handover Visual */}
          <div className={styles.journeySegment}>
            <div className={styles.stageBlock}>
              <div
                className={`${styles.step} ${activeStage === 4 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(4)}
              >
                <span className={styles.stepNum}>{stages[4].index}</span>
                <h3 className={styles.stepTitle}>{stages[4].title}</h3>
                <p className={styles.stepSummary}>{stages[4].summary}</p>
              </div>

              <div
                className={`${styles.step} ${activeStage === 5 ? styles.stepActive : ""}`}
                onMouseEnter={() => setActiveStage(5)}
              >
                <span className={styles.stepNum}>{stages[5].index}</span>
                <h3 className={styles.stepTitle}>{stages[5].title}</h3>
                <p className={styles.stepSummary}>{stages[5].summary}</p>
              </div>
            </div>

            <div className={styles.visualMoment}>
              <div className={styles.imageFrame}>
                <Image
                  src={visualMoments.export.src}
                  alt={visualMoments.export.alt}
                  fill
                  sizes="(max-width: 960px) 100vw, 32vw"
                  className={styles.momentImg}
                />
                <span className={styles.momentCaption}>{visualMoments.export.caption}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Vertical Story */}
        <div className={styles.mobileJourney}>
          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[0].index}</span>
            <h3 className={styles.mobileTitle}>{stages[0].title}</h3>
            <p className={styles.mobileSummary}>{stages[0].summary}</p>
          </div>

          <div className={styles.mobileMomentFrame}>
            <Image
              src={visualMoments.source.src}
              alt={visualMoments.source.alt}
              fill
              sizes="100vw"
              className={styles.momentImg}
            />
            <span className={styles.momentCaption}>{visualMoments.source.caption}</span>
          </div>

          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[1].index}</span>
            <h3 className={styles.mobileTitle}>{stages[1].title}</h3>
            <p className={styles.mobileSummary}>{stages[1].summary}</p>
          </div>

          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[2].index}</span>
            <h3 className={styles.mobileTitle}>{stages[2].title}</h3>
            <p className={styles.mobileSummary}>{stages[2].summary}</p>
          </div>

          <div className={styles.mobileMomentFrame}>
            <Image
              src={visualMoments.quality.src}
              alt={visualMoments.quality.alt}
              fill
              sizes="100vw"
              className={styles.momentImg}
            />
            <span className={styles.momentCaption}>{visualMoments.quality.caption}</span>
          </div>

          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[3].index}</span>
            <h3 className={styles.mobileTitle}>{stages[3].title}</h3>
            <p className={styles.mobileSummary}>{stages[3].summary}</p>
          </div>

          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[4].index}</span>
            <h3 className={styles.mobileTitle}>{stages[4].title}</h3>
            <p className={styles.mobileSummary}>{stages[4].summary}</p>
          </div>

          <div className={styles.mobileStep}>
            <span className={styles.mobileNum}>{stages[5].index}</span>
            <h3 className={styles.mobileTitle}>{stages[5].title}</h3>
            <p className={styles.mobileSummary}>{stages[5].summary}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
