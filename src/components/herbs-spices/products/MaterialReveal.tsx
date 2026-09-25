"use client";

import React, { useEffect, useRef } from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { getHerbsSpicesMedia } from "@/data/herbs-spices/media";
import { BOTANICAL_LATIN_NAMES } from "@/data/herbs-spices/catalogue";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import styles from "./MaterialReveal.module.css";
import { useHerbsSpicesDictionary, useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface MaterialRevealProps {
  readonly item: HerbsSpicesCatalogueItem;
  readonly selected: boolean;
  readonly onToggleSelection: () => void;
  readonly onClose: (restoreFocus?: boolean) => void;
  readonly onOpenEnquiryDrawer?: () => void;
}

export function MaterialReveal({
  item,
  selected,
  onToggleSelection,
  onClose,
  onOpenEnquiryDrawer,
}: MaterialRevealProps): React.JSX.Element {
  const dictionary = useHerbsSpicesDictionary().catalogue;
  const common = useCommonDictionary();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const media = getHerbsSpicesMedia(item.mediaKey);
  const latinName = BOTANICAL_LATIN_NAMES[item.slug];

  // Focus trap, body scroll lock, and ESC dismissal
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose(true);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const hasProductSpecificForms =
    item.formsConfidence === "product-specific" && item.forms.length > 0;

  // Check for future verified technical modules (only render if verified data exists)
  const hasVerifiedSpecs = Boolean(item.specifications && item.specifications.length > 0);
  const hasVerifiedCommercialParams = Boolean(
    item.packaging ||
      item.moq ||
      item.season ||
      item.shelfLife ||
      item.storage ||
      item.meshSize ||
      item.moisture ||
      item.purity ||
      item.volatileOil ||
      item.containerLoading ||
      (item.incoterms && item.incoterms.length > 0)
  );
  const hasVerifiedCertifications = Boolean(
    item.certifications && item.certifications.length > 0
  );

  return (
    <div
      className={styles.dialog}
      id={`material-dossier-${item.slug}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-item-title"
    >
      {/* Background Backdrop */}
      <button
        className={styles.backdrop}
        type="button"
        aria-label={common.actions.close}
        onClick={() => onClose(true)}
      />

      {/* Main Material Dossier Panel */}
      <div className={styles.panel} ref={panelRef}>
        {/* Mobile Drag Indicator */}
        <div className={styles.dragBar} aria-hidden="true">
          <span className={styles.dragHandle} />
        </div>

        {/* Dossier Header */}
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.eyebrow}>Material Dossier</span>
            <span className={styles.materialCode} aria-label="Catalogue Reference">
              Catalogue Ref · {item.slug.toUpperCase()}
            </span>
          </div>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            type="button"
            onClick={() => onClose(true)}
            aria-label={common.actions.close}
          >
            ×
          </button>
        </header>

        {/* Scrollable Dossier Viewport */}
        <div className={styles.contentViewport}>
          <div className={styles.contentInner}>
            {/* 1. MATERIAL IDENTITY */}
            <section className={styles.identitySection} aria-label="Material Identity">
              <div className={styles.imageStage}>
                <HerbsSpicesMedia
                  className={styles.media}
                  entry={media}
                  alt={`${item.name} botanical specimen`}
                  fallback={<span className={styles.fallback} />}
                />
                <div className={styles.imageBadge}>
                  <span>Origin: Egypt</span>
                </div>
              </div>

              <div className={styles.identityHeader}>
                <div className={styles.tagRow}>
                  <span className={styles.familyBadge}>{item.familyName}</span>
                  <span className={styles.originTag}>Egypt</span>
                </div>
                <h2 id="dossier-item-title" className={styles.title}>
                  {item.name}
                </h2>
                {latinName && <em className={styles.latinName}>{latinName}</em>}
              </div>
            </section>

            {/* 2. MATERIAL EXPRESSION / PROCESSING */}
            <section className={styles.dossierSection} aria-label="Processing & Forms">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionHeading}>
                  {hasProductSpecificForms ? dictionary.availableForms : "Processing Options"}
                </h3>
              </div>

              {hasProductSpecificForms ? (
                <div className={styles.formsList}>
                  {item.forms.map((form) => (
                    <span key={form} className={styles.formChip}>
                      <span className={styles.chipDot} aria-hidden="true" />
                      {form}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.registerValueText}>
                  Confirmed per enquiry.
                </p>
              )}
            </section>

            {/* 3. TRADE INFORMATION */}
            <section className={styles.dossierSection} aria-label="Trade Information">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionHeading}>Trade Information</h3>
              </div>
              <div className={styles.technicalRegister}>
                <div className={styles.registerEntry}>
                  <span className={styles.registerLabel}>Origin</span>
                  <span className={styles.registerValue}>Egypt</span>
                </div>
                <div className={styles.registerEntry}>
                  <span className={styles.registerLabel}>Technical Specifications</span>
                  <span className={styles.registerValue}>Available on request</span>
                </div>
                <div className={styles.registerEntry}>
                  <span className={styles.registerLabel}>Samples</span>
                  <span className={styles.registerValue}>Available on request</span>
                </div>
              </div>
            </section>

            {/* 4. DOCUMENTATION SUPPORT */}
            <section className={styles.dossierSection} aria-label="Documentation Support">
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionHeading}>Documentation Support</h3>
              </div>
              <ol className={styles.docRegister}>
                <li className={styles.docRegisterRow}>
                  <span className={styles.docIndex} aria-hidden="true">01</span>
                  <strong className={styles.docName}>Phytosanitary Documentation</strong>
                </li>
                <li className={styles.docRegisterRow}>
                  <span className={styles.docIndex} aria-hidden="true">02</span>
                  <strong className={styles.docName}>Certificate of Origin</strong>
                </li>
                <li className={styles.docRegisterRow}>
                  <span className={styles.docIndex} aria-hidden="true">03</span>
                  <strong className={styles.docName}>Commercial Export Documents</strong>
                </li>
              </ol>
            </section>

            {/* 5. FUTURE TECHNICAL MODULES (Strictly conditional - zero rendering if unconfirmed) */}
            {hasVerifiedSpecs && item.specifications && (
              <section className={styles.dossierSection} aria-label="Verified Specifications">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionHeading}>Specification Matrix</h3>
                </div>
                <div className={styles.technicalRegister}>
                  {item.specifications.map((spec) => (
                    <div key={spec.label} className={styles.registerEntry}>
                      <span className={styles.registerLabel}>{spec.label}</span>
                      <span className={styles.registerValue}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasVerifiedCommercialParams && (
              <section className={styles.dossierSection} aria-label="Technical Parameters">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionHeading}>Commercial Parameters</h3>
                </div>
                <div className={styles.technicalRegister}>
                  {item.packaging && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Packaging</span>
                      <span className={styles.registerValue}>{item.packaging}</span>
                    </div>
                  )}
                  {item.moq && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>MOQ</span>
                      <span className={styles.registerValue}>{item.moq}</span>
                    </div>
                  )}
                  {item.season && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Harvest Season</span>
                      <span className={styles.registerValue}>{item.season}</span>
                    </div>
                  )}
                  {item.shelfLife && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Shelf Life</span>
                      <span className={styles.registerValue}>{item.shelfLife}</span>
                    </div>
                  )}
                  {item.storage && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Storage</span>
                      <span className={styles.registerValue}>{item.storage}</span>
                    </div>
                  )}
                  {item.meshSize && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Mesh Size</span>
                      <span className={styles.registerValue}>{item.meshSize}</span>
                    </div>
                  )}
                  {item.moisture && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Moisture</span>
                      <span className={styles.registerValue}>{item.moisture}</span>
                    </div>
                  )}
                  {item.purity && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Purity</span>
                      <span className={styles.registerValue}>{item.purity}</span>
                    </div>
                  )}
                  {item.volatileOil && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Volatile Oil</span>
                      <span className={styles.registerValue}>{item.volatileOil}</span>
                    </div>
                  )}
                  {item.containerLoading && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Container Loading</span>
                      <span className={styles.registerValue}>{item.containerLoading}</span>
                    </div>
                  )}
                  {item.incoterms && item.incoterms.length > 0 && (
                    <div className={styles.registerEntry}>
                      <span className={styles.registerLabel}>Incoterms</span>
                      <span className={styles.registerValue}>{item.incoterms.join(" · ")}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {hasVerifiedCertifications && item.certifications && (
              <section className={styles.dossierSection} aria-label="Verified Certifications">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionHeading}>Product Certifications</h3>
                </div>
                <div className={styles.certList}>
                  {item.certifications.map((cert) => (
                    <span key={cert} className={styles.certBadge}>
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <footer className={styles.footer}>
          <button
            type="button"
            className={`${styles.enquiryActionBtn} ${selected ? styles.enquiryActionBtnActive : ""}`}
            aria-pressed={selected}
            onClick={onToggleSelection}
            aria-label={
              selected
                ? formatMessage(common.enquiry.removeItemFromEnquiry, { name: item.name })
                : formatMessage(common.enquiry.addItem, { name: item.name })
            }
          >
            <span className={styles.actionIcon} aria-hidden="true">
              {selected ? "✓" : "+"}
            </span>
            <span>
              {selected ? "Added to Sourcing Enquiry" : "Add to Sourcing Enquiry"}
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
