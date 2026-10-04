"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DIVISIONS } from "@/divisions/registry";
import {
  mapPathnameToDivision,
  resolveDivisionFromPathname,
} from "@/divisions/routing";
import styles from "./BusinessDivisionSwitcher.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface BusinessDivisionSwitcherProps {
  readonly tone?: "light" | "dark";
}

export function BusinessDivisionSwitcher({
  tone = "dark",
}: BusinessDivisionSwitcherProps): React.JSX.Element {
  const pathname = usePathname();
  const common = useCommonDictionary();
  const activeDivisionId = resolveDivisionFromPathname(pathname);

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = linkRefs.current[activeDivisionId];
      if (activeEl && navRef.current && activeEl.offsetWidth > 0) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };

    updateIndicator();
    const rafId = requestAnimationFrame(updateIndicator);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateIndicator);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateIndicator);
      if (navRef.current) resizeObserver.observe(navRef.current);
      Object.values(linkRefs.current).forEach((node) => {
        if (node) resizeObserver?.observe(node);
      });
    }

    window.addEventListener("resize", updateIndicator);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeDivisionId, pathname]);

  return (
    <nav
      ref={navRef}
      className={styles.switcher}
      data-tone={tone}
      aria-label={common.divisions.navigationLabel}
    >
      {DIVISIONS.map((division) => {
        const isActive = division.id === activeDivisionId;
        const displayLabel =
          common.divisions[
            division.id === "produce" ? "produce" : "herbsSpices"
          ];

        return (
          <Link
            key={division.id}
            ref={(node) => {
              linkRefs.current[division.id] = node;
            }}
            className={styles.divisionLink}
            href={mapPathnameToDivision(pathname, division.id)}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            aria-label={
              isActive
                ? formatMessage(common.divisions.current, { division: displayLabel })
                : formatMessage(common.divisions.switchTo, { division: displayLabel })
            }
          >
            <span className={styles.fullLabel}>{displayLabel}</span>
            <span className={styles.compactLabel} aria-hidden="true">
              {division.id === "produce" ? "P" : "H&S"}
            </span>
          </Link>
        );
      })}
      <span
        className={styles.indicator}
        style={
          indicatorStyle
            ? {
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: 1,
              }
            : { opacity: 0 }
        }
        aria-hidden="true"
      />
    </nav>
  );
}
