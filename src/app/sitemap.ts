import { SEO_PRODUCTS } from "@/seo/products";
import { productImageFor } from "@/data/productImages";
import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl, INDEXABLE_LOCALIZED_PATHS, languageAlternates, localizedUrl } from "@/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...INDEXABLE_LOCALIZED_PATHS.flatMap((path) => locales.map((locale) => ({ url: localizedUrl(locale, path), alternates: { languages: languageAlternates(path) } }))),
    ...SEO_PRODUCTS.flatMap((product) => locales.map((locale) => ({
      url: localizedUrl(locale, `/products/${product.slug}`),
      alternates: { languages: languageAlternates(`/products/${product.slug}`) },
      images: productImageFor(product.id) ? [absoluteUrl(productImageFor(product.id)!)] : [],
    }))),
    // Company main content and standalone Contact currently exist in English only.
    { url: localizedUrl("en", "/company") },
    { url: absoluteUrl("/contact") },
  ];
}
