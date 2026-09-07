import React from "react";
import type { JourneyStage } from "@/types/agrica";
import { StageSelector } from "./StageSelector";
import { LotStage } from "./LotStage";
import { StageDetail } from "./StageDetail";

export interface JourneyWorkspaceProps {
  readonly stages: readonly JourneyStage[];
  readonly activeIndex: number;
  readonly onSelectStage: (index: number, bringIntoView?: boolean) => void;
}

export function JourneyWorkspace({
  stages,
  activeIndex,
  onSelectStage,
}: JourneyWorkspaceProps): React.JSX.Element {
  const currentStage = stages[activeIndex] ?? stages[0];

  return (
    <div className="journey-workspace" data-motion="standard-workspace">
      <StageSelector
        stages={stages}
        activeIndex={activeIndex}
        onSelectStage={onSelectStage}
      />
      <LotStage
        stage={currentStage}
        activeIndex={activeIndex}
        totalStages={stages.length}
      />
      <StageDetail
        stage={currentStage}
        activeIndex={activeIndex}
      />
    </div>
  );
}
