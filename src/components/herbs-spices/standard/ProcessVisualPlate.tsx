"use client";

import React from "react";
import styles from "./ProcessVisualPlate.module.css";

interface ProcessVisualPlateProps {
  readonly stageId: string;
  readonly stageIndex: string;
  readonly stageTitle: string;
  readonly stageShortLabel: string;
  readonly stageDescription: string;
  readonly totalStagesFormatted: string;
  readonly isActive: boolean;
}

const STAGE_BOTANICAL_MEDIA: Record<string, { src: string; alt: string; objectPosition: string }> = {
  "herbs-spices-process:source": {
    src: "/assets/herbs-spices/home/form-whole.webp",
    alt: "Raw Egyptian whole botanical flowers and leaves at harvest",
    objectPosition: "center 45%",
  },
  "herbs-spices-process:prepare": {
    src: "/assets/herbs-spices/home/form-cut-sifted.webp",
    alt: "Handled and cut botanical material prepared for processing",
    objectPosition: "center 50%",
  },
  "herbs-spices-process:dry": {
    src: "/assets/herbs-spices/home/form-crushed.webp",
    alt: "Dehydrated and dried botanical surface texture",
    objectPosition: "center 52%",
  },
  "herbs-spices-process:grade": {
    src: "/assets/herbs-spices/home/form-tbc.webp",
    alt: "Sieved and graded botanical particles for infusion tea bag cuts",
    objectPosition: "center 48%",
  },
  "herbs-spices-process:pack": {
    src: "/assets/herbs-spices/home/form-powder.webp",
    alt: "Milled and export-ready packed botanical material",
    objectPosition: "center 46%",
  },
  "herbs-spices-process:export": {
    src: "/assets/herbs-spices/home/hero-primary.webp",
    alt: "Commercial botanical shipment and export handover standard",
    objectPosition: "center 40%",
  },
};

export function ProcessVisualPlate({
  stageId,
  stageIndex,
  stageTitle,
  stageShortLabel,
  stageDescription,
  totalStagesFormatted,
  isActive,
}: ProcessVisualPlateProps): React.JSX.Element {
  const media = STAGE_BOTANICAL_MEDIA[stageId] ?? {
    src: "/assets/herbs-spices/home/form-whole.webp",
    alt: `${stageTitle} botanical operational stage`,
    objectPosition: "center 50%",
  };

  return (
    <div
      id={`stage-panel-${stageIndex}`}
      role="tabpanel"
      aria-labelledby={`stage-tab-${stageIndex}`}
      className={`${styles.plateContainer} ${isActive ? styles.plateActive : ""}`}
      aria-hidden={!isActive}
    >
      <div className={styles.imageFrame}>
        <img
          src={media.src}
          alt={media.alt}
          className={styles.botanicalImage}
          style={{ objectPosition: media.objectPosition }}
          loading={stageIndex === "01" ? "eager" : "lazy"}
          draggable={false}
        />

        {/* Integrated Edge Title Plate with Subtle Dark Gradient (<35% height) */}
        <div className={styles.attachedPlate} aria-live="polite">
          <div className={styles.plateHeader}>
            <span className={styles.plateNumber}>{stageIndex}</span>
            <span className={styles.plateDivider}>/</span>
            <span className={styles.plateTotal}>{totalStagesFormatted}</span>
          </div>
          <h2 className={styles.plateTitle}>{stageTitle}</h2>
          {stageShortLabel && (
            <span className={styles.plateShortLabel}>{stageShortLabel}</span>
          )}
          <p className={styles.plateDescription}>{stageDescription}</p>
        </div>
      </div>
    </div>
  );
}
