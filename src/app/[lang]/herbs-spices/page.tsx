import React from "react";
import { HerbsSpicesHero } from "@/components/herbs-spices/home/HerbsSpicesHero";
import { IngredientFamiliesSection } from "@/components/herbs-spices/home/IngredientFamiliesSection";
import { IngredientFormsSection } from "@/components/herbs-spices/home/IngredientFormsSection";
import { SourceToSpecificationSection } from "@/components/herbs-spices/home/SourceToSpecificationSection";
import { WhyAgricaSection } from "@/components/herbs-spices/home/WhyAgricaSection";
import { QualityDocumentationSection } from "@/components/herbs-spices/home/QualityDocumentationSection";
import { HerbsSpicesTradeSection } from "@/components/herbs-spices/home/HerbsSpicesTradeSection";
import styles from "@/app/herbs-spices/page.module.css";

export default function HerbsSpicesHomePage(): React.JSX.Element {
  return (
    <main className={styles.home} id="main">
      {/* Hero (Phase 1 Locked) */}
      <HerbsSpicesHero />

      {/* Section 1: Ingredient Families */}
      <IngredientFamiliesSection />

      {/* Section 2: Material Forms */}
      <IngredientFormsSection />

      {/* Section 3: Source to Specification */}
      <SourceToSpecificationSection />

      {/* Section 4: Why AGRICA */}
      <WhyAgricaSection />

      {/* Section 5: Quality & Documentation */}
      <QualityDocumentationSection />

      {/* Section 6: Commercial Trade Enquiry */}
      <HerbsSpicesTradeSection />
    </main>
  );
}
