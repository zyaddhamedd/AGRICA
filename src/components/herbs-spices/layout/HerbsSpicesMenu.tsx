"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import styles from "./HerbsSpicesMenu.module.css";

export interface HerbsSpicesMenuProps {
  readonly onClose: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function HerbsSpicesMenu({
  onClose,
  triggerRef,
}: HerbsSpicesMenuProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !panelRef.current.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !panelRef.current.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  return (
    <div
      className={styles.dialog}
      id="herbs-spices-menu"
      role="dialog"
      aria-modal="true"
      aria-labelledby="herbs-spices-menu-title"
    >
      <div className={styles.backdrop} aria-hidden="true" onClick={onClose} />

      <div className={styles.panel} ref={panelRef}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.kicker}>AGRICA / HERBS &amp; SPICES</span>
            <h2 id="herbs-spices-menu-title">Menu</h2>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close Herbs & Spices menu"
          >
            <span>Close</span>
            <i aria-hidden="true">&times;</i>
          </button>
        </div>

        <nav className={styles.navigation} aria-label="Herbs & Spices pages">
          <Link href="/herbs-spices" aria-current={pathname === "/herbs-spices" ? "page" : undefined} onClick={onClose}>
            <span>01</span>
            <strong>Home</strong>
            <i aria-hidden="true">&nearr;</i>
          </Link>
          <Link href="/herbs-spices/products" aria-current={pathname === "/herbs-spices/products" ? "page" : undefined} onClick={onClose}>
            <span>02</span>
            <strong>Products</strong>
            <i aria-hidden="true">&nearr;</i>
          </Link>
          <Link href="/herbs-spices/standard" aria-current={pathname === "/herbs-spices/standard" ? "page" : undefined} onClick={onClose}>
            <span>03</span>
            <strong>Process</strong>
            <i aria-hidden="true">&nearr;</i>
          </Link>
        </nav>

        <div className={styles.panelFooter}>
          <span>AGRICA</span>
          <strong>Herbs &amp; Spices</strong>
        </div>
      </div>
    </div>
  );
}
