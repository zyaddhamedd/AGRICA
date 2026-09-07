import React from "react";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { WorldsSection } from "@/components/home/WorldsSection";
import { SeasonSection } from "@/components/home/SeasonSection";
import { StandardPreviewSection } from "@/components/home/StandardPreviewSection";
import { CompanySection } from "@/components/home/CompanySection";
import { TradeSection } from "@/components/home/TradeSection";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <SiteHeader variant="home" />
      <main id="main">
        <HeroSection />
        <WorldsSection />
        <SeasonSection />
        <StandardPreviewSection />
        <CompanySection />
        <TradeSection />
      </main>
      <SiteFooter variant="home" />
    </>
  );
}
