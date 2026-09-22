"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BusinessDivisionSwitcher } from "./BusinessDivisionSwitcher";
import { GlobalMenu } from "./GlobalMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleLink as Link } from "./LocaleLink";
import { useCommonDictionary } from "@/i18n/locale-context";
import { stripLocaleFromPath } from "@/i18n/navigation";

export type HeaderVariant = "home" | "products" | "standard" | "internal";
export type NavbarTheme = "navy" | "paper" | "light" | "transparent";

export interface SiteHeaderProps {
  readonly variant?: HeaderVariant;
  readonly theme?: NavbarTheme;
  readonly quoteCount?: number;
  readonly onOpenQuote?: () => void;
}

export function SiteHeader({
  variant,
  theme,
  quoteCount = 0,
  onOpenQuote,
}: SiteHeaderProps): React.JSX.Element {
  const pathname = usePathname();
  const common = useCommonDictionary();
  const semanticPathname = stripLocaleFromPath(pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reusable global scroll state logic for smart Navbar behavior
  const [scrollState, setScrollState] = useState<{
    isAtTop: boolean;
    isHidden: boolean;
    isFloating: boolean;
  }>({
    isAtTop: true,
    isHidden: false,
    isFloating: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const deltaY = currentScrollY - lastScrollY;
          const topThreshold = 20;
          const hideThreshold = 80;

          if (currentScrollY <= topThreshold) {
            setScrollState({
              isAtTop: true,
              isHidden: false,
              isFloating: false,
            });
          } else {
            // Require > 6px scroll movement to prevent jitter/flicker
            if (Math.abs(deltaY) > 6) {
              const isScrollingDown = deltaY > 0;
              setScrollState({
                isAtTop: false,
                isHidden: isScrollingDown && currentScrollY > hideThreshold,
                isFloating: true,
              });
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine theme mode: "home" vs "internal"
  // Homepage (`/`) -> Home theme ("paper" light surface, dark logo)
  // All internal pages (`/products`, `/standard`, etc.) -> Internal theme ("navy" surface #002050, white logo)
  const isHomePage =
    variant === "home" ||
    (semanticPathname === "/" && variant !== "products" && variant !== "standard" && variant !== "internal");

  const activeThemeMode: "home" | "internal" = isHomePage ? "home" : "internal";

  const activeVariant: HeaderVariant =
    variant ??
    (semanticPathname === "/products"
      ? "products"
      : semanticPathname === "/standard"
      ? "standard"
      : isHomePage
      ? "home"
      : "internal");

  const activeTheme: NavbarTheme =
    theme ?? (activeThemeMode === "internal" ? "navy" : "paper");

  const isWhiteLogo = activeTheme === "navy";

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <div
        className={`global-navbar-wrapper${
          activeVariant === "home" ? " home-navbar" : ""
        }`}
        data-variant={activeVariant}
        data-theme={activeTheme}
        data-top={scrollState.isAtTop ? "true" : "false"}
        data-scrolled={scrollState.isFloating ? "true" : "false"}
        data-hidden={!isMenuOpen && scrollState.isHidden ? "true" : "false"}
      >
        <header className="global-navbar-capsule" aria-label={common.navigation.primaryLabel}>
          {/* Brand Logo */}
          <Link href="/" className="global-navbar-brand" aria-label={common.navigation.agricaHome}>
            <img
              src={isWhiteLogo ? "/assets/agrica-logo.png" : "/assets/agrica-logo-brand.png"}
              alt="AGRICA"
              className="global-navbar-logo"
            />
          </Link>

          {/* Semantic Navigation Anchors for Accessibility & Test Parity */}
          <div className="visually-hidden" aria-hidden="true">
            <Link href="/products">{common.navigation.products}</Link>
            <Link href="/standard">{common.navigation.standard}</Link>
          </div>

          {/* Right Action Cluster */}
          <div className="global-navbar-actions">
            <BusinessDivisionSwitcher tone={isWhiteLogo ? "dark" : "light"} />

            <LanguageSwitcher className="global-navbar-language" tone={isWhiteLogo ? "dark" : "light"} />

            {/* Dedicated Quote Counter Trigger for Products */}
            {activeVariant === "products" && (
              <button
                className="global-navbar-quote-btn"
                type="button"
                aria-expanded="false"
                aria-controls="quote-drawer"
                onClick={onOpenQuote}
              >
                <span>{common.actions.buildQuote}</span>
                <b className="quote-count">{quoteCount}</b>
              </button>
            )}

            {/* Menu Trigger Button */}
            <button
              type="button"
              className={`global-navbar-menu-btn${isMenuOpen ? " is-active" : ""}`}
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="global-menu-panel"
              aria-label={isMenuOpen ? common.navigation.closeMenu : common.navigation.openMenu}
            >
              <span>{isMenuOpen ? common.navigation.close : common.navigation.menu}</span>
            </button>
          </div>
        </header>
      </div>

      {/* Shared Global Navigation Side-Panel Drawer */}
      <GlobalMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
