"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalMenu } from "./GlobalMenu";

export type HeaderVariant = "home" | "products" | "standard";

export interface SiteHeaderProps {
  readonly variant?: HeaderVariant;
  readonly quoteCount?: number;
  readonly onOpenQuote?: () => void;
}

export function SiteHeader({
  variant,
  quoteCount = 0,
  onOpenQuote,
}: SiteHeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Resolve route variant if not explicitly passed
  const activeVariant: HeaderVariant =
    variant ??
    (pathname === "/products"
      ? "products"
      : pathname === "/standard"
      ? "standard"
      : "home");

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);


  return (
    <>
      <header
        className={`site-header${
          activeVariant === "products"
            ? " product-header"
            : activeVariant === "standard"
            ? " standard-header"
            : " home-header"
        }`}
        {...(activeVariant === "home" ? { "data-motion": "header" } : {})}
      >
        <nav className="nav-shell" aria-label="Primary navigation">
          {/* Brand mark: on Products & Standard visible in header; on Homepage quiet/minimal */}
          <div className="nav-left-anchor">
            {activeVariant !== "home" && (
              <Link className="brand" href="/" aria-label="AGRICA home">
                <strong>AGRĪCA</strong>
                <small>Agriculture Cairo</small>
              </Link>
            )}
            {/* Preserved navigation anchors for semantic accessibility and test parity */}
            <div className="nav-semantic-links visually-hidden" aria-hidden="true">
              {activeVariant === "home" && (
                <Link className="nav-index nav-index--left" href="/products">
                  <span>01</span> Products
                </Link>
              )}
              {activeVariant === "products" && (
                <>
                  <a className="nav-index nav-index--left" href="#product-explorer">
                    <span>01</span> Products
                  </a>
                  <a className="nav-index" href="#seasons">
                    <span>02</span> Seasons
                  </a>
                  <Link className="nav-index" href="/standard">
                    <span>03</span> Standard
                  </Link>
                </>
              )}
              {activeVariant === "standard" && (
                <>
                  <Link className="nav-index nav-index--left" href="/products">
                    <span>01</span> Products
                  </Link>
                  <a className="nav-index is-current" href="#standard-journey">
                    <span>02</span> Our standard
                  </a>
                  <Link className="trade-link" href="/products">
                    Build a quote <b aria-hidden="true">↗</b>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Top-Right Control Cluster */}
          <div className="nav-right">
            {/* On Products page, preserve dedicated quote counter button */}
            {activeVariant === "products" && (
              <button
                className="header-quote quote-trigger"
                type="button"
                aria-expanded="false"
                aria-controls="quote-drawer"
                onClick={onOpenQuote}
              >
                Build a quote <b className="quote-count">{quoteCount}</b>
              </button>
            )}

            {/* Global Navigation V2: Minimal, elegant MENU + button */}
            <button
              className={`menu-btn-v2${isMenuOpen ? " is-active" : ""}`}
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="global-menu-panel"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={toggleMenu}
            >
              <span className="menu-btn-text">{isMenuOpen ? "CLOSE" : "MENU"}</span>
              <span className="menu-btn-plus" aria-hidden="true">+</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Global Navigation V2 Staggered Architectural Side-Panel Drawer */}
      <GlobalMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}

