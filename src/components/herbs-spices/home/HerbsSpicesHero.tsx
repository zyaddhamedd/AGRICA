"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import React from "react";
import styles from "./HerbsSpicesHero.module.css";

export function HerbsSpicesHero(): React.JSX.Element {
  return (
    <section className={styles.hero} aria-labelledby="herbs-spices-home-title">
      {/* Precision Lab Grid Canvas */}
      <div className={styles.canvasGrid} aria-hidden="true" />

      {/* Main Container */}
      <div className={styles.inner}>
        {/* Top Meta Bar */}
        <div className={styles.topMeta}>
          <div className={styles.kicker}>
            <span className={styles.originTag}>EGYPT</span>
            <span className={styles.kickerDivider} aria-hidden="true">
              /
            </span>
            <span className={styles.kickerBrand}>AGRICA / HERBS &amp; SPICES</span>
          </div>
          <div className={styles.specMeta} aria-hidden="true">
            <span>MEDICINAL &amp; AROMATIC PLANTS</span>
            <span className={styles.metaDivider}>|</span>
            <span>DIRECT B2B SUPPLY</span>
          </div>
        </div>

        {/* Main Stage */}
        <div className={styles.mainStage}>
          {/* Left Column: Typography & CTAs */}
          <div className={styles.copyBlock}>
            <div className={styles.headlineWrapper}>
              <h1 className={styles.title} id="herbs-spices-home-title">
                <span className={styles.titleLead}>FROM ORIGIN</span>
                <span className={styles.titleEmphasis}>to ingredient.</span>
              </h1>
            </div>

            <p className={styles.introduction}>
              An AGRICA world shaped around dried agricultural ingredients and
              international supply.
            </p>

            <div className={styles.actions}>
              <Link
                className={styles.primaryAction}
                href="/herbs-spices/products"
              >
                <span>EXPLORE INGREDIENTS</span>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
              <a className={styles.secondaryAction} href="#start-a-trade">
                <span>START A TRADE</span>
              </a>
            </div>
          </div>

          {/* Right Column: Botanical Specimen Study & Microscope Lab Field */}
          <div className={styles.specimenStage} aria-hidden="true">
            {/* Real Dried Botanical Petal Texture */}
            <div className={styles.petalImageContainer}>
              <Image
                src="/assets/herbs-spices/home/hero-specimen-study.jpg"
                alt="Dried botanical specimen morphology"
                fill
                priority
                sizes="(max-width: 960px) 75vw, 48vw"
                className={styles.petalImage}
              />
              <div className={styles.petalMaskOverlay} />
            </div>

            {/* Microscope & Coordinate Measurement Overlay */}
            <svg
              className={styles.measurementSvg}
              viewBox="0 0 640 640"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Calibration Circle */}
              <circle
                cx="380"
                cy="320"
                r="240"
                stroke="rgba(25, 56, 44, 0.22)"
                strokeWidth="1"
                className={styles.circleOuter}
              />

              {/* Inner Concentric Circle (Dashed) */}
              <circle
                cx="380"
                cy="320"
                r="165"
                stroke="rgba(25, 56, 44, 0.16)"
                strokeWidth="0.8"
                strokeDasharray="3 5"
                className={styles.circleInner}
              />

              {/* Center Crosshair (+) */}
              <circle
                cx="380"
                cy="320"
                r="4"
                fill="none"
                stroke="rgba(25, 56, 44, 0.45)"
                strokeWidth="0.8"
              />
              <circle cx="380" cy="320" r="1.5" fill="rgba(25, 56, 44, 0.6)" />
              <line
                x1="364"
                y1="320"
                x2="396"
                y2="320"
                stroke="rgba(25, 56, 44, 0.28)"
                strokeWidth="0.75"
              />
              <line
                x1="380"
                y1="304"
                x2="380"
                y2="336"
                stroke="rgba(25, 56, 44, 0.28)"
                strokeWidth="0.75"
              />

              {/* Grid Lines Through Specimen Field */}
              <line
                x1="120"
                y1="320"
                x2="640"
                y2="320"
                stroke="rgba(25, 56, 44, 0.08)"
                strokeWidth="0.75"
              />
              <line
                x1="380"
                y1="0"
                x2="380"
                y2="640"
                stroke="rgba(25, 56, 44, 0.08)"
                strokeWidth="0.75"
              />

              {/* Coordinates Top-Left */}
              <text
                x="310"
                y="155"
                fill="#4E6759"
                fontSize="8.5"
                fontFamily="var(--hs-font-sans)"
                fontWeight="500"
                letterSpacing="0.08em"
              >
                34.0522° N
              </text>
              <text
                x="310"
                y="167"
                fill="#4E6759"
                fontSize="8.5"
                fontFamily="var(--hs-font-sans)"
                fontWeight="500"
                letterSpacing="0.08em"
              >
                31.2357° E
              </text>

              {/* Specimen ID Tag */}
              <text
                x="410"
                y="485"
                fill="#4E6759"
                fontSize="8"
                fontFamily="var(--hs-font-sans)"
                fontWeight="600"
                letterSpacing="0.1em"
              >
                C. AROMATICA
              </text>
              <text
                x="410"
                y="497"
                fill="#7E9388"
                fontSize="7.5"
                fontFamily="var(--hs-font-sans)"
                letterSpacing="0.08em"
              >
                SPECIMEN 001
              </text>

              {/* Leader Lines with Anchor Dots */}
              {/* Leader Line 1 (to top coordinate) */}
              <line
                x1="380"
                y1="190"
                x2="520"
                y2="140"
                stroke="rgba(25, 56, 44, 0.3)"
                strokeWidth="0.75"
              />
              <circle cx="380" cy="190" r="2.5" fill="#19382C" />
              <circle cx="520" cy="140" r="2.5" fill="#19382C" />

              {/* Leader Line 2 (to center specimen) */}
              <line
                x1="485"
                y1="350"
                x2="560"
                y2="420"
                stroke="rgba(25, 56, 44, 0.3)"
                strokeWidth="0.75"
              />
              <circle cx="485" cy="350" r="2.5" fill="#19382C" />
              <circle cx="560" cy="420" r="2.5" fill="#19382C" />

              {/* Particle Measurement Dimension Bracket */}
              <g className={styles.particleDimension}>
                <text
                  x="295"
                  y="535"
                  fill="#7E9388"
                  fontSize="7.5"
                  fontFamily="var(--hs-font-sans)"
                  fontWeight="600"
                  letterSpacing="0.08em"
                >
                  PARTICLE
                </text>
                <text
                  x="295"
                  y="546"
                  fill="#4E6759"
                  fontSize="7.5"
                  fontFamily="var(--hs-font-sans)"
                  letterSpacing="0.06em"
                >
                  ~ 0.8 mm
                </text>
                <line
                  x1="345"
                  y1="532"
                  x2="345"
                  y2="548"
                  stroke="rgba(25, 56, 44, 0.35)"
                  strokeWidth="0.75"
                />
                <line
                  x1="345"
                  y1="540"
                  x2="355"
                  y2="540"
                  stroke="rgba(25, 56, 44, 0.35)"
                  strokeWidth="0.75"
                />
              </g>

              {/* Technical Measurement Specs Bottom-Right */}
              <text
                x="535"
                y="548"
                fill="#4E6759"
                fontSize="8.5"
                fontFamily="var(--hs-font-sans)"
                letterSpacing="0.06em"
              >
                Ø 12.4 mm
              </text>
              <text
                x="535"
                y="562"
                fill="#4E6759"
                fontSize="8.5"
                fontFamily="var(--hs-font-sans)"
                letterSpacing="0.06em"
              >
                T 0.3 mm
              </text>
              <text
                x="535"
                y="576"
                fill="#4E6759"
                fontSize="8.5"
                fontFamily="var(--hs-font-sans)"
                letterSpacing="0.06em"
              >
                N 120×
              </text>

              {/* Botanical Seeds & Particles */}
              <ellipse
                cx="395"
                cy="235"
                rx="5"
                ry="3"
                transform="rotate(-25 395 235)"
                fill="#B89B56"
                opacity="0.8"
              />
              <ellipse
                cx="305"
                cy="440"
                rx="6"
                ry="3.5"
                transform="rotate(35 305 440)"
                fill="#B89B56"
                opacity="0.8"
              />
              <ellipse
                cx="375"
                cy="495"
                rx="5.5"
                ry="3"
                transform="rotate(-40 375 495)"
                fill="#A68442"
                opacity="0.75"
              />
              <circle cx="360" cy="460" r="3" fill="#B89B56" opacity="0.65" />
              <circle cx="430" cy="270" r="1.5" fill="#8C7355" opacity="0.5" />
              <circle cx="320" cy="380" r="1.2" fill="#8C7355" opacity="0.5" />
            </svg>
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
