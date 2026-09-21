"use client";

import React, { useState } from "react";
import type { HomepageFamily, HomepageForm, HomepageTradeContent } from "@/data/herbs-spices/homepage";
import styles from "./HerbsSpicesTradeSection.module.css";

export interface HerbsSpicesTradeSectionProps {
  readonly trade: HomepageTradeContent;
  readonly families: readonly HomepageFamily[];
  readonly forms: readonly HomepageForm[];
}

export function HerbsSpicesTradeSection({ trade, families, forms }: HerbsSpicesTradeSectionProps): React.JSX.Element {
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setShowPreviewNotice(true); };
  return (
    <section className={styles.section} id="start-a-trade" aria-labelledby="trade-title"><div className={styles.inner}>
      <header className={styles.heading}><p>{trade.eyebrow}</p><h2 id="trade-title">{trade.title}</h2><span>{trade.description}</span></header>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label><span>{trade.categoryLabel}</span><select name="category" defaultValue="" required><option value="" disabled>{trade.selectPrompt}</option>{families.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label><span>{trade.formatLabel}</span><select name="format" defaultValue="" required><option value="" disabled>{trade.selectPrompt}</option>{forms.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label><span>{trade.volumeLabel}</span><input name="volume" type="text" autoComplete="off" required /></label>
        <label><span>{trade.destinationLabel}</span><input name="destination" type="text" autoComplete="country-name" required /></label>
        <label><span>{trade.companyLabel}</span><input name="company" type="text" autoComplete="organization" required /></label>
        <label><span>{trade.emailLabel}</span><input name="email" type="email" autoComplete="email" required /></label>
        <div className={styles.formFooter}><button type="submit">{trade.submitLabel}<span aria-hidden="true">&rarr;</span></button><p className={styles.status} role="status" aria-live="polite">{showPreviewNotice ? trade.previewMessage : ""}</p></div>
      </form>
    </div></section>
  );
}
