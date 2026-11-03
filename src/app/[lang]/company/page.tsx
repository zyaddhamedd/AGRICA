import { pageMetadata } from "@/seo/metadata";
import type { Locale } from "@/i18n/config";
import { COMPANY_HERO } from "@/data/company";
import type { Metadata } from "next";
import React from "react";
import { CompanyPageContent } from "@/components/company/CompanyPageContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(lang, "/company", {
    title: "The Company — Egyptian Origin & International Discipline",
    description: COMPANY_HERO.supporting,
  }, { translated: false, canonicalLocale: "en" });
}

export default function CompanyPage(): React.JSX.Element {
  return <div lang="en"><CompanyPageContent /></div>;
}
