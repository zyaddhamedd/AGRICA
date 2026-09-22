import type { Metadata } from "next";
import React from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { isWorldId } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore AGRICA's fresh, frozen and dried Egyptian produce and build an export enquiry.",
};

export default async function ProductsPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const requestedWorld = (await searchParams).world;
  const initialWorld = isWorldId(requestedWorld) ? requestedWorld : "fresh";
  return <ProductsExplorer initialWorld={initialWorld} />;
}
