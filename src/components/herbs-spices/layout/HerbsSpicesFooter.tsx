"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { useCommonDictionary } from "@/i18n/locale-context";
import styles from "./HerbsSpicesFooter.module.css";

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

export function HerbsSpicesFooter(): React.JSX.Element {
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
      className={styles.footer}
      ref={footerRef}
      data-visible="false"
      aria-labelledby="hs-footer-title"
    >
      <div className={styles.inner}>
        {/* 1. Header Bar: Brand Identity & Direct Communication */}
        <div className={`${styles.topBar} ${styles.reveal}`}>
          <div className={styles.brandGroup}>
            <div className={styles.brandHeader}>
              <Link className={styles.brandLink} href="/herbs-spices" aria-label={common.accessibility.footerHome}>
                <Image
                  src="/assets/agrica-logo.png"
                  alt="AGRICA"
                  width={150}
                  height={50}
                  className={styles.brandLogo}
                />
              </Link>
              <span className={styles.brandDivider} aria-hidden="true" />
              <span className={styles.divisionBadge}>{common.divisions.herbsSpices}</span>
            </div>
            <p className={styles.manifesto}>
              Egyptian botanical export house. Whole, cut, and milled botanical ingredients for global industry.
            </p>
          </div>

          <div className={styles.channels}>
            <div className={styles.channel}>
              <span className={styles.channelLabel}>General Enquiries</span>
              <a href="mailto:info@agriculturecairo.com" className={styles.channelLink}>
                <svg className={styles.channelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>info@agriculturecairo.com</span>
              </a>
            </div>

            <div className={styles.channel}>
              <span className={styles.channelLabel}>Direct Trade Desk</span>
              <a href="tel:+201061680854" className={styles.channelLink}>
                <svg className={styles.channelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>+20 106 168 0854</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Full-Width 3-Column Global Offices Grid */}
        <div className={`${styles.officesSection} ${styles.reveal}`}>
          <div className={styles.officesHeader}>
            <span className={styles.officesEyebrow}>GLOBAL PRESENCE & REGIONAL DESKS</span>
          </div>

          <div className={styles.officesGrid}>
            {GLOBAL_OFFICES.map((office) => (
              <div className={styles.officeCol} key={office.country}>
                <div className={styles.officeHead}>
                  <span className={styles.officeNum}>{office.number}</span>
                  <div className={styles.officeTitles}>
                    <h3 className={styles.officeCountry}>{office.country}</h3>
                    <span className={styles.officeRole}>{office.role}</span>
                  </div>
                </div>

                <p className={styles.officeAddress}>
                  <svg className={styles.pinIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{office.address}</span>
                </p>

                <a href={office.phoneHref} className={styles.officePhone}>
                  <svg className={styles.phoneIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{office.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Navigation & Actions Bar */}
        <div className={`${styles.utility} ${styles.reveal}`}>
          <nav className={styles.navLinks} aria-label={common.footer.navigationLabel}>
            <Link href="/herbs-spices" className={styles.navItem}>
              <span>{common.navigation.home}</span>
            </Link>
            <Link href="/herbs-spices/products" className={styles.navItem}>
              <span>{common.navigation.products}</span>
            </Link>
            <Link href="/herbs-spices/standard" className={styles.navItem}>
              <span>{common.divisions.process}</span>
            </Link>
            <Link href="/" className={styles.navItem}>
              <span>{common.divisions.produce}</span>
            </Link>
            <Link href="/herbs-spices#start-a-trade" className={styles.navItem}>
              <span>{common.navigation.startTrade}</span>
            </Link>
          </nav>

          <div className={styles.desk}>
            <span>{common.footer.tradeDesk}</span>
            <Link href="/herbs-spices#start-a-trade" className={styles.deskLink}>
              {common.footer.exportConversation} ↗
            </Link>
          </div>
        </div>

        {/* 4. Bottom Legal Bar */}
        <div className={`${styles.legal} ${styles.reveal}`}>
          <div className={styles.legalLeft}>
            <span>© 2026 AGRICA · Botanical Division · {common.navigation.agricultureCairo}</span>
          </div>

          <div className={styles.legalCenter}>
            <span className={styles.originDot} aria-hidden="true" />
            <span>30.0444° N · {common.navigation.cairoEgypt}</span>
          </div>

          <button
            type="button"
            className={styles.topBtn}
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

export default HerbsSpicesFooter;
