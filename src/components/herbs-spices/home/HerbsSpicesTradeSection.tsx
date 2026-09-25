"use client";

import React, { useState } from "react";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./HerbsSpicesTradeSection.module.css";

export function HerbsSpicesTradeSection(): React.JSX.Element {
  const { trade, families, forms } = useHerbsSpicesDictionary().homepage;
  const staticTrade = HERBS_SPICES_HOMEPAGE.trade;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className={styles.section} id="start-a-trade" aria-labelledby="trade-title">
      <div className={styles.inner}>
        {/* Left: Concise Heading + Support + Reassurance */}
        <div className={styles.contextCol}>
          <div className={styles.contextMeta}>
            <p className={styles.eyebrow}>{trade.eyebrow || staticTrade.eyebrow}</p>
            <span className={styles.scopeTag}>Trade Desk</span>
          </div>

          <h2 id="trade-title" className={styles.title}>
            {staticTrade.title}
          </h2>

          <p className={styles.description}>
            {staticTrade.description}
          </p>

          <p className={styles.reassuranceText}>
            {staticTrade.reassuranceText}
          </p>
        </div>

        {/* Right: Quiet, Clean Conversion Form */}
        <div className={styles.formCol}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGrid}>
              <label className={styles.label}>
                <span className={styles.labelText}>{trade.categoryLabel || staticTrade.categoryLabel}</span>
                <select name="category" defaultValue="" required className={styles.select}>
                  <option value="" disabled>{trade.selectPrompt || staticTrade.selectPrompt}</option>
                  {families.map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>{trade.formatLabel || staticTrade.formatLabel}</span>
                <select name="format" defaultValue="" required className={styles.select}>
                  <option value="" disabled>{trade.selectPrompt || staticTrade.selectPrompt}</option>
                  {forms.map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>{trade.volumeLabel || staticTrade.volumeLabel}</span>
                <input
                  name="volume"
                  type="text"
                  placeholder="e.g. 5 Tons / 20ft FCL"
                  autoComplete="off"
                  required
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>{trade.destinationLabel || staticTrade.destinationLabel}</span>
                <input
                  name="destination"
                  type="text"
                  placeholder="e.g. Hamburg / Rotterdam"
                  autoComplete="country-name"
                  required
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>{trade.companyLabel || staticTrade.companyLabel}</span>
                <input
                  name="company"
                  type="text"
                  placeholder="Your Company Name"
                  autoComplete="organization"
                  required
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                <span className={styles.labelText}>{trade.emailLabel || staticTrade.emailLabel}</span>
                <input
                  name="email"
                  type="email"
                  placeholder="buyer@company.com"
                  autoComplete="email"
                  required
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.formFooter}>
              <button type="submit" className={styles.submitBtn}>
                <span>{trade.submitLabel || staticTrade.submitLabel}</span>
                <span className={styles.submitArrow} aria-hidden="true">→</span>
              </button>

              {submitted && (
                <div className={styles.statusBox} role="status" aria-live="polite">
                  <span className={styles.statusIcon} aria-hidden="true">✓</span>
                  <p className={styles.statusText}>
                    {trade.previewMessage || staticTrade.previewMessage}
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
