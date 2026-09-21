import Link from "next/link";
import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import styles from "./HerbsSpicesHero.module.css";

export function HerbsSpicesHero(): React.JSX.Element {
  const { hero } = HERBS_SPICES_HOMEPAGE;
  return (
    <section className={styles.hero} aria-labelledby="herbs-spices-home-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.title} id="herbs-spices-home-title">{hero.titleLead} <em>{hero.titleEmphasis}</em></h1>
          <p className={styles.introduction}>{hero.introduction}</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/herbs-spices/products">{hero.primaryAction}<span aria-hidden="true">&nearr;</span></Link>
            <a className={styles.secondaryAction} href="#start-a-trade">{hero.secondaryAction}</a>
          </div>
        </div>
        <HerbsSpicesMedia
          className={styles.mediaSlot}
          entry={HERBS_SPICES_MEDIA.homepage.heroPrimary}
          decorative
          fallback={<><span className={styles.mediaLabel}>{hero.mediaLabel}</span><span className={styles.paperPlane} /><span className={styles.oliveForm} /><span className={styles.saffronForm} /><span className={styles.fineField} /><span className={styles.axis} /></>}
        />
      </div>
    </section>
  );
}
