"use client";

import React from "react";
import LogoLoop, { LogoItem } from "@/components/ui/LogoLoop/LogoLoop";
import styles from "./QualityDocumentationSection.module.css";

const CERTIFICATE_LOGOS: LogoItem[] = [
  {
    src: "/certificates/webp/cert-01-phytosanitary-240.webp",
    srcSet: "/certificates/webp/cert-01-phytosanitary-160.webp 160w, /certificates/webp/cert-01-phytosanitary-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 1",
    title: "Phytosanitary & Export Compliance Certificate",
  },
  {
    src: "/certificates/webp/cert-02-iso-240.webp",
    srcSet: "/certificates/webp/cert-02-iso-160.webp 160w, /certificates/webp/cert-02-iso-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 2",
    title: "ISO Quality Management Accreditation",
  },
  {
    src: "/certificates/webp/cert-03-organic-240.webp",
    srcSet: "/certificates/webp/cert-03-organic-160.webp 160w, /certificates/webp/cert-03-organic-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 3",
    title: "Organic & Sustainable Farming Verification",
  },
  {
    src: "/certificates/webp/cert-04-food-safety-240.webp",
    srcSet: "/certificates/webp/cert-04-food-safety-160.webp 160w, /certificates/webp/cert-04-food-safety-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 4",
    title: "Food Safety & Hygiene Standard Clearance",
  },
  {
    src: "/certificates/webp/cert-05-origin-coa-240.webp",
    srcSet: "/certificates/webp/cert-05-origin-coa-160.webp 160w, /certificates/webp/cert-05-origin-coa-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 5",
    title: "International Origin Certificate of Analysis",
  },
  {
    src: "/certificates/webp/cert-06-botanical-purity-240.webp",
    srcSet: "/certificates/webp/cert-06-botanical-purity-160.webp 160w, /certificates/webp/cert-06-botanical-purity-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 240,
    alt: "Agricultural Quality & Export Certificate 6",
    title: "Botanical Purity & Specification Clearance",
  },
  {
    src: "/certificates/webp/cert-07-global-export-240.webp",
    srcSet: "/certificates/webp/cert-07-global-export-160.webp 160w, /certificates/webp/cert-07-global-export-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 226,
    alt: "Agricultural Quality & Export Certificate 7",
    title: "Global Export & Quarantine Clearance",
  },
  {
    src: "/certificates/webp/cert-08-egyptian-origin-240.webp",
    srcSet: "/certificates/webp/cert-08-egyptian-origin-160.webp 160w, /certificates/webp/cert-08-egyptian-origin-240.webp 240w",
    sizes: "(max-width: 640px) 110px, 150px",
    width: 240,
    height: 180,
    alt: "Agricultural Quality & Export Certificate 8",
    title: "Certified Egyptian Origin Export Verification",
  },
];

export function QualityDocumentationSection(): React.JSX.Element {
  return (
    <section
      className={styles.section}
      id="quality-documentation"
      aria-label="05 / DOCUMENTATION"
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            05 / DOCUMENTATION
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
                  srcSet={item.srcSet}
                  sizes={item.sizes ?? "(max-width: 640px) 110px, 150px"}
                  width={item.width}
                  height={item.height}
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

