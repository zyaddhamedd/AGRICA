import React from "react";
import styles from "./HerbsSpicesStandardHero.module.css";

export function HerbsSpicesStandardHero(): React.JSX.Element {
  return <header className={styles.hero}>
    <div className={styles.inner}>
      <p>AGRICA / HERBS &amp; SPICES</p>
      <h1>From source <em>to form.</em></h1>
      <span>A structured journey from agricultural origin to a prepared ingredient format.</span>
      <div className={styles.material} aria-hidden="true"><i /><i /><i /><b /></div>
    </div>
  </header>;
}
