import { divisionPageMetadata } from "@/divisions/metadata";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import React from "react";
import { StandardPageContent } from "@/components/standard/StandardPageContent";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    ...divisionPageMetadata(lang, "produce", "standard"),
    title: "Our Standard",
    description:
      "Follow how AGRICA manages Egyptian produce from source selection to export coordination.",
  };
}

export default function StandardPage(): React.JSX.Element {
  return <StandardPageContent />;
}
