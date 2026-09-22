"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { LocaleLink as Link } from "./LocaleLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCommonDictionary } from "@/i18n/locale-context";

export interface GlobalMenuProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const MENU_ITEMS = [
  { number: "01", labelKey: "home", href: "/" },
  { number: "02", labelKey: "products", href: "/products" },
  { number: "03", labelKey: "standard", href: "/standard" },
  { number: "04", labelKey: "company", href: "/#company" },
  { number: "05", labelKey: "startTrade", href: "/#trade" },
] as const;

export function GlobalMenu({ isOpen, onClose }: GlobalMenuProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  const common = useCommonDictionary();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open & manage focus
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className={`global-menu-root${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label={common.navigation.siteDialogLabel}
    >
      {/* Click-away Backdrop */}
      <div
        className="global-menu-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Staggered Underlay 2 (Deepest layer) */}
      <div className="global-menu-underlay underlay--2" aria-hidden="true" />

      {/* Staggered Underlay 1 (Middle layer) */}
      <div className="global-menu-underlay underlay--1" aria-hidden="true" />

      {/* Main Architectural Paper Panel */}
      <aside className="global-menu-panel" ref={panelRef}>
        <div className="menu-panel-head">
          <div className="menu-origin-signal">
            <span className="signal-dot" aria-hidden="true">●</span>
            <span>30.0444° N</span>
            <span className="signal-sep">/</span>
            <span>{common.navigation.cairoEgypt}</span>
          </div>

          <button
            ref={closeButtonRef}
            className="menu-close-btn"
            type="button"
            onClick={onClose}
            aria-label={common.navigation.closeMenu}
          >
            <span>{common.navigation.close}</span>
            <i aria-hidden="true">×</i>
          </button>
        </div>

        <nav className="menu-panel-nav" aria-label={common.navigation.sitePagesLabel}>
          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.number}
              href={item.href}
              className="menu-nav-link"
              onClick={onClose}
              style={{ transitionDelay: isOpen ? `${140 + index * 40}ms` : "0ms" }}
            >
              <span className="nav-item-num">{item.number}</span>
              <strong className="nav-item-label">{common.navigation[item.labelKey]}</strong>
              <i className="nav-item-arrow" aria-hidden="true">↗</i>
            </Link>
          ))}
        </nav>

        <div className="menu-panel-foot">
          <LanguageSwitcher className="global-menu-language" tone="light" />
          <div className="foot-brand">
            <strong>AGRĪCA</strong>
            <small>{common.navigation.agricultureCairo}</small>
          </div>
          <p className="foot-statement">
            {common.navigation.exportStatement}
          </p>
          <div className="foot-meta">
            <span>{common.navigation.b2bExport}</span>
            <span>{common.navigation.produceWorlds}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
