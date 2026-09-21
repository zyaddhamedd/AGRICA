import Link from "next/link";
import React from "react";
import styles from "./ProcessFinalSection.module.css";

export function ProcessFinalSection(): React.JSX.Element {
  return <section className={styles.final} aria-labelledby="process-final-title">
    <div className={styles.number} aria-hidden="true">06—</div>
    <div className={styles.copy}><p>Next step</p><h2 id="process-final-title">Prepared for the next commercial step.</h2><span>Continue with the provisional ingredient catalogue or begin a conversation around your brief.</span><div className={styles.actions}><Link href="/herbs-spices/products">Explore ingredients <i aria-hidden="true">&nearr;</i></Link><Link href="/herbs-spices#start-a-trade">Start a trade <i aria-hidden="true">&nearr;</i></Link></div></div>
  </section>;
}
