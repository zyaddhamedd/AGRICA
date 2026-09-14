"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import type { HeaderVariant } from "./SiteHeader";

export interface SiteFooterProps {
  readonly variant?: HeaderVariant;
  readonly onPrimaryAction?: () => void;
}

const FOOTER_COPY: Record<HeaderVariant, { readonly eyebrow: string; readonly cta: string; readonly href: string }> = {
  home: { eyebrow: "One origin · Three worlds", cta: "Explore our produce", href: "/products" },
  products: { eyebrow: "Your next export programme", cta: "Build your quotation", href: "#product-atlas-main" },
  standard: { eyebrow: "Controlled from origin", cta: "Discover our products", href: "/products" },
  internal: { eyebrow: "Egyptian origin · Global readiness", cta: "Explore our produce", href: "/products" },
};

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Our standard", href: "/standard" },
  { label: "Company", href: "/#company" },
  { label: "Start a trade", href: "/#trade" },
] as const;

export function SiteFooter({ variant = "home", onPrimaryAction }: SiteFooterProps): React.JSX.Element {
  const footerRef = useRef<HTMLElement>(null);
  const copy = FOOTER_COPY[variant];
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
          <span>Cairo, Egypt</span>
        </div>

        <div className="site-footer-v2__statement">
          <div className="site-footer-v2__copy site-footer-v2__reveal">
            <p className="site-footer-v2__eyebrow">{copy.eyebrow}</p>
            <h2 id="site-footer-title">
              Egyptian origin.
              <br />
              Ready for the <em>world.</em>
            </h2>
            <p className="site-footer-v2__description">
              Fresh, frozen and dried produce prepared for global supply.
            </p>
          </div>

          <div className="site-footer-v2__action-wrap site-footer-v2__reveal">
            <span>Begin here</span>
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
          <nav className="site-footer-v2__nav" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <Link href={link.href} key={link.href}><span>{link.label}</span></Link>
            ))}
          </nav>

          <div className="site-footer-v2__desk">
            <span>Trade desk</span>
            <Link href="/#trade">Start an export conversation ↗</Link>
          </div>
        </div>

        <Link className="site-footer-v2__wordmark site-footer-v2__reveal" href="/" aria-label="AGRICA home">
          <Image src="/assets/agrica-logo.png" alt="" width={1024} height={341} sizes="100vw" />
        </Link>

        <div className="site-footer-v2__legal site-footer-v2__reveal">
          <span>© 2026 AGRICA</span>
          <span>Agriculture Cairo</span>
          <button
            type="button"
            className="site-footer-v2__top-link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
