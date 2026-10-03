import type { Metadata } from "next";
import React from "react";
import { CompanyPageContent } from "@/components/company/CompanyPageContent";

export const metadata: Metadata = {
  title: "The Company — Egyptian Origin & International Discipline",
  description:
    "Explore AGRICA's agricultural origin in Egypt, observable field and packhouse operations, rigorous produce grading, and global export coordination.",
};

export default function CompanyPage(): React.JSX.Element {
  return <CompanyPageContent />;
}
