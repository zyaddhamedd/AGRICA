/** Stable identifiers for AGRICA business divisions. */
export const DIVISION_IDS = ["produce", "herbs-spices"] as const;

export type DivisionId = (typeof DIVISION_IDS)[number];

/**
 * Page roles that can be mapped between divisions without relying on URL
 * string replacement.
 */
export const SEMANTIC_PAGE_KINDS = ["home", "products", "standard"] as const;

export type SemanticPageKind = (typeof SEMANTIC_PAGE_KINDS)[number];

export type DivisionRouteMap = Readonly<
  Partial<Record<SemanticPageKind, string>> &
    Pick<Record<SemanticPageKind, string>, "home">
>;

/** Lightweight routing metadata only. */
export interface DivisionDefinition {
  readonly id: DivisionId;
  readonly label: string;
  readonly basePath: string;
  readonly routes: DivisionRouteMap;
}
