import type { Metadata } from "next";
import React from "react";
import { ProcessIntro } from "@/components/herbs-spices/standard/ProcessIntro";
import { ProcessAtlas } from "@/components/herbs-spices/standard/ProcessAtlas";
import { ProcessOutro } from "@/components/herbs-spices/standard/ProcessOutro";
import { HERBS_SPICES_PROCESS_STAGES } from "@/data/herbs-spices/process";
import styles from "@/app/herbs-spices/standard/page.module.css";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { localizeHerbsProcessStages } from "@/content/standard/localize";

export const metadata: Metadata = {
  title: "Process Journey | AGRICA Herbs & Spices",
  description: "Six structured stages connecting raw Egyptian botanical material to commercial export format.",
};

export default async function HerbsSpicesStandardPage({
  params,
}: {
  readonly params: Promise<{ lang: Locale }>;
}): Promise<React.JSX.Element> {
  const dictionary = await getDictionary((await params).lang);
  const stages = localizeHerbsProcessStages(
    HERBS_SPICES_PROCESS_STAGES,
    dictionary.standard,
  );

  return (
    <main className={styles.page}>
      {/* A. Compact Process Intro */}
      <ProcessIntro />

      {/* B. Process Atlas (Unified 6-Stage Workspace) */}
      <ProcessAtlas stages={stages} />

      {/* C. Quiet Closing Statement & D. Final CTA */}
      <ProcessOutro />
    </main>
  );
}

