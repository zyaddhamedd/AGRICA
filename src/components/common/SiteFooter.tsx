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
    number: "01",
    country: "Egypt",
    role: "Headquarters & Processing",
    address: "Building No. 41, Heliopolis Gardens, First Floor, Sheraton – El Nozha, Cairo, Egypt",
    phone: "+20 106 168 0854",
    phoneHref: "tel:+201061680854",
  },
  {
    number: "02",
    country: "Canada",
    role: "North America Desk",
    address: "PO Box 381 Station M, Calgary, AB, T2P 2H9, Canada",
    phone: "+1 587 917 4538",
    phoneHref: "tel:+15879174538",
  },
  {
    number: "03",
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
        {/* 1. Header Bar: Brand Identity & Direct Communication */}
        <div className="site-footer-v2__top-bar site-footer-v2__reveal">
          <div className="site-footer-v2__brand-group">
            <Link href="/" className="site-footer-v2__brand-link" aria-label={common.accessibility.footerHome}>
              <Image
                src="/assets/agrica-logo.png"
                alt="AGRICA"
                width={150}
                height={50}
                className="site-footer-v2__brand-logo"
              />
            </Link>
            <p className="site-footer-v2__manifesto">
              One Origin. Three Worlds. Egyptian produce prepared for global commercial supply.
            </p>
          </div>

          <div className="site-footer-v2__channels">
            <div className="site-footer-v2__channel">
              <span className="site-footer-v2__channel-label">General Enquiries</span>
              <a href="mailto:info@agriculturecairo.com" className="site-footer-v2__channel-link">
                <svg className="site-footer-v2__channel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>info@agriculturecairo.com</span>
              </a>
            </div>

            <div className="site-footer-v2__channel">
              <span className="site-footer-v2__channel-label">Direct Trade Desk</span>
              <a href="tel:+201061680854" className="site-footer-v2__channel-link">
                <svg className="site-footer-v2__channel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+20 106 168 0854</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Full-Width 3-Column Global Offices Grid */}
        <div className="site-footer-v2__offices-section site-footer-v2__reveal">
          <div className="site-footer-v2__offices-header">
            <span className="site-footer-v2__offices-eyebrow">GLOBAL PRESENCE & REGIONAL DESKS</span>
          </div>

          <div className="site-footer-v2__offices-grid">
            {GLOBAL_OFFICES.map((office) => (
              <div className="site-footer-v2__office-col" key={office.country}>
                <div className="site-footer-v2__office-head">
                  <span className="site-footer-v2__office-num">{office.number}</span>
                  <div className="site-footer-v2__office-titles">
                    <h3 className="site-footer-v2__office-country">{office.country}</h3>
                    <span className="site-footer-v2__office-role">{office.role}</span>
                  </div>
                </div>

                <p className="site-footer-v2__office-address">
                  <svg className="site-footer-v2__pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{office.address}</span>
                </p>

                <a href={office.phoneHref} className="site-footer-v2__office-phone">
                  <svg className="site-footer-v2__phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{office.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Navigation & Actions Bar */}
        <div className="site-footer-v2__utility site-footer-v2__reveal">
          <nav className="site-footer-v2__nav-links" aria-label={common.footer.navigationLabel}>
            {NAV_LINKS.map((link) => (
              <Link href={link.href} key={link.href} className="site-footer-v2__nav-item">
                <span>{common.navigation[link.labelKey]}</span>
              </Link>
            ))}
            <Link href="/herbs-spices" className="site-footer-v2__nav-item">
              <span>{common.divisions.herbsSpices}</span>
            </Link>
          </nav>

          <div className="site-footer-v2__desk">
            <span>{common.footer.tradeDesk}</span>
            <Link href="/#trade" className="site-footer-v2__desk-link">
              {common.footer.exportConversation} ↗
            </Link>
          </div>
        </div>

        {/* 4. Bottom Legal Bar */}
        <div className="site-footer-v2__legal site-footer-v2__reveal">
          <div className="site-footer-v2__legal-left">
            <span>© 2026 AGRICA · {common.navigation.agricultureCairo}</span>
          </div>

          <div className="site-footer-v2__legal-center">
            <span className="site-footer-v2__origin-dot" aria-hidden="true" />
            <span>30.0444° N · {common.navigation.cairoEgypt}</span>
          </div>

          <button
            type="button"
            className="site-footer-v2__top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span>{common.footer.backToTop}</span>
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
