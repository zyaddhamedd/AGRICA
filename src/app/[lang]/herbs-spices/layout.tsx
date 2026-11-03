import React from "react";
import { HerbsSpicesFooter } from "@/components/herbs-spices/layout/HerbsSpicesFooter";
import { HerbsSpicesHeader } from "@/components/herbs-spices/layout/HerbsSpicesHeader";
import styles from "@/app/herbs-spices/theme.module.css";

export default function HerbsSpicesLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.divisionRoot} data-division="herbs-spices">
      <HerbsSpicesHeader />
      <div className={styles.routeContent}>{children}</div>
      <HerbsSpicesFooter />
    </div>
  );
}
