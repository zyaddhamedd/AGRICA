import type { Metadata, Viewport } from "next";
import React from "react";
import "@/styles/globals.css";
import "@/styles/products.css";
import "@/styles/standard.css";
import { SkipLink } from "@/components/common/SkipLink";

export const metadata: Metadata = {
  title: {
    default: "AGRICA — One Origin. Three Worlds.",
    template: "%s — AGRICA",
  },
  description:
    "AGRICA supplies Egyptian produce to global markets across fresh, frozen and dried categories.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8f3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
