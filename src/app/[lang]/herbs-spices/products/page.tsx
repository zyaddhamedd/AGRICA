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

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introMeta}>
            <p className={styles.eyebrow}>{dictionary.eyebrow}</p>
            <span className={styles.scopeTag}>Botanical Sourcing Library</span>
          </div>

          <div className={styles.introContent}>
            <h1 className={styles.title}>
              {dictionary.titleLead} <em>{dictionary.titleEmphasis}</em>
            </h1>
            <p className={styles.description}>
              {dictionary.description}
            </p>
          </div>

          <div className={styles.introStats}>
            <span className={styles.statItem}>
              <strong>{HERBS_SPICES_CATALOGUE.length}</strong>
              <small>Materials</small>
            </span>
            <span className={styles.statDivider}>/</span>
            <span className={styles.statItem}>
              <strong>{HERBS_SPICES_FAMILIES.length}</strong>
              <small>Families</small>
            </span>
            <span className={styles.statDivider}>/</span>
            <span className={styles.statItem}>
              <strong>Egypt</strong>
              <small>Origin</small>
            </span>
          </div>
        </div>
      </header>

      <div className={styles.catalogueWrapper}>
        <HerbsSpicesProductsExplorer
          catalogue={HERBS_SPICES_CATALOGUE}
          families={HERBS_SPICES_FAMILIES}
          initialFamily={initialFamily}
        />
      </div>
    </main>
  );
}
