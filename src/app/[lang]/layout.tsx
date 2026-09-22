import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import React from "react";
import "@/styles/globals.css";
import "@/styles/products.css";
import "@/styles/standard.css";
import "@/styles/footer.css";
import { SkipLink } from "@/components/common/SkipLink";
import { directionForLocale, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LocaleProvider } from "@/i18n/locale-context";

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

export function generateStaticParams(): Array<{ lang: string }> {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{ lang: string }>;
}): Promise<React.JSX.Element> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} dir={directionForLocale(lang)}>
      <body>
        <LocaleProvider locale={lang} dictionary={dictionary}>
          <SkipLink />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
