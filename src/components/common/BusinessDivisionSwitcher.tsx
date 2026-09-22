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

  return (
    <nav
      className={styles.switcher}
      data-tone={tone}
      aria-label={common.divisions.navigationLabel}
    >
      {DIVISIONS.map((division) => {
        const isActive = division.id === activeDivisionId;
        const displayLabel = common.divisions[division.id === "produce" ? "produce" : "herbsSpices"];

        return (
          <Link
            key={division.id}
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
            <span className={styles.narrowLabel} aria-hidden="true">
              {division.id === "produce" ? "P" : "H"}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
