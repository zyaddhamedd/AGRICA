"use client";

import React from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { JOURNEY_STAGES } from "@/data/stages";
import { StandardMonolithHero } from "./StandardMonolithHero";
import { StandardProgressThread } from "./StandardProgressThread";
import { StandardStageBlock } from "./StandardStageBlock";
import { StandardFinalStageBlock } from "./StandardFinalStageBlock";
import { StandardProofInterlude } from "./StandardProofInterlude";
import { useStandardDictionary } from "@/i18n/locale-context";
import { localizeJourneyStages } from "@/content/standard/localize";

export function StandardPageContent(): React.JSX.Element {
  const dictionary = useStandardDictionary();
  const stages = localizeJourneyStages(JOURNEY_STAGES, dictionary);
  return (
    <div className="standard-page">
      <SiteHeader variant="standard" />

      <main id="standard-monolith-main">
        {/* Cinematic Compact Monolith Hero */}
        <StandardMonolithHero />

        {/* Minimalist Progress Thread Indicator */}
        <StandardProgressThread stages={stages} />

        {/* 6 Layered Stage Blocks with Mid-Page Interlude & Stage 06 Final Payoff */}
        <div className="standard-stages-container">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              {idx === stages.length - 1 ? (
                <StandardFinalStageBlock stage={stage} index={idx} />
              ) : (
                <StandardStageBlock stage={stage} index={idx} />
              )}
              {idx === 2 && <StandardProofInterlude />}
            </React.Fragment>
          ))}
        </div>
      </main>

      <SiteFooter variant="standard" />
    </div>
  );
}
