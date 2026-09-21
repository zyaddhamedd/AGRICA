import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./HerbsSpicesFooter.module.css";

export function HerbsSpicesFooter(): React.JSX.Element {
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
          <strong>Herbs &amp; Spices</strong>
        </Link>

        <p className={styles.parentStatement}>An AGRICA business division.</p>

        <div className={styles.utility}>
          <nav aria-label="Herbs & Spices footer navigation">
            <Link href="/herbs-spices">Home</Link>
            <Link href="/herbs-spices/products">Products</Link>
            <Link href="/herbs-spices/standard">Process</Link>
          </nav>
          <span>© 2026 AGRICA</span>
        </div>
      </div>
    </footer>
  );
}
