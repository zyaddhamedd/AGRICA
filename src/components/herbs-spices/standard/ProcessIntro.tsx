"use client";

import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";
import styles from "./ProcessIntro.module.css";

export function ProcessIntro(): React.JSX.Element {
  const hero = useStandardDictionary().herbs.hero;

  return (
    <header className={styles.intro}>
      <div className={styles.inner}>
        <span className={styles.chapterLabel}>04 / PROCESS JOURNEY</span>
        <h1 className={styles.headline}>
          {hero.titleLead} <em>{hero.titleEmphasis}</em>
        </h1>
        <p className={styles.description}>
          Six stages connecting raw botanical material to commercial supply.
        </p>
        <div className={styles.divider} aria-hidden="true" />
      </div>
    </header>
  );
}
