# AGRICA Dual-Site Implementation Plan

Planning date: 2026-09-19  
Basis: current `main` implementation at commit `508d9f3`, the active `src/app` import graph, `AGRICA_CURRENT_IMPLEMENTATION_REPORT.md`, and the Next.js 16.3.4 documentation bundled in this repository.  
Scope: architecture and migration planning only. This document does not authorize or include implementation.

# 1. CURRENT ARCHITECTURE IMPACT ANALYSIS

## Current routes

The application uses the Next.js App Router with one root layout:

```text
src/app/
├── layout.tsx
├── page.tsx                 → /
├── products/page.tsx        → /products
└── standard/page.tsx        → /standard
```

All three routes are currently statically prerendered. There are no nested route layouts, route groups, dynamic segments, API routes, middleware, locale segments, or CMS-backed routes.

## Homepage composition

`src/app/page.tsx` composes the current Produce homepage in this exact order:

```text
SiteHeader
main#main
├── HeroSection
├── WorldsSection → ThreeWorldsSection → WorldCard
├── SeasonSection
├── CompanySection
└── TradeSection
SiteFooter
```

The homepage sections are predominantly client components with local React state and GSAP/CSS motion. `HeroSection` contains its own desktop/mobile navigation and its own `GlobalMenu`, in addition to the page-level `SiteHeader` and its `GlobalMenu`. The intended CSS rule to hide the shared homepage header does not match the current markup, so both systems are mounted and the fixed shared header generally overlays the hero-local header.

That duplication is an existing issue, not part of the dual-site requirement. It increases the risk of adding a switcher because adding it to only one navigation implementation could produce inconsistent or hidden behavior.

## Products architecture

`src/app/products/page.tsx` renders the client-side `ProductsExplorer`.

`ProductsExplorer` owns all Products state:

- `activeWorld`: Fresh/Frozen/Dried.
- `activeFamilyCode`.
- `searchQuery`.
- `quoteItems`.
- `isDrawerOpen`.

It reads `?world=` on mount, flattens the complete `PRODUCT_LIBRARY` into runtime `ProductAtlasItem` objects, filters the items, and passes state to the catalogue, cards, header, floating dock, and quote drawer. State is local and disappears on navigation or refresh.

The active catalogue chain is:

```text
PRODUCT_LIBRARY
→ ProductsExplorer
→ WorldSwitch / FamilyPanel / LiveSearchInput
→ AtlasGrid
→ ProductFlipCard
   ├── ProductCardFront → productImages + QuoteMicroAction
   └── ProductCardBack → productSpecs + ProductSpecTable + ExportActionRail
```

The current “Dried” world is an intrinsic part of this 60-item Produce catalogue. It must remain in `PRODUCT_LIBRARY` and in the current world selector.

## Standard architecture

`src/app/standard/page.tsx` renders `StandardPageContent`, which composes:

```text
SiteHeader
StandardMonolithHero
StandardProgressThread
five StandardStageBlock instances
StandardProofInterlude (after stage 03)
StandardFinalStageBlock (stage 06)
SiteFooter
```

The six stages come from `src/data/stages.ts`. The page uses native scrolling, a fixed/sticky progress reader, GSAP/ScrollTrigger reveals, and route-specific global CSS in `src/styles/standard.css`.

## Shared header/menu/footer

- `SiteHeader.tsx` is used on all routes. It infers route state with `usePathname`, applies Produce-specific variants/themes, owns scroll hide/show state, and renders `GlobalMenu`.
- `GlobalMenu.tsx` has one hardcoded Produce menu array and Produce-specific content/copy.
- `SiteFooter.tsx` supports four current variants (`home`, `products`, `standard`, `internal`) but all are Produce variants. It uses a shared DOM/CSS treatment with variant-specific CTA copy.
- `HeroSection.tsx` bypasses part of that shared structure with separate home navigation/menu markup.

The existing components are reusable within Produce, but none should automatically become a cross-division “universal” component. Their props, copy, route assumptions, and CSS are already Produce-specific.

## CSS loading

`src/app/layout.tsx` imports these files for every route:

- `src/styles/globals.css`
- `src/styles/products.css`
- `src/styles/standard.css`
- `src/styles/footer.css`

This means all current Produce route CSS, including legacy selectors, is global and available on every page. `CompanySection`, `TradeSection`, `SeasonSection`, and `ThreeWorldsSection` also import colocated global CSS files through their client component modules.

Current risks for a second site:

- Broad selectors exist, including element selectors and universal reduced-motion rules.
- Generic class names such as `.hero-*`, `.month`, `.season-*`, `.stage-*`, and `.quote-*` are already used globally.
- The root variables in `:root` are Produce brand tokens.
- Adding a new global stylesheet to `app/layout.tsx` would load it on Produce and could override current output.
- Moving existing CSS into new route groups/layouts would be a high-regression refactor.

## Product data

The current source of truth is split deliberately:

- `src/data/products.ts`: 60 Produce names across Fresh/Frozen/Dried.
- `src/data/productSpecs.ts`: specs/varieties for eight fresh products.
- `src/data/productImages.ts`: selected Produce image mappings.
- `src/types/agrica.ts`: current shared types.

Exact string-based IDs connect the catalogue, images, specs, filters, and quote items. Moving, renaming, or “generalizing” these files during the new-site architecture phase is unnecessary and risky.

## Safe reuse versus protected code

Safe to reuse as concepts or small primitives:

- AGRICA logo asset selection.
- `next/link` navigation conventions.
- The idea of a scroll-aware header shell, but not necessarily the current component implementation.
- Dialog mechanics after accessibility hardening.
- Skip-link primitive after correcting its route targeting.
- Low-level button, focus, and enquiry types created specifically for cross-division use.
- GSAP itself, imported only by route components that need it.

Keep isolated/untouched initially:

- All current homepage sections and their CSS.
- `ProductsExplorer` and every active product-card component.
- All current Produce data files.
- Active Standard components, data, and CSS.
- Current footer markup/CSS.
- Current media files.
- Existing route files and URLs.

# 2. CRITICAL PRESERVATION RULE

The implementation must treat AGRICA Produce as a frozen compatibility surface. “Unchanged” means the same rendered structure, route behavior, catalogue identity, motion, breakpoints, and content, except for the explicitly approved addition of a Business Division switcher.

The guarantee should be enforced as follows:

1. **Do not move the existing page files.** Keep `app/page.tsx`, `app/products/page.tsx`, and `app/standard/page.tsx` at their current paths.
2. **Do not create a Produce route prefix.** `/`, `/products`, and `/standard` remain canonical and directly render their existing pages.
3. **Do not modify current data.** Keep the 60-product `PRODUCT_LIBRARY`, Fresh/Frozen/Dried ordering, current specs, IDs, images, and current Dried category unchanged.
4. **Do not import Dried & Spices code from Produce pages.** Shared imports must be tiny division/navigation primitives only; no new catalogue, media registry, animation component, or site stylesheet may enter a Produce page bundle.
5. **Do not put new site tokens in `:root`.** Scope them to the Dried & Spices route wrapper.
6. **Do not add Dried & Spices CSS to `app/layout.tsx`.** Load it from the `/dried-spices` subtree or from its components.
7. **Do not rename active Produce CSS classes.** New classes should be CSS-module generated or prefixed/scoped.
8. **Do not refactor current page state into a global division store.** URL/pathname identifies the division; current Produce state remains local.
9. **Capture a visual and behavioral baseline before the first integration change.** Current automated parity tests are stale, so they cannot serve as the preservation gate without replacement.
10. **Review every shared-file change as a Produce regression change.** `app/layout.tsx`, `SiteHeader`, `GlobalMenu`, `SiteFooter`, and global CSS require targeted before/after verification.

Preservation scope:

- `/` and the current Hero, Three Worlds, Season, Company, Start a Trade, footer, motion, colors, and responsive behavior.
- `/products`, including all three current worlds, 60 products, search behavior, family filtering, card flip behavior, quote selection, season section, and mobile drawer/dock.
- `/standard`, including stage order, copy, imagery, progress behavior, animations, and mobile stacking.
- Existing internal links and `?world=fresh|frozen|dried` entry links.

The switcher itself is an intentional new global-navigation feature. Its footprint must be approved separately; it must not be used as justification for changing other Produce visuals.

# 3. DEFINE THE TWO EXPERIENCES

## Experience A — AGRICA Produce

AGRICA Produce is the current application at:

- `/`
- `/products`
- `/standard`

It retains Fresh, Frozen, and Dried as its three existing product worlds. The current Dried catalogue remains Produce data and keeps its current routes, UI, product IDs, cards, and enquiry context.

Internal identity for new shared infrastructure should be `produce`, but that identifier must not force a URL prefix.

## Experience B — AGRICA Dried & Spices

AGRICA Dried & Spices is a new, isolated route subtree at `/dried-spices` with its own future:

- Homepage.
- Catalogue and product taxonomy.
- Product types/specifications/media.
- Visual theme and motion.
- Process/standard story.
- Quote fields and selected items.
- Metadata and analytics context.

It must not read from, append to, filter, or reinterpret `PRODUCT_LIBRARY`. A Dried & Spices product may eventually have a similar display name to a Produce Dried product, but it remains a different record with a division-qualified stable ID.

# 4. ROUTING OPTIONS

## Option A — preserve Produce; add `/dried-spices`

```text
/                           Produce homepage
/products                   Produce products
/standard                   Produce standard
/dried-spices               Dried & Spices homepage
/dried-spices/products      Dried & Spices products
/dried-spices/standard      Dried & Spices process/standard
```

Impact:

- Current URLs: unchanged.
- SEO: all current Produce URLs retain their existing identity; new division receives a clear, crawlable namespace.
- Migration risk: lowest. No redirects or content relocation are needed.
- Implementation complexity: low/moderate. One nested route subtree and explicit switch mapping.
- Existing code changes: limited to the approved switcher integration and shared division registry; no current page relocation.
- Future divisions: another top-level namespace such as `/seeds` can follow the same pattern.
- Links/bookmarks: remain valid.
- Ability to preserve current website: strongest of all options.

Trade-off: Produce has no explicit `/produce` prefix while new divisions do. This asymmetry is acceptable because URL stability is more valuable than taxonomy symmetry.

## Option B — make both divisions explicit

```text
/produce
/produce/products
/produce/standard
/dried-spices
/dried-spices/products
/dried-spices/standard
```

`/` would become a selection page or redirect.

Impact:

- Current URLs: displaced or duplicated.
- SEO: requires permanent redirects, canonical migration, sitemap updates, and careful duplicate-content prevention. Existing ranking signals may take time to transfer.
- Migration risk: high. Every current link, menu item, CTA, query-string entry, bookmark, campaign URL, and test assumption changes.
- Implementation complexity: high because Produce pages/layouts must move or be wrapped/re-exported.
- Existing code changes: broad; route assumptions are hardcoded in header/menu/footer/data links.
- Future divisions: structurally neat.
- Links/bookmarks: work only through redirects or duplicate aliases.
- Ability to preserve current website exactly: poor. `/` would necessarily change behavior/content.

This option should be rejected while preservation is priority #1.

## Option C — subdomain or `/divisions/...` namespace

Examples:

```text
dried-spices.example.com
```

or

```text
/divisions/dried-spices
```

Impact:

- Current Produce URLs can stay intact.
- SEO: a subdomain can look more separate to search engines and needs separate domain/canonical/analytics configuration; `/divisions/...` adds unnecessary URL depth.
- Migration risk: moderate due to host-based routing, environment/domain handling, cookie/storage boundaries, and deployment configuration.
- Implementation complexity: higher than a top-level path.
- Existing code changes: potentially small for path namespace, larger for subdomain detection.
- Future divisions: extensible.
- Links/bookmarks: current Produce links remain valid.
- Ability to preserve current website: good, but operational complexity is not justified by current requirements.

## Recommendation

Use **Option A**. Keep Produce exactly at its current URLs and add a nested `app/dried-spices` subtree.

Do not use multiple root layouts. Next.js 16 documents that navigation across different root layouts triggers a full page load. Keep the existing `app/layout.tsx` as the only root layout and add a normal nested `app/dried-spices/layout.tsx`. This preserves client-side navigation and avoids relocating the current `/` page.

# 5. SHARED VS SEPARATE COMPONENT STRATEGY

## Shared, deliberately small

- `BusinessDivisionSwitcher`: route-aware links and keyboard semantics only.
- Division definitions/route map: IDs, labels, base paths, and supported page kinds.
- Brand asset references if both experiences use the same core AGRICA marks.
- Accessibility utilities: focus return/trap primitives, skip-link helper, dialog shell, if extracted with tests.
- Future quote transport types and validation primitives, not page-specific quote UI.
- Analytics event contract.
- Small neutral UI primitives only when both sites genuinely render the same structure.

## Produce-only

Keep these components in their current locations and behavior initially:

- `components/home/*` active sections.
- `components/products/*` active explorer/card components.
- `components/standard/Standard*` active components.
- `SiteHeader`, `GlobalMenu`, and `SiteFooter` should be treated as Produce-owned until a tested extraction proves otherwise.
- `data/products.ts`, `productSpecs.ts`, `productImages.ts`, `threeWorlds.ts`, `seasons.ts`, and `stages.ts`.
- Existing CSS and assets.

## Dried & Spices-only

- Division layout shell/header/menu/footer.
- Homepage sections.
- Catalogue explorer/cards/filters.
- Process/standard components.
- Dried & Spices quote form UI.
- Theme tokens and CSS Modules.
- Catalogue/spec/season/process data.
- Media registry and assets.

## Abstraction rule

Do not build a page-level component that branches on `division`. Each division should own its pages and composition. Shared components should operate below the page-composition layer and receive narrow, typed configuration.

Good boundary:

```text
ProduceHomePage → Produce components
DriedSpicesHomePage → Dried & Spices components
Both may render <BusinessDivisionSwitcher />
```

Bad boundary:

```text
<UniversalHome division={division}> with conditionals for every section
```

# 6. BUSINESS DIVISION SWITCHER

## Location

- Produce: in the actual visible `SiteHeader` action area, after the Dried & Spices destination exists and without changing the surrounding Produce header structure.
- Dried & Spices: in its own header, in a parallel discoverable location.
- Mobile: available in the main header/menu path with at least a 44px target; do not rely on hover or a desktop-only dropdown.
- The switcher should not be placed independently in every page body.

Because the homepage has duplicate nav systems, the first integration should use the fixed shared `SiteHeader`, which is currently the topmost visible navigation. Do not simultaneously delete or redesign the hero-local navbar. A later approved header-consolidation task can remove the duplicate after pixel and interaction parity is proven.

## Active division

The URL is the source of truth:

- Path begins `/dried-spices` → `dried-spices`.
- All current authored routes (`/`, `/products`, `/standard`) → `produce`.

A tiny pure resolver can be shared by server/client code. A client switcher may use `usePathname()` because Next layouts do not receive live pathname updates. A context may expose the derived division to descendants, but it must never override the URL.

## Route behavior

Use semantic page-kind mapping, not string replacement:

| Current route kind | Produce | Dried & Spices |
|---|---|---|
| Home | `/` | `/dried-spices` |
| Products | `/products` | `/dried-spices/products` |
| Standard/process | `/standard` | `/dried-spices/standard` |

Expected switches:

- Produce homepage → Dried & Spices homepage.
- Produce Products → Dried & Spices Products.
- Produce Standard → Dried & Spices Standard/process.
- Reverse mappings return to the corresponding Produce route.

Do not carry Produce-specific query parameters such as `?world=dried` to Dried & Spices. They have no shared semantic contract. Do not carry selected quote state across divisions.

When the corresponding destination is not implemented:

- The route registry marks that page kind unavailable.
- The switcher links to the target division homepage, not a 404 and not a fabricated placeholder page.
- The control’s accessible label should state the actual destination, for example “Switch to AGRICA Dried & Spices home.”
- Once the route exists, only the registry mapping changes.

## Desktop interaction

Preferred technical form: an explicit two-option segmented control or a button that opens a small two-item menu. With only two divisions, direct links are simpler and more accessible than a custom select. Final visuals remain a separate design task.

## Mobile interaction

- Direct links in a clearly labeled “Business division” area of the menu, or an always-visible compact switch control if space allows.
- If presented as a popup, support Escape, outside click, focus return, and focus containment.
- Avoid gestures and hover-only discovery.

## Keyboard/accessibility

- Use links because switching changes URL/location.
- Use `aria-current` on the active division link.
- Provide a visible focus state.
- If a popup is used, implement standard menu-button behavior; do not use `role="tab"` for cross-page navigation.
- Announce full division names, not only “Produce”/“Spices” without AGRICA context.

## Persistence

No localStorage is required initially. Automatic preference redirects would make direct links unpredictable and weaken URL authority.

If a future neutral division gateway is introduced, localStorage may remember a preference only as a suggestion. It must never override an explicitly opened path. Direct deep links always win.

# 7. THEME ARCHITECTURE

## Current system

Produce tokens are global `:root` custom properties in `src/styles/globals.css`, including `--navy`, `--green`, `--paper`, type scales, fonts, and gutter. Product pages add world-specific properties on `.products-page`.

## Recommended Dried & Spices system

Create a Dried & Spices route wrapper in `app/dried-spices/layout.tsx` and apply a CSS Module class plus a data attribute:

```text
class = generated CSS Module class
data-division = "dried-spices"
```

Define Dried & Spices custom properties on that wrapper, not on `:root`, `html`, or `body`. Conceptually:

```css
.site {
  --ds-color-background: ...;
  --ds-color-text: ...;
  --ds-font-display: ...;
  --ds-space-page: ...;
}
```

Actual palette/type values must wait for approved design. Prefix tokens (`--ds-*`) even though they are scoped; this makes ownership obvious and avoids collision with Produce’s generic variables.

Rules:

- Never overwrite current Produce tokens.
- Dried & Spices components read only `--ds-*` tokens or neutral shared tokens explicitly designed for cross-division use.
- Shared switcher should accept minimal theme hooks/classes rather than read Produce colors globally.
- Do not add `data-division` styles that target unscoped descendants by generic class name.
- Keep theme selection structural through the route layout, not client state, avoiding hydration mismatch.

# 8. CSS ISOLATION STRATEGY

## Evaluated approaches

### New global stylesheet in root layout

Rejected. It would load on every Produce route and could collide with current global/legacy selectors.

### Division-level root class plus global descendant selectors

Better, but still vulnerable to accidental specificity/cascade issues and easy to misuse as the site grows.

### Route-scoped CSS Modules

Recommended. Module-generated class names avoid collisions, and styles imported only by the `/dried-spices` layout/pages/components are associated with that route subtree.

### Multiple root layouts

Rejected for this project. They would require moving current routes or removing the existing root layout and cause full page reloads between divisions.

## Practical recommendation

Use all of the following together:

1. `app/dried-spices/layout.tsx` provides a division wrapper and imports only a small Dried & Spices token/base module.
2. Every new visual component uses `*.module.css` colocated with the component.
3. All new custom properties are scoped to the wrapper and prefixed `--ds-*`.
4. Avoid generic element selectors outside the wrapper; avoid generic class names entirely through CSS Modules.
5. Do not import new styles from `app/layout.tsx`.
6. Do not retrofit CSS Modules into Produce during the dual-site build.
7. If a third-party stylesheet is later needed, import it only inside the Dried & Spices subtree and audit its global selectors.

The new site will still inherit current root resets and Produce `:root` variables because the existing root layout remains. That is acceptable for the safest first version: Dried & Spices explicitly overrides what it needs inside its wrapper, while Produce remains untouched. A future global-CSS cleanup should be separate and regression-tested.

# 9. DATA ARCHITECTURE

Do not migrate current data initially. Add a parallel namespace:

```text
src/data/
├── products.ts                  # existing Produce, unchanged
├── productSpecs.ts             # existing Produce, unchanged
├── productImages.ts            # existing Produce, unchanged
├── seasons.ts                  # existing Produce, unchanged
├── stages.ts                   # existing Produce, unchanged
└── dried-spices/
    ├── catalogue.ts            # new approved product/category records
    ├── specifications.ts       # approved commercial specs
    ├── media.ts                # stable IDs → local asset references
    ├── seasons.ts              # only if approved season data exists
    └── process.ts              # approved process/standard content
```

New types should live with the new domain or under `src/types/dried-spices.ts`; do not widen `ProductAtlasItem` until a genuinely shared use case appears.

Suggested Dried & Spices model requirements, without inventing records:

- `id`: stable, opaque, division-local ID; never derived only from display name.
- `slug`: route-safe stable slug if product detail routes are planned.
- `name` and optional approved scientific/trade names.
- `categoryId` and category record.
- `division: "dried-spices"` when serialized into cross-division systems.
- `media`: references by stable asset key, with alt text.
- `specification`: explicitly optional approved fields; no fabricated fallbacks.
- `availability`/season data only when business-confirmed.
- `status`: optional publication/readiness status if incomplete records must be withheld.

IDs should be globally unambiguous at integration boundaries by combining division and local ID, for example `dried-spices:<local-id>`. This prevents collision with Produce’s current string keys without changing Produce.

No Dried & Spices file should import `PRODUCT_LIBRARY`. Shared display names do not imply shared records.

# 10. QUOTATION ARCHITECTURE

## Future-safe schema

Use a discriminated union rather than one untyped bag:

```text
QuoteDraft
├── version
├── division: "produce" | "dried-spices" | future division ID
├── items[]
│   ├── productId (division-qualified stable ID)
│   ├── productNameSnapshot
│   ├── categoryId/categoryNameSnapshot
│   └── requested item options
├── contact
│   ├── company
│   ├── email
│   └── optional contact fields
├── trade
│   ├── destination
│   ├── estimatedVolume
│   └── optional timing/notes
└── divisionDetails (validated according to division)
```

The concrete TypeScript model should be:

- `ProduceQuoteDraft` with `division: "produce"` and Produce-specific item/details type.
- `DriedSpicesQuoteDraft` with `division: "dried-spices"` and its own item/details type.
- `QuoteDraft = ProduceQuoteDraft | DriedSpicesQuoteDraft`.

The backend contract can later accept the union at one endpoint or route internally by division. Validation must branch on the discriminator, not on URL strings or display names.

## Mixed enquiries

Prevent mixed-division enquiries initially.

Reasons:

- The divisions may use different sales owners, MOQ/spec fields, fulfilment processes, and validation.
- Current Produce quote state is local and not ready for cross-route persistence.
- Mixing introduces ambiguous product IDs and submission ownership before a backend exists.

Maintain a separate draft per division if persistence is later added. When switching divisions with selected items:

- Never silently transfer them.
- Preserve the original division draft separately if supported.
- Explain that the target division starts a separate enquiry.
- Do not block navigation unless loss is real; today Produce state is ephemeral, so any future persistence/confirmation policy should be explicit.

# 11. SITE HEADER ARCHITECTURE

The dual-site feature should not use the existing homepage duplication as an excuse for a broad header rewrite.

## Safest first integration

1. Keep `SiteHeader`’s existing DOM, theme classes, scroll behavior, and logo behavior.
2. Add the switcher through one narrowly defined slot/component in its action cluster after the Dried & Spices home exists.
3. Use CSS scoped to the switcher and exact screenshot comparisons to prevent capsule dimension/theme regressions.
4. Give Dried & Spices its own `DriedSpicesHeader` that renders the shared switcher but otherwise follows its own approved design.
5. Do not make `SiteHeader` branch into two full headers based on division.

## Homepage duplication

Current situation:

- `app/page.tsx` renders `SiteHeader`.
- `HeroSection` renders desktop/mobile local navbars and another `GlobalMenu`.
- The CSS intended to hide the shared home header targets obsolete class names.

Fixing this could change z-index, spacing, menu ownership, initial focus, scroll behavior, or the visible capsule. Therefore:

- Record it as a separate Produce bug/refactor.
- Do not remove either implementation in the same change that introduces the dual-site routes/switcher.
- If the switcher must be present in the hero-local nav as well for an approved visual reason, use the same small switcher component but do not duplicate its routing logic.
- Consolidate only after visual baselines and cross-device behavior prove identical.

The Produce header may eventually be renamed conceptually to `ProduceHeader`, but a file rename provides no immediate value and should not be part of the initial implementation.

# 12. GLOBAL MENU

Produce’s menu is currently hardcoded in `MENU_ITEMS` inside `GlobalMenu.tsx`:

- Home.
- Products.
- Our Standard.
- Company.
- Start a Trade.

Dried & Spices should receive its own approved configuration, potentially:

- Home.
- Products.
- Process/Standard.
- Company.
- Start a Trade.

The exact labels/routes must wait for approved content.

Recommended evolution:

1. Initially preserve `GlobalMenu` as Produce output.
2. Create a separate Dried & Spices menu component/config so its visual structure can differ safely.
3. After both menus exist, extract only a tested accessible drawer primitive if their behavior is truly identical: backdrop, Escape handling, focus trap/return, body scroll lock.
4. Keep menu item arrays data-driven per division, but keep rendering/composition division-owned.

A single global `MENU_ITEMS` array with conditionals is not suitable. A registry may expose `navigation.produce` and `navigation.driedSpices`, while each header decides how to render its list.

# 13. FOOTER STRATEGY

Use **separate division footers initially**, with shared low-level primitives only if proven useful.

Rationale:

- The current `SiteFooter` is visually and semantically Produce-specific despite its variants.
- Its CTA text, links, route anchors, wordmark treatment, coordinates, colors, and CSS animation are coupled to Produce.
- A “universal” footer would accumulate large division conditionals and risk changing current DOM/CSS.
- Dried & Spices is explicitly intended to have its own atmosphere and business process.

Plan:

- Keep `SiteFooter.tsx` and `footer.css` unchanged for Produce.
- Create `DriedSpicesFooter` with CSS Module styling and Dried & Spices route config.
- Share only the logo/link/accessibility primitives if identical.
- Reconsider a shared footer shell only after both outputs are stable and snapshot-tested.

# 14. NEW DIRECTORY STRUCTURE

Recommended target structure without moving existing Produce files:

```text
src/
├── app/
│   ├── layout.tsx                         # existing root, minimal shared document shell
│   ├── page.tsx                           # existing Produce home, unchanged
│   ├── products/page.tsx                  # existing Produce products, unchanged
│   ├── standard/page.tsx                  # existing Produce standard, unchanged
│   └── dried-spices/
│       ├── layout.tsx                     # division wrapper, tokens, metadata defaults
│       ├── page.tsx                       # Dried & Spices home
│       ├── products/
│       │   └── page.tsx                   # separate catalogue
│       └── standard/
│           └── page.tsx                   # separate process/standard
├── components/
│   ├── common/
│   │   ├── BusinessDivisionSwitcher.tsx
│   │   └── BusinessDivisionSwitcher.module.css
│   ├── home/                              # existing Produce, unchanged
│   ├── products/                          # existing Produce, unchanged
│   ├── standard/                          # existing Produce, unchanged
│   └── dried-spices/
│       ├── layout/
│       │   ├── DriedSpicesHeader.tsx
│       │   ├── DriedSpicesMenu.tsx
│       │   └── DriedSpicesFooter.tsx
│       ├── home/                           # new homepage sections
│       ├── products/                       # new catalogue components
│       └── standard/                       # new process components
├── data/
│   ├── products.ts                        # existing Produce, unchanged
│   ├── productSpecs.ts                    # existing Produce, unchanged
│   ├── productImages.ts                   # existing Produce, unchanged
│   └── dried-spices/
│       ├── catalogue.ts
│       ├── specifications.ts
│       ├── media.ts
│       ├── seasons.ts
│       └── process.ts
├── divisions/
│   ├── types.ts
│   ├── registry.ts                        # IDs, labels, base paths, page map only
│   └── routing.ts                         # pure resolve/map functions
├── types/
│   ├── agrica.ts                          # existing Produce types, unchanged initially
│   ├── dried-spices.ts
│   └── quotation.ts                       # future discriminated union
└── styles/
    └── dried-spices/
        └── theme.module.css                # route wrapper tokens/base only
```

Component-specific CSS should normally be colocated as CSS Modules rather than accumulated under `styles/dried-spices`.

Do not create empty data files merely to satisfy the tree. Add each only when approved data or an implemented consumer exists.

# 15. FUTURE THIRD DIVISION TEST

With the proposed architecture, AGRICA Seeds would require:

- One division registry entry with ID, label, base path, and supported page mappings.
- `app/seeds` route subtree and nested layout.
- `components/seeds` and `data/seeds` namespaces.
- Its own header/menu/footer/theme.
- Switcher UI capable of rendering three options rather than assuming a two-way toggle.
- SEO/sitemap/analytics registration.

The shared code should iterate a registry and map semantic page kinds. It should not contain booleans such as `isDriedSpices` throughout the application.

Do not build a dynamic `[division]` route or general multi-tenant engine now. Produce has intentionally unprefixed legacy URLs and distinct page architecture. A small typed registry plus separate explicit route trees provides enough extensibility without overengineering.

# 16. SEO ARCHITECTURE

## Division identity

Search engines should see one AGRICA organization with two clearly named business divisions and unique page sets.

- Produce canonicals remain `/`, `/products`, and `/standard`.
- Dried & Spices canonicals use `/dried-spices`, `/dried-spices/products`, and `/dried-spices/standard`.
- Do not duplicate Produce content under `/produce`.

## Metadata plan

- Root `app/layout.tsx`: AGRICA organization defaults and `metadataBase` once the production domain is approved.
- Existing Produce pages: preserve titles/descriptions first; add Produce-specific OG/canonical metadata in a separate SEO task.
- `app/dried-spices/layout.tsx`: division title template, division description, and division OG defaults.
- Dried & Spices child pages: unique titles, descriptions, canonicals, and OG images.
- Use route-level `opengraph-image`/`twitter-image` files or metadata references so division assets do not conflict.

## Structured content

- One top-level `Organization` entity for AGRICA.
- Division pages may describe `subOrganization`, `department`, or business/service relationships only after the legal/business relationship is confirmed.
- Catalogue pages can use `CollectionPage`/`ItemList`; product schema should only be added when product facts are verified and public.
- Do not present unverified price, availability, certification, or offer data in schema.

## Sitemap/robots

- Add all six public division routes to a generated/static sitemap when they are ready for indexing.
- Exclude placeholder/incomplete routes until approved.
- One robots policy can cover the domain.
- Ensure division switch links are crawlable normal anchors.

# 17. ANALYTICS READINESS

No analytics should be installed during architecture work. Define a provider-neutral event contract first.

Every future event should include:

- `division`: `produce`, `dried-spices`, or future registry ID.
- `route` and semantic `page_kind`.
- Stable product/category ID where relevant.
- Non-sensitive UI context such as source component.

Planned events:

- `division_switch`: `from_division`, `to_division`, `from_page_kind`, `to_page_kind`.
- `product_view`: division-qualified product ID and category ID.
- `product_add_to_quote` / `product_remove_from_quote`.
- `quote_started`.
- `quote_submitted` only after an actual accepted submission, never on the current simulated success state.
- `quote_error` with non-sensitive error category.

Event helpers should accept the division explicitly or derive it once from the route. They must not import catalogue/media modules, and they must never send commercial form contents or personal data by default.

# 18. PERFORMANCE IMPACT

## Route-level code splitting

Next.js will split route modules when Dried & Spices pages import only their own components. Preserve that boundary:

- Do not import Dried & Spices page components from root layout, Produce pages, or the division registry.
- The registry contains strings/route metadata only.
- Keep Dried & Spices animations inside its route components.
- Prefer Server Components for static new sections; create small client islands for switchers, filters, cards, and motion.

## CSS

- Import Dried & Spices token/base CSS from its nested layout and component Modules from its own components.
- Do not add Dried & Spices CSS to root layout.
- CSS Modules reduce selector collision and allow route-associated chunks.
- Current Produce CSS will still exist globally on Dried & Spices due to the legacy root imports; removing that cost requires a later risky Produce CSS split and is not required to keep Dried & Spices assets off Produce.

## Media

- Store new assets under a distinct path such as `public/assets/dried-spices/`.
- Reference them only from Dried & Spices modules/metadata.
- Use `next/image`, explicit responsive `sizes`, modern formats, and deliberate priority only for above-the-fold media.
- Do not repeat the current hero pattern of mounting desktop and mobile autoplay video trees simultaneously.
- Use posters and conservative video preload behavior if video is approved.

## Shared dependencies

- The small switcher and registry are the only expected new Produce-bundle cost.
- If Dried & Spices uses GSAP, static route-local imports prevent its components from entering Produce through the shared graph; GSAP is already a dependency but execution/module inclusion should remain route-bound.
- Avoid a global division provider that imports both sites’ navigation, quote, or data modules.
- Use `next/dynamic` only for genuinely heavy client interactions that are not needed for initial render; do not dynamically import basic navigation or server-renderable content.

# 19. MIGRATION PLAN

## Step 0 — establish the Produce baseline

- Likely files affected: new test/baseline artifacts only; no application files.
- Risk: low.
- Visible Produce impact: none.
- Work: capture desktop/mobile screenshots at agreed widths; record current DOM landmarks, route links, product counts, interactions, network/media behavior, and reduced-motion output. Replace or quarantine stale parity expectations.
- Validation: current build/typecheck; direct catalogue count test; manual/screenshot baselines for all three routes.

## Step 1 — define division contracts and routing registry

- Likely files created: `src/divisions/types.ts`, `registry.ts`, `routing.ts`; unit tests for route mapping.
- Risk: low.
- Visible Produce impact: none; do not import into UI yet.
- Work: define `DivisionId`, semantic page kinds, base paths, supported routes, and pure resolver/mapping functions.
- Validation: route-map unit tests, typecheck, build; confirm no Produce bundle/render change.

## Step 2 — create the isolated Dried & Spices route shell

- Likely files created: `app/dried-spices/layout.tsx`, `app/dried-spices/page.tsx`, initial shell components/module CSS.
- Risk: low/moderate.
- Visible Produce impact: none.
- Work: add only approved shell/copy; if business content is not approved, keep the route non-indexed or do not release it rather than invent content.
- Validation: direct route, 404 behavior, static build, no Dried & Spices assets requested on Produce routes.

## Step 3 — add scoped theme and division-owned chrome

- Likely files created: `theme.module.css`, `DriedSpicesHeader`, `DriedSpicesMenu`, `DriedSpicesFooter`, related Modules/config.
- Risk: moderate.
- Visible Produce impact: none.
- Work: wrapper-scoped `--ds-*` tokens; independent header/menu/footer; accessibility behavior.
- Validation: CSS leakage tests, keyboard/menu focus, mobile layout, network CSS chunks, Produce screenshots unchanged.

## Step 4 — integrate the Business Division switcher

- Likely files created/changed: `BusinessDivisionSwitcher.tsx`, Module CSS, targeted `SiteHeader.tsx` change, Dried & Spices header.
- Risk: high for Produce because `SiteHeader` is shared and homepage navigation is duplicated.
- Visible Produce impact: only the approved switcher control; no other layout/style change.
- Work: URL-derived active state, page-kind mapping, direct links, accessible focus behavior. Integrate only after destination home works.
- Validation: every source/destination mapping, query parameter policy, direct links, desktop/mobile header screenshots, scroll hide/show, global menu, no hydration warnings.

## Step 5 — build Dried & Spices homepage independently

- Likely files: `components/dried-spices/home/*`, its page, route-only assets/Modules.
- Risk: low to Produce; moderate within new site.
- Visible Produce impact: none.
- Work: approved content/media only; server-first component boundaries; route-local motion.
- Validation: performance, accessibility, mobile/desktop, reduced motion, asset isolation, Produce regression suite.

## Step 6 — add separate Dried & Spices data and catalogue

- Likely files: `data/dried-spices/*`, `types/dried-spices.ts`, `components/dried-spices/products/*`, products page.
- Risk: moderate.
- Visible Produce impact: none.
- Work: stable IDs, categories, specs/media mapping, filters/cards based only on approved new data.
- Validation: no imports from `PRODUCT_LIBRARY`; data integrity tests; deep links; card/filter/search/touch behavior; no asset crossover.

## Step 7 — add Dried & Spices process/standard page

- Likely files: `data/dried-spices/process.ts`, `components/dried-spices/standard/*`, standard page.
- Risk: low to Produce; moderate within new site.
- Visible Produce impact: none.
- Work: independent approved process narrative and motion.
- Validation: route switch mapping, natural scrolling, responsive/reduced motion, no current `stages.ts` changes.

## Step 8 — define and connect division-aware quote drafts

- Likely files: `types/quotation.ts`, shared validation/transport boundary, Dried & Spices quote components; targeted future Produce adapter only when backend contract is ready.
- Risk: high because current Produce quote state is local and forms are prototypes.
- Visible Produce impact: none until explicitly migrating its form; then behavior should improve without visual redesign.
- Work: discriminated schema, separate drafts, no mixed enquiries, backend/error/privacy contract.
- Validation: division tag on every payload, field validation, no cross-division item leakage, refresh/navigation policy, failure/loading/success states.

## Step 9 — SEO, sitemap, analytics hooks, and performance pass

- Likely files: route metadata, OG assets, `sitemap.ts`, `robots.ts`, analytics event types/helper; image optimization changes only in the new site.
- Risk: moderate.
- Visible Produce impact: no visual change; head/sitemap behavior changes intentionally.
- Validation: canonical uniqueness, social previews, structured data validation, sitemap URLs, crawlability, event division fields, route bundle/network audit.

## Step 10 — full QA and staged release

- Files: tests/configuration, not feature redesign.
- Risk: release-level.
- Visible Produce impact: none beyond approved switcher.
- Work: run strict Produce regression, new-site QA, accessibility audit, browser/device checks, broken-link crawl, and deployment preview comparison.
- Validation: section 20 plus business approval of all Dried & Spices content/data.

## Separate follow-up — homepage header consolidation

- Do not bundle with steps 1–4 unless the current visible duplication blocks an approved switcher layout.
- Requires its own baseline, pixel comparison, keyboard/focus tests, scroll tests, and approval.
- Goal would be one navigation/menu owner with identical Produce output, not a redesign.

# 20. PRODUCE REGRESSION CHECKLIST

Run after every shared-file or routing change; run the complete list before release.

## Routes and links

- [ ] `/`, `/products`, and `/standard` return successfully without redirects.
- [ ] Existing `?world=fresh|frozen|dried` links still initialize the correct world.
- [ ] Current menu/footer/company/trade anchors retain their destinations.
- [ ] Direct bookmarks and browser back/forward behavior remain intact.
- [ ] No Dried & Spices CSS, image, video, catalogue, or animation module is requested on Produce pages beyond the small shared switcher assets.

## Homepage desktop

- [ ] Existing fixed/hero navigation appearance matches baseline apart from approved switcher.
- [ ] Hero dimensions, two videos, decoration, logo, copy, and autoplay behavior match baseline.
- [ ] Three Worlds order, card imagery, flip interactions, and links match baseline.
- [ ] Season month selection/readout and desktop copy match baseline.
- [ ] Company copy, image, CTA, reveal, and parallax match baseline.
- [ ] Start a Trade fields, local success behavior, and animation match baseline.
- [ ] Footer copy, links, reveal, and Back to top match baseline.

## Homepage mobile

- [ ] Mobile hero replaces desktop stage at the same breakpoint.
- [ ] Both marquee directions, masked copy, decoration, and local navigation match baseline.
- [ ] World cards are one-column and touch flips do not block vertical scrolling.
- [ ] Mobile season ribbon scroll/selection and crop composition match baseline.
- [ ] Company media remains hidden at its current breakpoint.
- [ ] Trade form and footer stack exactly as before.

## Navigation/menu

- [ ] Header hide-on-down/show-on-up thresholds and behavior are unchanged.
- [ ] Produce logo assets/themes remain correct on all routes.
- [ ] Menu items/order/copy remain unchanged.
- [ ] Escape, backdrop close, scroll lock, and current focus behavior do not regress.
- [ ] Switcher active state follows URL and never changes the current page before activation.

## Products

- [ ] Fresh count = 29, Frozen = 18, Dried = 13, total = 60.
- [ ] Current Dried remains visible and unchanged.
- [ ] World filters and family tabs return the same entries.
- [ ] Search returns the same current results/empty state.
- [ ] Product keys, names, category labels, images, varieties, and specs match baseline.
- [ ] Only one product card flips at a time.
- [ ] Pointer/touch/keyboard flipping still works.
- [ ] Add/remove quote actions work on both card faces.
- [ ] Header count, floating dock, drawer list/removal, and prototype submission behavior remain unchanged until intentionally migrated.
- [ ] Products season and footer match baseline.

## Standard

- [ ] Stage order remains Source, Inspect, Prepare, Pack, Control, Handover.
- [ ] All current headings, copy, images, statuses, proof output, interlude, seal, and CTA match baseline.
- [ ] Desktop progress rail updates at the same scroll positions.
- [ ] Mobile sticky pill and stage stacking match baseline.
- [ ] GSAP reveals and reduced-motion behavior match baseline.

## Accessibility and motion

- [ ] Keyboard tab order does not gain hidden/unreachable controls.
- [ ] Focus states remain visible.
- [ ] Dialog/menu close behavior works.
- [ ] Product/world flips remain keyboard accessible.
- [ ] `prefers-reduced-motion` suppresses the same current movement and does not expose hidden faces.
- [ ] No new hydration/accessibility warnings appear.

## Technical gates

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes and current routes remain static unless a deliberate requirement changes that.
- [ ] Direct catalogue integrity test passes.
- [ ] New current-state regression tests pass; do not rely on the three stale parity scripts.
- [ ] Visual diffs at agreed desktop/mobile widths show only approved switcher changes.
- [ ] Browser console is free of runtime errors and hydration warnings.

# 21. FILES THAT SHOULD NOT BE TOUCHED INITIALLY

- `src/app/page.tsx`: preserves exact homepage composition/order.
- `src/app/products/page.tsx`: current route and metadata.
- `src/app/standard/page.tsx`: current route and metadata.
- `src/components/home/HeroSection.tsx`: highest-risk media/motion/navigation component.
- `src/components/home/ThreeWorldsSection.tsx`, `WorldCard.tsx`, `WorldsSection.tsx`: current three-world experience.
- `src/components/home/SeasonSection.tsx`, `CompanySection.tsx`, `TradeSection.tsx` and their CSS: active current sections.
- `src/components/products/ProductsExplorer.tsx` and all active card/filter/drawer children: tightly coupled local state and interaction system.
- `src/data/products.ts`: exact 60-product source of truth.
- `src/data/productSpecs.ts`, `productImages.ts`: exact-name/key mappings.
- `src/components/standard/StandardPageContent.tsx`, `StandardStageBlock.tsx`, `StandardFinalStageBlock.tsx`, `StandardProgressThread.tsx`.
- `src/data/stages.ts`: active Standard sequence/content/anchor IDs.
- `src/styles/globals.css`, `products.css`, `standard.css`, `footer.css`: global regression surface.
- `src/components/common/SiteFooter.tsx`: all current routes rely on its exact variant output.
- `public/assets/*` current assets: do not replace, reorganize, or optimize them during architecture work.

The first necessary current-file change should be the later targeted switcher slot in `SiteHeader.tsx`, after the isolated destination exists and baselines are in place. `app/layout.tsx` should remain unchanged unless SEO/shared document requirements explicitly demand a reviewed change.

# 22. FILES THAT WILL LIKELY BE CREATED

Planning list only; names may be refined during implementation:

- `src/divisions/types.ts`
- `src/divisions/registry.ts`
- `src/divisions/routing.ts`
- `src/components/common/BusinessDivisionSwitcher.tsx`
- `src/components/common/BusinessDivisionSwitcher.module.css`
- `src/app/dried-spices/layout.tsx`
- `src/app/dried-spices/page.tsx`
- `src/app/dried-spices/products/page.tsx`
- `src/app/dried-spices/standard/page.tsx`
- `src/styles/dried-spices/theme.module.css`
- `src/components/dried-spices/layout/DriedSpicesHeader.tsx`
- `src/components/dried-spices/layout/DriedSpicesHeader.module.css`
- `src/components/dried-spices/layout/DriedSpicesMenu.tsx`
- `src/components/dried-spices/layout/DriedSpicesFooter.tsx`
- `src/components/dried-spices/home/*`
- `src/components/dried-spices/products/*`
- `src/components/dried-spices/standard/*`
- `src/types/dried-spices.ts`
- `src/types/quotation.ts` when the shared quote contract is approved
- `src/data/dried-spices/catalogue.ts`
- `src/data/dried-spices/specifications.ts`
- `src/data/dried-spices/media.ts`
- `src/data/dried-spices/seasons.ts` only if approved seasonal data exists
- `src/data/dried-spices/process.ts`
- `public/assets/dried-spices/*` approved media
- Route-mapping/data integrity/regression test files
- Later: route-level OG images, `src/app/sitemap.ts`, and `src/app/robots.ts`

# 23. RISKS

| Risk | Why it is material here | Mitigation |
|---|---|---|
| Global CSS contamination | Produce loads four large global stylesheets with generic/legacy selectors | CSS Modules for every new visual component; wrapper-scoped `--ds-*`; no new root CSS import |
| Accidental route changes | Current links are hardcoded across header/menu/footer/data | Preserve all current files/URLs; Option A; semantic route-map tests; no `/produce` migration |
| Product-data mixing | Current Dried names can look related to new business products | Separate data namespace/types/IDs; prohibit imports from `PRODUCT_LIBRARY`; division discriminator at boundaries |
| Switcher state bugs | Layouts do not rerender from pathname and current routes have queries/anchors | URL/pathname resolver in small client component; explicit page-kind mapping; direct-link tests; no localStorage authority |
| Hydration mismatch | Client-derived division/theme could differ from server markup | Route layout supplies structural theme; client hook only marks switcher active; no localStorage-dependent first render |
| Both divisions’ assets loading | Shared imports or root CSS can pull new modules/media into Produce | Route-local imports/assets; registry contains no component/media imports; network/bundle audits |
| SEO duplicate content | Aliasing Produce at `/produce` or publishing placeholder division pages creates duplication | No Produce alias; unique canonicals/copy; withhold incomplete routes from indexing |
| Quote state crossing divisions | Current quote keys lack a division field and state is local | Separate drafts; discriminated union; no mixed carts; do not carry state/query during switch |
| Homepage header duplication | Two navbar/menu systems make switcher placement ambiguous | Integrate first into actual shared visible header; do not combine consolidation with route work; separate tested follow-up |
| Over-abstraction | Universal page/header/footer components would accumulate conditionals | Separate route trees and division components; share only proven primitives |
| Stale tests | Existing parity tests describe old interfaces and fail now | Establish new baseline and current tests before shared changes |
| Unverified new business data | No Dried & Spices catalogue/content has been provided | Create architecture without records; never invent products/specs/process claims; gate release on business approval |
| Multiple root layout reloads | Next.js performs full-page loads across root layouts | Retain one root layout; use nested `/dried-spices/layout.tsx` |
| Produce header layout squeeze | Switcher competes with quote/menu actions, especially mobile | Approved compact slot, responsive design, screenshot testing; menu placement as mobile fallback |
| Future division hardcoding | A binary toggle would require rewrite for a third division | Registry-driven list and semantic route mapping; no `isProduce ? ... : ...` routing core |

# 24. FINAL RECOMMENDATION

### Recommended URL architecture

Use Option A:

- AGRICA Produce: `/`, `/products`, `/standard`.
- AGRICA Dried & Spices: `/dried-spices`, `/dried-spices/products`, `/dried-spices/standard`.

Keep one root layout and add a nested Dried & Spices layout. Do not add `/produce` aliases or move the homepage.

### Recommended component architecture

Maintain two explicit page/component trees. Share only the division switcher, route registry, brand/accessibility primitives, and future quote transport contract. Keep current Produce header/menu/footer/components operationally Produce-owned until a small extraction is proven safe.

### Recommended theme architecture

Keep all current Produce CSS/tokens unchanged. Give the new route a wrapper-scoped, prefixed `--ds-*` token set and CSS Modules imported only from the Dried & Spices subtree/components. Do not add a new global stylesheet to the root layout.

### Recommended data architecture

Leave `PRODUCT_LIBRARY`, product specs, images, seasons, and stage data in place. Create `src/data/dried-spices` with its own types, stable IDs, categories, specs, media, seasons, and process content. Never infer or duplicate business data from Produce.

### Recommended switch behavior

Derive active division from pathname. Map Home ↔ Home, Products ↔ Products, and Standard ↔ Standard through a typed registry. Fall back to the target division homepage when the corresponding route is unavailable. Do not carry Produce world queries or quote state. Do not use localStorage as routing authority.

### What should remain completely untouched

- Current route files and URLs.
- Homepage section composition and active components.
- Current 60-product Fresh/Frozen/Dried catalogue and current Dried world.
- Product cards, filters, search, and current quote UI.
- Current Standard data/components/animation.
- Current Produce theme, CSS, media, and responsive rules.
- Current Produce footer output.

### What should be refactored before adding Dried & Spices

Only new, low-risk infrastructure:

- Typed division identifiers and semantic route registry.
- Route resolution/switch mapping with tests.
- A small accessible switcher component.
- Current-state Produce regression coverage.

No broad existing-site refactor is a prerequisite for building the isolated new subtree.

### What should NOT be refactored yet

- Do not move Produce into route groups or `/produce`.
- Do not reorganize current data under `data/produce`.
- Do not convert current global CSS to Modules during this feature.
- Do not create a universal header/footer/home/catalogue component.
- Do not replace current local quote state before the backend/schema is approved.
- Do not fix the homepage header duplication in the same initial change.
- Do not clean legacy components/assets as part of dual-site work.

### Safe first implementation step

Before adding a visible route or switcher, create and approve a zero-change Produce regression baseline plus the pure division route registry/mapping tests. The first visible feature should then be the isolated `/dried-spices` route shell with route-scoped theme infrastructure. Only after that destination is stable should the shared Produce header receive the switcher.
