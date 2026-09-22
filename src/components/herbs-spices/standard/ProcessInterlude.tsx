"use client";

import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";
import styles from "./ProcessInterlude.module.css";

export function ProcessInterlude(): React.JSX.Element {
  const interlude = useStandardDictionary().herbs.interlude;
  return <section className={styles.interlude} aria-labelledby="process-interlude-title">
    <div className={styles.copy}><p>{interlude.eyebrow}</p><h2 id="process-interlude-title">{interlude.title} <em>{interlude.emphasis}</em></h2><span>{interlude.description}</span></div>
    <div className={styles.forms} aria-hidden="true"><i /><i /><i /><i /><b /></div>
  </section>;
}
