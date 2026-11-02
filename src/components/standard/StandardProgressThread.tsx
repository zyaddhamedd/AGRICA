import React, { useState, useEffect, useRef } from "react";
import type { JourneyStage } from "@/types/agrica";
import { useStandardDictionary } from "@/i18n/locale-context";

export function StandardProgressThread({ stages }: { readonly stages: readonly JourneyStage[] }): React.JSX.Element {
  const ui = useStandardDictionary().produce.ui;
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || stages.length === 0) return;

    // In-memory cache of document vertical offsets (top coordinates) and viewport height
    let cachedTops: number[] = new Array(stages.length).fill(0);
    let cachedViewportHeight = window.innerHeight;

    const measureGeometries = () => {
      cachedViewportHeight = window.innerHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      cachedTops = stages.map((s, idx) => {
        const num = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
        const el = document.getElementById(`stage-${s.id}`) || document.getElementById(`stage-${num}`);
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.top + scrollY;
      });
    };

    const updateActiveStage = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const triggerPoint = scrollY + cachedViewportHeight * 0.4;

      let currentIndex = 0;
      for (let i = 0; i < cachedTops.length; i++) {
        const top = cachedTops[i];
        if (top > 0 && top <= triggerPoint) {
          currentIndex = i;
        }
      }

      if (currentIndex !== activeIndexRef.current) {
        activeIndexRef.current = currentIndex;
        setActiveStageIndex(currentIndex);
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = window.requestAnimationFrame(() => {
          rafIdRef.current = null;
          updateActiveStage();
        });
      }
    };

    let resizeRafId: number | null = null;
    const handleResize = () => {
      if (resizeRafId === null) {
        resizeRafId = window.requestAnimationFrame(() => {
          resizeRafId = null;
          measureGeometries();
          updateActiveStage();
        });
      }
    };

    // Initial measurement scheduled in animation frame to avoid synchronous layout reads during mount
    const initialRaf = window.requestAnimationFrame(() => {
      measureGeometries();
      updateActiveStage();
    });

    // Observe stage element geometry updates (e.g. image loads, responsive reflows)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        handleResize();
      });

      stages.forEach((s, idx) => {
        const num = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
        const el = document.getElementById(`stage-${s.id}`) || document.getElementById(`stage-${num}`);
        if (el) ro?.observe(el);
      });
    }

    // Font loading safeguard: measure again if web fonts shift line heights or block sizes
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        measureGeometries();
        updateActiveStage();
      }).catch(() => {
        // Fallback gracefully if fonts.ready rejects
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (resizeRafId !== null) {
        window.cancelAnimationFrame(resizeRafId);
        resizeRafId = null;
      }
      window.cancelAnimationFrame(initialRaf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
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
