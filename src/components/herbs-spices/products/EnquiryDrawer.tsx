"use client";

import React, { useEffect, useRef, useState } from "react";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import styles from "./EnquiryDrawer.module.css";

export interface EnquiryDrawerProps {
  readonly items: readonly HerbsSpicesCatalogueItem[];
  readonly onClose: () => void;
  readonly onRemove: (id: HerbsSpicesCatalogueItem["id"]) => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function EnquiryDrawer({ items, onClose, onRemove, triggerRef }: EnquiryDrawerProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !panelRef.current.contains(active))) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  return <div className={styles.dialog} id="herbs-spices-enquiry" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
    <button className={styles.backdrop} type="button" aria-label="Close enquiry" onClick={onClose} />
    <div className={styles.panel} ref={panelRef}>
      <header><div><p>LOCAL ENQUIRY PREVIEW</p><h2 id="enquiry-title">Selected materials</h2></div><button ref={closeRef} className={styles.close} type="button" onClick={onClose}>Close <span aria-hidden="true">&times;</span></button></header>
      <div className={styles.content}>
        <ul className={styles.selection} aria-label="Selected materials">{items.map((item) => <li key={item.id}><div><span>{item.familyName}</span><strong>{item.name}</strong></div><button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name} from enquiry`}>Remove</button></li>)}</ul>
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label>Destination<input name="destination" autoComplete="country-name" required /></label>
          <label>Estimated volume<input name="volume" required /></label>
          <label>Company<input name="company" autoComplete="organization" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <button className={styles.submit} type="submit">Preview enquiry</button>
          {submitted && <p className={styles.notice} role="status">Enquiry preview — submission integration coming next.</p>}
        </form>
      </div>
    </div>
  </div>;
}
