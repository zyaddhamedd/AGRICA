"use client";

import React from "react";
import LogoLoop, { LogoItem } from "@/components/ui/LogoLoop/LogoLoop";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./QualityDocumentationSection.module.css";

const CERTIFICATE_LOGOS: LogoItem[] = [
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_20_55 PM-1.png",
    alt: "Agricultural Quality & Export Certificate 1",
    title: "Phytosanitary & Export Compliance Certificate",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_20_57 PM-2.png",
    alt: "Agricultural Quality & Export Certificate 2",
    title: "ISO Quality Management Accreditation",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_21_05 PM-1.png",
    alt: "Agricultural Quality & Export Certificate 3",
    title: "Organic & Sustainable Farming Verification",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_21_07 PM-2.png",
    alt: "Agricultural Quality & Export Certificate 4",
    title: "Food Safety & Hygiene Standard Clearance",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_21_08 PM-3.png",
    alt: "Agricultural Quality & Export Certificate 5",
    title: "International Origin Certificate of Analysis",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_21_12 PM.png",
    alt: "Agricultural Quality & Export Certificate 6",
    title: "Botanical Purity & Specification Clearance",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_21_19 PM.png",
    alt: "Agricultural Quality & Export Certificate 7",
    title: "Global Export & Quarantine Clearance",
  },
  {
    src: "/certificates/ChatGPT Image Sep 27, 2026, 08_23_17 PM.png",
    alt: "Agricultural Quality & Export Certificate 8",
    title: "Certified Egyptian Origin Export Verification",
  },
];

export function QualityDocumentationSection(): React.JSX.Element {
  const intro = HERBS_SPICES_HOMEPAGE.qualityIntro;

  return (
    <section
      className={styles.section}
      id="quality-documentation"
      aria-label={intro.eyebrow || "06 / DOCUMENTATION"}
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            {intro.eyebrow || "06 / DOCUMENTATION"}
          </span>
        </div>

        {/* LogoLoop Carousel Container */}
        <div className={styles.loopWrapper}>
          <LogoLoop
            logos={CERTIFICATE_LOGOS}
            speed={50}
            direction="left"
            logoHeight={80}
            gap={48}
            pauseOnHover={true}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="#f4f1ea"
            ariaLabel="Export and quality certificates"
            className={styles.certificateLoop}
            renderItem={(item, key) => (
              <div className={styles.certCard} key={key}>
                <img
                  src={item.src}
                  alt={item.alt ?? "Certificate"}
                  title={item.title}
                  className={styles.certImage}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            )}
          />
        </div>

        {/* Quiet Reassurance Strip */}
        <div className={styles.footerStrip}>
          <span className={styles.footerDot} aria-hidden="true" />
          <p className={styles.footerNote}>
            All export shipments are accompanied by authenticated phytosanitary, origin, and batch analysis documentation.
          </p>
        </div>
      </div>
    </section>
  );
}

