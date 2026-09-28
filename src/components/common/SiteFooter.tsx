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

const GLOBAL_OFFICES = [
  {
    number: "01",
    country: "Egypt",
    role: "Headquarters & Processing",
    address: "Building 41, Heliopolis Gardens, 1st Floor, Sheraton, Cairo, Egypt",
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
        {/* Main Editorial Body Grid */}
        <div className="site-footer-v2__main-grid site-footer-v2__reveal">
          {/* Brand & Direct Connection Column */}
          <div className="site-footer-v2__brand-col">
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

            <div className="site-footer-v2__direct-channels">
              <div className="site-footer-v2__channel">
                <span className="site-footer-v2__channel-label">General Enquiries</span>
                <a href="mailto:info@agriculturecairo.com" className="site-footer-v2__channel-link">
                  info@agriculturecairo.com
                </a>
              </div>
              <div className="site-footer-v2__channel">
                <span className="site-footer-v2__channel-label">Direct Trade Desk</span>
                <a href="tel:+201061680854" className="site-footer-v2__channel-link">
                  +20 106 168 0854
                </a>
              </div>
            </div>

            <div className="site-footer-v2__origin-pill">
              <span className="site-footer-v2__origin-dot" aria-hidden="true" />
              <span>30.0444° N · CAIRO, EGYPT</span>
            </div>
          </div>

          {/* Global Presence / 3 Regional Desks */}
          <div className="site-footer-v2__offices-col">
            <div className="site-footer-v2__offices-header">
              <span className="site-footer-v2__offices-eyebrow">GLOBAL OFFICES & DISTRIBUTION</span>
            </div>

            <div className="site-footer-v2__offices-grid">
              {GLOBAL_OFFICES.map((office) => (
                <div className="site-footer-v2__office-item" key={office.country}>
                  <div className="site-footer-v2__office-top">
                    <span className="site-footer-v2__office-num">{office.number}</span>
                    <h3 className="site-footer-v2__office-country">{office.country}</h3>
                  </div>
                  <span className="site-footer-v2__office-role">{office.role}</span>
                  <p className="site-footer-v2__office-address">{office.address}</p>
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
        </div>

        {/* Lower Utility & Navigation Bar */}
        <div className="site-footer-v2__bottom-bar site-footer-v2__reveal">
          <nav className="site-footer-v2__nav-links" aria-label={common.footer.navigationLabel}>
            <Link href="/products" className="site-footer-v2__nav-item">
              <span>{common.navigation.products}</span>
            </Link>
            <Link href="/standard" className="site-footer-v2__nav-item">
              <span>{common.navigation.standard}</span>
            </Link>
            <Link href="/#company" className="site-footer-v2__nav-item">
              <span>{common.navigation.company}</span>
            </Link>
            <Link href="/herbs-spices" className="site-footer-v2__nav-item">
              <span>{common.divisions.herbsSpices}</span>
            </Link>
            <Link href="/#trade" className="site-footer-v2__nav-item">
              <span>{common.navigation.startTrade}</span>
            </Link>
          </nav>

          <div className="site-footer-v2__meta">
            <span>© 2026 AGRICA · {common.navigation.agricultureCairo}</span>
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
      </div>
    </footer>
  );
}
