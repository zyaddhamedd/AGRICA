"use client";

import React from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { DIVISION_REGISTRY } from "@/divisions/registry";
import styles from "./IngredientFamiliesSection.module.css";

export function IngredientFamiliesSection(): React.JSX.Element {
  const dictionary = useHerbsSpicesDictionary();
  const { familiesIntro, families } = dictionary.homepage;
  return (
    <section className={styles.section} id="ingredient-families" aria-labelledby="families-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p>{familiesIntro.eyebrow}</p><h2 id="families-title">{familiesIntro.title}</h2><span>{familiesIntro.description}</span>
        </header>
        <ul className={styles.library}>
          {families.map((family) => (
            <li className={styles.family} key={family.id}>
              <Link
                className={styles.familyLink}
                href={`${DIVISION_REGISTRY["herbs-spices"].routes.products}?family=${encodeURIComponent(family.id)}`}
                aria-label={formatMessage(dictionary.catalogue.exploreFamily, { name: family.name })}
              >
                <HerbsSpicesMedia className={styles.material} entry={HERBS_SPICES_MEDIA.families[family.id]} alt={family.name} fallback={<><i /><i /></>} />
                <div className={styles.familyCopy}>
                  <span className={styles.index} aria-hidden="true">{family.index}</span>
                  <h3>{family.name}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
