# AGRICA Produce Baseline

Baseline date: 2026-09-19  
Git branch: `main`  
Current commit: `508d9f3` — `feat: redesign product worlds and imagery`  
Scope: Phase 0 baseline and post-Phase-1 regression verification.

## Baseline outcome

**PASS.** The existing AGRICA Produce application still builds as the same three statically prerendered routes:

- `/`
- `/products`
- `/standard`

No Produce application source, CSS, data, assets, component composition, or visual behavior was intentionally changed during Phase 0 or Phase 1.

## Checks performed

| Check | Method | Result |
|---|---|---|
| TypeScript | `npm run typecheck` | PASS |
| Production build | `npm run build` with Next.js 16.3.4/Turbopack | PASS |
| Build route table | Inspected build output | PASS: only `/`, `/_not-found`, `/products`, `/standard`; all authored routes static |
| Homepage production response | `next start`, HTTP request to `/`, expected homepage marker | PASS: HTTP 200 |
| Products production response | `next start`, HTTP request to `/products`, expected Products marker | PASS: HTTP 200 |
| Standard production response | `next start`, HTTP request to `/standard`, expected Standard marker | PASS: HTTP 200 |
| Fresh query entry | HTTP request to `/products?world=fresh`; unchanged query-selection code reviewed | PASS: HTTP 200; valid world remains supported |
| Frozen query entry | HTTP request to `/products?world=frozen`; unchanged query-selection code reviewed | PASS: HTTP 200; valid world remains supported |
| Dried query entry | HTTP request to `/products?world=dried`; unchanged query-selection code reviewed | PASS: HTTP 200; valid world remains supported |
| Catalogue integrity | Direct `tsx test/catalogue.test.ts` | PASS: Fresh 29, Frozen 18, Dried 13, total 60 |
| Division routing logic | Direct `tsx test/divisions.test.ts` | PASS |
| Existing tracked Produce files | `git status`/change-scope review | PASS: no tracked Produce file modified |

## Interaction baseline

No reliable browser screenshot/E2E framework is configured in the repository. The ignored `scratch` files are visual experiments, not regression tooling, and the existing homepage/products/standard parity tests target superseded interfaces. They were not treated as reliable baseline gates.

The following current interaction paths were verified against the active, unchanged source and recorded as the baseline:

| Area | Current baseline behavior | Status |
|---|---|---|
| Product world switching | `WorldSwitch` changes Fresh/Frozen/Dried, clears family, and updates `?world=` with `history.replaceState` | PASS — unchanged code path |
| Family filtering | `FamilyPanel` filters the active world by family code; All Families clears the filter | PASS — unchanged code path |
| Search | `LiveSearchInput` filters across product name/world/family; a non-empty query searches across all worlds | PASS — unchanged code path |
| Product card flip | One `ProductFlipCard` flips at a time; pointer-distance and keyboard toggle paths remain present | PASS — unchanged code path |
| Quote add/remove | Front and back actions toggle de-duplicated local `QuoteItem` state; drawer removal remains wired | PASS — unchanged code path |
| Standard stage order | Source → Inspect → Prepare → Pack → Control → Handover | PASS — confirmed from active data/build |
| Header/menu | Existing route themes, scroll hide/show, Escape/backdrop menu close, and homepage duplicate navigation remain as before | PASS — unchanged; known issue retained |
| Footer | Existing home/products/standard variants and route actions remain in place | PASS — unchanged code path |
| Responsive behavior | Existing CSS breakpoints and dedicated desktop/mobile layouts remain untouched | PASS — source/CSS unchanged |
| Reduced motion | Existing global/products/standard/footer reduced-motion rules and component checks remain untouched | PASS — source/CSS unchanged |

These interaction entries are code-path baselines rather than automated browser interaction results. A future visual/E2E suite should be established before changing shared Produce UI.

## Catalogue baseline

| World | Count |
|---|---:|
| Fresh | 29 |
| Frozen | 18 |
| Dried | 13 |
| **Total** | **60** |

The current Produce Dried world remains part of `PRODUCT_LIBRARY`. No product name, family, key, specification, image mapping, season record, or Standard stage was changed.

## Known pre-existing issues retained intentionally

- The homepage mounts the shared `SiteHeader`/`GlobalMenu` and a second hero-local navigation/menu system. This phase did not refactor it.
- The root Products and Standard skip-link targets do not match current main-section IDs; Products also renders a second valid local skip link.
- Homepage and Products enquiry forms are front-end simulations and do not submit to a backend.
- Confirmed seasonal data is empty; the rendered seasonal registry is illustrative.
- The current lint script uses removed/incompatible `next lint` behavior under Next.js 16.
- `test/homepage.test.ts`, `test/products.test.ts`, and `test/standard.test.ts` assert older DOM concepts and are not reliable current-state regression tests.
- Current media/performance/accessibility issues documented in `AGRICA_CURRENT_IMPLEMENTATION_REPORT.md` remain unchanged.

## Phase 1 change boundary

Phase 1 added only:

- `src/divisions/types.ts`
- `src/divisions/registry.ts`
- `src/divisions/routing.ts`
- `test/divisions.test.ts`
- This baseline document

The division modules are not imported by any current page, component, data module, stylesheet, or asset. They contain no React, UI components, product data, media, GSAP, CSS, storage, cookies, context, or redirect behavior.

No `/dried-spices` route exists yet. No Business Division Switcher exists yet.

## Explicit preservation confirmation

- No visible Produce redesign was performed.
- No existing Produce route was renamed, moved, redirected, or wrapped in a new layout.
- No current homepage, Products, Standard, header, menu, footer, quote, animation, responsive, or reduced-motion implementation was modified.
- No current Produce CSS or asset was modified.
- No Dried & Spices component, catalogue, media, or CSS is imported into Produce.

## Recommended next step

Phase 2 should create only the isolated `/dried-spices` route shell and its nested layout/theme boundary, using route-scoped CSS Modules and approved content. Keep it disconnected from Produce UI until the destination is stable; add the visible Business Division Switcher in a later targeted phase.
