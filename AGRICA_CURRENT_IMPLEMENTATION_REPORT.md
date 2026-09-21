# AGRICA Current Implementation Report

Audit date: 2026-09-19  
Repository state audited: branch `main`, commit `508d9f3` (`feat: redesign product worlds and imagery`, 2026-09-14)  
Source of truth: the active `src/app` import graph and current repository contents. Generated `.next` output was rebuilt during the audit. No application source was changed.

# 1. EXECUTIVE SUMMARY

AGRICA is presented as a B2B Egyptian agricultural-export brand supplying fresh, frozen, and dried produce to global markets.

The current site is a statically prerendered Next.js App Router application with three authored routes:

- `/`: brand homepage with a video hero, three product-world cards, an illustrative season explorer, company positioning, a non-sending trade form, and a global footer.
- `/products`: a 60-item product catalogue with Fresh/Frozen/Dried switching, family filters, global text search, dark 3D flip cards, in-memory enquiry selection, an illustrative season section, and a non-sending quotation drawer.
- `/standard`: a six-stage, long-form export-control story with a progress indicator, stage imagery, a mid-page proof interlude, and product/enquiry CTAs.

This is beyond a wireframe: the principal layouts, responsive CSS, navigation, catalogue interactions, and motion treatments are implemented. It is not production-ready. The two enquiry forms do not send data, commercial and seasonal claims need business verification, internationalization is absent, route-level SEO is minimal, several accessibility defects remain, the homepage mounts duplicate navigation systems, and the automated parity tests mostly describe superseded interfaces.

Best classification: **high-fidelity front-end prototype / pre-integration implementation**.

# 2. CURRENT TECH STACK

Installed versions below come from the current lockfile/install (`npm ls --depth=0`), not assumptions:

| Area | Current implementation |
|---|---|
| Framework | Next.js App Router, `next@16.3.4` |
| UI runtime | `react@19.2.8`, `react-dom@19.2.8` |
| Language | TypeScript; installed `typescript@5.9.3`; strict mode enabled |
| Types | `@types/node@22.20.1`, `@types/react@19.2.18`, `@types/react-dom@19.2.7` |
| Styling | Plain global/component CSS. **No Tailwind dependency or configuration exists.** |
| GSAP | `gsap@3.15.0`; `ScrollTrigger` is imported and registered in the hero, company, trade, and standard stage components |
| Lenis | **Not installed and not used** |
| Other animation | `motion@13.2.0` (`motion/react`), but only in the currently unused `Stack.tsx` prototype |
| Icons | No icon package. Icons/arrows are inline SVG or Unicode characters. |
| Images | Mix of `next/image` and raw `<img>`; local PNG/JPG/AVIF/SVG files under `public/assets` |
| Video | Native `<video>` using local MP4 files, autoplay/loop/muted/playsInline, `preload="auto"` |
| Fonts | System Helvetica Neue/Helvetica/Arial sans stack and Georgia/Times serif stack; no downloaded or `next/font` font |
| Localization | No i18n package or locale routing |
| Forms | Controlled React forms plus native HTML inputs; no form library |
| State | Local React state/hooks only; no global store or persistence |
| Backend/API | None |
| CMS/database | None |
| Email/contact integration | None |
| Analytics | None |
| Deployment | No platform configuration is committed; Git remote is GitHub, but hosting cannot be identified |
| Test runner | No formal runner. Standalone TypeScript scripts execute through `tsx@4.23.13`. |

`package.json` specifies ranges for several development dependencies (`typescript ^5.8.2`, `tsx ^4.19.3`, type packages), while the lockfile/install resolves the versions shown above.

# 3. PROJECT STRUCTURE

```text
.
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root metadata, viewport, CSS imports, global skip link
│   │   ├── page.tsx                   # Homepage composition
│   │   ├── products/page.tsx          # Products route and metadata
│   │   └── standard/page.tsx          # Standard route and metadata
│   ├── components/
│   │   ├── common/                    # Header, drawer menu, footer, skip link
│   │   ├── home/                      # Active homepage sections plus unused prototypes
│   │   ├── products/                  # Catalogue, cards, filters, enquiry UI, unused detail sheet
│   │   └── standard/                  # Active monolith stages plus older workspace components
│   ├── data/
│   │   ├── products.ts                # Active 60-name catalogue taxonomy
│   │   ├── productSpecs.ts            # Specs/varieties for eight fresh products
│   │   ├── productImages.ts           # Dedicated image mapping for 15 catalogue items
│   │   ├── seasons.ts                 # Month definitions and explicitly illustrative demo crops
│   │   ├── stages.ts                  # Active six-stage Standard content
│   │   ├── threeWorlds.ts             # Homepage world-card content
│   │   └── controlDisciplines.ts      # Data used only by an inactive legacy component
│   ├── styles/
│   │   ├── globals.css                # Tokens, navbar/menu, hero, and substantial legacy CSS
│   │   ├── products.css               # Active catalogue/card/drawer styles plus inactive sheet styles
│   │   ├── standard.css               # Active Standard page styles
│   │   └── footer.css                 # Shared footer styles
│   └── types/agrica.ts                # Shared catalogue, specs, season, quote, and stage types
├── public/
│   ├── agrica-logo.png                # Duplicate top-level public logo
│   └── assets/                        # Runtime-served brand/product/season/stage media
├── assets/                            # Source/raw duplicates; not web-served by Next.js
├── dist/                              # Ignored legacy static HTML/CSS/JS prototype
├── scratch/                           # Ignored asset-processing and visual experiments
├── test/                              # Standalone catalogue and old parity scripts
├── package.json / package-lock.json
├── next.config.ts
├── tsconfig.json
├── README.md                          # Partly stale description of an older homepage architecture
├── MOTION_DIRECTOR.md                 # Older motion direction, not the current implementation
└── ANTIGRAVITY_HANDOFF.md             # Handoff for the legacy `dist` prototype
```

There is no `lib`, `hooks`, `utils`, `locales`, CMS, database, or API directory. Component-specific homepage CSS lives beside components; all other route CSS is imported globally from the root layout.

# 4. ROUTES / PAGES

| URL | Page file | Purpose | Status | Main active components | Mobile state / known issues |
|---|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Brand and lead-generation homepage | PARTIAL | `SiteHeader`, `HeroSection`, `WorldsSection` → `ThreeWorldsSection`, `SeasonSection`, `CompanySection`, `TradeSection`, `SiteFooter` | Dedicated mobile hero and season layouts; cards become one column. Duplicate global and hero-local navbars/menu instances are mounted. Trade submission is simulated. |
| `/products` | `src/app/products/page.tsx` | Browse all produce and build an enquiry | PARTIAL | `ProductsExplorer` and its product/filter/quote children; reused `SeasonSection`; shared header/footer | Responsive 3/2/1-column grid and touch flip. Enquiry is memory-only and submission is simulated. Root skip link points to missing `#product-explorer`; a second local skip link points correctly to `#product-atlas-main`. |
| `/standard` | `src/app/standard/page.tsx` | Explain six controlled export stages | PARTIAL | `StandardPageContent`, monolith hero, progress thread, five `StandardStageBlock`s, proof interlude, `StandardFinalStageBlock`, shared header/footer | Two-column stages stack on mobile; desktop rail becomes sticky pill. Root skip link points to missing `#standard-journey`. Commercial claims are not externally verified. |

Next.js also generates `/_not-found`, but there is no authored `not-found.tsx`; it is framework output, not a project page. No `/about`, `/contact`, product-detail, dedicated enquiry, test, or API route exists.

# 5. HOMEPAGE — EXACT CURRENT STATE

Display order is defined in `src/app/page.tsx`.

## 5.1 Global header

- Component: `SiteHeader`, `src/components/common/SiteHeader.tsx`.
- A fixed paper capsule with AGRICA logo and Menu button is mounted before the hero.
- Important defect: comments/CSS attempt to hide `.site-header.home-header`, but the actual markup is `.global-navbar-wrapper.home-navbar`. The global header therefore remains mounted and visible while the hero also renders its own desktop/mobile navbar. The fixed global header will generally overlay the hero-local header.
- The global header owns one `GlobalMenu`; the hero owns a second independent `GlobalMenu`.

## 5.2 Hero

- Component: `HeroSection`, `src/components/home/HeroSection.tsx`; core styling is in `src/styles/globals.css`.
- Desktop (`min-width: 961px`): full-viewport dark navy stage; three decorative PNGs; a paper navbar; two asymmetric video cards using `video_hero.mp4` and `video 2.mp4`; AGRICA logo; copy: “From Egyptian fields to / global supply.”
- Mobile (`max-width: 960px`): full-height dark stage; nine decorative instances of `s1.png`, `s2.png`, and `s3.png`; local paper navbar; two continuously moving video ribbons. Each ribbon duplicates its videos for looping, producing eight mobile video elements total. Copy: “From Egyptian soil, [AGRICA] reaches / the world.”
- Motion: GSAP mobile marquee loops, three-line masked reveal, and continuous decorative drift/breathing. All videos are also explicitly played on mount. `gsap.matchMedia()` and tween cleanup are present.
- Reduced motion: the GSAP mobile branch exits; CSS suppresses animation/transitions.
- Incomplete/debt: no poster is assigned to video elements; all use `preload="auto"`; both mobile and desktop DOM/media are mounted regardless of CSS visibility; the imported `ScrollTrigger` is registered but not used by this component; local and global headers duplicate navigation.

## 5.3 Three Worlds

- Active chain: `WorldsSection.tsx` → `ThreeWorldsSection.tsx` → `WorldCard.tsx`; data in `src/data/threeWorlds.ts`; styles in `ThreeWorldsSection.css`.
- Copy: “THREE WORLDS”, “Three worlds. One export standard.”, and “Fresh · Frozen · Dried”.
- Three responsive 3D cards: Fresh Produce, Frozen Produce, Dried Produce. Fronts use `world-card-fresh.png`, `world-card-frozen.png`, and `world-card-dried.png`; backs use two-line editorial descriptions.
- Interaction: pointer tap/click or keyboard activation flips one card at a time; footer links route to `/products?world=fresh|frozen|dried` without triggering a flip.
- Responsive: three columns desktop, two columns tablet, one column below 700px. Card heights and typography are reduced on narrow screens.
- Complete: primary cards, imagery, route links, and touch/keyboard flip behavior.
- Temporary/debt: world copy and imagery are hardcoded; no analytics; visual transitions are CSS-only. README descriptions of an `OptionWheel`, shared world store, pinned transition, and card stack do not match this active implementation.

## 5.4 Seasonal Rhythm

- Component: `SeasonSection.tsx`; data in `src/data/seasons.ts`; styles split between `SeasonSection.css` and legacy/global season rules.
- Mobile: month ribbon, selected month/season readout, and up to three floating crop images from the illustrative registry. Month changes animate crop entries with GSAP.
- Desktop: dark two-column season section with month grid and readout. It always displays the static illustrative line “Orange · Lemon · Sweet potato” and “Final seasonal availability to be confirmed”; it does not render the registry’s month-specific crop results.
- Default month is January, not the visitor’s current month.
- Incomplete: the official matrix is empty; demo months are explicitly illustrative. `SEASON_ILLUSTRATIVE_NOTICE` is imported but never rendered. `secondaryCrops` is calculated but unused.

## 5.5 Company

- Component/style: `CompanySection.tsx` / `CompanySection.css`.
- Copy: “THE COMPANY”, “Egyptian by origin. International by discipline.” and “AGRICA connects agricultural origin with the standards, coordination, and clarity global trade demands.”
- Trust pillars: Origin = Egypt; Operating model = Farm-to-export coordination.
- Media: lazy raw image `/assets/company_editorial_hero.jpg`.
- CTA: “TALK TO AGRICA” anchors to `#trade`.
- Motion: ScrollTrigger stagger reveal, media clip-path reveal, and scrubbed image parallax; `gsap.context()` is reverted on cleanup.
- Responsive: two columns collapse at 992px; media is hidden below 680px.
- Incomplete: claims and image provenance need business review; no dedicated company route.

## 5.6 Start a Trade

- Component/style: `TradeSection.tsx` / `TradeSection.css`.
- Copy: “Tell us what needs to arrive.” and “Share the essentials. AGRICA will handle the next export step.”
- Fields: Product or Category, Destination Market, Estimated Volume, Company Name, Work Email.
- Submit only sets local `submitted=true`, changes the button to “ENQUIRY SENT,” shows a success note, then resets after four seconds. No request is sent.
- The form has `noValidate`; only email has `required`, but browser validation is disabled. Blank or malformed submissions are accepted by the handler.
- Motion: separate ScrollTrigger stagger reveals for heading and fields, cleaned through a GSAP context.
- Responsive: two-column layout/field grid collapses at 992px/680px.

## 5.7 Footer

- Component/style: `SiteFooter.tsx` / `src/styles/footer.css`.
- Homepage variant copy includes “One origin · Three worlds,” “Egyptian origin. Ready for the world.” and a link to `/products`.
- Shared footer includes Products, Our Standard, Company, Start a Trade, trade-desk link, logo wordmark, “© 2026 AGRICA,” and a smooth Back to top button.
- Reveal uses a one-shot `IntersectionObserver` and data attribute; CSS disables motion for reduced-motion users.

The homepage does **not** currently include `StandardPreviewSection`; that file is inactive.

# 6. NAVBAR / GLOBAL LAYOUT

- Root layout: `src/app/layout.tsx`; it imports all four large CSS files globally, sets `<html lang="en">`, inserts `SkipLink`, and renders route content.
- Shared navbar: `src/components/common/SiteHeader.tsx`; fixed capsule, max width 1440px, z-index 90.
- Scroll behavior: at `scrollY <= 20`, visible/non-floating; after that, a movement over 6px hides it while scrolling down past 80px and shows it while scrolling up. A menu-open header is never hidden.
- Route themes: homepage defaults to paper/dark logo; all internal variants default to navy/white logo. `/products` explicitly passes navy. The `transparent` theme type exists but has no dedicated CSS behavior and is unused.
- Products CTA: “Build a quote” plus count, wired to the quote drawer. `aria-expanded` is hardcoded to `false`, even while open.
- Menu: `GlobalMenu.tsx`, a right-side modal drawer with Home, Products, Our Standard, Company, and Start a Trade links. Escape, backdrop click, body scroll lock, and initial focus on Close are implemented.
- Menu gaps: no focus trap, no return-focus behavior, and the dialog remains mounted while closed.
- Hidden semantic links in `SiteHeader` are placed inside `aria-hidden="true"` but remain normal focusable links, creating potentially invisible/AT-hidden tab stops.
- Logo: route-dependent raw `<img>` using `/assets/agrica-logo.png` or `/assets/agrica-logo-brand.png`.
- Language selector: none.
- Main responsive navbar breakpoint: 960px (56px desktop capsule, 46px mobile capsule).
- Homepage exception/bug: `HeroSection` implements a second navbar and a second menu instance at both desktop and mobile sizes; the intended hiding selector does not match `SiteHeader`.
- Footer is shared on all three routes. Header/footer are composed per page rather than directly by the root layout.

# 7. PRODUCTS PAGE — FULL IMPLEMENTATION

## Architecture

`src/app/products/page.tsx` renders client component `ProductsExplorer.tsx`. `ProductsExplorer` owns active world, active family, search query, selected quote items, and quote-drawer state.

Active hierarchy:

```text
ProductsExplorer
├── SiteHeader (products variant)
├── products hero
│   └── WorldSwitch
├── catalogue handoff
│   ├── LiveSearchInput
│   └── FamilyPanel
├── AtlasGrid
│   └── ProductFlipCard × filtered products
│       ├── ProductCardFront → QuoteMicroAction
│       └── ProductCardBack → ProductSpecTable + ExportActionRail
├── SeasonSection
├── SiteFooter
├── QuoteDrawer
└── FloatingEnquiryDock
```

## World, search, and family filtering

- Fresh/Frozen/Dried is a tab-like `WorldSwitch`.
- Initial `?world=` is read once on mount; valid values select the relevant world. Later switches update the URL with `history.replaceState` without navigation.
- Family tabs are generated from the active world. “All Families” resets the family filter. The strip is sticky at 72px and horizontally scrollable.
- Search is a collapsible controlled input. When a query exists, it searches all 60 products by name, world label/id, and family name/code and deliberately bypasses active-world/family filtering.
- The source comment says variety is searchable, but runtime atlas items never receive a `variety` value and the separate spec registry is not consulted, so variety search does not work.
- Switching worlds while a search is non-empty changes theme/taxonomy but does not constrain the results until search is cleared.
- `totalMatches` is passed to `LiveSearchInput` but ignored. `catalogueCount` is computed but unused.

## Grid and cards

- Grid: 3 columns desktop, 2 at ≤1024px, 1 at ≤640px.
- At most one card is flipped at once. Filtering automatically clears a flipped card that disappears.
- Front: family/world code, add/remove micro-action, uppercase product name, category/family, verified variety names when available, and a dedicated image or sprite fallback.
- Back: code, product name, “Product specifications,” up to five priority rows, and add/remove enquiry notch.
- Specs for the eight registered fresh products prioritize Origin, Harvest Window, Grade Standard, Packaging, and Shipping Temperature. Other products normally show only Origin and Condition.
- Flip input: pointer down/up within 8px toggles; card uses `touch-action: pan-y`; an invisible full-card button supports keyboard toggling. Quote buttons stop propagation.
- Dark floating concept: **implemented**, not merely planned. `products.css` defines navy/deep surfaces, world-specific accents, perspective, 620ms Y rotation, large shadows, hover lift, gloss/rim layers, and dedicated back faces. It is active for every catalogue card.
- Mobile uses the same flip-card interaction, with shorter fixed card height and one-column layout; there is no separate mobile detail sheet in the active graph.
- Reduced motion swaps rotation for front/back opacity and pointer-event state.

## Quote selection

- Add/remove is available on both card faces.
- A selected count appears in the navbar. Once at least one product is selected, a bottom floating enquiry dock appears on all viewport sizes.
- Quote state is local to `ProductsExplorer`; it is lost on refresh/navigation and is not stored in URL, local storage, context, or backend.
- The quote drawer lists selected items and fields, but submit only shows a prototype message.

## Product media strategy

- Fifteen IDs map to dedicated optimized AVIF files (five fresh citrus and ten frozen products).
- Fresh Grapes gets a dedicated PNG outside the map.
- All remaining products reuse one of the large `three-worlds.png` or `product-atlas.png` atlas backgrounds based on a coarse visual key; therefore many distinct products display the same generic family/world visual.

# 8. PRODUCT DATA — SOURCE OF TRUTH

## Active data sources

1. `src/data/products.ts` is the catalogue source of truth for world, family, and product names.
2. `src/data/productSpecs.ts` is an auxiliary fresh-product specification/variety registry.
3. `src/data/productImages.ts` maps selected runtime product IDs to dedicated images.
4. `src/types/agrica.ts` defines the contracts.

`ProductsExplorer` flattens `PRODUCT_LIBRARY` at runtime into `ProductAtlasItem` objects. The legacy `dist/products/products.js` catalogue is not imported by Next.js.

## Counts and actual names

### Fresh — 29

- Citrus (`CIT`, 5): Oranges, Lemons, Egyptian Limes, Mandarins, Grapefruit.
- Fresh Fruits (`FRT`, 8): Grapes, Pomegranates, Strawberries, Mangoes, Watermelon, Melons, Guava, Dates.
- Vegetables & Tubers (`VEG`, 16): Potatoes, Sweet Potatoes, Onions, Garlic, Green Beans, Tomatoes, Bell Peppers, Chili Peppers, Cucumbers, Zucchini, Eggplant, Artichokes, Carrots, Broccoli, Cauliflower, Cabbage.

### Frozen — 18

- IQF Fruits (`IQF`, 4): Strawberries, Mango, Pomegranate Arils, Guava.
- IQF Vegetables (`IQV`, 14): Green Beans, Green Peas, Okra, Molokhia, Spinach, Artichokes, Broccoli, Cauliflower, Carrots, Bell Peppers, Sweet Corn, Broad Beans, Peas & Carrots, Mixed Vegetables.

### Dried — 13

- Dried Fruits (`DRF`, 7): Orange, Lemon, Grapefruit, Mango, Strawberry, Pomegranate, Dates.
- Dehydrated Vegetables (`DRV`, 6): Onion, Garlic, Tomato, Carrot, Bell Pepper, Molokhia.

Total: **60 catalogue entries**. Names repeated across conditions are separate entries with unique `world::family::name` keys.

## Schema and populated fields

`ProductLibrary` contains `WorldLibrary { label, families[] }`; each `ProductFamily` contains `{ name, code, products[] }`.

Runtime `ProductAtlasItem` supports:

`id`, `key`, `name`, `worldId`, `worldLabel`, `familyCode`, `familyName`, `visual`, plus optional `variety`, `packaging`, `temperature`, `grade`, `origin`, `availability`, `varieties`, and `exportSpecs`.

Real populated runtime atlas fields for all products:

- `id`/`key` (derived), `name`, `worldId`, `worldLabel`, `familyCode`, `familyName`, `visual` (derived), and `origin` (hardcoded to `Egypt`).

Populated only through the separate spec lookup for eight **fresh** names:

- `varieties`, and selected `ExportSpecification` fields: `origin`, `harvestWindow`, `temperature`, `packaging`, `grade`; Grapes also has `seedStatus`.
- Registered products: Oranges, Lemons, Grapes, Potatoes, Strawberries, Pomegranates, Onions, Garlic.

Declared but unpopulated everywhere:

- `sizeCalibre`, `brix`, `acidity`, `averageWeight`, `shelfLife`.
- Runtime atlas `availability`, nested `exportSpecs`, and item-level `varieties` are never assigned.
- There is no product slug, long description, shipping method, MOQ, Incoterm, certificate object, destination list, or product-detail route.

Placeholder/coarse content:

- Generic atlas visuals for products without dedicated images.
- The universally assigned origin and all commercial spec values require business verification despite the registry’s “Verified” code comment.

# 9. SEASONAL DATA

- File: `src/data/seasons.ts`.
- `MONTHS` defines all 12 months, season name/label, and background tint.
- `CONFIRMED_SEASON_MATRIX` is an empty `ProductSeasonAvailability[]`. No catalogue product has confirmed structured monthly availability.
- `SEASONAL_CROPS_REGISTRY` is explicitly an **illustrative demo matrix**, with four entries:
  - EGYPTIAN MANGOES: peak Jun–Jan; available Feb and May.
  - FRESH POMEGRANATES: peak Aug–Mar; available Apr and Jul.
  - HERBS & BOTANICALS: peak Oct–May; available Jun and Sep.
  - CITRUS SELECTION: peak Mar–Sep; available Feb and Oct.
- These names do not all map one-to-one to catalogue entries (“HERBS & BOTANICALS” is not in the 60-product catalogue).
- `getCropsForMonth` returns peak/available demo crops sorted by display priority.
- Mobile `SeasonSection` consumes that function and shows the first three results. Desktop only changes month/readout and retains a static illustrative product line.
- The explicit disclaimer constant is not shown on mobile; desktop shows a shorter confirmation warning.
- The same component appears on `/` and `/products`; there is no dedicated seasonal route.

# 10. OUR STANDARD PAGE

The active page follows the **Editorial Monolith / Controlled Layering** direction named at the top of `src/styles/standard.css`. It is not the older tabbed Digital Lot Passport workspace still present in unused files.

Overall order:

1. `StandardMonolithHero`: “One lot. Every step controlled.” plus the field-to-handover subline and animated scroll line.
2. `StandardProgressThread`: fixed left rail on desktop; sticky progress pill at ≤1024px.
3. Six sequential stage blocks, with `StandardProofInterlude` inserted after stage 03.
4. Shared Standard footer.

Stages come from `src/data/stages.ts`:

| # | Stage/title | Active component | Copy summary | Media | Motion/mobile/status |
|---|---|---|---|---|---|
| 01 | Source — “Selected for the buyer, not the warehouse.” | `StandardStageBlock.tsx` | Grower, field, and crop matched to destination before entry | `/assets/standard_stage_01_source.jpg` | GSAP watermark/headline/mask reveal; text then image on mobile; implemented, claims unverified |
| 02 | Inspect — “Quality checked before it moves.” | `StandardStageBlock.tsx` | Physical condition, calibre, grade verified on-site | `/assets/standard_stage_02_inspect.jpg` | Same reveal; tinted background; implemented, claims unverified |
| 03 | Prepare — “Prepared to destination specification.” | `StandardStageBlock.tsx` | Fresh/frozen/dried formatting around buyer tolerances | `/assets/standard_stage_03_prepare.jpg` | Same reveal; implemented, claims unverified |
| — | Proof interlude — “Built around the destination.” | `StandardProofInterlude.tsx` | Market, Grade, Pack, Condition, Handover | No media | Static responsive flex row; implemented |
| 04 | Pack — “Packed for the journey ahead.” | `StandardStageBlock.tsx` | Unitizing, labeling, compliance, transit stability | `/assets/stage_04.png` | Same reveal; tinted background; implemented, claims unverified |
| 05 | Control — “Condition maintained through handling.” | `StandardStageBlock.tsx` | Cold chain, humidity, atmospheric management | `/assets/stage_05.png` | Same reveal; implemented, claims unverified |
| 06 | Handover — “Cleared. Accounted for. Ready to move.” | `StandardFinalStageBlock.tsx` | Documentation, handling, export handover | `/assets/stage_06.png` | Sequenced GSAP timeline for watermark, headline, media, status, seal, CTA; navy finale; implemented, claims unverified |

The experience is normal document scrolling; no section is pinned and no scroll-jacking/Lenis exists. The progress code listens to native scroll and considers a stage active when it passes 45% of viewport height.

Important data/render mismatch: `kicker`, `stamp`, `coordinate`, and the three `facts` rows in each `JourneyStage` are no longer rendered by the active design. `code` is only a data attribute. They belong to the old workspace concept.

The final “FULL SPECIFICATION CERTIFIED” seal is hardcoded presentation copy, not evidence of an integrated certification system.

# 11. REQUEST A QUOTE / START A TRADE FLOW

## Entry points

- Homepage menu/footer → `/#trade`.
- Homepage Company CTA → `#trade`.
- Product front `+`, product back “Add to enquiry,” products navbar “Build a quote,” floating enquiry dock, and Products footer CTA.
- Standard final CTA/footer → `/products`; products must then be selected.

## Homepage form

- File: `src/components/home/TradeSection.tsx`.
- Fields: product, destination, volume, company, email.
- Product preselection: none.
- Validation: effectively none because `noValidate` is set; email alone has `required`.
- Submission destination: none. It only displays a timed local success state.

## Products enquiry

- State owner: `ProductsExplorer.tsx`; shape: `QuoteItem { key, name, world, family }`.
- Selection is de-duplicated by key and removable from cards/drawer.
- Drawer file: `QuoteDrawer.tsx`.
- Fields: destination, estimated volume, company, work email; all use native `required`, and email uses `type="email"`.
- Product preselection: selected card items appear in drawer, but are not serialized or submitted.
- Persistence: none; state disappears on reload/navigation.
- Submit with no products: local warning. Submit with products: “Enquiry prepared. In production, this will be sent directly to the AGRICA export team.”
- API/email/database: none.
- Success/error states: informational local messages only; no network loading/error state.
- Mobile: drawer becomes full width; form labels stack; floating dock remains at the viewport bottom.

# 12. INTERNATIONALIZATION

- Architecture: none.
- `<html lang="en">` is hardcoded.
- Configured locales: English only by implication; no locale config.
- Language switcher: none.
- Translation files: none.
- Arabic/RTL: not implemented.
- French, German, Spanish, Russian: not implemented.
- Localized routes: none.
- All visitor-facing copy is hardcoded English in components/data.

Nothing is architecturally prepared beyond ordinary string-containing data objects.

# 13. RESPONSIVE / MOBILE IMPLEMENTATION

- Global breakpoint strategy is CSS-driven and inconsistent by component: 480, 560, 640, 680, 699/700, 900, 960/961, 992, 1023/1024, and 1100px all appear.
- Viewport metadata uses device width and initial scale 1; major full-height areas use `svh`.
- Header: same shared capsule scales at 960px. Homepage has a dedicated mobile-local header in addition to the shared one.
- Hero: completely separate mobile stage at ≤960px with marquee ribbons and editorial sentence. Both mobile and desktop media remain in the DOM.
- Three Worlds: 3 → 2 → 1 columns; touch-safe flip detection and `touch-action: pan-y`.
- Season: separate mobile composition at ≤960px; horizontal native month ribbon with `scrollIntoView`; desktop variant is hidden.
- Products: world labels flex across width; family tabs horizontally scroll; grid becomes two then one column; cards remain 3D/tap-to-flip; quote drawer is full width at ≤900px.
- Standard: stage grid collapses at ≤1024px; alternating order is removed; left progress rail becomes a sticky pill.
- Quote/trade: drawer and homepage trade fields stack. Floating dock gives a persistent review action.
- Company: media disappears entirely under 680px.
- Touch: product/world cards use pointer distance thresholds; buttons use touch-action manipulation; horizontal ribbons use native scrolling.

Desktop-first or fragile areas:

- Product cards retain a fixed 400–425px mobile height; long back-side packaging text can become dense.
- Standard switches to its mobile form at 1024px, while global navigation/hero switch at 960px.
- Homepage loads desktop and mobile media simultaneously in the DOM.
- Company’s image is removed rather than adapted on small screens.
- The homepage duplicate navbar issue affects both desktop and mobile.

# 14. ANIMATION SYSTEM

## Active GSAP/ScrollTrigger

- `HeroSection.tsx`: GSAP `matchMedia`; infinite mobile marquee timelines, masked text reveal, decorative drift. `ScrollTrigger` is registered but unused.
- `SeasonSection.tsx`: 0.5s staggered entry tween whenever selected month changes; not wrapped in a context and not explicitly killed.
- `CompanySection.tsx`: ScrollTrigger stagger reveal, clip reveal, and scrubbed parallax in a reverted context.
- `TradeSection.tsx`: two ScrollTrigger reveal groups in a reverted context.
- `StandardStageBlock.tsx`: per-stage watermark, headline, and media reveals in a reverted context.
- `StandardFinalStageBlock.tsx`: one ScrollTrigger timeline with sequenced final-stage elements in a reverted context.

## Other motion

- CSS transitions drive header hide/show, global menu layers, world/product flips, quote drawer, floating dock, footer reveal, and hero scroll indicator.
- Native `IntersectionObserver` reveals the footer.
- `motion/react` is only in unused `Stack.tsx`.

## Absent systems

- No Lenis.
- No route transitions.
- No active pinned sections.
- No shared animation provider.

## Reduced motion

- Hero GSAP mobile motion exits early.
- Standard GSAP stage effects exit early.
- Global/products/standard/footer CSS has reduced-motion overrides.
- Company and Trade JS do **not** check reduced-motion themselves, but global CSS collapses CSS transition/animation durations; GSAP inline transforms/tweens may still run.

## Risks/debt

- The ten mounted hero video elements and multiple continuous mobile tweens are the largest motion cost.
- Rapid month changes can overlap short season tweens because they are not killed/reverted.
- `TradeSection`’s four-second timeout is not cleared on unmount.
- The header’s scheduled animation frame is not explicitly cancelled during cleanup.
- ScrollTrigger registration occurs in multiple modules; this is generally safe, but there is no central motion bootstrap.
- No visible hardcoded scroll distances or active scroll-jacking were found.

# 15. MEDIA / ASSET INVENTORY

## Active production paths

- Logos: `/public/assets/agrica-logo.png` (1024×341, 118 KB), `/public/assets/agrica-logo-brand.png` (2172×724, 115 KB).
- Hero: `/public/assets/video_hero.mp4` (6.31 MB), `/public/assets/video 2.mp4` (4.05 MB), plus `s1.png` (442 KB), `s2.png` (493 KB), `s3.png` (495 KB).
- World cards: `world-card-fresh.png` (2.25 MB), `world-card-frozen.png` (2.32 MB), `world-card-dried.png` (2.25 MB).
- Product fallbacks: `product-atlas.png` (1.90 MB), `three-worlds.png` (2.56 MB), `grapes_card.png` (2.12 MB).
- Dedicated fresh AVIF: `products/fresh/{oranges,lemons,egyptian-limes,mandarins,grapefruit}.avif` (56–67 KB each).
- Dedicated frozen AVIF: `products/frozen/{strawberries,mango,pomegranate-arils,guava,green-beans,green-peas,okra,molokhia,spinach,artichokes}.avif` (66–121 KB each).
- Season: `season_crop_1.png` 2.83 MB, `_2.png` 2.70 MB, `_3.png` 2.04 MB, `_4.png` 2.14 MB.
- Company: `company_editorial_hero.jpg` (928×1152, 924 KB).
- Standard: `standard_stage_01_source.jpg` (741 KB), `_02_inspect.jpg` (695 KB), `_03_prepare.jpg` (693 KB), `stage_04.png` (1.90 MB), `stage_05.png` (2.09 MB), `stage_06.png` (1.97 MB).
- Icons: inline SVG/Unicode. `agrica-leaf.svg` and `agrica-leaf-mask.svg` exist but are not referenced.
- Fonts: no font files.
- Packaging/carton/container/logistics: no explicitly named carton or container asset. Stage 04–06 imagery is the only packaging/control/handover media.

## Unused/duplicate/temporary assets

- `public/assets/video 3.mp4` (3.68 MB) and `video_hero_thumb.jpg` are unused.
- Raw `public/assets/ChatGPT Image ...` files are unused aliases of season images.
- `fresh_img.png`, `frozen_img.png`, `dried_img.png`, corresponding `*_text.png`, `logo.png`, `lemon_card.png`, and `three_worlds_{fresh,frozen,dried}.jpg` are not referenced by active source.
- `standard_stage_04_pack.jpg`, `_05_control.jpg`, `_06_export_handover.jpg` are byte-identical duplicates of the actively referenced `stage_04.png`, `stage_05.png`, `stage_06.png` despite differing extensions/names.
- Top-level `assets/` contains another ~48.3 MB of raw/duplicate material and is not served by Next.js.
- `public/agrica-logo.png` duplicates `public/assets/agrica-logo.png` and is unused.
- `public/` totals about 79.9 MB. Many active PNGs are 1.9–2.8 MB and appear to be generated/temporary artwork based on filenames.

# 16. DESIGN SYSTEM

Primary tokens are at the top of `src/styles/globals.css`:

- AGRICA Navy: `#002050`; deep navy `#001837`.
- AGRICA Green: `#50a010`.
- Paper: `#f7f8f3`; footer paper overrides to `#f3f1e8`.
- White: `#ffffff`; ink `#071b2f`; muted `#69747d`; ice `#dfeef4`; amber `#c78640`.
- Global line: `rgba(0, 32, 80, 0.17)`.
- Global gutter: `clamp(1.25rem, 3vw, 3.75rem)`, reduced to 1.15rem below 680px.
- Main max widths: 1440px for navigation/products; 1280px for Standard content; 1000px for proof interlude.
- Type: Helvetica Neue stack for sans; Georgia stack for serif emphasis. Display and section sizes use `clamp`; headlines typically use tight `0.94–0.98` line-height and negative tracking.
- Common radii: navbar 11px; world/product cards 20/22px; stage media 8px; primary rectangular CTAs 0–4px; enquiry dock/pills 999px.
- Shadows: restrained navbar/footer/button shadows, but product cards use layered large 24–70px shadows.
- Buttons: paper/navy capsule nav controls, rectangular navy/green CTAs, minimal text tabs, circular `+` actions.
- Cards: homepage light world cards; products dark world-accented flip cards; Standard image/text blocks.
- z-index conventions: progress/taxonomy around 40–50, floating enquiry 80, navbar/backdrop 90, dialogs/menu 100, skip link 200.
- Product world overrides: Fresh green/pale green, Frozen `#3d8fb2`/ice, Dried `#ad6c34`/warm beige.

Actual inconsistencies:

- Paper is both `#f7f8f3` and `#f3f1e8`.
- Multiple breakpoint systems overlap.
- Active component CSS is split between global files and colocated homepage CSS, while unused legacy selectors remain globally loaded.
- Some newer components use token fallbacks (`var(--font-sans, system-ui, sans-serif)`), while route CSS assumes root tokens.

# 17. ACCESSIBILITY

Implemented:

- Semantic `main`, `section`, `nav`, `header`, `footer`, headings, buttons, links, forms, labels, `dl`, and ordered structures are used broadly.
- Menus/drawers use dialog roles, labels, Escape handling, backdrop close, and body scroll lock.
- World/product cards expose explicit button controls; inactive flip-side controls receive `tabIndex=-1`.
- Search, quote actions, and close controls have accessible labels.
- Many decorative images/icons have empty alt or `aria-hidden`.
- Focus-visible styles exist for important product card actions; a global skip-link style is present.
- Reduced-motion CSS exists across major route styles.
- Most primary touch controls meet or approach 44px; product quote control is 38px.

Concrete problems:

- `/standard` root skip link targets nonexistent `#standard-journey`.
- `/products` root skip link targets nonexistent `#product-explorer`; the page adds a second skip link targeting valid `#product-atlas-main`.
- The homepage has two visible navigation triggers and two modal menu instances.
- `SiteHeader` includes focusable links inside an `aria-hidden="true"` visually hidden container.
- `GlobalMenu` and `QuoteDrawer` do not trap focus or restore it to the opener.
- Products quote header button always reports `aria-expanded="false"`.
- Product/world cards rely on `aria-hidden` on sections; browser/assistive-technology handling of entire transformed faces should be tested, although tab order is explicitly managed.
- Standard progress nodes are links and usable; the mobile sticky status pill is announced through `aria-live` on every active-stage update, which may be noisy during scrolling.
- Homepage trade form disables native validation and provides a false success message.
- Several raw content images have descriptive alt, but most raw `<img>` elements omit intrinsic width/height. This affects layout stability rather than name computation.
- Focus styling is not consistently defined for global menu links, header buttons, taxonomy tabs, and world tabs.
- Product card micro-action is 38×38px, smaller than a common 44×44 touch target.

# 18. PERFORMANCE

Positive implementation details:

- Routes are statically prerendered.
- Dedicated product and world-card imagery uses `next/image` with responsive `sizes`.
- Company and Standard stage raw images are `loading="lazy"`.
- AVIF is used for 15 dedicated product mappings.
- GSAP contexts clean up most ScrollTriggers.

Largest risks:

1. `HeroSection` mounts ten autoplaying, looping, `preload="auto"` video elements (eight mobile duplicates plus two desktop), and its effect attempts to play all of them even when their stage is hidden by CSS. There are two unique active files totaling ~10.36 MB, but duplicate decode/playback work remains possible.
2. Both desktop and mobile hero decorative/media DOM are always mounted. Twelve decorative raw-image elements are present in addition to the videos.
3. Active season/world/product PNGs are commonly 1.9–2.8 MB. The four mobile season images alone total ~9.7 MB if fetched as they become relevant.
4. The entire `public` directory is ~79.9 MB and contains many duplicates/unused files, increasing deployment artifact size.
5. Raw `<img>` use bypasses Next image optimization for hero decoration, season crops, company, Standard imagery, and header logos.
6. No dynamic imports/code splitting are authored for GSAP-heavy sections. All homepage sections are client components. `ProductsExplorer` and `StandardPageContent` make almost their entire route trees client-rendered/hydrated.
7. All four CSS files are imported by the root layout, so products/standard/legacy rules are delivered globally.
8. A global search can render all 60 flip cards at once; there is no virtualization. This is acceptable at current catalogue size but combines with 3D layers/shadows.
9. No explicit poster/preload strategy exists beyond video `preload="auto"`; `video_hero_thumb.jpg` is unused.

No external font downloads, remote image hosts, or runtime API waterfalls exist.

# 19. SEO / METADATA

Implemented:

- Root default title: `AGRICA — One Origin. Three Worlds.`
- Root description: “AGRICA supplies Egyptian produce to global markets across fresh, frozen and dried categories.”
- `/products`: title `Products` through template → `Products — AGRICA`; route description exists.
- `/standard`: title `Our Standard` through template → `Our Standard — AGRICA`; route description exists.
- HTML language is English; viewport/theme color are set.

Missing:

- Open Graph metadata.
- Twitter cards.
- Canonical URLs and metadata base.
- Sitemap.
- `robots.txt`/robots metadata.
- Structured data/schema.
- Product-specific pages/metadata.
- Authored favicon/app icons/manifest.
- Social preview images.
- Dedicated homepage metadata beyond root defaults.

# 20. FORMS / APIs / EXTERNAL SERVICES

There are **no API routes and no external service integrations**.

| Surface | File | Current behavior | Auth/env |
|---|---|---|---|
| Homepage trade form | `src/components/home/TradeSection.tsx` | Prevents submit, shows local success for four seconds | None |
| Product quote drawer | `src/components/products/QuoteDrawer.tsx` | Validates native required fields, then shows a prototype-only message; no payload leaves browser | None |
| `?world=` query | `ProductsExplorer.tsx` | Reads valid initial world and updates URL via History API | None |

No email, WhatsApp, phone, CRM, analytics, CDN, CMS, database, authentication, payment, map, or remote image service appears in source.

# 21. ENVIRONMENT / CONFIGURATION

Environment variables referenced by application code: **none**.

No `.env` or `.env.local` is present. `.gitignore` excludes `.env` and `.env*.local`.

Important configuration:

- `package.json`: scripts/dependencies.
- `package-lock.json`: exact dependency resolution.
- `next.config.ts`: `reactStrictMode: true`; removes `X-Powered-By` header.
- `tsconfig.json`: strict TypeScript, ES2022 target, bundler resolution, `@/*` → `src/*`, tests excluded from typecheck.
- `next-env.d.ts`: generated Next types.
- `AGENTS.md`: requires reading bundled Next 16 guidance before future code changes.
- `.gitignore`: excludes Next/build output, `dist`, environment files, TypeScript build info, and scratch files.

# 22. DEPLOYMENT / BUILD STATUS

Commands:

- Development: `npm run dev` → `next dev`.
- Build: `npm run build` → `next build`.
- Production: `npm run start` → `next start`.
- Typecheck: `npm run typecheck` → `tsc --noEmit`.
- Lint: `npm run lint` → `next lint`.

Audit results on 2026-09-19:

- `npm run typecheck`: **PASS**.
- `npm run build`: **PASS** under Next.js 16.3.4/Turbopack. `/`, `/products`, and `/standard` are statically prerendered.
- `npm run lint`: **FAIL (configuration/script)**. Next 16 interprets `lint` as a project directory and reports `Invalid project directory ...\lint`; no ESLint setup/package is present.
- `npm run test:catalogue`: exits successfully but is misleading: Node can require the TypeScript data module, so the left side of `||` succeeds and the actual assertion script is skipped.
- Direct `tsx test/catalogue.test.ts`: **PASS** (29 Fresh + 18 Frozen + 13 Dried = 60 and visual-key checks).
- Direct homepage parity test: **FAIL**, first at missing legacy `.hero-origin`.
- Direct products parity test: **FAIL**, first at missing legacy `.site-header product-header`.
- Direct Standard parity test: **FAIL**, expects stage name `Store` but current data uses `Control`; it also targets the superseded workspace architecture.

Hosting platform: not identifiable. There is no `vercel.json`, Netlify config, Dockerfile, CI workflow, or deployment-specific source. Git remote is `https://github.com/zyaddhamedd/AGRICA.git`; that does not establish production hosting or domain.

# 23. KNOWN BUGS / INCOMPLETE AREAS

| Class | Issue | Relevant files |
|---|---|---|
| Functional | Both enquiry forms are simulations; no submission leaves the browser | `TradeSection.tsx`, `QuoteDrawer.tsx` |
| Functional | Homepage trade form disables native validation and accepts empty/invalid data | `TradeSection.tsx` |
| Functional | Quote/cart state is not persistent | `ProductsExplorer.tsx` |
| Functional | Variety search is described in code but cannot match spec-registry varieties | `ProductsExplorer.tsx`, `productSpecs.ts` |
| Visual | Homepage mounts shared and hero-local navbars, usually overlapping | `page.tsx`, `HeroSection.tsx`, `SiteHeader.tsx`, `globals.css` |
| Visual/Data | Most product cards reuse generic atlas images, not product-specific media | `productImages.ts`, `ProductCardFront.tsx`, `products.css` |
| Responsive | Both mobile and desktop hero video/image trees remain mounted | `HeroSection.tsx`, `globals.css` |
| Responsive | Company media is hidden entirely below 680px | `CompanySection.css` |
| Data | Confirmed season matrix is empty; rendered calendar is illustrative | `seasons.ts`, `SeasonSection.tsx` |
| Data | Commercial specs exist for only eight fresh product names; others show only origin/condition | `productSpecs.ts`, `ProductSpecTable.tsx` |
| Data | Commercial, certification, cold-chain, and company claims are hardcoded and unverified in this repository | `productSpecs.ts`, `stages.ts`, company/common copy |
| Performance | Ten hero videos are mounted with autoplay and `preload="auto"` | `HeroSection.tsx` |
| Performance | Numerous multi-megabyte PNGs and duplicate assets | `public/assets`, `assets` |
| Performance | Route-specific and legacy CSS is imported globally | `layout.tsx`, `globals.css`, `products.css` |
| Accessibility | Broken root skip targets on Products and Standard; duplicate product skip link | `SkipLink.tsx`, `ProductsExplorer.tsx`, `StandardPageContent.tsx` |
| Accessibility | Hidden header links can remain keyboard-focusable while AT-hidden | `SiteHeader.tsx` |
| Accessibility | Dialogs lack focus traps/return focus; quote expanded state is wrong | `GlobalMenu.tsx`, `QuoteDrawer.tsx`, `SiteHeader.tsx` |
| Accessibility | Product `+` touch target is 38px | `products.css` |
| SEO | Only basic title/description; no OG, canonical, sitemap, robots, schema, or favicon | `layout.tsx`, route pages |
| Technical debt | Three parity tests and `test:catalogue` script do not validate the current UI correctly | `test/*`, `package.json` |
| Technical debt | README and motion/handoff documents describe older architectures | `README.md`, `MOTION_DIRECTOR.md`, `ANTIGRAVITY_HANDOFF.md` |
| Technical debt | Many inactive components and legacy selectors remain | listed in section 25 |

# 24. PLACEHOLDERS / FAKE OR UNVERIFIED DATA

The repository provides no external evidence for commercial claims. The following are hardcoded and should be treated as **NEEDS BUSINESS VERIFICATION**.

## Product specifications

- Oranges: Valencia, Navel, Baladi; Egypt; Nov–May; +4°C to +6°C; Telescopic Cartons 15kg, Open-Top Cartons 10kg, Net Bags 5kg; Class I / GlobalG.A.P. — **NEEDS BUSINESS VERIFICATION**.
- Lemons: Eureka, Verna, Adalia; Egypt; Oct–Mar; +8°C to +10°C; Telescopic Cartons 15kg, Plastic Boxes 10kg; Class I / GlobalG.A.P. — **NEEDS BUSINESS VERIFICATION**.
- Grapes: Flame Seedless, Superior Seedless, Crimson Seedless; Egypt; May–Aug; 0°C to +1°C; Carry Bags in Cartons 5kg, Punnets 500g × 10; Seedless; Class I / GlobalG.A.P. — **NEEDS BUSINESS VERIFICATION**.
- Potatoes: Spunta, Hermes, Lady Rosetta; Egypt; Jan–Jun; +4°C to +8°C; Jumbo Bags 1000kg, Mesh Bags 25kg/10kg; Class I / Phytosanitary Certified — **NEEDS BUSINESS VERIFICATION**.
- Strawberries: Florida Fortuna, Sensation; Egypt; Nov–Apr; 0°C to +1°C; Punnets in Cartons 250g × 8 / × 10; Class I / GlobalG.A.P. — **NEEDS BUSINESS VERIFICATION**.
- Pomegranates: Wonderful, 116; Egypt; Aug–Nov; +5°C to +7°C; Cartons 4.5kg/5kg; Class I / GlobalG.A.P. — **NEEDS BUSINESS VERIFICATION**.
- Onions: Red Onion, Golden/Yellow Onion; Egypt; Feb–Jun; Ambient / Controlled Cool; Mesh Bags 10kg/25kg, Jumbo Bags 1000kg — **NEEDS BUSINESS VERIFICATION**.
- Garlic: Egyptian White, Egyptian Red; Egypt; Feb–May; -1°C to 0°C; Mesh Bags 5kg/10kg, Cartons 10kg — **NEEDS BUSINESS VERIFICATION**.
- `ProductsExplorer` assigns origin `Egypt` to every one of the 60 entries — **NEEDS BUSINESS VERIFICATION** at product/program level.

## Seasonality

- All four demo crop month arrays in `SEASONAL_CROPS_REGISTRY` are explicitly illustrative — **NEEDS BUSINESS VERIFICATION**.
- Desktop “Orange · Lemon · Sweet potato” availability line — **NEEDS BUSINESS VERIFICATION**.
- `CONFIRMED_SEASON_MATRIX` is empty.

## Company and operational claims

- “Farm-to-export coordination,” “global supply,” “international by discipline,” and equivalent brand statements — **NEEDS BUSINESS VERIFICATION**.
- Standard-stage claims about buyer matching before harvest, on-site quality verification, destination compliance, continuous cold chain/humidity/atmosphere, documentation, export clearance, and “FULL SPECIFICATION CERTIFIED” — **NEEDS BUSINESS VERIFICATION**.
- Control-discipline claims including traceability, IQF processing, certifications, and sustainability are in inactive data but may be reused — **NEEDS BUSINESS VERIFICATION**.
- Coordinates `30.0444° N` and `Cairo, Egypt` are hardcoded in global menu/footer. No full legal address is present — **NEEDS BUSINESS VERIFICATION**.

## Not present

No hardcoded countries served, production capacity, shipment counts, MOQ, Incoterms, phone number, email address, WhatsApp number, or full postal address were found.

# 25. LEGACY / UNUSED CODE

Confirmed inactive from the current route import graph:

- `src/components/home/StandardPreviewSection.tsx`: old homepage Standard journey; not imported.
- `src/components/home/OptionWheel.tsx` and `.css`: elaborate draggable category selector; not imported.
- `src/components/home/Stack.tsx` and `.css`: Motion-based card stack; not imported. It is the only current consumer of `motion`.
- `src/components/products/ProductDetailSheet.tsx`: mobile/desktop detail drawer; not imported. Its large CSS block remains globally loaded.
- `src/components/products/SeasonStrip.tsx`: older product season component; not imported.
- `src/components/standard/JourneyWorkspace.tsx`, `StageSelector.tsx`, `LotStage.tsx`, `StageDetail.tsx`, `ControlRegister.tsx`, `MobileBriefBar.tsx`, `StandardClose.tsx`: previous interactive workspace/close architecture; none is imported by the active Standard page.
- `src/data/controlDisciplines.ts`: only used by inactive `ControlRegister`.
- `dist/`: ignored static prototype with separate HTML/CSS/JS for all three routes; not served or imported by Next.js. Old tests still treat it as reference material.
- `scratch/`: ignored image extraction, stage processing, math, mask, rotation, and portal experiments; not part of build.
- `MOTION_DIRECTOR.md`, `ANTIGRAVITY_HANDOFF.md`, and significant README sections document older portal/world/workspace designs.
- `globals.css` retains orphan selectors for old `.hero-origin`, `.hero-portals`, `.worlds`, `.world-tab`, `.journey`, old header/footer classes, and other prototype structures.
- `products.css` retains the inactive ProductDetailSheet styles and older product/footer responsive selectors.
- Public/raw media duplicates and unused files are listed in section 15.

Nothing in this section should be deleted until design/history requirements and test replacement are agreed.

# 26. CURRENT DEPENDENCY MAP

```text
RootLayout
├── global CSS (globals + products + standard + footer)
└── SkipLink → pathname

Homepage (/)
├── SiteHeader → GlobalMenu
├── HeroSection → second GlobalMenu + hero media
├── WorldsSection → ThreeWorldsSection → threeWorlds data → WorldCard
├── SeasonSection → seasons data
├── CompanySection
├── TradeSection
└── SiteFooter

Products (/products)
└── ProductsExplorer
    ├── products data → flattened ProductAtlasItem[]
    ├── SiteHeader → quote state → QuoteDrawer
    ├── WorldSwitch + FamilyPanel + LiveSearchInput
    ├── AtlasGrid → ProductFlipCard
    │   ├── productSpecs → ProductSpecTable
    │   ├── productImages → ProductCardFront
    │   └── QuoteMicroAction / ExportActionRail → quote state
    ├── SeasonSection → illustrative seasons data
    ├── FloatingEnquiryDock → QuoteDrawer
    └── SiteFooter → QuoteDrawer

Standard (/standard)
└── StandardPageContent
    ├── SiteHeader
    ├── StandardMonolithHero
    ├── StandardProgressThread → JOURNEY_STAGES
    ├── StandardStageBlock × 5 → JOURNEY_STAGES + GSAP/ScrollTrigger
    ├── StandardProofInterlude
    ├── StandardFinalStageBlock → stage 6 + GSAP/ScrollTrigger
    └── SiteFooter
```

# 27. TOP 15 FILES A NEW DEVELOPER MUST READ

1. `src/app/layout.tsx` — establishes global metadata, viewport, CSS delivery, and skip-link behavior.
2. `src/app/page.tsx` — definitive active homepage section order.
3. `src/components/common/SiteHeader.tsx` — shared route theme, quote trigger, and scroll-hide state.
4. `src/components/home/HeroSection.tsx` — most media-heavy and custom homepage component, including duplicate local navigation.
5. `src/components/home/ThreeWorldsSection.tsx` — current world-card state owner.
6. `src/components/home/SeasonSection.tsx` — shared homepage/products seasonal UI and its desktop/mobile divergence.
7. `src/components/home/TradeSection.tsx` — current homepage lead form and simulated submission.
8. `src/components/products/ProductsExplorer.tsx` — products route state, filters, query string, catalogue flattening, and enquiry selection.
9. `src/components/products/ProductFlipCard.tsx` — central product interaction contract.
10. `src/data/products.ts` — authoritative 60-item catalogue taxonomy.
11. `src/data/productSpecs.ts` — only populated commercial specification registry.
12. `src/data/seasons.ts` — explicit boundary between empty confirmed data and illustrative demo data.
13. `src/components/standard/StandardPageContent.tsx` — definitive active Standard architecture.
14. `src/data/stages.ts` — all active Standard page content/media/status claims.
15. `src/styles/globals.css` — global tokens, shared navigation/menu, hero layouts, and accumulated legacy CSS that can affect every route.

Also read `src/styles/products.css` before changing product cards and `src/styles/standard.css` before changing the Standard flow.

# 28. DEVELOPMENT STATUS TABLE

| Area | Current Status | Main Files | Notes |
|---|---|---|---|
| Global layout | PARTIAL | `app/layout.tsx` | Functional; minimal metadata; all CSS global; route skip targets partly broken |
| Navbar | PARTIAL | `SiteHeader.tsx`, `GlobalMenu.tsx` | Works internally; homepage duplicates it; focus management incomplete |
| Homepage Hero | PARTIAL | `HeroSection.tsx`, `globals.css` | High-fidelity desktop/mobile design; media/performance and duplicate-nav issues |
| Three Worlds | DONE | `ThreeWorldsSection.tsx`, `WorldCard.tsx`, `threeWorlds.ts` | Active cards and routing work; copy/media still require business/design approval |
| Season | PLACEHOLDER | `SeasonSection.tsx`, `seasons.ts` | Interactive UI uses illustrative months; confirmed matrix empty |
| Company | PARTIAL | `CompanySection.tsx` | Designed and animated; no route; claims unverified; image hidden on mobile |
| Products | PARTIAL | `ProductsExplorer.tsx` | Browsing/filter/search work; integration/data completeness missing |
| Product data | PARTIAL | `products.ts`, `productSpecs.ts` | 60 names; specs only for eight fresh products |
| Product cards | PARTIAL | `ProductFlipCard.tsx` and children | Dark floating flip design is active; generic media/spec gaps remain |
| Standard | PARTIAL | `StandardPageContent.tsx`, `stages.ts` | Complete visual narrative; claims unverified; old data fields unused |
| Quote flow | PLACEHOLDER | `QuoteDrawer.tsx`, `TradeSection.tsx` | UI only; no submission/persistence/backend |
| Footer | DONE | `SiteFooter.tsx`, `footer.css` | Shared variants and links implemented |
| Mobile | PARTIAL | route CSS + active components | Major layouts exist; breakpoint inconsistency and duplicate media/nav remain |
| i18n | NOT IMPLEMENTED | `layout.tsx` | English only, hardcoded |
| SEO | PARTIAL | `layout.tsx`, route pages | Basic titles/descriptions only |
| Accessibility | PARTIAL | common/product components | Good semantic base; skip links/dialog focus/hidden focus defects |
| Performance | PARTIAL | Hero/media/CSS | Static output and AVIF help; hero/video/PNG/global CSS risks are material |
| Deployment | PARTIAL | `package.json`, `next.config.ts` | Build passes; no hosting/CI config; lint command broken |

# 29. WHAT SHOULD NOT BE TOUCHED ACCIDENTALLY

- `src/data/products.ts`: all counts, family tabs, runtime IDs, quote keys, search, and catalogue tests derive from this exact taxonomy. Renames change keys and can disconnect `productImages.ts`/`productSpecs.ts` lookups.
- `src/types/agrica.ts`: shared by product flattening, cards, quote state, seasons, and Standard data.
- `src/data/productSpecs.ts`: lookup is exact-name and fresh-only. Applying it across worlds would incorrectly attach fresh specs to same-named frozen/dried products.
- `src/data/productImages.ts`: keys must exactly match `${worldId}::${familyName}::${productName}`.
- `ProductsExplorer.tsx`: single owner of filter/search/URL/quote/drawer state. Splitting it without a persistence/state plan can break many downstream controls.
- `src/data/seasons.ts`: intentionally separates an empty confirmed matrix from illustrative display data; do not promote demo values to confirmed data accidentally.
- `src/data/stages.ts`: feeds both progress and all six active stage blocks. IDs are used as DOM anchors (`stage-${id}`).
- `src/app/layout.tsx` and global CSS imports: changes affect all routes because CSS is not route-scoped.
- `src/styles/globals.css`: contains current tokens/nav/hero plus legacy selectors; broad cleanup can silently change active homepage/common UI.
- `SiteHeader.tsx`/`GlobalMenu.tsx`: used by all routes, while homepage separately duplicates their function.
- `SiteFooter.tsx`: all routes rely on variant-specific CTA behavior; Products passes a callback instead of a link.
- `HeroSection.tsx`: owns both responsive hero trees and its own menu. Navigation/media changes can affect accessibility, performance, and z-index simultaneously.
- `products.css`: controls world theming, flip mechanics, keyboard/reduced-motion fallbacks, drawer, and dock in one global file.
- `standard.css`: desktop rail and mobile sticky progress behavior depend on the 1024px breakpoint and stage DOM classes.
- `dist/` and old tests: not active production code, but still represent historical approved prototypes and test assumptions; do not use them as current source of truth or remove without agreement.

# 30. FINAL CURRENT-STATE SUMMARY

### What is genuinely finished

- Three authored App Router routes build and prerender successfully.
- The 60-item catalogue taxonomy and world/family counts are internally consistent.
- The homepage Three Worlds card system, shared footer, product filters, flip-card mechanics, quote item add/remove UI, and six-stage Standard page are fully rendered and interactive at front-end level.
- Major desktop/mobile layouts and reduced-motion CSS paths exist.

### What currently works but needs refinement

- Hero, Company, Standard, seasonal demo, product media, global menu, and enquiry drawer all work visually but carry performance, accessibility, data-verification, or responsive issues.
- Search works for product/world/family but not spec-registry varieties and becomes cross-world while a query is active.
- The dark floating product flip-card concept is active and substantial, but most catalogue entries lack dedicated imagery and detailed specs.
- Basic metadata and static builds work, but SEO is incomplete.

### What is missing

- Real form delivery/API/email/CRM and durable enquiry state.
- Confirmed seasonal matrix.
- Full verified product specifications and dedicated product content/media.
- Internationalization/RTL.
- Complete SEO assets/files/schema.
- Working lint configuration and current UI tests.
- Identifiable deployment/CI configuration.

### What contains placeholder/unverified data

- Entire seasonal demo registry.
- All commercial product spec values and certification/temperature/packaging claims until business approval is documented.
- Company/export-control claims, global-readiness language, and clearance/certification seal text.
- Generic atlas imagery used for most products.

### What the next developer must understand before touching the project

- The active Next.js application has diverged substantially from `dist`, README, motion notes, and three parity tests.
- Product identity depends on exact string keys across three data files.
- The homepage currently has two navbar/menu systems due to a selector/architecture mismatch.
- Seasonal “confirmed” data is intentionally empty; illustrative values must not be treated as business truth.
- Forms are visual prototypes only, even though they display success language.
- Global CSS includes active and abandoned concepts together, so cleanup requires import/selector tracing.

### Recommended immediate development sequence

1. Obtain business approval for catalogue names, eight existing spec records, operational claims, contact destination, and seasonal data; keep unapproved values explicitly provisional.
2. Decide the single homepage navigation owner, then repair skip targets, dialog focus behavior, and header accessibility without altering visual direction.
3. Define and implement the enquiry submission contract (endpoint/CRM/email, validation, privacy/error/loading states), then connect both form surfaces or deliberately consolidate them.
4. Replace the empty confirmed season matrix and make desktop/mobile consume the same approved data/disclaimer path.
5. Normalize product data around stable IDs and approved fields before adding more images/specs or product-detail routes.
6. Address hero/media loading and image optimization, then measure real mobile performance.
7. Add current lint tooling and replace stale parity scripts with tests for the active DOM and interactions.
8. Complete metadata, sitemap/robots, canonical/OG assets, and deployment configuration after the production domain/platform is known.
9. Only after those dependencies are stable, remove or archive legacy components/CSS/assets with explicit approval.
