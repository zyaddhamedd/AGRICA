import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicProductCardContent } from "@/data/productCardContent";
import { productImageFor } from "@/data/productImages";
import { productCardFieldLabel } from "@/content/produce/product-card-labels";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { pageMetadata } from "@/seo/metadata";
import { seoProductBySlug, SEO_PRODUCTS } from "@/seo/products";
import { localizedUrl } from "@/seo/site";
import styles from "./page.module.css";

type Params = Promise<{ lang: string; slug: string }>;
async function context(params: Params) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = seoProductBySlug(slug);
  if (!product) notFound();
  return { lang, product, dictionary: await getDictionary(lang) };
}

export function generateStaticParams(): { lang: Locale; slug: string }[] {
  return locales.flatMap((lang) => SEO_PRODUCTS.map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, product, dictionary } = await context(params);
  const name = dictionary.products.products[product.id].name;
  return pageMetadata(lang, `/products/${product.slug}`, {
    title: `${name} | ${dictionary.products.worlds[product.world].label}`,
    description: `${name}. ${dictionary.common.navigation.exportStatement} ${dictionary.products.ui.productSpecifications}.`,
  });
}

export default async function ProductPage({ params }: { params: Params }): Promise<React.JSX.Element> {
  const { lang, product, dictionary } = await context(params);
  const { common, products } = dictionary;
  const name = products.products[product.id].name;
  const image = productImageFor(product.id);
  const fields = getPublicProductCardContent(product.id).fields;
  const breadcrumbs = [
    { name: common.navigation.home, path: "/" },
    { name: common.navigation.products, path: "/products" },
    { name, path: `/products/${product.slug}` },
  ];
  return (
    <>
      <SiteHeader variant="internal" theme="navy" />
      <main className={styles.page} id="main" data-product-profile={product.id}>
        <nav className={styles.breadcrumbs} aria-label={common.navigation.sitePagesLabel}>
          <ol>{breadcrumbs.map((crumb) => <li key={crumb.path}><Link prefetch={false} href={localePath(lang, crumb.path)} aria-current={crumb.path.endsWith(product.slug) ? "page" : undefined}>{crumb.name}</Link></li>)}</ol>
        </nav>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{products.worlds[product.world].label} · {products.ui.egypt}</p>
            <h1>{name}</h1>
            <p className={styles.description}>{common.navigation.exportStatement}</p>
            <div className={styles.actions}>
              <a href={`mailto:info@agriculturecairo.com?subject=${encodeURIComponent(`AGRICA — ${name}`)}`}>{common.footer.exportConversation}</a>
              <Link prefetch={false} href="/contact">{common.actions.contact} ↗</Link>
            </div>
          </div>
          {image && <div className={styles.visual}><Image src={image} alt={products.products[product.id].imageAlt} fill sizes="(max-width: 720px) calc(100vw - 2.5rem), 36vw" /></div>}
        </div>
        <section className={styles.specifications} aria-labelledby="profile-specifications">
          <h2 id="profile-specifications">{products.ui.productSpecifications}</h2>
          <dl>{fields.map((field) => <div key={field.labelKey}><dt>{productCardFieldLabel(lang, field.labelKey)}</dt><dd lang="en" dir="ltr">{field.value}</dd></div>)}</dl>
        </section>
        <nav className={styles.related} aria-label={common.footer.discoverProducts}>
          <h2>{common.footer.discoverProducts}</h2>
          <Link prefetch={false} href={localePath(lang, `/products?world=${product.world}`)}>{products.worlds[product.world].label} ↗</Link>
          {SEO_PRODUCTS.filter((item) => item.id !== product.id).map((item) => <Link prefetch={false} key={item.id} href={localePath(lang, `/products/${item.slug}`)}>{products.products[item.id].name} ↗</Link>)}
        </nav>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: localizedUrl(lang, crumb.path) })) }} />
      </main>
      <SiteFooter variant="internal" />
    </>
  );
}
