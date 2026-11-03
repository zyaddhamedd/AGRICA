# Product detail polish and Explore integration

Scope: isolated `codex/phase1-herbs-launch` worktree, reviewed baseline `dc88149`. No merge, push or deployment. Original main retains only its pre-existing `next-env.d.ts` modification.

## Implementation

The four approved product profiles use a tighter editorial hero, existing photography with reserved cover crops, three specification groups and one primary enquiry action. Approved values are presented verbatim exactly once. Existing metadata, canonical/hreflang, JSON-LD, robots, inventory and sitemap remain unchanged.

Expanded cards gain a small translated native anchor for approved routes only. Product-ID lookup reuses the approved SEO registry. Existing enquiry controls, grid, animation timelines and navigation remain intact. Ordinary activation completes the existing close animation before native navigation so the body unlocks first. Modified clicks retain normal anchor behavior. A tab-local, single-use marker restores the original card focus and scroll on browser Back; it applies only to matching history navigation, expires after 30 minutes, and stops after 15 seconds or user interaction. Storage restrictions gracefully disable that enhancement.

## Exact changed files

- `src/app/[lang]/products/[slug]/page.tsx`
- `src/app/[lang]/products/[slug]/page.module.css`
- `src/components/products/ProductCardBack.tsx`
- `src/components/products/ProductCardBack.module.css` (new)
- `src/components/products/ProductCardFlightOverlay.tsx`
- `src/components/products/ProductsExplorer.tsx`
- `src/components/products/exploreReturn.ts` (new)
- `src/content/page-dictionaries.ts`
- `src/i18n/types.ts`
- `src/seo/products.ts`
- `test/seo.test.ts`
- `test/product-polish-browser.mjs` (new)
- `docs/product-polish/verification.md` (this report)
- `docs/product-polish/browser-results.json` (evidence)
- `docs/product-polish/performance.json` (evidence)
- `docs/product-polish/seo-http-validation.json` (evidence)

## Verification

- Production build and TypeScript: PASS.
- SEO unit, approved product content, phase3b/launch tests and existing Tier 1 browser suite: PASS.
- SEO HTTP coverage: all 47 indexable routes PASS, including canonical/hreflang, sitemap, robots and structured data checks.
- Product layout matrix: all four products × EN/AR/RU/DE/FR × 1440/1024/768/390/320 pixels (100 cases). One H1, correct locale/direction, exact approved specifications, no overflow or header collision.
- Explore flows: four English desktop keyboard flows and 20 localized mobile touch flows. Enquiry, focus trap, destination unlock, Back focus/exact scroll, and original Escape close verified. Unsupported product, reduced motion and stale ordinary-navigation marker checked.
- JavaScript disabled: eight EN/AR product profiles retain specifications; existing catalogue directory remains crawlable without duplicate links.
- Full lint retains baseline debt: 19 errors / 24 warnings. Two targeted compiler-rule suppressions document the existing imperative origin-node restoration in new callback paths; no blanket rule disable.
- Independent native Codex static review: GO after return-marker lifecycle fixes and final callback review.

Run the added browser check against a local production server with `node --import tsx test/product-polish-browser.mjs` (defaults to port 3117).

## Performance and limitations

Local fresh-Chrome sampling, same eight routes/order at desktop/mobile, observed CLS 0 and no overflow; four profiles each request one product image. Homepage JS transfer increased 247,046 → 247,436 bytes (+390 bytes, 0.16%); warm catalogue incremental JS increased 8,823 → 9,460 bytes (+637 bytes). No new dependencies, fonts or media assets. No observed card/layout regression. These short local samples do not establish field Core Web Vitals, animation FPS or cross-browser guarantees. Performance evidence precedes a behavior-equivalent callback extraction and lint annotations.

Chrome desktop, touch emulation and reduced motion were exercised; physical iOS/Safari testing remains a release follow-up. Session-storage denial or expiry leaves native browser Back behavior. Existing repository lint debt remains outside this scope.

## Screenshots

All four before/after desktop and mobile captures are preserved locally under `/private/tmp/agrica-product-polish/{before,after}/{slug}-{1440,390}.png`. Additional Arabic 320px, Russian 1024px, French 768px and expanded-card captures are under `after/`. Temporary screenshot files are not committed.

Recommendation: GO for this scoped local checkpoint and subsequent release review. Production deployment requires a separate approval.
