import type { Metadata } from "next";
import React from "react";
import { HerbsSpicesStandardHero } from "@/components/herbs-spices/standard/HerbsSpicesStandardHero";
import { ProcessFinalSection } from "@/components/herbs-spices/standard/ProcessFinalSection";
import { ProcessInterlude } from "@/components/herbs-spices/standard/ProcessInterlude";
import { ProcessProgress } from "@/components/herbs-spices/standard/ProcessProgress";
import { ProcessStage } from "@/components/herbs-spices/standard/ProcessStage";
import { HERBS_SPICES_PROCESS_STAGES } from "@/data/herbs-spices/process";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Our process | Herbs & Spices",
  description: "A provisional process narrative for AGRICA Herbs & Spices.",
  robots: { index: false, follow: false },
};

export default function HerbsSpicesStandardPage(): React.JSX.Element {
  const openingStages = HERBS_SPICES_PROCESS_STAGES.slice(0, 3);
  const closingStages = HERBS_SPICES_PROCESS_STAGES.slice(3);

  return <main className={styles.page}>
    <HerbsSpicesStandardHero />
    <div className={styles.story}>
      <ProcessProgress stages={HERBS_SPICES_PROCESS_STAGES} />
      <div className={styles.sequence}>
        {openingStages.map((stage) => <ProcessStage key={stage.id} stage={stage} />)}
        <ProcessInterlude />
        {closingStages.map((stage) => <ProcessStage key={stage.id} stage={stage} />)}
      </div>
    </div>
    <ProcessFinalSection />
  </main>;
}
