import Link from "next/link";
import type { Dictionary } from "@/i18n/types";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/navigation";
import { SEO_PRODUCTS } from "@/seo/products";
import { localizedUrl } from "@/seo/site";
import { JsonLd } from "./JsonLd";
import styles from "./ProductDiscovery.module.css";

export function ProductDiscovery({ locale, dictionary }: { readonly locale: Locale; readonly dictionary: Dictionary }): React.JSX.Element {
  return (
    <section className={styles.section} aria-labelledby="product-discovery-title" data-product-discovery>
      <div className={styles.intro}>
        <p>{dictionary.common.navigation.b2bExport}</p>
        <h2 id="product-discovery-title">{dictionary.common.footer.discoverProducts}</h2>
      </div>
      <nav className={styles.worlds} aria-label={dictionary.products.worldNavigation}>
        {(["fresh", "frozen"] as const).map((world) => <Link prefetch={false} key={world} href={localePath(locale, `/products?world=${world}`)}>{dictionary.products.worlds[world].label} <span aria-hidden="true">↗</span></Link>)}
      </nav>
      <ul className={styles.list}>
        {SEO_PRODUCTS.map((product) => <li key={product.id}><Link prefetch={false} href={localePath(locale, `/products/${product.slug}`)}><span>{dictionary.products.products[product.id].name}</span><small>{dictionary.products.worlds[product.world].label}</small><span aria-hidden="true">↗</span></Link></li>)}
      </ul>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: SEO_PRODUCTS.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: dictionary.products.products[product.id].name, url: localizedUrl(locale, `/products/${product.slug}`) })) }} />
    </section>
  );
}
