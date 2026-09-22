"use client";

import Image from "next/image";
import React from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import styles from "./HerbsSpicesFooter.module.css";
import { useCommonDictionary } from "@/i18n/locale-context";

export function HerbsSpicesFooter(): React.JSX.Element {
  const common = useCommonDictionary();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/herbs-spices">
          <Image
            className={styles.logo}
            src="/assets/agrica-logo.png"
            alt="AGRICA"
            width={1024}
            height={341}
          />
          <span aria-hidden="true" />
          <strong>{common.divisions.herbsSpices}</strong>
        </Link>

        <p className={styles.parentStatement}>{common.divisions.businessDivision}</p>

        <div className={styles.utility}>
          <nav aria-label={common.footer.navigationLabel}>
            <Link href="/herbs-spices">{common.navigation.home}</Link>
            <Link href="/herbs-spices/products">{common.navigation.products}</Link>
            <Link href="/herbs-spices/standard">{common.divisions.process}</Link>
          </nav>
          <span>© 2026 AGRICA</span>
        </div>
      </div>
    </footer>
  );
}
