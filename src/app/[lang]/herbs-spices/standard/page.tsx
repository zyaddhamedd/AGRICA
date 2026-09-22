import type { Metadata } from "next";
import React from "react";
import { HerbsSpicesStandardHero } from "@/components/herbs-spices/standard/HerbsSpicesStandardHero";
import { ProcessFinalSection } from "@/components/herbs-spices/standard/ProcessFinalSection";
import { ProcessInterlude } from "@/components/herbs-spices/standard/ProcessInterlude";
import { ProcessProgress } from "@/components/herbs-spices/standard/ProcessProgress";
import { ProcessStage } from "@/components/herbs-spices/standard/ProcessStage";
import { HERBS_SPICES_PROCESS_STAGES } from "@/data/herbs-spices/process";
import styles from "@/app/herbs-spices/standard/page.module.css";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { localizeHerbsProcessStages } from "@/content/standard/localize";

export const metadata: Metadata = {
  title: "Our process | Herbs & Spices",
  description: "A provisional process narrative for AGRICA Herbs & Spices.",
  robots: { index: false, follow: false },
};

export default async function HerbsSpicesStandardPage({ params }: { readonly params: Promise<{ lang: Locale }> }): Promise<React.JSX.Element> {
  const dictionary = await getDictionary((await params).lang);
  const stages = localizeHerbsProcessStages(HERBS_SPICES_PROCESS_STAGES, dictionary.standard);
  const openingStages = stages.slice(0, 3);
  const closingStages = stages.slice(3);

  return <main className={styles.page}>
    <HerbsSpicesStandardHero />
    <div className={styles.story}>
      <ProcessProgress stages={stages} />
      <div className={styles.sequence}>
        {openingStages.map((stage) => <ProcessStage key={stage.id} stage={stage} />)}
        <ProcessInterlude />
        {closingStages.map((stage) => <ProcessStage key={stage.id} stage={stage} />)}
      </div>
    </div>
    <ProcessFinalSection />
  </main>;
}
