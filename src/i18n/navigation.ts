import { defaultLocale, isLocale, type Locale } from "./config";

const EXTERNAL_SCHEME = /^[a-z][a-z\d+.-]*:/i;

function splitHref(href: string): { pathname: string; suffix: string } {
  const suffixIndex = href.search(/[?#]/);
  if (suffixIndex === -1) return { pathname: href, suffix: "" };
  return { pathname: href.slice(0, suffixIndex), suffix: href.slice(suffixIndex) };
}

function normalizedPathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

/** Returns the supported leading locale, or null for semantic/unprefixed paths. */
export function localeFromPathname(pathname: string): Locale | null {
  const { pathname: pathOnly } = splitHref(pathname);
  const firstSegment = normalizedPathname(pathOnly).split("/")[1];
  return isLocale(firstSegment) ? firstSegment : null;
}

/** Removes one valid leading locale while retaining query and hash fragments. */
export function stripLocaleFromPath(href: string): string {
  const { pathname, suffix } = splitHref(href);
  const normalized = normalizedPathname(pathname);
  const locale = localeFromPathname(normalized);
  if (!locale) return `${normalized}${suffix}`;

  const stripped = normalized.slice(locale.length + 1) || "/";
  return `${stripped.startsWith("/") ? stripped : `/${stripped}`}${suffix}`;
}

/**
 * Prefixes a semantic internal URL or replaces its existing locale prefix.
 * Query strings and hash fragments are preserved verbatim.
 */
export function localePath(locale: Locale, href: string): string {
  if (!href || href.startsWith("#") || href.startsWith("//") || EXTERNAL_SCHEME.test(href)) {
    return href;
  }

  const semanticHref = stripLocaleFromPath(href);
  const { pathname, suffix } = splitHref(semanticHref);
  const normalized = normalizedPathname(pathname);
  const localizedPath = normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
  return `${localizedPath}${suffix}`;
}

export function replaceLocale(href: string, locale: Locale): string {
  return localePath(locale, href);
}

const produceWorlds = new Set(["fresh", "frozen", "dried"]);
const herbsFamilies = new Set([
  "herbs", "flowers", "seeds", "spices", "roots", "dehydrated-vegetables",
]);

function validatedSwitchSearch(semanticPathname: string, search: string): string {
  const input = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const output = new URLSearchParams();

  if (semanticPathname === "/products") {
    const world = input.get("world");
    if (world && produceWorlds.has(world)) output.set("world", world);
  }

  if (semanticPathname === "/herbs-spices/products") {
    const family = input.get("family");
    if (family && herbsFamilies.has(family)) output.set("family", family);
  }

  const serialized = output.toString();
  return serialized ? `?${serialized}` : "";
}

function validatedSwitchHash(semanticPathname: string, hash: string): string {
  if (!hash.startsWith("#")) return "";
  const anchor = hash.slice(1);

  if (semanticPathname === "/") {
    return ["top", "main", "company", "trade"].includes(anchor) ? hash : "";
  }
  if (semanticPathname === "/products") {
    return ["product-explorer", "product-atlas-main"].includes(anchor) ? hash : "";
  }
  if (semanticPathname === "/standard" || semanticPathname === "/herbs-spices/standard") {
    return /^stage-[a-z0-9-]+$/.test(anchor) ? hash : "";
  }
  if (semanticPathname === "/herbs-spices") {
    return ["start-a-trade", "ingredient-families", "ingredient-forms", "agrica-trust"].includes(anchor) ? hash : "";
  }
  return "";
}

/** Builds an equivalent locale route while retaining only known route state. */
export function languageSwitchPath(
  locale: Locale,
  pathname: string,
  search = "",
  hash = "",
): string {
  const semanticPathname = stripLocaleFromPath(pathname).split(/[?#]/, 1)[0] || "/";
  return localePath(
    locale,
    `${semanticPathname}${validatedSwitchSearch(semanticPathname, search)}${validatedSwitchHash(semanticPathname, hash)}`,
  );
}

export function localeOrDefaultFromPathname(pathname: string): Locale {
  return localeFromPathname(pathname) ?? defaultLocale;
}
