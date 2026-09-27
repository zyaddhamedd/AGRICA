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
    <section className={styles.section} id="start-a-trade" aria-label={trade.eyebrow || staticTrade.eyebrow || "07 / COMMERCIAL ENQUIRY"}>
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            {trade.eyebrow || staticTrade.eyebrow || "07 / COMMERCIAL ENQUIRY"}
          </span>
        </div>

        {/* Centered Luxury Trade Card */}
        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardHeading}>Export Trade Enquiry</h3>
            <p className={styles.cardSubheading}>Direct sourcing from verified Egyptian harvest origins</p>
          </div>

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

          {staticTrade.reassuranceText && (
            <div className={styles.reassuranceWrapper}>
              <span className={styles.reassuranceDot} aria-hidden="true" />
              <p className={styles.reassuranceText}>
                {staticTrade.reassuranceText}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
