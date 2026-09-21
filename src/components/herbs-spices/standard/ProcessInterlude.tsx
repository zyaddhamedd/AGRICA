import React from "react";
import styles from "./ProcessInterlude.module.css";

export function ProcessInterlude(): React.JSX.Element {
  return <section className={styles.interlude} aria-labelledby="process-interlude-title">
    <div className={styles.copy}><p>Material / control</p><h2 id="process-interlude-title">The material changes. <em>The discipline does not.</em></h2><span>Each intended form shapes the journey. The final sequence and controls will follow the approved ingredient specification.</span></div>
    <div className={styles.forms} aria-hidden="true"><i /><i /><i /><i /><b /></div>
  </section>;
}
