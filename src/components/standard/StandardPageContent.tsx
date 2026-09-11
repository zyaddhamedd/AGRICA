"use client";

import React from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { JOURNEY_STAGES } from "@/data/stages";
import { StandardMonolithHero } from "./StandardMonolithHero";
import { StandardProgressThread } from "./StandardProgressThread";
import { StandardStageBlock } from "./StandardStageBlock";

export function StandardPageContent(): React.JSX.Element {
  return (
    <div className="standard-page">
      <SiteHeader variant="standard" />

      <main id="standard-monolith-main">
        {/* Cinematic Compact Monolith Hero */}
        <StandardMonolithHero />

        {/* Minimalist Progress Thread Indicator */}
        <StandardProgressThread />

        {/* 6 Layered Stage Blocks */}
        <div className="standard-stages-container">
          {JOURNEY_STAGES.map((stage, idx) => (
            <StandardStageBlock
              key={stage.id}
              stage={stage}
              index={idx}
              isCulmination={idx === JOURNEY_STAGES.length - 1}
            />
          ))}
        </div>
      </main>

      <SiteFooter variant="standard" />
    </div>
  );
}
