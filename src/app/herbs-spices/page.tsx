import React from "react";
import { AgricaTrustSection } from "@/components/herbs-spices/home/AgricaTrustSection";
import { HerbsSpicesHero } from "@/components/herbs-spices/home/HerbsSpicesHero";
import { HerbsSpicesTradeSection } from "@/components/herbs-spices/home/HerbsSpicesTradeSection";
import { IngredientFamiliesSection } from "@/components/herbs-spices/home/IngredientFamiliesSection";
import { IngredientFormsSection } from "@/components/herbs-spices/home/IngredientFormsSection";
import { ProcessTeaserSection } from "@/components/herbs-spices/home/ProcessTeaserSection";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./page.module.css";

export default function HerbsSpicesHomePage(): React.JSX.Element {
  return (
    <main className={styles.home} id="main">
      <HerbsSpicesHero />
      <IngredientFamiliesSection />
      <IngredientFormsSection />
      <ProcessTeaserSection />
      <AgricaTrustSection />
      <HerbsSpicesTradeSection
        trade={HERBS_SPICES_HOMEPAGE.trade}
        families={HERBS_SPICES_HOMEPAGE.families}
        forms={HERBS_SPICES_HOMEPAGE.forms}
      />
    </main>
  );
}
