"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useCommonDictionary } from "@/i18n/locale-context";
import { stripLocaleFromPath } from "@/i18n/navigation";
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
  const common = useCommonDictionary();
  const semanticPathname = stripLocaleFromPath(pathname);

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
            <span className={styles.kicker}>AGRICA / {common.divisions.herbsSpices}</span>
            <h2 id="herbs-spices-menu-title">{common.navigation.menu}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label={common.divisions.herbsMenuClose}
          >
            <span>{common.navigation.close}</span>
            <i aria-hidden="true">×</i>
          </button>
        </div>

        <nav className={styles.navigation} aria-label={common.divisions.herbsPagesLabel}>
          <Link href="/herbs-spices" aria-current={semanticPathname === "/herbs-spices" ? "page" : undefined} onClick={onClose}>
            <span>01</span>
            <strong>{common.navigation.home}</strong>
            <i aria-hidden="true">↗</i>
          </Link>
          <Link href="/herbs-spices/products" aria-current={semanticPathname === "/herbs-spices/products" ? "page" : undefined} onClick={onClose}>
            <span>02</span>
            <strong>{common.navigation.products}</strong>
            <i aria-hidden="true">↗</i>
          </Link>
          <Link href="/herbs-spices/standard" aria-current={semanticPathname === "/herbs-spices/standard" ? "page" : undefined} onClick={onClose}>
            <span>03</span>
            <strong>{common.divisions.process}</strong>
            <i aria-hidden="true">↗</i>
          </Link>
        </nav>

        <div className={styles.panelFooter}>
          <LanguageSwitcher className={styles.menuLanguage} tone="herbs" />
          <span>AGRICA</span>
          <strong>{common.divisions.herbsSpices}</strong>
        </div>
      </div>
    </div>
  );
}
