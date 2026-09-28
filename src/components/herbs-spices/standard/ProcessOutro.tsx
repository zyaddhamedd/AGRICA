"use client";

import React from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { useCommonDictionary } from "@/i18n/locale-context";
import styles from "./ProcessOutro.module.css";

export function ProcessOutro(): React.JSX.Element {
  const common = useCommonDictionary();

  return (
    <section className={styles.outroSection} aria-labelledby="process-outro-title">
      <div className={styles.inner}>
        {/* Quiet Closing Statement */}
        <div className={styles.statementBlock}>
          <span className={styles.statementEyebrow}>FROM SOURCE TO SUPPLY</span>
          <h2 id="process-outro-title" className={styles.statementTitle}>
            A controlled sequence shaped by the intended ingredient form.
          </h2>
        </div>

        {/* Compact Final Action Row */}
        <div className={styles.actionRow}>
          <Link href="/herbs-spices/products" className={styles.primaryLink}>
            {common.actions.explore} {common.navigation.products}{" "}
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </Link>
          <Link href="/herbs-spices#start-a-trade" className={styles.secondaryLink}>
            {common.navigation.startTrade}{" "}
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
