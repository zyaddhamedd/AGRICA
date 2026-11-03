import { ProductDiscovery } from "@/components/seo/ProductDiscovery";
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
  discovery,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
  readonly discovery?: React.ReactNode;
}): Promise<React.JSX.Element> {
  const requestedWorld = (await searchParams).world;
  const initialWorld = isWorldId(requestedWorld) ? requestedWorld : "fresh";
  return <ProductsExplorer key={initialWorld} initialWorld={initialWorld} discovery={discovery} />;
}

export default async function ProductsPage({
  searchParams,
  params,
}: {
  readonly params: Promise<{ lang: Locale }>;
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return (
    <Suspense fallback={<ProductsExplorer initialWorld="fresh" />}>
      <ProductsQueryBridge searchParams={searchParams} discovery={<ProductDiscovery locale={lang} dictionary={dictionary} />} />
    </Suspense>
  );
}
