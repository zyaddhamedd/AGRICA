import React from "react";
import { AgricaTrustSection } from "@/components/herbs-spices/home/AgricaTrustSection";
import { HerbsSpicesHero } from "@/components/herbs-spices/home/HerbsSpicesHero";
import { HerbsSpicesTradeSection } from "@/components/herbs-spices/home/HerbsSpicesTradeSection";
import { IngredientFamiliesSection } from "@/components/herbs-spices/home/IngredientFamiliesSection";
import { IngredientFormsSection } from "@/components/herbs-spices/home/IngredientFormsSection";
import styles from "@/app/herbs-spices/page.module.css";

export default function HerbsSpicesHomePage(): React.JSX.Element {
  return (
    <main className={styles.home} id="main">
      <HerbsSpicesHero />
      <IngredientFamiliesSection />
      <IngredientFormsSection />
      <AgricaTrustSection />
      <HerbsSpicesTradeSection />
    </main>
  );
}
