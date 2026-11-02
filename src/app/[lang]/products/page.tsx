import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { isWorldId } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore AGRICA's fresh and frozen Egyptian produce and build an export enquiry.",
};

async function ProductsQueryBridge({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const requestedWorld = (await searchParams).world;
  const initialWorld = isWorldId(requestedWorld) ? requestedWorld : "fresh";
  return <ProductsExplorer key={initialWorld} initialWorld={initialWorld} />;
}

export default function ProductsPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): React.JSX.Element {
  return (
    <Suspense fallback={<ProductsExplorer initialWorld="fresh" />}>
      <ProductsQueryBridge searchParams={searchParams} />
    </Suspense>
  );
}
