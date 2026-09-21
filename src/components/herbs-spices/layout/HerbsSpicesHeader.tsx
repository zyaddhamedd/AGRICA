"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useRef, useState } from "react";
import { BusinessDivisionSwitcher } from "@/components/common/BusinessDivisionSwitcher";
import { HerbsSpicesMenu } from "./HerbsSpicesMenu";
import styles from "./HerbsSpicesHeader.module.css";

export function HerbsSpicesHeader(): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/herbs-spices">
          <Image
            className={styles.logo}
            src="/assets/agrica-logo.png"
            alt="AGRICA"
            width={1024}
            height={341}
            priority
          />
          <span className={styles.brandRule} aria-hidden="true" />
          <span className={styles.divisionName}>Herbs &amp; Spices</span>
        </Link>

        <div className={styles.actions}>
          <BusinessDivisionSwitcher tone="dark" />

          <button
            ref={menuTriggerRef}
            className={styles.menuTrigger}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="herbs-spices-menu"
            aria-label={isMenuOpen ? "Close Herbs & Spices menu" : "Open Herbs & Spices menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span>{isMenuOpen ? "Close" : "Menu"}</span>
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
