"use client";

import React, { useState, useRef } from "react";
import type { HerbsSpicesProcessStage } from "@/types/herbs-spices-process";
import { ProcessVisualPlate } from "./ProcessVisualPlate";
import styles from "./ProcessAtlas.module.css";

interface ProcessAtlasProps {
  readonly stages: readonly HerbsSpicesProcessStage[];
}

export function ProcessAtlas({ stages }: ProcessAtlasProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = stages[activeIndex] ?? stages[0];
  const totalStagesFormatted = String(stages.length).padStart(2, "0");

  // Touch Swipe navigation on mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        setActiveIndex((prev) => (prev + 1) % stages.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + stages.length) % stages.length);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % stages.length);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + stages.length) % stages.length);
    }
  };

  return (
    <section
      className={styles.atlasSection}
      id="process-atlas"
      aria-label="Process Atlas Workspace"
    >
      <div className={styles.inner}>
        {/* Mobile Header (Hidden on Desktop) */}
        <div className={styles.mobileHeader}>
          <span className={styles.mobileHeaderLabel}>03 / PROCESS JOURNEY</span>
          <span className={styles.mobileHeaderCounter}>
            {activeStage.index} / {totalStagesFormatted}
          </span>
        </div>

        {/* Unified 2-Column Process Workspace */}
        <div className={styles.atlasGrid}>
          {/* Left: Quiet Botanical Stage Rail */}
          <aside className={styles.leftRail}>
            <div className={styles.railHeader}>
              <span className={styles.railLabel}>03 / PROCESS ATLAS</span>
              <span className={styles.railCounter}>
                {activeStage.index} / {totalStagesFormatted}
              </span>
            </div>

            <nav
              className={styles.stageNav}
              aria-label="Process journey stages"
              role="tablist"
            >
              {stages.map((stage, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    className={`${styles.stageNavItem} ${isActive ? styles.stageNavItemActive : ""}`}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    aria-selected={isActive}
                    role="tab"
                    id={`stage-tab-${stage.index}`}
                    aria-controls={`stage-panel-${stage.index}`}
                  >
                    <span className={styles.itemIndex}>{stage.index}</span>
                    <span className={styles.itemName}>{stage.title}</span>
                    <span className={styles.itemIndicator} aria-hidden="true" />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right: Botanical Process Plate Visual System */}
          <div className={styles.stageCol}>
            <div
              className={styles.visualFrame}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {stages.map((stage, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <ProcessVisualPlate
                    key={stage.id}
                    stageId={stage.id}
                    stageIndex={stage.index}
                    stageTitle={stage.title}
                    stageShortLabel={stage.shortLabel ?? ""}
                    stageDescription={stage.description}
                    totalStagesFormatted={totalStagesFormatted}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
