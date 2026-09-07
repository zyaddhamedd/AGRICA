"use client";

import React, { useEffect, useCallback, useRef } from "react";
import Link from "next/link";

export interface GlobalMenuProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const MENU_ITEMS = [
  { number: "01", label: "HOME", href: "/" },
  { number: "02", label: "PRODUCTS", href: "/products" },
  { number: "03", label: "OUR STANDARD", href: "/standard" },
  { number: "04", label: "COMPANY", href: "/#company" },
  { number: "05", label: "START A TRADE", href: "/#trade" },
] as const;

export function GlobalMenu({ isOpen, onClose }: GlobalMenuProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
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
      aria-label="Site Navigation"
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
            <span>CAIRO, EGYPT</span>
          </div>

          <button
            ref={closeButtonRef}
            className="menu-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <span>CLOSE</span>
            <i aria-hidden="true">×</i>
          </button>
        </div>

        <nav className="menu-panel-nav" aria-label="Site pages">
          {MENU_ITEMS.map((item, index) => (
            <Link
              key={item.number}
              href={item.href}
              className="menu-nav-link"
              onClick={onClose}
              style={{ transitionDelay: isOpen ? `${140 + index * 40}ms` : "0ms" }}
            >
              <span className="nav-item-num">{item.number}</span>
              <strong className="nav-item-label">{item.label}</strong>
              <i className="nav-item-arrow" aria-hidden="true">↗</i>
            </Link>
          ))}
        </nav>

        <div className="menu-panel-foot">
          <div className="foot-brand">
            <strong>AGRĪCA</strong>
            <small>Agriculture Cairo</small>
          </div>
          <p className="foot-statement">
            Egyptian produce. Prepared for global supply.
          </p>
          <div className="foot-meta">
            <span>B2B Agricultural Export</span>
            <span>Fresh / Frozen / Dried</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
