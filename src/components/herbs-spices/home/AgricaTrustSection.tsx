import React from "react";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./AgricaTrustSection.module.css";

export function AgricaTrustSection(): React.JSX.Element {
  const { trust } = HERBS_SPICES_HOMEPAGE;
  return (
    <section className={styles.section} id="agrica-trust" aria-labelledby="trust-title"><div className={styles.inner}>
      <p className={styles.eyebrow}>{trust.eyebrow}</p>
      <div className={styles.statement}><h2 id="trust-title">{trust.title}</h2><p>{trust.description}</p></div>
      <span className={styles.parentLabel}>{trust.parentLabel}</span><div className={styles.mark} aria-hidden="true"><span /></div>
    </div></section>
  );
}
