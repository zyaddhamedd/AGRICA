import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import styles from "./IngredientFamiliesSection.module.css";

export function IngredientFamiliesSection(): React.JSX.Element {
  const { familiesIntro, families } = HERBS_SPICES_HOMEPAGE;
  return (
    <section className={styles.section} id="ingredient-families" aria-labelledby="families-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p>{familiesIntro.eyebrow}</p><h2 id="families-title">{familiesIntro.title}</h2><span>{familiesIntro.description}</span>
        </header>
        <ul className={styles.library}>
          {families.map((family) => (
            <li className={styles.family} key={family.id}>
              <HerbsSpicesMedia className={styles.material} entry={HERBS_SPICES_MEDIA.families[family.id]} fallback={<><i /><i /></>} />
              <div className={styles.familyCopy}>
                <span className={styles.index} aria-hidden="true">{family.index}</span>
                <h3>{family.name}</h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
