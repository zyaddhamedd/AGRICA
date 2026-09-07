"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { JOURNEY_STAGES } from "@/data/stages";
import { JourneyWorkspace } from "./JourneyWorkspace";
import { ControlRegister } from "./ControlRegister";
import { StandardClose } from "./StandardClose";
import { MobileBriefBar } from "./MobileBriefBar";

export function StandardPageContent(): React.JSX.Element {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const currentStage = JOURNEY_STAGES[activeStageIndex] ?? JOURNEY_STAGES[0];

  // Synchronize document.body.dataset.stage for full prototype fidelity
  useEffect(() => {
    document.body.dataset.stage = currentStage.id;

    return () => {
      delete document.body.dataset.stage;
    };
  }, [currentStage.id]);

  const handleSelectStage = useCallback((index: number) => {
    if (index >= 0 && index < JOURNEY_STAGES.length) {
      setActiveStageIndex(index);
    }
  }, []);

  return (
    <div className="standard-page" data-stage={currentStage.id}>
      <SiteHeader variant="standard" />
      <main>
        <section
          className="standard-intro"
          id="standard-journey"
          aria-labelledby="standard-title"
        >
          <div className="intro-heading">
            <p className="eyebrow">One connected operating standard</p>
            <h1 id="standard-title">
              One lot.
              <br />
              <em>Every step</em>
              <br />
              accounted for.
            </h1>
          </div>
          <div className="intro-note">
            <span>AGR / CONTROL / 01—06</span>
            <p>
              Move through the journey to see how one AGRICA lot is managed from
              Egyptian origin to export handover.
            </p>
          </div>

          <JourneyWorkspace
            stages={JOURNEY_STAGES}
            activeIndex={activeStageIndex}
            onSelectStage={handleSelectStage}
          />
        </section>

        <ControlRegister />
        <StandardClose />
      </main>
      <SiteFooter variant="standard" />
      <MobileBriefBar />
    </div>
  );
}
