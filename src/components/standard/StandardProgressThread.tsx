import React, { useState, useEffect } from "react";
import { JOURNEY_STAGES } from "@/data/stages";

export function StandardProgressThread(): React.JSX.Element {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const stageElements = JOURNEY_STAGES.map((s) =>
        document.getElementById(`stage-${s.id}`)
      );

      const viewportCenter = window.innerHeight * 0.45;

      for (let i = stageElements.length - 1; i >= 0; i--) {
        const el = stageElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportCenter) {
            setActiveStageIndex(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeStage = JOURNEY_STAGES[activeStageIndex] ?? JOURNEY_STAGES[0];
  const numStr = activeStageIndex < 9 ? `0${activeStageIndex + 1}` : `${activeStageIndex + 1}`;
  const stageNameUpper = activeStageIndex === 5 ? "EXPORT HANDOVER" : activeStage.name.toUpperCase();

  return (
    <>
      {/* Desktop Slim Left Indicator Rail */}
      <aside className="progress-thread-desktop" aria-label="Journey stage progress">
        <div className="thread-line-bg">
          <div
            className="thread-line-fill"
            style={{ height: `${((activeStageIndex + 1) / JOURNEY_STAGES.length) * 100}%` }}
          />
        </div>

        <ul className="thread-nodes-list">
          {JOURNEY_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            const nodeNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
            const labelUpper = idx === 5 ? "HANDOVER" : stage.name.toUpperCase();
            return (
              <li key={stage.id} className={`thread-node-item${isActive ? " is-active" : ""}`}>
                <a href={`#stage-${stage.id}`} className="thread-node-link">
                  <span className="thread-node-dot" />
                  <span className="thread-node-code">{nodeNum} {labelUpper}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile Lightweight Floating Micro Reader Pill */}
      <div className="progress-thread-mobile" aria-live="polite">
        <div className="mobile-pill-inner">
          <span className="mobile-pill-text">{numStr} / {stageNameUpper}</span>
          <div className="mobile-pill-bar-track">
            <div
              className="mobile-pill-bar-fill"
              style={{ width: `${((activeStageIndex + 1) / JOURNEY_STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
