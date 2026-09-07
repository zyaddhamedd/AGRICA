import type { Metadata } from "next";
import React from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore AGRICA's fresh, frozen and dried Egyptian produce and build an export enquiry.",
};

export default function ProductsPage(): React.JSX.Element {
  return <ProductsExplorer />;
}
