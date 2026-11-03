import { getDictionary } from "@/i18n/get-dictionary";
import { divisionPageMetadata } from "@/divisions/metadata";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import React from "react";
import { StandardPageContent } from "@/components/standard/StandardPageContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const copy = dictionary.standard.produce.hero;
  return divisionPageMetadata(lang, "produce", "standard", {
    title: `${copy.titleLead} ${copy.titleEmphasis} ${copy.titleClose}`,
    description: copy.description,
  });
}

export default function StandardPage(): React.JSX.Element {
  return <StandardPageContent />;
}
