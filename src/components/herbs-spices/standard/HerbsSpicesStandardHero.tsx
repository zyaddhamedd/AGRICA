"use client";

import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";
import styles from "./HerbsSpicesStandardHero.module.css";

export function HerbsSpicesStandardHero(): React.JSX.Element {
  const hero = useStandardDictionary().herbs.hero;
  return <header className={styles.hero}>
    <div className={styles.inner}>
      <p>{hero.eyebrow}</p>
      <h1>{hero.titleLead} <em>{hero.titleEmphasis}</em></h1>
      <span>{hero.description}</span>
      <div className={styles.material} aria-hidden="true"><i /><i /><i /><b /></div>
    </div>
  </header>;
}
