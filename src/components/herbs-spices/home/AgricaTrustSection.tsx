"use client";

import React from "react";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import styles from "./AgricaTrustSection.module.css";

export function AgricaTrustSection(): React.JSX.Element {
  const { trust } = useHerbsSpicesDictionary().homepage;
  return (
    <section className={styles.section} id="agrica-trust" aria-labelledby="trust-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{trust.eyebrow}</p>
        <div className={styles.statement}>
          <h2 id="trust-title">{trust.title}</h2>
          <p>{trust.description}</p>
        </div>
        <ol className={styles.pillars}>
          {trust.pillars.map((pillar) => (
            <li key={pillar.index}>
              <div className={styles.pillarHeading}>
                <span aria-hidden="true">{pillar.index}</span>
                <h3>{pillar.title}</h3>
              </div>
              <p>{pillar.description}</p>
            </li>
          ))}
        </ol>
        <p className={styles.parentLabel}>{trust.parentLabel}</p>
      </div>
    </section>
  );
}
