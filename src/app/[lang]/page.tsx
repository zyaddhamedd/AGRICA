import React from "react";
import { SiteFooter } from "@/components/common/SiteFooter";
import { HeroSection } from "@/components/home/HeroSection";
import { WorldsSection } from "@/components/home/WorldsSection";
import { SeasonSection } from "@/components/home/SeasonSection";
import { CompanySection } from "@/components/home/CompanySection";
import { TradeSection } from "@/components/home/TradeSection";

export default function HomePage(): React.JSX.Element {
  return (
    <>
      <main id="main">
        <HeroSection />
        <WorldsSection />
        <SeasonSection />
        <CompanySection />
        <TradeSection />
      </main>
      <SiteFooter variant="home" />
    </>
  );
}
