"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { DIVISIONS } from "@/divisions/registry";
import {
  mapPathnameToDivision,
  resolveDivisionFromPathname,
} from "@/divisions/routing";
import styles from "./BusinessDivisionSwitcher.module.css";

export interface BusinessDivisionSwitcherProps {
  readonly tone?: "light" | "dark";
}

export function BusinessDivisionSwitcher({
  tone = "dark",
}: BusinessDivisionSwitcherProps): React.JSX.Element {
  const pathname = usePathname();
  const activeDivisionId = resolveDivisionFromPathname(pathname);

  return (
    <nav
      className={styles.switcher}
      data-tone={tone}
      aria-label="AGRICA business divisions"
    >
      {DIVISIONS.map((division) => {
        const isActive = division.id === activeDivisionId;
        const displayLabel = division.label.replace(/^AGRICA\s+/i, "");

        return (
          <Link
            key={division.id}
            className={styles.divisionLink}
            href={mapPathnameToDivision(pathname, division.id)}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            aria-label={
              isActive
                ? `${division.label}, current business division`
                : `Switch to ${division.label}`
            }
          >
            <span className={styles.fullLabel}>{displayLabel}</span>
            <span className={styles.compactLabel} aria-hidden="true">
              {division.id === "produce" ? "P" : "H&S"}
            </span>
            <span className={styles.narrowLabel} aria-hidden="true">
              {division.id === "produce" ? "P" : "H"}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
