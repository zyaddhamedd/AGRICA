import type { Metadata } from "next";
import React from "react";
import { HerbsSpicesProductsExplorer } from "@/components/herbs-spices/products/HerbsSpicesProductsExplorer";
import { HERBS_SPICES_CATALOGUE, HERBS_SPICES_FAMILIES, isHerbsSpicesFamilyId } from "@/data/herbs-spices/catalogue";
import styles from "@/app/herbs-spices/products/page.module.css";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Ingredient catalogue | Herbs & Spices",
  description: "Explore AGRICA Herbs & Spices ingredient families and materials.",
  robots: { index: false, follow: false },
};

export default async function HerbsSpicesProductsPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ lang: Locale }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const requestedFamily = (await searchParams).family;
  const initialFamily = isHerbsSpicesFamilyId(requestedFamily) ? requestedFamily : "all";
  const dictionary = (await getDictionary((await params).lang)).herbsSpices.catalogue;

  return <main className={styles.page}>
    <header className={styles.intro}><div><p>{dictionary.eyebrow}</p><h1>{dictionary.titleLead} <em>{dictionary.titleEmphasis}</em></h1><span>{dictionary.description}</span></div></header>
    <div className={styles.catalogueWrapper}>
      <HerbsSpicesProductsExplorer catalogue={HERBS_SPICES_CATALOGUE} families={HERBS_SPICES_FAMILIES} initialFamily={initialFamily} />
    </div>
  </main>;
}
