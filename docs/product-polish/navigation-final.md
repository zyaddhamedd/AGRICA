# Final product navigation correction

## Root cause and server identity

Before changing code, local process inspection found:

| Port | Process working directory | Worktree HEAD before this correction | Observed expanded orange card |
| --- | --- | --- | --- |
| 3001 | `/Users/zyad/Projects/AGRICA` | `043dc5d` (original main) | Dialog present; Explore anchor absent from DOM |
| 3117 | `/private/tmp/agrica-phase1` | `680045d` | Explore anchor visible, unobscured and inside the viewport; 44px target; correct `/en/products/oranges` destination |

The missing Explore link was an older-server mismatch, not a clipping or positioning issue in the approved implementation. No Explore code or card styling was changed. Both processes identify themselves as Next.js 16.3.4 production servers. The original server's build ID is `koqHDHOAAGXFAWRSIbmH3`. The pre-correction latest build ID was `MELPXsoOmNC1LdDwH3RXf`; the final navigation build is `9qcgrTqTFeP0U9xgNqE4P`. Build IDs are not Git SHAs; no embedded compile-time Git SHA exists, so the worktree HEADs and independently observed UI establish the version difference without claiming additional binary provenance.

Explore renders only when `ProductCardBack` is expanded and `seoProductById(item.id)` finds one of the four approved registry entries. It is an ordinary localized anchor beside the existing enquiry action. Its original close-animation and tab-local browser-Back enhancement are preserved.

## Change

Added a translated, 44px-target Back to Catalogue anchor beside breadcrumbs on the four server-rendered profiles. It preserves locale and links to `/products?world=fresh` or `/products?world=frozen` using the approved product record. RTL reverses the directional arrow. Normal Next Link navigation is used without introducing history state. Hero/specification spacing did not warrant another adjustment in the rendered matrix.

## Files

- `src/app/[lang]/products/[slug]/page.tsx`
- `src/app/[lang]/products/[slug]/page.module.css`
- `src/content/page-dictionaries.ts`
- `src/i18n/types.ts`
- `test/product-polish-browser.mjs`
- `docs/product-polish/navigation-final.md`
- `docs/product-polish/navigation-final-browser.json`
- `docs/product-polish/navigation-final-seo.json`

## Validation

- Production build and TypeScript PASS.
- SEO, approved product content, products and i18n unit tests PASS.
- All 47 sitemap URLs PASS for ordinary clients and Googlebot: canonical, reciprocal hreflang, indexing restrictions, sitemap, metadata and JSON-LD preserved.
- All four profiles × five locales × five widths (1440, 1024, 768, 390, 320): 100 layout cases; Back link translated, visible, unobscured, at least 44px high and linked to the correct world.
- All 20 direct product HTML responses include exactly one server-rendered catalogue-return anchor with the correct locale/world.
- Twenty directly opened product pages return via actual touch activation to the correct localized Fresh/Frozen catalogue.
- Forty Explore/Back flows across all four products, five locales and desktop/mobile: actual keyboard, mouse and touch activation; enquiry toggle; focus trap; native destination; unlocked body; browser Back original card focus/exact scroll; Escape close.
- Unsupported product gating, reduced motion, stale ordinary-navigation return-marker cleanup and eight EN/AR no-JavaScript profiles checked.
- Lint unchanged from baseline: 19 existing errors, 24 warnings. No new lint diagnostics.
- Independent native Codex static review: GO, no blockers. Browser QA performed against the rebuilt production app.

Chrome with touch emulation was used; physical Safari/iOS verification remains a release follow-up. The approved session-storage return enhancement retains its documented expiry/storage limitations. No new dependencies or media. Animation timelines, overlay implementation, header/navigation and original main files are unchanged.

## Review URLs

Use port **3117**, not the older 3001 instance:

- Fresh: `http://localhost:3117/en/products?world=fresh`
- Frozen: `http://localhost:3117/en/products?world=frozen`
- Oranges: `http://localhost:3117/en/products/oranges`
- Fresh Strawberries: `http://localhost:3117/en/products/fresh-strawberries`
- IQF Strawberries: `http://localhost:3117/en/products/iqf-strawberries`
- IQF Broccoli: `http://localhost:3117/en/products/iqf-broccoli`
- Arabic Fresh: `http://localhost:3117/ar/products?world=fresh`
- Arabic Oranges: `http://localhost:3117/ar/products/oranges`

Replace `en` with `ar`, `ru`, `de` or `fr` for other locales. Runtime preview remains running for review. Original main retains its pre-existing `next-env.d.ts` modification. No merge, push or deployment.

Local screenshot evidence: `/private/tmp/agrica-navigation-final/port-{3001,3117}-expanded.png` shows the pre-change comparison. `/private/tmp/agrica-navigation-final/after/` contains the final product headers and EN/AR expanded cards at desktop/mobile widths. Browser and SEO JSON evidence are committed beside this report.

Recommendation after passing validation: GO for this local navigation checkpoint; deployment remains a separate approval boundary.
