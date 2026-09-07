"use client";

import React, { useRef, useEffect } from "react";
import type { JourneyStage } from "@/types/agrica";

export interface StageSelectorProps {
  readonly stages: readonly JourneyStage[];
  readonly activeIndex: number;
  readonly onSelectStage: (index: number, bringIntoView?: boolean) => void;
}

export function StageSelector({
  stages,
  activeIndex,
  onSelectStage,
}: StageSelectorProps): React.JSX.Element {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    let nextIndex = activeIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = Math.min(activeIndex + 1, stages.length - 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = Math.max(activeIndex - 1, 0);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = stages.length - 1;
    }

    if (nextIndex !== activeIndex) {
      onSelectStage(nextIndex, true);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const handleButtonClick = (index: number) => {
    onSelectStage(index, true);
    buttonRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div
      className="stage-selector"
      id="stage-selector"
      role="tablist"
      aria-label="Export journey stages"
      onKeyDown={handleKeyDown}
    >
      {stages.map((stage, index) => {
        const isActive = index === activeIndex;
        const paddedNumber = String(index + 1).padStart(2, "0");

        return (
          <button
            key={stage.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            className={`stage-button${isActive ? " is-active" : ""}`}
            role="tab"
            aria-selected={isActive}
            aria-controls="stage-detail"
            tabIndex={isActive ? 0 : -1}
            data-index={index}
            onClick={() => handleButtonClick(index)}
          >
            <span>{paddedNumber}</span>
            <strong>{stage.name}</strong>
            <i aria-hidden="true"></i>
          </button>
        );
      })}
    </div>
  );
}
