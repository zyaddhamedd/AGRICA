import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./contact.css";

const title = "AGRICA Connect | Egyptian Agricultural Exports";
const description =
  "Connect with AGRICA Produce and AGRICA Herbs & Spices, view the official company profiles, or save AGRICA's contact details.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.agriculturecairo.com"),
  title,
  description,
  alternates: { canonical: "/contact" },
  icons: { icon: "/assets/agrica-leaf.svg" },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "AGRICA",
    title,
    description,
    images: [{
      url: "/contact/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "AGRICA Connect — Egyptian Agricultural Exports",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/contact/opengraph-image.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8f3",
};

export default function ContactLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="connect-body">{children}</body>
    </html>
  );
}
