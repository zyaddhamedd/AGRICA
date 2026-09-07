import React from "react";
import type { JourneyStage } from "@/types/agrica";

export interface StageDetailProps {
  readonly stage: JourneyStage;
  readonly activeIndex: number;
}

export function StageDetail({
  stage,
  activeIndex,
}: StageDetailProps): React.JSX.Element {
  const paddedIndex = String(activeIndex + 1).padStart(2, "0");

  return (
    <article
      className="stage-detail"
      id="stage-detail"
      role="tabpanel"
      aria-live="polite"
    >
      <div className="detail-index">
        <span id="detail-number">{paddedIndex}</span>
        <span>of 06</span>
      </div>
      <p className="detail-kicker" id="detail-kicker">
        {stage.kicker}
      </p>
      <h2 id="detail-title">{stage.name}</h2>
      <p id="detail-copy">{stage.copy}</p>
      <dl id="detail-facts">
        {stage.facts.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
