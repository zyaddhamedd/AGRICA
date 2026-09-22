import { DIVISION_REGISTRY, DIVISIONS } from "./registry";
import type { DivisionDefinition, DivisionId, SemanticPageKind } from "./types";
import { localeOrDefaultFromPathname, localePath, stripLocaleFromPath } from "@/i18n/navigation";

function normalizePathname(pathname: string): string {
  const withoutQueryOrHash = pathname.split(/[?#]/, 1)[0] ?? "/";
  const withLeadingSlash = withoutQueryOrHash.startsWith("/")
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;

  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function isPathWithinBase(pathname: string, basePath: string): boolean {
  if (basePath === "/") return true;
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

/** Resolves the active division from the URL pathname. */
export function resolveDivisionFromPathname(pathname: string): DivisionId {
  const normalizedPathname = normalizePathname(stripLocaleFromPath(pathname));

  const matchingDivision = [...DIVISIONS]
    .filter((division) => division.basePath !== "/")
    .sort((a, b) => b.basePath.length - a.basePath.length)
    .find((division) => isPathWithinBase(normalizedPathname, division.basePath));

  return matchingDivision?.id ?? "produce";
}

/** Resolves an exact registered route to its semantic page role. */
export function resolvePageKindFromPathname(
  pathname: string,
): SemanticPageKind | null {
  const normalizedPathname = normalizePathname(stripLocaleFromPath(pathname));

  for (const division of DIVISIONS) {
    for (const [pageKind, route] of Object.entries(division.routes)) {
      if (normalizePathname(route) === normalizedPathname) {
        return pageKind as SemanticPageKind;
      }
    }
  }

  return null;
}

/**
 * Returns a division route for a semantic page role, falling back to that
 * division's homepage when the page role is not supported.
 */
export function resolveRouteForDivision(
  division: DivisionDefinition,
  pageKind: SemanticPageKind,
): string {
  return division.routes[pageKind] ?? division.routes.home;
}

/** Maps a pathname to the equivalent semantic route in another division. */
export function mapPathnameToDivision(
  pathname: string,
  targetDivisionId: DivisionId,
): string {
  const locale = localeOrDefaultFromPathname(pathname);
  const pageKind = resolvePageKindFromPathname(pathname) ?? "home";
  const targetDivision = DIVISION_REGISTRY[targetDivisionId];

  return localePath(locale, resolveRouteForDivision(targetDivision, pageKind));
}
