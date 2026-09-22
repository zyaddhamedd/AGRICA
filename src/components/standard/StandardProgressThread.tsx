import React, { useState, useEffect } from "react";
import type { JourneyStage } from "@/types/agrica";
import { useStandardDictionary } from "@/i18n/locale-context";

export function StandardProgressThread({ stages }: { readonly stages: readonly JourneyStage[] }): React.JSX.Element {
  const ui = useStandardDictionary().produce.ui;
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const stageElements = stages.map((s, idx) => {
        const num = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
        return document.getElementById(`stage-${s.id}`) || document.getElementById(`stage-${num}`);
      });

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const triggerPoint = scrollY + viewportHeight * 0.4;

      let currentIndex = 0;
      stageElements.forEach((el, idx) => {
        if (el && el.offsetTop <= triggerPoint) {
          currentIndex = idx;
        }
      });

      setActiveStageIndex(currentIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [stages]);

  const activeStage = stages[activeStageIndex] ?? stages[0];
  const numStr = activeStageIndex < 9 ? `0${activeStageIndex + 1}` : `${activeStageIndex + 1}`;
  const stageNameUpper = activeStageIndex === 5 ? ui.exportHandover : activeStage.name;

  return (
    <>
      {/* Desktop Slim Left Indicator Rail */}
      <aside className="progress-thread-desktop" aria-label={ui.progressLabel}>
        <div className="thread-line-bg">
          <div
            className="thread-line-fill"
            style={{ height: `${((activeStageIndex + 1) / stages.length) * 100}%` }}
          />
        </div>

        <ul className="thread-nodes-list">
          {stages.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const nodeNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
            const labelUpper = idx === 5 ? ui.handover : stage.name;
            return (
              <li key={stage.id} className={`thread-node-item${isActive ? " is-active" : ""}`}>
                <a href={`#stage-${stage.id}`} className="thread-node-link" aria-current={isActive ? "step" : undefined}>
                  <span className="thread-node-dot" />
                  <span className="thread-node-code"><bdi>{nodeNum}</bdi> {labelUpper}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile Lightweight Floating Micro Reader Pill */}
      <div className="progress-thread-mobile" aria-live="polite" aria-label={ui.progressLabel}>
        <div className="mobile-pill-inner">
          <span className="mobile-pill-text"><bdi>{numStr}</bdi> / {stageNameUpper}</span>
          <div className="mobile-pill-bar-track">
            <div
              className="mobile-pill-bar-fill"
              style={{ width: `${((activeStageIndex + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
