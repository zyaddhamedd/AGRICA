import Link from "next/link";
import React from "react";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./ProcessTeaserSection.module.css";

export function ProcessTeaserSection(): React.JSX.Element {
  const { processIntro, process } = HERBS_SPICES_HOMEPAGE;
  return (
    <section className={styles.section} id="process-preview" aria-labelledby="process-title"><div className={styles.inner}>
      <header className={styles.heading}><p>{processIntro.eyebrow}</p><h2 id="process-title">{processIntro.title}</h2><span>{processIntro.description}</span></header>
      <ol className={styles.sequence}>{process.map((stage) => <li key={stage.id}><span>{stage.index}</span><strong>{stage.name}</strong></li>)}</ol>
      <Link className={styles.processLink} href="/herbs-spices/standard">View the process <span aria-hidden="true">&nearr;</span></Link>
    </div></section>
  );
}
