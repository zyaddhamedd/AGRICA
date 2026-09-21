import type { Metadata } from "next";
import React from "react";
import { HerbsSpicesFooter } from "@/components/herbs-spices/layout/HerbsSpicesFooter";
import { HerbsSpicesHeader } from "@/components/herbs-spices/layout/HerbsSpicesHeader";
import styles from "./theme.module.css";

export const metadata: Metadata = {
  title: "Herbs & Spices",
  description:
    "Design foundation preview for AGRICA's Herbs & Spices business division.",
  robots: {
    index: false,
    follow: false,
  },
};

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
