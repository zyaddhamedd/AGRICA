"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import type { HeaderVariant } from "./SiteHeader";
import { LocaleLink as Link } from "./LocaleLink";
import { useCommonDictionary } from "@/i18n/locale-context";

export interface SiteFooterProps {
  readonly variant?: HeaderVariant;
  readonly onPrimaryAction?: () => void;
}

const NAV_LINKS = [
  { labelKey: "products", href: "/products" },
  { labelKey: "standard", href: "/standard" },
  { labelKey: "company", href: "/#company" },
  { labelKey: "startTrade", href: "/#trade" },
] as const;

const GLOBAL_OFFICES = [
  {
    id: "egypt",
    country: "Egypt",
    role: "Headquarters & Processing",
    address: "Building No. 41, Heliopolis Gardens, First Floor, Sheraton – El Nozha, Cairo, Egypt",
    phone: "+20 106 168 0854",
    phoneHref: "tel:+201061680854",
  },
  {
    id: "canada",
    country: "Canada",
    role: "North America Desk",
    address: "PO Box 381 Station M, Calgary, AB, T2P 2H9, Canada",
    phone: "+1 587 917 4538",
    phoneHref: "tel:+15879174538",
  },
  {
    id: "netherlands",
    country: "Netherlands",
    role: "European Trade Desk",
    address: "Lange Beestenmarkt, 2512 EG Den Haag, The Netherlands",
    phone: "+31 6 47 29 69 78",
    phoneHref: "tel:+31647296978",
  },
] as const;

export function SiteFooter({ variant = "home" }: SiteFooterProps): React.JSX.Element {
  const footerRef = useRef<HTMLElement>(null);
  const common = useCommonDictionary();

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      className={`site-footer-v2 site-footer-v2--${variant}`}
      ref={footerRef}
      data-visible="false"
      aria-labelledby="site-footer-title"
    >
      <div className="site-footer-v2__inner">
        {/* 1. Top Header Bar: Logo & Direct Communication */}
        <div className="site-footer-v2__top-bar site-footer-v2__reveal">
          <div className="site-footer-v2__brand-group">
            <Link href="/" className="site-footer-v2__brand-logo" aria-label={common.accessibility.footerHome}>
              <Image
                src="/assets/agrica-logo.png"
                alt="AGRICA"
                width={140}
                height={46}
                className="site-footer-v2__logo-img"
              />
            </Link>
            <span className="site-footer-v2__brand-tagline">
              One Origin. Three Worlds. · Egyptian Produce for Global Supply
            </span>
          </div>

          <div className="site-footer-v2__direct-contact">
            <a href="mailto:info@agriculturecairo.com" className="site-footer-v2__contact-chip">
              <svg className="site-footer-v2__chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>info@agriculturecairo.com</span>
            </a>
            <a href="tel:+201061680854" className="site-footer-v2__contact-chip">
              <svg className="site-footer-v2__chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>+20 106 168 0854</span>
            </a>
          </div>
        </div>

        {/* 2. Global Offices Grid (Egypt, Canada, Netherlands) */}
        <div className="site-footer-v2__locations site-footer-v2__reveal">
          <div className="site-footer-v2__locations-header">
            <span className="site-footer-v2__locations-kicker">GLOBAL PRESENCE & OFFICES</span>
          </div>

          <div className="site-footer-v2__locations-grid">
            {GLOBAL_OFFICES.map((office) => (
              <div className="site-footer-v2__location-card" key={office.id}>
                <div className="site-footer-v2__card-head">
                  <div className="site-footer-v2__card-indicator" aria-hidden="true" />
                  <div className="site-footer-v2__card-title-group">
                    <h3 className="site-footer-v2__country">{office.country}</h3>
                    <span className="site-footer-v2__role">{office.role}</span>
                  </div>
                </div>

                <div className="site-footer-v2__card-body">
                  <p className="site-footer-v2__address">
                    <svg className="site-footer-v2__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{office.address}</span>
                  </p>
                  <a href={office.phoneHref} className="site-footer-v2__phone">
                    <svg className="site-footer-v2__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{office.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Navigation & Action Desk */}
        <div className="site-footer-v2__utility site-footer-v2__reveal">
          <nav className="site-footer-v2__nav" aria-label={common.footer.navigationLabel}>
            {NAV_LINKS.map((link) => (
              <Link href={link.href} key={link.href}>
                <span>{common.navigation[link.labelKey]}</span>
              </Link>
            ))}
            <Link href="/herbs-spices">
              <span>{common.divisions.herbsSpices}</span>
            </Link>
          </nav>

          <div className="site-footer-v2__desk">
            <span>{common.footer.tradeDesk}</span>
            <Link href="/#trade">{common.footer.exportConversation} ↗</Link>
          </div>
        </div>

        {/* 4. Bottom Legal & Coordinate Bar */}
        <div className="site-footer-v2__legal site-footer-v2__reveal">
          <div className="site-footer-v2__legal-left">
            <span>© 2026 AGRICA</span>
            <span>·</span>
            <span>{common.navigation.agricultureCairo}</span>
          </div>

          <div className="site-footer-v2__legal-center">
            <span className="site-footer-v2__signal" aria-hidden="true" />
            <span>30.0444° N / {common.navigation.cairoEgypt}</span>
          </div>

          <button
            type="button"
            className="site-footer-v2__top-link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {common.footer.backToTop} <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
