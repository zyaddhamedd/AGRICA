import type { Metadata } from "next";
import React from "react";
import { HerbsSpicesProductsExplorer } from "@/components/herbs-spices/products/HerbsSpicesProductsExplorer";
import { HERBS_SPICES_CATALOGUE, HERBS_SPICES_FAMILIES } from "@/data/herbs-spices/catalogue";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Ingredient catalogue | Herbs & Spices",
  description: "Explore AGRICA Herbs & Spices ingredient families and materials.",
  robots: { index: false, follow: false },
};

export default function HerbsSpicesProductsPage(): React.JSX.Element {
  return <main className={styles.page}>
    <header className={styles.intro}><div><p>AGRICA / HERBS &amp; SPICES</p><h1>Ingredient <em>catalogue.</em></h1><span>Source-backed product families for international ingredient enquiries. Technical and commercial details are confirmed on request.</span></div></header>
    <HerbsSpicesProductsExplorer catalogue={HERBS_SPICES_CATALOGUE} families={HERBS_SPICES_FAMILIES} />
  </main>;
}
