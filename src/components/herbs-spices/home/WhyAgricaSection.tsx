"use client";

import React, { useRef, useState } from "react";
import { HOMEPAGE_WHY_AGRICA } from "@/data/herbs-spices/homepage";
import styles from "./WhyAgricaSection.module.css";

interface PillarDetail {
  tag: string;
  badge: string;
  icon: string;
}

const PILLAR_METADATA: Record<string, PillarDetail> = {
  "01": {
    tag: "Egyptian Terroir",
    badge: "Origin Traced",
    icon: "M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364",
  },
  "02": {
    tag: "Repeatable Standard",
    badge: "Lab Verified",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  "03": {
    tag: "Volume Agility",
    badge: "Commercial Scale",
    icon: "M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7M4 7c0-2 1.5-3 3.5-3h9c2 0 3.5 1 3.5 3M4 7l8 5 8-5",
  },
  "04": {
    tag: "Dedicated Desk",
    badge: "Direct Account",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  "05": {
    tag: "Export Ready",
    badge: "Certified COA",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  "06": {
    tag: "Global Reach",
    badge: "FOB & CIF Ports",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export function WhyAgricaSection(): React.JSX.Element {
  const pillars = HOMEPAGE_WHY_AGRICA;
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      className={styles.section}
      id="why-agrica"
      aria-label="04 / WHY AGRICA"
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>04 / WHY AGRICA</span>
        </div>

        {/* Interactive Spotlight Bento Grid */}
        <div className={styles.bentoGrid} ref={gridRef}>
          {pillars.map((pillar, index) => {
            const meta = PILLAR_METADATA[pillar.index] ?? {
              tag: "Standard",
              badge: "Verified",
              icon: "M12 3v18M3 12h18",
            };
            const isHovered = hoveredIndex === index;

            return (
              <article
                key={pillar.index}
                className={`${styles.bentoCard} ${isHovered ? styles.bentoCardActive : ""}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                tabIndex={0}
              >
                {/* Radial Glow Spotlight Overlay */}
                <div className={styles.spotlightGlow} aria-hidden="true" />
                <div className={styles.borderGlow} aria-hidden="true" />

                {/* Card Top Metadata & Icon */}
                <div className={styles.cardHeader}>
                  <div className={styles.metaGroup}>
                    <span className={styles.cardIndex}>{pillar.index}</span>
                    <span className={styles.tagBadge}>{meta.tag}</span>
                  </div>
                  <div className={styles.iconCircle} aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.iconSvg}
                    >
                      <path d={meta.icon} />
                    </svg>
                  </div>
                </div>

                {/* Card Headline & Narrative */}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{pillar.title}</h3>
                  <p className={styles.cardStatement}>{pillar.statement}</p>
                </div>

                {/* Card Footer Credential Badge */}
                <div className={styles.cardFooter}>
                  <span className={styles.badgeDot} aria-hidden="true" />
                  <span className={styles.badgeText}>{meta.badge}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

