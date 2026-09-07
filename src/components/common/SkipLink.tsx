"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function SkipLink(): React.JSX.Element {
  const pathname = usePathname();

  if (pathname === "/standard") {
    return (
      <a className="skip-link" href="#standard-journey">
        Skip to the standard journey
      </a>
    );
  }

  if (pathname === "/products") {
    return (
      <a className="skip-link" href="#product-explorer">
        Skip to product explorer
      </a>
    );
  }

  return (
    <a className="skip-link" href="#main">
      Skip to main content
    </a>
  );
}

