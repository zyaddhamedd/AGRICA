import React from "react";
import Link from "next/link";
import type { HeaderVariant } from "./SiteHeader";

export interface SiteFooterProps {
  readonly variant?: HeaderVariant;
}

export function SiteFooter({ variant = "home" }: SiteFooterProps): React.JSX.Element {
  const footerClass = variant === "standard" ? "standard-footer" : undefined;

  return (
    <footer className={footerClass}>
      <Link
        className="brand brand--footer"
        href={variant === "home" ? "#top" : "/"}
        aria-label="AGRICA home"
      >
        <strong>AGRĪCA</strong>
        <small>Agriculture Cairo</small>
      </Link>
      <p>Egyptian produce. Prepared for global supply.</p>
      <div>
        <span>Cairo, Egypt</span>
        <span>© 2026 AGRICA</span>
      </div>
    </footer>
  );
}
