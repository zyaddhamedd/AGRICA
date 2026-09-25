"use client";

import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";
import { BusinessDivisionSwitcher } from "@/components/common/BusinessDivisionSwitcher";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useCommonDictionary } from "@/i18n/locale-context";
import { HerbsSpicesMenu } from "./HerbsSpicesMenu";
import styles from "./HerbsSpicesHeader.module.css";

export function HerbsSpicesHeader(): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const common = useCommonDictionary();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/herbs-spices">
          <Image
            className={styles.logo}
            src="/assets/agrica-logo-brand.png"
            alt="AGRICA"
            width={1024}
            height={341}
            priority
          />
          <span className={styles.brandRule} aria-hidden="true">/</span>
          <span className={styles.divisionName}>{common.divisions.herbsSpices}</span>
        </Link>

        <div className={styles.actions}>
          <BusinessDivisionSwitcher tone="light" />
          <LanguageSwitcher className={styles.language} tone="light" />

          <button
            ref={menuTriggerRef}
            className={styles.menuTrigger}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="herbs-spices-menu"
            aria-label={isMenuOpen ? common.divisions.herbsMenuClose : common.divisions.herbsMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span>{isMenuOpen ? common.navigation.close : common.navigation.menu}</span>
            <i aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <HerbsSpicesMenu
          onClose={closeMenu}
          triggerRef={menuTriggerRef}
        />
      )}
    </header>
  );
}
