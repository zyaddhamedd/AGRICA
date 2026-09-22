"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { stripLocaleFromPath } from "@/i18n/navigation";
import { useCommonDictionary } from "@/i18n/locale-context";

export function SkipLink(): React.JSX.Element {
  const pathname = usePathname();
  const common = useCommonDictionary();
  const semanticPathname = stripLocaleFromPath(pathname);

  if (semanticPathname === "/standard") {
    return (
      <a className="skip-link" href="#standard-journey">
        {common.accessibility.skipStandard}
      </a>
    );
  }

  if (semanticPathname === "/products") {
    return (
      <a className="skip-link" href="#product-explorer">
        {common.accessibility.skipProducts}
      </a>
    );
  }

  return (
    <a className="skip-link" href="#main">
      {common.accessibility.skipMain}
    </a>
  );
}
