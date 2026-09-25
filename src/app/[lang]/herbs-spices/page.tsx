import React from "react";
import { HerbsSpicesHero } from "@/components/herbs-spices/home/HerbsSpicesHero";
import { IngredientFamiliesSection } from "@/components/herbs-spices/home/IngredientFamiliesSection";
import { SignatureIngredientsSection } from "@/components/herbs-spices/home/SignatureIngredientsSection";
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

      {/* Section 2: Signature Ingredients */}
      <SignatureIngredientsSection />

      {/* Section 3: Material Forms */}
      <IngredientFormsSection />

      {/* Section 4: Source to Specification */}
      <SourceToSpecificationSection />

      {/* Section 5: Why AGRICA */}
      <WhyAgricaSection />

      {/* Section 6: Quality & Documentation */}
      <QualityDocumentationSection />

      {/* Section 7: Commercial Trade Enquiry */}
      <HerbsSpicesTradeSection />
    </main>
  );
}
