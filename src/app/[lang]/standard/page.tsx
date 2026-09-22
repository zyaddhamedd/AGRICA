import type { Metadata } from "next";
import React from "react";
import { StandardPageContent } from "@/components/standard/StandardPageContent";

export const metadata: Metadata = {
  title: "Our Standard",
  description:
    "Follow how AGRICA manages Egyptian produce from source selection to export coordination.",
};

export default function StandardPage(): React.JSX.Element {
  return <StandardPageContent />;
}
