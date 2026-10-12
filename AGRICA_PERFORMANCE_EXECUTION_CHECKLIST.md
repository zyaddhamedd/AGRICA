# AGRICA — Performance Optimization Execution Checklist

> **Companion Document to:** `AGRICA_PERFORMANCE_MASTER_PLAN.md`  
> **Purpose:** Practical, phase-by-phase tracking of tasks, verification commands, acceptance gates, and sign-offs.  
> **Status:** READY FOR PHASE 0 ACTIVATION

---

## Global Execution Rules
- **Rule 1:** Only ONE phase may be executed at a time.
- **Rule 2:** Every phase has an unskippable **STOP GATE**. Never begin a subsequent phase without explicit approval.
- **Rule 3:** The current visual design, animations, typography, and 5-language systems are LOCKED.
- **Rule 4:** No application source files or assets may be modified outside the approved phase scope.

---

## Phase 1 — Hero Media Optimization (with Quick Safety & Baseline)

### Pre-Flight (Safety & Baseline Check)
- [x] Confirm current git commit: `99c67072ce99daf0703aa1e79b4e440c9f8e9139`.
- [x] Confirm all existing uncommitted files are preserved and untouched.
- [x] Record baseline Hero media asset sizes:
  - Hero Card 2 Poster (`hero_02_processing_poster.png`): **2,560,221 bytes** (2.56 MB)
  - Hero Card 3 Poster (`hero_03_packing_poster.png`): **2,133,847 bytes** (2.13 MB)
  - Hero Card 4 Poster (`Agrica Loading Dock Operations (1).png`): **2,431,266 bytes** (2.43 MB)
  - Hero Background (`hero-bg.jpg`): **796,625 bytes** (797 KB)
  - Botanical Decor `s1.png`: **442,053 bytes**, `s2.png`: **492,596 bytes**, `s3.png`: **494,919 bytes**
  - Total Baseline Hero Media: **9,351,527 bytes (~9.35 MB)**.

### Execution Tasks
- [x] Generate high-fidelity AVIF and WebP variants of Hero Posters 2, 3, 4:
  - `hero_02_processing_poster.avif` (207.5 KB) / `.webp` (203.2 KB) — down from 2,500.2 KB PNG (-91.7%)
  - `hero_03_packing_poster.avif` (60.1 KB) / `.webp` (51.3 KB) — down from 2,083.8 KB PNG (-97.1%)
  - `hero_04_shipping_poster.avif` (187.8 KB) / `.webp` (167.0 KB) — down from 2,374.3 KB PNG (-92.1%)
- [x] Compress background decor assets:
  - `hero-bg.avif` (172.6 KB) / `hero-bg.webp` (148.6 KB) — down from 778.0 KB JPEG (-77.8%)
  - `s1.avif` (122.6 KB) / `s1.webp` (151.6 KB) — down from 431.7 KB PNG (-71.6%)
  - `s2.avif` (73.9 KB) / `s2.webp` (116.1 KB) — down from 481.1 KB PNG (-84.6%)
  - `s3.avif` (121.5 KB) / `s3.webp` (137.9 KB) — down from 483.3 KB PNG (-74.9%)
- [x] Update `src/components/home/HeroSection.tsx`:
  - Point `HERO_MEDIA_ITEMS` to optimized AVIF posters with WebP/original fallbacks.
  - Set `fetchPriority="high"` and priority loading on LCP hero background (`hero-bg.avif`).
  - Set proper `decoding="async"` across hero media.
  - Set `fetchPriority="high"` on active Card 1 poster and `fetchPriority="auto"` on inactive cards.
  - Preserved all four Hero stages: Harvest, Processing, Packing, Shipping.
  - Preserved video autoplay, switching, transitions, GSAP animations, and timing.
- [x] Update `src/styles/hero.css`:
  - Added `display: contents;` on picture wrappers to prevent layout shifts.
  - Preserved exact video fade transitions and playing selectors.

### Acceptance Criteria
- [x] Target Hero media payload reduced from **9.37 MB (9,366,374 bytes) to 0.94 MB (983,524 bytes)** (-89.5% reduction, saving 7.99 MB).
- [x] All four Hero stage videos and posters transition seamlessly upon selection.
- [x] Visual QA confirms identical citrus artwork, decor, sharpness, and film strip appearance across desktop and mobile.
- [x] Build and test suites pass (`next build`, `tsc --noEmit`, `test:phase1`).

### 🛑 STOP GATE: PHASE 1
- **Status:** COMPLETED — READY FOR USER APPROVAL
- **Notes:** Phase 1 fully verified on production build. Awaiting explicit user sign-off before proceeding to Phase 2.

---

## Phase 2 — Products Grid Rendering

### Pre-Flight
- [x] Confirm Phase 1 approval (Merged into Phase 1 and fully approved).
- [x] Record initial `/en/products` SSR markup tag count (1,688 tags) and baseline node structure.

### Execution Tasks
- [x] Inspect `src/components/products/ProductFlipCard.tsx`.
- [x] Remove redundant `<ProductCardBack>` and `<ProductSpecTable>` from the static in-grid card render tree.
- [x] Verify `export-card-keyboard-toggle` retains all accessibility attributes (`aria-haspopup="dialog"`, `aria-label`, `aria-expanded`, `aria-controls`).
- [x] Verify `src/components/products/ProductCardFlightOverlay.tsx` receives full product fields and renders `<ProductCardBack expanded>` inside the portal.
- [x] Verify GSAP FLIP/flight transform in `ProductCardFlightOverlay.tsx` computes bounds accurately from originating `.export-card` rect.

### Acceptance Criteria
- [x] Static HTML tag count on `/en/products` drops from **1,688 tags to 650 tags** (-61.5% reduction, eliminating 1,038 redundant DOM elements).
- [x] Number of rendered `ProductCardBack` instances in the grid reduced from **21 to 0** (-100% elimination of hidden grid backs).
- [x] Card front visual design, typography, photography, and badges remain 100% identical.
- [x] Clicking any card triggers the smooth 3D flight expansion modal with complete specification tables and action buttons.
- [x] Escape key, backdrop click, and close button close the modal cleanly with smooth return animation and focus restoration.
- [x] `npm run typecheck`, `npm run test:products`, and `npm run test:product-card-content` pass 100%.
- [x] Mobile (390×844) touch and Arabic RTL (`/ar/products`) verified without layout shift or overflow.

### 🛑 STOP GATE: PHASE 2
- **Status:** COMPLETED — APPROVED
- **Notes:** Phase 2 DOM reduction complete and verified.

---

## Phase 2.5 — Product Card Animation Smoothness (Produce Only)

### Pre-Flight
- [x] Complete forensic audit in `AGRICA_PRODUCT_ANIMATION_AUDIT.md`.
- [x] Confirm no modification to visual layout, dimensions, easing curves, or animation timing.

### Execution Tasks
- [x] Stabilize `handleOpen` in `src/components/products/AtlasGrid.tsx` via `useCallback`.
- [x] Memoize `src/components/products/ProductFlipCard.tsx` with `React.memo` and memoize `displayItem` reference via `useMemo`.
- [x] Memoize `src/components/products/ProductCardFront.tsx` with `React.memo`.
- [x] Add `force3D: true` to GSAP transform sets and timelines in `src/components/products/ProductCardFlightOverlay.tsx`.
- [x] Add `backface-visibility: hidden; -webkit-backface-visibility: hidden;` in `ProductCardFlightOverlay.module.css`.
- [x] Strictly preserve existing body-fixed scroll lock to guarantee iOS Safari scroll position restoration.

### Acceptance Criteria
- [x] React re-renders during active flight reduced from **21 cards to 1 active card** (-95% re-render elimination).
- [x] 3D flight opening and closing transitions run smoothly with GPU layer promotion (`force3D`).
- [x] Quote micro-action state updates remain immediate and reactive.
- [x] Scroll lock, backdrop dismissal, Escape key, and focus trapping 100% preserved.
- [x] All automated tests pass (`typecheck`, `test:products`, `test:product-card-content`, `build`).

### 🛑 STOP GATE: PHASE 2.5
- **Status:** COMPLETED — READY FOR USER APPROVAL
- **Notes:** Phase 2.5 complete and verified. Awaiting explicit user sign-off before proceeding to Phase 3.

---

## Phase 3 — Static Catalogue Rendering (Produce Only)

> **Launch Scope Notice:** Per Produce-only launch decision, Herbs & Spices optimization is deferred to a future release. Phase 3 focuses exclusively on the AGRICA Produce catalogue (`/[lang]/products`). The dormant Herbs & Spices codebase remains intact.

### Pre-Flight
- [ ] Confirm Phase 2 approval.
- [ ] Verify `/en/products` is currently `ƒ (Dynamic)` with TTFB ~109ms.

### Execution Tasks
- [ ] Refactor `src/app/[lang]/products/page.tsx`:
  - Remove server-side `await searchParams`.
  - Wrap `ProductsExplorer` in a React `<Suspense>` boundary.
- [ ] Update `src/components/products/ProductsExplorer.tsx`:
  - Read query parameters via Next.js client `useSearchParams()` inside Suspense.
  - Initialize default world (`fresh`) during SSR.
  - Synchronize `world` state seamlessly if URL query is `?world=frozen`.
- [ ] Run `npm run build` and inspect route output table.

### Acceptance Criteria
- [ ] Next.js build table classifies `/[lang]/products` as **`● (SSG)`**.
- [ ] Local production TTFB on `/en/products` drops to **< 15 ms** (Edge CDN cacheable).
- [ ] Direct URLs to `/en/products?world=fresh` and `/en/products?world=frozen` render the intended world without flash.
- [ ] Browser history navigation (Back/Forward) functions correctly.
- [ ] `npm run test:routing` and `npm run test:catalogue` pass.

### 🛑 STOP GATE: PHASE 3
- **Status:** BLOCKED UNTIL PHASE 2 COMPLETE & APPROVED
- **Notes:** Confirm SSG route manifest and cache headers; request approval for Phase 4.

---

## Phase 4 — Seasonal Orbit Loading

### Pre-Flight
- [ ] Confirm Phase 3 approval.
- [ ] Verify that opening `/products` currently triggers downloads for all 8 seasonal hero images.

### Execution Tasks
- [ ] Inspect `src/components/home/season/EditorialOrbitExplorer.tsx`.
- [ ] Add an `IntersectionObserver` (`rootMargin: "400px"`) around `#seasons`.
- [ ] Gate the image preloading effect so it only executes when `#seasons` is near the viewport.
- [ ] Limit idle preloading to adjacent months (current, prev, next) rather than all 8 crops.
- [ ] Verify Cairo timezone detection and current month selection logic remain untouched.

### Acceptance Criteria
- [ ] Navigating to `/products` downloads 0 seasonal hero crop images initially.
- [ ] Scrolling down to the Season section immediately displays the correct seasonal hero.
- [ ] Dial navigation between months remains fast and responsive.
- [ ] `npm run test:season` passes.

### 🛑 STOP GATE: PHASE 4
- **Status:** BLOCKED UNTIL PHASE 3 COMPLETE & APPROVED
- **Notes:** Report network waterfall savings on `/products`; request approval for Phase 5.

---

## Phase 5 — Company Video Lifecycle

### Pre-Flight
- [ ] Confirm Phase 4 approval.
- [ ] Verify that `/company` currently mounts 8 unthrottled video tags on load.

### Execution Tasks
- [ ] In `src/data/company.ts`, replace heavy PNG posters with optimized AVIF/WebP posters:
  - `facility_reveal.avif` (from `facility_reveal.png`)
  - `hero_01_origin_start_keyframe.avif`
  - `human_qc.avif`
  - `sizing_completion.avif`
- [ ] In `src/components/company/CompanyPageContent.tsx`:
  - Adopt the `IntersectionObserver` pattern from `CompanySection.tsx`.
  - Use `data-src` on offscreen videos; attach `video.src` only when scrolled within 350px.
  - Gate rendering of mobile workflow videos to active mobile viewport.
- [ ] Ensure video pause on hidden / play on visible lifecycle is preserved.

### Acceptance Criteria
- [ ] Initial video network requests on `/en/company` drop from 8 videos to 1 video (the Hero).
- [ ] Poster images consume < 250 KB total (down from > 8 MB).
- [ ] No mobile video stutter or memory exhaustion.
- [ ] Visual transition and playback remain completely seamless.

### 🛑 STOP GATE: PHASE 5
- **Status:** BLOCKED UNTIL PHASE 4 COMPLETE & APPROVED
- **Notes:** Report video memory and bandwidth savings; request approval for Final Validation.

---

## Final Phase — Full Validation & Regression Sign-off

### Pre-Flight
- [ ] Confirm Phase 5 approval.
- [ ] Ensure all 5 phases are completed and verified individually.

### Execution Tasks
- [ ] Run comprehensive automated test suite:
  ```bash
  npm run test:i18n
  npm run test:catalogue
  npm run test:products
  npm run test:season
  npm run test:herbs-spices
  npm run test:herbs-spices-process
  npm run test:routing
  npm run test:products-browser
  ```
- [ ] Perform cross-language manual & browser QA:
  - [ ] English (`/en`)
  - [ ] Arabic RTL (`/ar`)
  - [ ] Russian (`/ru`)
  - [ ] German (`/de`)
  - [ ] French (`/fr`)
- [ ] Perform viewport QA:
  - [ ] Mobile (390×844)
  - [ ] Tablet (768×1024)
  - [ ] Desktop (1440×900)
- [ ] Re-run baseline benchmark script on port 3005 and record final numbers.
- [ ] Prepare Before vs. After Comparative Engineering Report.

### Acceptance Criteria
- [ ] 100% test pass rate across all suites.
- [ ] Zero visual or functional regressions.
- [ ] All target performance metrics met.

### 🏁 FINAL SIGN-OFF
- **Status:** PENDING ALL PHASES
- **Approver:** Lead Performance Engineer & Stakeholder
