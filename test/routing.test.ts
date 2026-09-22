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
assert.equal(localePath("fr", "/fr/products?world=dried"), "/fr/products?world=dried");
assert.equal(localePath("de", "/"), "/de/");
assert.equal(localePath("de", "#process"), "#process");
assert.equal(localePath("de", "mailto:trade@example.com"), "mailto:trade@example.com");
assert.equal(localePath("de", "https://example.com/products"), "https://example.com/products");
assert.equal(replaceLocale("/ar/products?world=frozen#atlas", "en"), "/en/products?world=frozen#atlas");
assert.equal(stripLocaleFromPath("/ru/herbs-spices/products?family=roots"), "/herbs-spices/products?family=roots");
assert.equal(localeFromPathname("/fr/standard"), "fr");
assert.equal(localeFromPathname("/es/standard"), null);
assert.equal(languageSwitchPath("ar", "/en/products", "?world=frozen", ""), "/ar/products?world=frozen");
assert.equal(languageSwitchPath("ru", "/ar/products", "?world=dried", ""), "/ru/products?world=dried");
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
      { source: "/", destination: "/en/", permanent: true },
      { source: "/products", destination: "/en/products", permanent: true },
      { source: "/standard", destination: "/en/standard", permanent: true },
      { source: "/herbs-spices", destination: "/en/herbs-spices", permanent: true },
      { source: "/herbs-spices/products", destination: "/en/herbs-spices/products", permanent: true },
      { source: "/herbs-spices/standard", destination: "/en/herbs-spices/standard", permanent: true },
    ],
  );

  console.log("✓ Locale path generation, replacement, and semantic stripping verified");
  console.log("✓ Thirty locale-prefixed route combinations enumerated");
  console.log("✓ Six permanent English legacy redirects configured");
}

void verifyRedirects();
