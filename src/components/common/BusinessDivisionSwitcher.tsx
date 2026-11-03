"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DIVISIONS } from "@/divisions/registry";
import { mapPathnameToDivision, resolveDivisionFromPathname } from "@/divisions/routing";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";
import styles from "./BusinessDivisionSwitcher.module.css";

export interface BusinessDivisionSwitcherProps {
  readonly tone?: "light" | "dark";
}

export function BusinessDivisionSwitcher({ tone = "dark" }: BusinessDivisionSwitcherProps): React.JSX.Element {
  const pathname = usePathname();
  const common = useCommonDictionary();
  const activeDivisionId = resolveDivisionFromPathname(pathname);

  return (
    <nav className={styles.switcher} data-division-switcher data-tone={tone} aria-label={common.divisions.navigationLabel}>
      {DIVISIONS.map((division) => {
        const isActive = division.id === activeDivisionId;
        const label = common.divisions[division.id === "produce" ? "produce" : "herbsSpices"];
        return (
          <Link
            key={division.id}
            className={styles.divisionLink}
            href={mapPathnameToDivision(pathname, division.id)}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            aria-label={formatMessage(isActive ? common.divisions.current : common.divisions.switchTo, { division: label })}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
