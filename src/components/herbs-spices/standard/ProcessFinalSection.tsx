"use client";

import { LocaleLink as Link } from "@/components/common/LocaleLink";
import React from "react";
import styles from "./ProcessFinalSection.module.css";
import { useCommonDictionary, useStandardDictionary } from "@/i18n/locale-context";

export function ProcessFinalSection(): React.JSX.Element {
  const common = useCommonDictionary();
  const final = useStandardDictionary().herbs.final;
  return <section className={styles.final} aria-labelledby="process-final-title">
    <div className={styles.number} aria-hidden="true"><bdi>06—</bdi></div>
    <div className={styles.copy}><p>{final.eyebrow}</p><h2 id="process-final-title">{final.title}</h2><span>{final.description}</span><div className={styles.actions}><Link href="/herbs-spices/products">{common.actions.explore} {common.navigation.products} <i aria-hidden="true">&nearr;</i></Link><Link href="/herbs-spices#start-a-trade">{common.navigation.startTrade} <i aria-hidden="true">&nearr;</i></Link></div></div>
  </section>;
}
