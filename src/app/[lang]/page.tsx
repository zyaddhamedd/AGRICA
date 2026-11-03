import { getDictionary } from "@/i18n/get-dictionary";
import { divisionPageMetadata } from "@/divisions/metadata";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import React from "react";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { WorldsSection } from "@/components/home/WorldsSection";
import { SeasonSection } from "@/components/home/SeasonSection";
import { CompanySection } from "@/components/home/CompanySection";
import { QualityDocumentationSection } from "@/components/herbs-spices/home/QualityDocumentationSection";
import { TradeSection } from "@/components/home/TradeSection";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return divisionPageMetadata(lang, "produce", "home", {
    title: `${dictionary.common.navigation.b2bExport} | ${dictionary.common.navigation.produceWorlds}`,
    description: dictionary.common.navigation.exportStatement,
  });
}

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <main id="main">
        <HeroSection />
        <WorldsSection />
        <SeasonSection />
        <CompanySection />
        <QualityDocumentationSection />
        <TradeSection />
      </main>
      <SiteFooter variant="home" />
    </>
  );
}
