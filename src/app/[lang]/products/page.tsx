import { getDictionary } from "@/i18n/get-dictionary";
import { divisionPageMetadata } from "@/divisions/metadata";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { isWorldId } from "@/data/products";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return divisionPageMetadata(lang, "produce", "products", {
    title: `${dictionary.products.heroLead} ${dictionary.products.heroEmphasis}`,
    description: `${dictionary.products.worlds.fresh.label} · ${dictionary.products.worlds.frozen.label}. ${dictionary.common.navigation.exportStatement}`,
  });
}

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
