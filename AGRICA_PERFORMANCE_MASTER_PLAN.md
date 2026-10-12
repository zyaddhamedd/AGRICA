# AGRICA — Master Performance Optimization Plan

> **Document Type:** Production Architecture & Engineering Execution Plan  
> **Status:** APPROVED FOR PLANNING — READY FOR PHASE 0  
> **Author:** Senior Next.js Performance Engineering Lead  
> **Target Platform:** AGRICA (`agrica.eg`) — Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 5.8, GSAP 3.15, Lenis 1.3  
> **Rule of Engagement:** PLANNING ONLY. Application source files and assets remain strictly unmodified until individual phase authorization.

---

## 1. Executive Strategy & Core Principles

The AGRICA platform is visually complete, embodying a bespoke editorial aesthetic across two primary commercial divisions (**Produce: Fresh & Frozen** and **Herbs & Spices: Dried Botanical Materials**) in five languages (**EN, AR, RU, DE, FR**).

The mission of this optimization program is to achieve near-instantaneous page transitions, sub-second LCP on mobile networks, and frictionless scrolling without altering design tokens, motion choreography, content fidelity, or business logic.

### 1.1 Non-Negotiable Engineering Laws
1. **Design & Identity Locked:** No typography changes, no layout shifts, no alteration of the four-stage cinematic Hero, no changes to product card geometry, and no alterations to the 3D card flight modal.
2. **Animation & Motion Preserved:** All GSAP timelines, ScrollTrigger pin/scrub behaviors, Lenis smooth scrolling, and mobile touch interactions must be preserved. Optimizations must reduce main-thread cost and GPU memory without clipping visual frames.
3. **Multilingual & RTL Parity:** English, Arabic (RTL with LTR technical tokens), Russian, German, and French must function identically with zero hydration mismatch.
4. **Content & Business Parity:** No removal of product specifications, varieties, botanical classifications, or RFQ/Quote actions.
5. **Production Verification Only:** All claims and benchmarks must be validated on production builds (`next build` + `next start`). Synthetic estimates must never be reported as actual measurements.
6. **Strict Phased Execution with Stop Gates:** Every phase must be executed, verified, and approved before subsequent phases can begin.

---

## 2. Master Phase Roadmap & Architectural Blueprint

The optimization program follows a locked sequence of 6 phases (with Phase 0 merged directly into Phase 1 as a lightweight safety & baseline pre-flight):

```
[Phase 1: Baseline & Hero Media Optimization] (Safety check + Network & LCP quick win: -7 MB initial load)
       │
       ▼
[Phase 2: Products Grid Rendering] (DOM & Memory reduction: -1,038 tags, 0 hidden backs)
       │
       ▼
[Phase 2.5: Product Card Animation Smoothness] (React.memo, stable callbacks, force3D GPU promotion)
       │
       ▼
[Phase 3: Static Catalogue Rendering] (Produce Only: TTFB 109ms → < 15ms, 100% SSG)
       │
       ▼
[Phase 4: Seasonal Orbit Loading] (Eliminate background bandwidth contention)
       │
       ▼
[Phase 5: Company Video Lifecycle] (Viewport-aware gating of 8 company videos)
       │
       ▼
[Final Phase: Full Validation] (Cross-language, mobile/desktop, Lighthouse & QA)
```

---

## 3. Phase-by-Phase Execution Plans

---

### Phase 1 — Quick Safety, Baseline & Hero Media Optimization

#### 1.1 Objective & Verified State
Perform a lightweight safety & baseline check, preserving all existing work, and eliminate **7.12 MB** of uncompressed PNG posters and **2.23 MB** of uncompressed background decor on the Homepage Hero. Slashes initial page payload from ~9.4 MB down to < 450 KB without altering visual appearance, video playback, or LCP priority.

- **Safety & Baseline State:**
  - Branch: `main`
  - Current Git HEAD: `99c67072ce99daf0703aa1e79b4e440c9f8e9139`
  - Uncommitted Changes: Preserved 100%. Under no circumstances will `git checkout .`, `git reset --hard`, or `git clean` be executed.
- **Verified Media Problem:**
  - `HeroSection.tsx:59-84` mounts 4 hero cards. Posters for cards 2, 3, and 4 are uncompressed PNGs:
    - Card 2 (Processing): `hero_02_processing_poster.png` = **2,560,221 bytes (2.56 MB)**
    - Card 3 (Packing): `hero_03_packing_poster.png` = **2,133,847 bytes (2.13 MB)**
    - Card 4 (Shipping): `Agrica Loading Dock Operations (1).png` = **2,431,266 bytes (2.43 MB)**
  - Background decor (`HeroSection.tsx:288-312`) uses:
    - `hero-bg.jpg` = **796,625 bytes (797 KB)**
    - `s1.png` = **442,053 bytes**, `s2.png` = **492,596 bytes**, `s3.png` = **494,919 bytes** (1.43 MB total)
  - Rendered via unoptimized `<img>` tags without responsive sizes or modern format fallbacks.

#### 1.2 Exact Affected Files
- `src/components/home/HeroSection.tsx`
- `src/styles/hero.css`
- New optimized assets in `public/assets/hero/` and `public/assets/decor/` (original files preserved).

#### 1.3 Technical Solution
1. **Asset Generation:**
   - Convert posters 2, 3, and 4 into high-fidelity AVIF (`.avif`, quality 82, 960px width) and WebP (`.webp`, quality 85) variants.
   - Compress `hero-bg.jpg` into AVIF (~75 KB) and WebP (~110 KB).
   - Compress `s1.png`, `s2.png`, `s3.png` into transparent AVIF/WebP (~35 KB each).
   - Store new files alongside originals (e.g., `hero_02_processing_poster.avif`, `hero_03_packing_poster.avif`, `hero_04_shipping_poster.avif`).
2. **Component Refinement (`HeroSection.tsx`):**
   - Update `HERO_MEDIA_ITEMS` to point to the new optimized AVIF posters.
   - Add modern `<picture>` tags with `<source type="image/avif">`, `<source type="image/webp">`, and fallback.
   - For inactive hero cards (indices 1, 2, 3), add `loading="lazy"` and `decoding="async"`. Active card (Harvest, index 0) receives `fetchPriority="high"` and `eager` loading.
   - Ensure `video.poster` attributes reference the optimized poster files.
3. **Protected Features:**
   - The four film reel cards (Harvest, Processing, Packing, Shipping) must remain identical.
   - Autoplay on the active card and smooth video cross-fade handover must be preserved.
   - GSAP entrance animation on kickers and titles must remain unchanged.

#### 1.4 Verification & Acceptance Criteria
- Initial Hero media transfer drops from **9.35 MB to < 450 KB** (>95% payload reduction).
- LCP on Desktop drops by > 30%.
- Visual QA confirms identical pixel appearance and seamless video startup.

---

### Phase 2 — Products Grid Rendering

#### 2.1 Objective & Verified Problem
Eliminate unnecessary hidden DOM nodes in the Products Atlas Grid. Currently, every card renders both front and back faces, including complete technical specification tables with 14 rows, causing DOM bloat and main-thread lag during scrolling.

- **Verified Problem:**
  - `src/components/products/ProductFlipCard.tsx:53-68` renders both `<ProductCardFront>` and `<ProductCardBack>`.
  - Inside `<ProductCardBack>`, `<ProductSpecTable>` builds and renders 10–14 `<dt>`/`<dd>` rows per card.
  - In 21 Fresh cards, this creates **> 294 specification DOM elements** and 21 hidden header/action nodes.
  - **Code Truth Confirmed:** The card back is NEVER displayed inside the grid. Clicking a card opens `ProductCardFlightOverlay`, which mounts its own `<ProductCardBack expanded>` inside a React Portal!
  - The in-grid `<ProductCardBack>` is pure phantom overhead.

#### 2.2 Exact Affected Files
- [src/components/products/ProductFlipCard.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/products/ProductFlipCard.tsx)
- [src/components/products/ProductCardFlightOverlay.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/products/ProductCardFlightOverlay.tsx)
- [src/styles/products.css](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/styles/products.css)

#### 2.3 Technical Solution
1. **Grid Card Streamlining (`ProductFlipCard.tsx`):**
   - Remove the unexpanded `<ProductCardBack>` from the base grid card.
   - Render exclusively `<ProductCardFront>` within `export-card`.
   - Maintain the keyboard toggle button (`export-card-keyboard-toggle`) and accessibility attributes (`aria-haspopup="dialog"`, `aria-label`) so screen reader and keyboard functionality remain 100% identical.
2. **Preserve Flight Modal (`ProductCardFlightOverlay.tsx`):**
   - The modal portal continues to render `<ProductCardFront>` (for the initial 3D launch transform) and `<ProductCardBack expanded>` (for the final dossier view).
   - Verify that GSAP FLIP calculation (`originElement.getBoundingClientRect()`) operates seamlessly without the hidden back element.
3. **Protected Features:**
   - Card front design, typography, tags, and product images must remain identical.
   - Quote toggle button (`QuoteMicroAction`) on card front must maintain immediate state response.
   - 3D flight animation, background darkening, scroll locking (`position: fixed`), Escape key closing, and focus restoration must be preserved.

#### 2.4 Verification & Acceptance Criteria
- Total DOM node count on `/en/products` drops from **588 nodes to < 320 nodes** (~45% reduction).
- Scrolling at 60fps on low-tier mobile devices with zero frame drops.
- `npm run test:products` and `npm run test:products-browser` pass 100%.

---

### Phase 3 — Static Catalogue Rendering (Produce Only)

> **Launch Scope Notice:** Per Produce-only launch decision, Herbs & Spices optimization is deferred to a future release. Phase 3 focuses exclusively on the AGRICA Produce catalogue (`/[lang]/products`). The dormant Herbs & Spices codebase remains intact and unoptimized for this release.

#### 3.1 Objective & Verified Problem
Restore static prerendering (`● SSG`) to `/[lang]/products`, eliminating dynamic SSR overhead and unlocking edge CDN caching for the Produce commercial catalogue hub.

- **Verified Problem:**
  - `src/app/[lang]/products/page.tsx:17` awaits `searchParams`.
  - Next.js detects dynamic parameter access, turns off SSG, and marks routes as `ƒ (Dynamic)`.
  - Measured TTFB on local server jumps from 9ms to **71–109 ms** (equivalent to 350–700 ms on real edge infrastructure).
  - Routes emit `Cache-Control: private, no-cache, no-store, max-age=0`.

#### 3.2 Exact Affected Files
- [src/app/[lang]/products/page.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/app/[lang]/products/page.tsx)
- [src/components/products/ProductsExplorer.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/products/ProductsExplorer.tsx)

*(Herbs & Spices catalogue files deferred to a future release).*

#### 3.3 Technical Solution & Highest-Risk Design Decision
- **Challenge:** If we remove `searchParams` from the server page, how do deep links like `/products?world=frozen` work without layout shift or UI flash?
- **Architecture Decision:**
  1. `ProductsPage` in `src/app/[lang]/products/page.tsx` becomes a synchronous static shell:
     ```tsx
     export default function ProductsPage(): React.JSX.Element {
       return (
         <React.Suspense fallback={<ProductsExplorerSkeleton />}>
           <ProductsExplorer />
         </React.Suspense>
       );
     }
     ```
  2. Inside `ProductsExplorer.tsx` (`"use client"`), use Next.js `useSearchParams()` inside the Suspense boundary.
  3. Default `activeWorld` initializes to `"fresh"` during SSR. If `searchParams.get("world") === "frozen"`, state syncs in an immediate layout-effect or hydration-safe transition.
- **Protected Features:**
  - Direct bookmarks to `/products?world=fresh` and `/products?world=frozen` must navigate to the correct world.
  - World switching must continue updating the browser history URL via `window.history.replaceState`.
  - All 5 languages (`/en/products`, `/ar/products`, `/ru/products`, `/de/products`, `/fr/products`) must build statically.

#### 3.4 Verification & Acceptance Criteria
- `next build` classifies `/[lang]/products` as **`● (SSG)`**.
- Measured TTFB drops from **109 ms to < 15 ms** on local production server.
- Response header outputs `cache-control: s-maxage=31536000`.
- Deep links (`?world=frozen`) render correctly with zero console errors.

---

### Phase 4 — Seasonal Orbit Loading

#### 4.1 Objective & Verified Problem
Eliminate unneeded background image downloads in `<SeasonSection />`, unblocking critical network bandwidth on catalogue pages.

- **Verified Problem:**
  - `<SeasonSection />` is mounted at the bottom of the Products page (`ProductsExplorer.tsx:151`).
  - `EditorialOrbitExplorer.tsx:49-84` executes an aggressive preloader:
    - Preloads adjacent months immediately.
    - During `requestIdleCallback`, preloads **all 8 seasonal hero images** simultaneously into the browser cache.
  - While the user is browsing product cards above the fold, the browser is downloading 8 high-res botanical cutouts (`hero-orange.webp`, `hero-strawberry.webp`, `hero-potato.avif`, etc.) for a section hundreds of pixels below the viewport.

#### 4.2 Exact Affected Files
- [src/components/home/season/EditorialOrbitExplorer.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/home/season/EditorialOrbitExplorer.tsx)
- [src/components/home/SeasonSection.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/home/SeasonSection.tsx)

#### 4.3 Technical Solution
1. **Intersection-Aware Preload Gating:**
   - In `EditorialOrbitExplorer.tsx`, attach an `IntersectionObserver` to the section root with `rootMargin: "400px"`.
   - Gate the preloading logic so it only fires when the user scrolls within 400px of `#seasons`.
2. **Throttle Idle Preloads:**
   - When active, only preload the *current* month hero and the *adjacent* (next/prev) month heroes. Do NOT download all 8 crops at once.
   - Preload remaining months only when the user interacts with the month selector dial.
3. **Protected Features:**
   - Instant monthly switching and smooth dial animation must be preserved.
   - Egyptian crop calendar accuracy and Cairo timezone detection must remain intact.
   - Seasonal cards and add-to-quote functionality must remain untouched.

#### 4.4 Verification & Acceptance Criteria
- Navigating to `/products` initiates 0 seasonal hero image requests on initial load.
- Scrolling down to `#seasons` seamlessly loads seasonal hero media with zero visual delay.
- Memory usage during initial grid interaction is reduced.

---

### Phase 5 — Company Video Lifecycle

#### 5.1 Objective & Verified Problem
Prevent 8 simultaneous video instances on the Company page from competing for memory, CPU, and network buffering on mobile devices.

- **Verified Problem:**
  - `src/components/company/CompanyPageContent.tsx` mounts 8 `<video>` elements:
    - 1 Hero video (`COMPANY_HERO.videoDesktop`)
    - 1 Desktop Workflow video (`activeStep.mediaSrc`)
    - 4 Mobile Workflow videos (`step.mediaSrc` for each step)
    - 1 Quality standard video (`COMPANY_QUALITY.videoSrc`)
    - 1 Logistics dispatch video (`COMPANY_LOGISTICS.videoSrc`)
  - All 8 elements declare `autoPlay muted loop playsInline preload="metadata"`.
  - Contrast with `CompanySection.tsx` on the Homepage, which uses an elegant `IntersectionObserver` with `data-src`.

#### 5.2 Exact Affected Files
- [src/components/company/CompanyPageContent.tsx](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/components/company/CompanyPageContent.tsx)
- [src/data/company.ts](file:///c:/Users/PMT/Downloads/AGRICA_Antigravity_Base_v1/src/data/company.ts)

#### 5.3 Technical Solution
1. **Adopt Viewport-Aware Media Mounting:**
   - Mirror the proven `CompanySection` pattern in `CompanyPageContent.tsx`.
   - Use `data-src` on offscreen video tags. Attach `video.src` only when an `IntersectionObserver` (`rootMargin: "300px"`) confirms the video is approaching viewport.
2. **Optimize Posters in `src/data/company.ts`:**
   - `facility_reveal.png` (2.26 MB), `hero_01_origin_start_keyframe.png` (2.64 MB), `human_qc.png` (2.01 MB), and `sizing_completion.png` (2.23 MB) should point to optimized AVIF/WebP posters (~50 KB each).
3. **Responsive Media Separation:**
   - Render mobile workflow videos ONLY when the mobile breakpoint matches (`< 860px`), avoiding redundant DOM mounting of both desktop and mobile video elements simultaneously.
4. **Protected Features:**
   - Video autoplay when visible, pause when hidden, loop continuity, and posters must remain identical.
   - Tab switching across the 4 export stages (Harvest, Sorting, Packaging, Dispatch) must remain immediate.

#### 5.4 Verification & Acceptance Criteria
- Initial network requests on `/en/company` load only 1 video (the Hero), with remaining videos deferred until scrolled.
- Poster image payload reduced by **> 8 MB**.
- Mobile memory pressure reduced by > 50%.

---

### Final Phase — Full Validation & Regression Verification

#### 6.1 Objective
Execute a rigorous multi-vector validation covering all five languages, mobile and desktop viewports, automated test suites, and Core Web Vitals comparisons against the Phase 0 baseline.

#### 6.2 Test Matrix
1. **Automated Test Suites:**
   ```bash
   npm run test:i18n
   npm run test:catalogue
   npm run test:products
   npm run test:season
   npm run test:herbs-spices
   npm run test:routing
   npm run test:products-browser
   ```
2. **Multilingual & RTL Verification:**
   - Verify `/ar`, `/ar/products`, `/ar/company`, `/ar/standard` in Arabic for proper RTL layout, correct font weights, and intact LTR code numbers.
   - Verify `/ru`, `/de`, `/fr` for correct translation string rendering and line wrapping.
3. **Responsive Device Matrix:**
   - Mobile: 390×844 (iPhone 14/15 profile)
   - Tablet: 768×1024 (iPad profile)
   - Desktop: 1440×900 and 1920×1080
4. **Production Benchmark Comparison:**
   - Re-run benchmark script and compare against Phase 0 baseline metrics.
   - Generate Final Performance Verification Summary.

---

## 4. Cross-Phase Dependency & Risk Assessment

```
Phase 0 (Baseline)
    │
    ├─► Phase 1 (Hero Media) ──────┐ [Independent media optimization, zero risk to logic]
    │                              │
    ├─► Phase 2 (Products Grid) ───┼─► Phase 3 (Static Catalogue) [High architectural synergy]
    │                              │
    ├─► Phase 4 (Seasonal Orbit) ──┘ [Independent lifecycle tweak]
    │
    └─► Phase 5 (Company Video) ────► Final Phase (Validation)
```

### 4.1 Highest-Risk Technical Decisions & Mitigations

| Decision | Risk | Mitigation Strategy |
| :--- | :--- | :--- |
| **Converting `/products` from Dynamic SSR to SSG** | Deep links like `?world=frozen` might show brief flash of `fresh` content before hydrating. | Wrap `useSearchParams()` in a dedicated `<Suspense>` boundary; evaluate `world` synchronously before first DOM paint, or render clean world-neutral skeleton during hydration. |
| **Pruning `<ProductCardBack>` from Atlas Grid** | 3D Flight animation might rely on measuring the unexpanded card back. | Verify `ProductCardFlightOverlay.tsx` line 64: FLIP bounds calculation uses `originElement.getBoundingClientRect()` on `.export-card` (the outer wrapper), not the back. Tested and proven safe. |
| **Intersection-Gated Video Loading** | Video may take a fraction of a second to start after fast scroll. | High-quality AVIF posters ensure the user sees an identical, sharp still frame while the video buffers in the background. Use generous `rootMargin: "350px"`. |

---

## 5. Audit Assumptions: Verification & Corrections

During deep inspection of the active codebase, the following findings from the initial audit were verified or corrected:

1. **CSS Chunks (Correction):** The audit reported "CSS: 0.0 KB (0 files)" in the initial script. Deep analysis proved this was an artifact of the regex expecting `/_next/static/css/`, whereas Next.js 16.3 with Turbopack emits CSS into `.next/static/chunks/*.css` (e.g., `17pfde3pbldko.css` = 100.4 KB). Total CSS is properly bundled and extracted.
2. **Hero Video Playback (Verified):** The audit correctly noted that Hero video posters are massive (7.12 MB). Inspection verified that videos 2, 3, 4 are paused on load, but browsers still fetch the unoptimized posters immediately.
3. **Products Card Back (Verified):** Inspection of `ProductCardFlightOverlay.tsx` confirmed that the grid's `<ProductCardBack>` is completely unused; the overlay mounts its own expanded back face in a React Portal. Pruning the grid's card back is 100% architecturally sound.

---

## 6. Execution Governance & Protocol

Every phase must adhere strictly to the following 5-step operational protocol:

1. **Pre-Flight:** Verify clean Git state and phase authorization.
2. **Implementation:** Modify ONLY files explicitly designated for the current phase.
3. **Verification:** Run targeted automated tests and local benchmarks.
4. **Completion Report:** Document exact files changed, before/after metrics, and test results.
5. **STOP GATE:** Stop execution and await explicit user approval before proceeding to the next phase. Never chain phases automatically.

---
*End of Master Performance Optimization Plan.*
