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

export function SiteFooter({ variant = "home", onPrimaryAction }: SiteFooterProps): React.JSX.Element {
  const footerRef = useRef<HTMLElement>(null);
  const common = useCommonDictionary();
  const copy: { readonly eyebrow: string; readonly cta: string; readonly href: string } = ({
    home: { eyebrow: common.footer.oneOriginThreeWorlds, cta: common.footer.exploreProduce, href: "/products" },
    products: { eyebrow: common.footer.nextExportProgramme, cta: common.footer.buildQuotation, href: "#product-atlas-main" },
    standard: { eyebrow: common.footer.controlledFromOrigin, cta: common.footer.discoverProducts, href: "/products" },
    internal: { eyebrow: common.footer.originGlobalReadiness, cta: common.footer.exploreProduce, href: "/products" },
  } satisfies Record<HeaderVariant, { readonly eyebrow: string; readonly cta: string; readonly href: string }>)[variant];
  const isActionButton = variant === "products" && onPrimaryAction;

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
      { threshold: 0.12 }
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
      <div className="site-footer-v2__route" aria-hidden="true">
        <span className="site-footer-v2__route-origin" />
        <span className="site-footer-v2__route-line" />
        <span className="site-footer-v2__route-end" />
      </div>

      <div className="site-footer-v2__inner">
        <div className="site-footer-v2__origin site-footer-v2__reveal">
          <span className="site-footer-v2__signal" aria-hidden="true" />
          <span>30.0444° N</span>
          <span>{common.navigation.cairoEgypt}</span>
        </div>

        <div className="site-footer-v2__statement">
          <div className="site-footer-v2__copy site-footer-v2__reveal">
            <p className="site-footer-v2__eyebrow">{copy.eyebrow}</p>
            <h2 id="site-footer-title">
              {common.footer.originHeadline}
              <br />
              <em>{common.footer.worldHeadline}</em>
            </h2>
            <p className="site-footer-v2__description">
              {common.footer.description}
            </p>
          </div>

          <div className="site-footer-v2__action-wrap site-footer-v2__reveal">
            <span>{common.footer.beginHere}</span>
            {isActionButton ? (
              <button className="site-footer-v2__action" type="button" onClick={onPrimaryAction} aria-controls="quote-drawer">
                <span>{copy.cta}</span>
                <i aria-hidden="true">↗</i>
              </button>
            ) : (
              <Link className="site-footer-v2__action" href={copy.href}>
                <span>{copy.cta}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            )}
          </div>
        </div>

        <div className="site-footer-v2__utility site-footer-v2__reveal">
          <nav className="site-footer-v2__nav" aria-label={common.footer.navigationLabel}>
            {NAV_LINKS.map((link) => (
              <Link href={link.href} key={link.href}><span>{common.navigation[link.labelKey]}</span></Link>
            ))}
          </nav>

          <div className="site-footer-v2__desk">
            <span>{common.footer.tradeDesk}</span>
            <Link href="/#trade">{common.footer.exportConversation} ↗</Link>
          </div>
        </div>

        <Link className="site-footer-v2__wordmark site-footer-v2__reveal" href="/" aria-label={common.accessibility.footerHome}>
          <Image src="/assets/agrica-logo.png" alt="" width={1024} height={341} sizes="100vw" />
        </Link>

        <div className="site-footer-v2__legal site-footer-v2__reveal">
          <span>© 2026 AGRICA</span>
          <span>{common.navigation.agricultureCairo}</span>
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
