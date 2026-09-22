import React from "react";
import type { JourneyStage } from "@/types/agrica";
import { useStandardDictionary } from "@/i18n/locale-context";

export interface LotStageProps {
  readonly stage: JourneyStage;
  readonly activeIndex: number;
  readonly totalStages: number;
}

export function LotStage({
  stage,
  activeIndex,
  totalStages,
}: LotStageProps): React.JSX.Element {
  const ui = useStandardDictionary().produce.ui;
  const paddedIndex = String(activeIndex + 1).padStart(2, "0");
  const progressPercent =
    totalStages > 1 ? (activeIndex / (totalStages - 1)) * 100 : 0;

  return (
    <div className="lot-stage" id="lot-stage" data-motion="lot-stage">
      <div className="stage-grid" aria-hidden="true"></div>
      <span className="stage-watermark" id="stage-watermark" aria-hidden="true">
        {paddedIndex}
      </span>
      <div className="route-line" aria-hidden="true">
        <i
          id="route-progress"
          style={{ width: `${progressPercent}%` }}
        ></i>
      </div>
      <div className="lot-card" data-motion="agrica-lot">
        <div className="lot-card-top">
          <strong>AGRĪCA</strong>
          <bdi id="lot-code">{stage.code}</bdi>
        </div>
        <div className="lot-card-main">
          <span>{ui.exportProgramme}</span>
          <strong id="lot-status">{stage.status}</strong>
          <i className="lot-stamp" id="lot-stamp">
            {stage.stamp}
          </i>
        </div>
        <div className="lot-card-foot">
          <span>{ui.egypt}</span>
          <bdi id="lot-step">{paddedIndex} / 06</bdi>
        </div>
      </div>
      <bdi className="stage-coordinate" id="stage-coordinate">
        {stage.coordinate}
      </bdi>
    </div>
  );
}
