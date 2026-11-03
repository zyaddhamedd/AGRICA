import assert from "node:assert/strict";
import nextConfig from "../next.config";
import { locales } from "../src/i18n/config";
import {
  localeFromPathname,
  languageSwitchPath,
  localePath,
  replaceLocale,
  stripLocaleFromPath,
} from "../src/i18n/navigation";

assert.equal(localePath("en", "/products"), "/en/products");
assert.equal(
  localePath("ar", "/herbs-spices/products?family=spices#catalogue"),
  "/ar/herbs-spices/products?family=spices#catalogue",
);
assert.equal(localePath("ru", "/en/standard"), "/ru/standard");
assert.equal(localePath("fr", "/fr/products?world=fresh"), "/fr/products?world=fresh");
assert.equal(localePath("de", "/"), "/de/");
assert.equal(localePath("de", "#process"), "#process");
assert.equal(localePath("de", "mailto:trade@example.com"), "mailto:trade@example.com");
assert.equal(localePath("de", "https://example.com/products"), "https://example.com/products");
assert.equal(replaceLocale("/ar/products?world=frozen#atlas", "en"), "/en/products?world=frozen#atlas");
assert.equal(stripLocaleFromPath("/ru/herbs-spices/products?family=roots"), "/herbs-spices/products?family=roots");
assert.equal(localeFromPathname("/fr/standard"), "fr");
assert.equal(localeFromPathname("/es/standard"), null);
assert.equal(languageSwitchPath("ar", "/en/products", "?world=frozen", ""), "/ar/products?world=frozen");
assert.equal(languageSwitchPath("ru", "/ar/products", "?world=dried", ""), "/ru/products");
assert.equal(languageSwitchPath("fr", "/ru/standard", "", "#stage-04"), "/fr/standard#stage-04");
assert.equal(
  languageSwitchPath("ar", "/fr/herbs-spices/products", "?family=spices", ""),
  "/ar/herbs-spices/products?family=spices",
);
assert.equal(languageSwitchPath("de", "/en/products", "?world=invalid&debug=1", "#unknown"), "/de/products");
assert.equal(languageSwitchPath("de", "/en/standard", "?debug=1", "#stage-packing"), "/de/standard#stage-packing");

const routeSuffixes = [
  "",
  "/products",
  "/standard",
  "/herbs-spices",
  "/herbs-spices/products",
  "/herbs-spices/standard",
] as const;

assert.equal(
  locales.flatMap((locale) => routeSuffixes.map((suffix) => `/${locale}${suffix}`)).length,
  30,
);

async function verifyRedirects(): Promise<void> {
  assert.ok(nextConfig.redirects);
  const redirects = await nextConfig.redirects();
  assert.deepEqual(
    redirects.map(({ source, destination, permanent }) => ({ source, destination, permanent })),
    [
      { source: "/", destination: "/en", permanent: true },
      { source: "/products", destination: "/en/products", permanent: true },
      { source: "/standard", destination: "/en/standard", permanent: true },
      { source: "/company", destination: "/en/company", permanent: true },
      { source: "/herbs-spices", destination: "/en/herbs-spices", permanent: true },
      { source: "/herbs-spices/products", destination: "/en/herbs-spices/products", permanent: true },
      { source: "/herbs-spices/standard", destination: "/en/herbs-spices/standard", permanent: true },
    ],
  );

  console.log("✓ Locale path generation, replacement, and semantic stripping verified");
  console.log("✓ Thirty locale-prefixed route combinations enumerated");
  console.log("✓ Six permanent English legacy redirects configured");
}

async function verifyHeaders(): Promise<void> {
  assert.ok(nextConfig.headers, "nextConfig.headers must be defined");
  const headers = await nextConfig.headers();
  assert.ok(Array.isArray(headers), "headers must return an array");

  const staticSources = [
    "/assets/:path*",
    "/certificates/:path*",
    "/herbs-background/:path*",
    "/fonts/:path*",
    "/_next/static/:path*",
    "/agrica-logo.png",
  ];

  for (const src of staticSources) {
    const entry = headers.find((h) => h.source === src);
    assert.ok(entry, `Header rule for ${src} must exist`);
    const cc = entry.headers.find((h) => h.key.toLowerCase() === "cache-control");
    assert.ok(cc, `Cache-Control header for ${src} must exist`);
    assert.equal(cc.value, "public, max-age=31536000, immutable");
  }

  const contactEntry = headers.find((h) => h.source === "/contact/:file(.+\\.(?:pdf|vcf))");
  assert.ok(contactEntry, "Header rule for contact files must exist");
  const contactCc = contactEntry?.headers.find((h) => h.key.toLowerCase() === "cache-control");
  assert.ok(contactCc, "Cache-Control header for contact files must exist");
  assert.equal(contactCc.value, "public, max-age=3600, must-revalidate");

  console.log("✓ Public static asset cache headers verified");
  console.log("✓ Mutable contact documents short cache-control verified");
}

async function main(): Promise<void> {
  await verifyRedirects();
  await verifyHeaders();
}

void main();
