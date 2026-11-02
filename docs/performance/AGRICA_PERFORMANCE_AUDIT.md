# AGRICA performance audit

Audit date: 20 October 2026 (Africa/Cairo). Status: audit only; no application changes, package installs, commits, or deployments.

## Executive assessment

The strongest confirmed problems are unnecessary media requests, oversized images in active page sections, and a company hero that uses a large PNG poster. The premium visual treatment can be retained while improving resource selection and loading timing. The evidence does **not** establish a site-wide JavaScript execution crisis, database bottleneck, or broken CDN. Do not replace animation frameworks or introduce backend infrastructure based on this audit.

Production tested: https://www.agriculturecairo.com, corroborated by `src/app/contact/layout.tsx:10` and matching page structure/assets. The local build and deployment have different chunk identifiers and paths; deployed commit identity is unavailable. Source locations below describe the checked-out repository; live network observations corroborate many, but not every, implementation detail.

Existing root-level performance reports were treated as historical context, not measurement evidence. In particular, the current homepage requests `hero-bg.avif` (176,758 bytes), not the large JPEG assumed by an older report. Historical local millisecond timings are not imported into this baseline.

## Method, limits, and reproducibility

- Inspected all eight page entry points, both root layouts, shared locale providers, reachable component/data/CSS modules, `next.config.ts`, package scripts, Vercel project metadata, and the existing `.next` production manifests.
- Read the installed Next.js 16.3.4 documentation: `node_modules/next/dist/docs/01-app/02-guides/production-checklist.md` and relevant image API sections. In this version `priority` is deprecated in favor of `preload`; this is a maintenance detail, not itself proof of a performance defect. `sizes` and appropriate discovery priority matter more than changing prop names.
- Used installed Chrome 155.0.8059.85 in a separate headless profile, via the Chrome DevTools Protocol. Tested public production pages sequentially, desktop then mobile. Cache disabled, one sample per route/profile, no scrolling/clicking during load samples. Desktop: 1440×900, DPR 1, CPU rate 1, nominal 40 ms latency / 10 Mbps download. Mobile: 390×844, DPR 3, CPU rate 4, nominal 150 ms / 1.6 Mbps download. These are CDP settings, **not standardized Lighthouse profiles**; desktop user agent was retained. Device emulation is not a physical phone.
- Recorded PerformanceNavigationTiming, paint entries, buffered LCP/layout-shift observations, ResourceTiming, and CDP network responses/completed transfers. Captured at about 8 seconds (desktop) / 14 seconds (mobile) after navigation request. Several pages were still `interactive`, so their results are censored and their full page weights are unknown. Video range requests, prefetches, and late images continue after the window.
- Each subsequent navigation may overlap residual/aborted work from its predecessor. HTTP connection, CDN and image transformation caches remain warm even with browser cache disabled. Small navigation timings despite nominal latency settings show these are approximate lab conditions. Results are directional, not medians, field percentiles, or controlled before/after comparisons.
- Started the existing build with `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3189`; did not rebuild, because a build writes generated files. Startup was 108 ms, which is not page TTFB. Local HTML and headers were inspected; local interactions were tested separately. Existing build freshness relative to all source files is not guaranteed.
- Initial sandbox attempts failed: local listener `EPERM`, Chrome exit 134, and production DNS resolution failure. Approved diagnostic execution subsequently succeeded; these are environment restrictions, not website defects.
- Lighthouse is absent from project/global command resolution; `lighthouse`, `playwright`, `puppeteer`, and `@playwright/test` package resolution failed. No installation was performed. A hosted PageSpeed Insights mobile request returned HTTP **429 RESOURCE_EXHAUSTED**, daily query quota exceeded. Accordingly **no Lighthouse score, Speed Index, standardized TBT, or Lighthouse mobile/desktop result is available**. Needed: an already provisioned Lighthouse runner or functioning PageSpeed API quota/key, then at least three runs per route/profile against the same deployment.
- No CrUX export, Search Console CWV report, RUM dashboard, or authenticated field-data source was available. **Field INP, field LCP/CLS and p75 CWV pass rate are unavailable.** Load tests cannot measure INP. Event Timing from a few scripted clicks is not field INP. No RUM package needs to be added just to perform the initial fixes.
- Raw diagnostics were written to temporary files (`/tmp/agrica-performance-measurements.json`, `/tmp/agrica-performance-interactions.json`, `/tmp/agrica-media-inventory.json`, `/tmp/agrica-perf-measure.mjs`). The tables and concrete evidence below are the durable report; temporary files are not a long-term artifact contract.

## Routes and rendering baseline

`src/i18n/config.ts:1` defines `en`, `ar`, `ru`, `de`, `fr`; Arabic is RTL. There are **36 content URLs**: seven localized page types × five languages, plus `/contact`. Query variants are additional states, not separate page entry points.

| Pattern | Page entry under `src/app/` | Existing build rendering | Key interactions |
|---|---|---|---|
| `/{lang}` | `[lang]/page.tsx` | Prerendered for all five locales | Four-film hero, world cards, month orbit, seasonal cards, enquiry |
| `/{lang}/products` | `[lang]/products/page.tsx` | Request rendered; reads `searchParams` | Fresh/frozen, family/search, flight dossier, quote drawer |
| `/{lang}/company` | `[lang]/company/page.tsx` | Prerendered | Workflow tabs and cinematic videos |
| `/{lang}/standard` | `[lang]/standard/page.tsx` | Prerendered | Scroll progress, stage reveals |
| `/{lang}/herbs-spices` | `[lang]/herbs-spices/page.tsx` | Prerendered | Family accordion, material forms, process stack |
| `/{lang}/herbs-spices/products` | `[lang]/herbs-spices/products/page.tsx` | Request rendered; reads `searchParams` | Family/search, material inspection, enquiry drawer |
| `/{lang}/herbs-spices/standard` | `[lang]/herbs-spices/standard/page.tsx` | Prerendered | Process tabs/swipe |
| `/contact` | `contact/page.tsx` | Prerendered, separate English root layout | Profile PDF downloads, vCard, contact links |

Also: `/contact/opengraph-image.png` is a metadata asset route; Next internal 404/global-error routes are not business pages. Unlocalized `/`, `/products`, `/company`, `/standard`, and the three herbs paths redirect permanently to English in `next.config.ts:12–20`. Root was observed returning 308 to `/en/`; redirects add a navigation round trip when entry links use them. Invalid locale behavior is guarded by `notFound()` in `[lang]/layout.tsx`. No `[slug]` product detail route or localized contact page exists. Product detail is an in-page overlay.

All route types were load tested in English; `/en/products?world=frozen` and Arabic homepage were additional samples. Other language pages were inspected through the shared source and prerender manifest, **not individually browser tested**. Accessibility and SEO outcomes were not comprehensively audited; preserve existing metadata, hreflang behavior where present, indexing policy, URL parameters, dictionary selection and RTL during optimization. Herbs layout currently declares `noindex`/`nofollow`; changing that is outside performance scope.

## Current production lab baseline

Times are milliseconds; MB means decimal bytes / 1,000,000. LCP is the **last candidate seen before cutoff**, not a finalized field metric. CLS is the largest layout-shift session window in the observed interval, excluding recent input. JS is completed script ResourceTiming transfer bytes, including small response overhead; cross-origin restricted timing may undercount. Requests count observed responses, including range requests and prefetches, not unique assets. Completed bytes sum CDP loading-finished encoded lengths during the capture; **this is a lower bound, not full page weight** and excludes partially downloaded/aborted resources.

| Profile | Route | LCP | FCP | TTFB¹ | CLS | JS KB | Responses | Completed MB² | Ready state |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| Desktop | `/en` | 3260 | 3260 | 252 | 0.00000 | 234.3 | 66 | 3.38 | interactive |
| Desktop | `/en/products` | 5972 | 5972 | 1910 | 0.00000 | 261.7 | 70 | 6.34 | complete |
| Desktop | `/en/products?world=frozen` | 416 | 416 | 61 | 0.00000 | 261.7 | 64 | 7.41 | complete |
| Desktop | `/en/company` | 5572 | 392 | 75 | 0.00000 | 205.9 | 27 | 4.98 | interactive |
| Desktop | `/en/standard` | 6216 | 4056 | 1932 | 0.00000 | 252.4 | 36 | 4.49 | complete |
| Desktop | `/en/herbs-spices` | 996 | 696 | 91 | 0.00002 | 206.5 | 38 | 1.35 | complete |
| Desktop | `/en/herbs-spices/products` | 4244 | 468 | 85 | 0.00000 | 216.9 | 35 | 0.40 | complete |
| Desktop | `/en/herbs-spices/standard` | 984 | 492 | 67 | 0.00000 | 209.5 | 35 | 2.07 | complete |
| Desktop | `/contact` | 680 | 584 | 71 | 0.00000 | 140.9 | 13 | 0.25 | complete |
| Desktop | `/ar` | 1736 | 764 | 80 | 0.00000 | 252.4 | 72 | 6.40 | complete |
| Mobile | `/en` | 4432 | 4100 | 65 | 0.00000 | 234.3 | 69 | 0.63 | interactive |
| Mobile | `/en/products` | 7988 | 7988 | 82 | 0.00000 | 217.2 | 55 | 0.52 | interactive |
| Mobile | `/en/products?world=frozen` | 1212 | 1212 | 146 | 0.00000 | 261.7 | 59 | 1.17 | interactive |
| Mobile | `/en/company` | 13864 | 1408 | 168 | 0.00000 | 205.9 | 54 | 0.80 | interactive |
| Mobile | `/en/standard` | 6040 | 6040 | 130 | 0.00000 | 252.4 | 33 | 0.34 | interactive |
| Mobile | `/en/herbs-spices` | 3836 | 2688 | 60 | 0.00000 | 206.5 | 41 | 1.64 | complete |
| Mobile | `/en/herbs-spices/products` | 2184 | 1600 | 72 | 0.00000 | 216.9 | 30 | 0.39 | complete |
| Mobile | `/en/herbs-spices/standard` | 8744 | 1292 | 75 | 0.00000 | 209.5 | 35 | 2.07 | complete |
| Mobile | `/contact` | 1740 | 720 | 285 | 0.00000 | 140.9 | 12 | 0.27 | complete |
| Mobile | `/ar` | 4100 | 2220 | 70 | 0.00000 | 234.3 | 69 | 1.16 | interactive |

¹ `responseStart` relative to navigation start, including navigation setup, not isolated backend compute. ² Incomplete-window lower bound; do not compare mobile/desktop bytes as total-page savings.

### Separate local production interaction diagnostics

Read-only checks against the existing local production build, unthrottled network; desktop CPU rate 1 and mobile CPU rate 4. These use emulated mouse clicks, not real touch hardware. One repeat was needed after the first diagnostic exited with an unsettled pending await during its mobile step; the cause was not established and is not assigned to the application.

| Profile | Overlay mounted | Controls ready | Recorded click Event Timing | Escape close |
|---|---:|---:|---:|---|
| Desktop | 21.5 ms | 493.7 ms | 24 ms (pointerdown 32 ms) | Passed |
| Mobile emulation | 45.1 ms | 515.7 ms | 48 ms (pointerdown 64 ms) | Passed |

The roughly half-second readiness is consistent with the authored animation gate; it is not half a second of click-handler CPU. A scripted 90-rAF scroll probe on herbs home recorded 90 layouts, ~4.43 ms aggregate layout / 15.66 ms scripting desktop, and ~3.68 ms / 10.38 ms mobile (CDP duration counters). This was a short, low-stress synthetic scroll, not a real touch fling or full-page trace; it does not demonstrate scroll jank or justify rewriting the stack. Full search/filter/quote interaction latency, navigation click-to-paint, and physical-device frame consistency remain unmeasured.

FCP/LCP/TTFB are lab observations only. INP, Speed Index, Lighthouse TBT and performance score are **unavailable for every row**. The load observer recorded no long-task entries; this does not prove zero blocking, and is not a validated TBT result. Full-load weight/request totals are unavailable for unfinished pages and continuous media. No runtime exception was captured in these load windows; that is not a full functional pass.

Interpretation: company has a measurable image/media loading problem; contact is a useful lightweight control. Catalogue and standard samples have large run-to-run/state variation, so their slow FCP cannot be attributed to any one file from this sample alone. Request-time catalogue rendering is confirmed, but a persistent slow origin is not: other samples are fast. Repeat clean, isolated runs before assigning a server-time SLA or predicting a score.

## Delivery and architecture findings

- Production homepage GET: HTTP 200, gzip, `x-vercel-cache: HIT`, `x-nextjs-prerender: 1`, roughly 20,252 compressed HTML bytes and 112,953 decompressed HTML bytes; separate curl TTFB 217 ms. This single curl measurement is not a field percentile. Root redirect: 308. Production code chunks: Brotli, `public,max-age=31536000,immutable`, CDN HIT. **Compression and CDN caching are working.**
- `/en/products` HEAD: `private, no-cache, no-store, max-age=0, must-revalidate`, `x-vercel-cache: MISS`, `x-matched-path: /[lang]/products`; request went through an `iad1` origin marker behind `fra1`. Do not infer all users' routing or permanent origin slowness from this sample. The existing prerender manifest excludes both catalogue route types.
- Public hero AVIF and MP4: `public,max-age=0,must-revalidate`, stable ETag, CDN HIT, `accept-ranges: bytes`; actual media requests return 206. Edge hits coexist with mandatory browser revalidation. Videos should retain range support; do not blindly gzip already compressed media. No custom headers, CDN rules or compression override in `next.config.ts`.
- Many Next/Image responses are responsive, correctly configured with `sizes`; `next.config.ts:7–9` enables AVIF/WebP. This setting does not optimize raw `<img>`, CSS backgrounds, or video posters. Product profile image requests, for example, use `w=256&q=75` for compact cards and `w=640&q=75` for some catalogue cells. One observed compact strawberry response transferred 241,779 bytes despite that small width: use measured rendered dimensions and quality review before reducing DPR/quality globally.
- Five global stylesheets are imported by `[lang]/layout.tsx:5–9`: **138,740 source bytes** total, including products, standard and hero styling on every localized page. Source bytes are not network bytes; production CSS is minified/compressed. This is avoidable route coupling, not proof that every rule is unused. Contact has a separate layout and CSS.
- Local `.next/static` contains 1,108,226 uncompressed JS bytes across all routes. **Do not call that first-load transfer.** The production table reports actual completed script transfers (~141–262 KB per sample). Route splitting exists. `ProductsExplorer`, `CompanyPageContent`, `StandardPageContent` and many home sections are client boundaries; full-page client content imports static data and interactive code. Client components are still server prerendered; they are not automatically client-only rendered.
- `get-dictionary.ts` is server-only and dynamically selects one locale. `[lang]/layout.tsx:55–63` nevertheless serializes the entire selected dictionary into `LocaleProvider`. Direct serialization of the English dictionary is 26,172 raw JSON bytes: common 4,123; home 3,160; products 4,698; standard 7,327; herbs/spices 6,806. Route-specific subsets could reduce payload, but gzip/RSC overhead and client imports require actual bundle attribution before promising a benefit. **This does not mean all five dictionaries are serialized.**
- GSAP is active on homepage, product overlays, company, standard and herbs family accordion. Motion appears only in `home/Stack.tsx`, which is not reachable from current page entry points in the inspected static import graph. Removing Motion is therefore primarily dependency housekeeping unless bundle evidence proves otherwise. Lenis is imported by the active herbs home `ScrollStack`, but `useWindowScroll={true}` uses native scroll listeners (`ScrollStack.tsx:333–337`) and does **not** instantiate Lenis. The nested-scroller Lenis branch is unused by that caller. Do not blame active global smooth scrolling on Lenis.
- No application `fetch()`, Axios, Prisma/Supabase database client, API route handlers, server actions, or backend query loops were found under `src`. Data is local TS. Trade form submission in `TradeSection.tsx:93–98` changes local state. Contact uses links/downloads. **No database, API waterfall or N+1 optimization is justified.** Framework RSC navigation requests are not a business API/database layer.
- No active third-party script/analytics tag was found. Picsum URLs are component defaults; actual family gallery supplies local images. `hero.css:1` contains a Google Fonts import, but it is absent from inspected compiled CSS and no Google font request appeared in the load captures. Current CSS uses system/Georgia-style font variables. Therefore an external-font waterfall, font preconnect benefit, or font-induced CLS is **not confirmed**. Do not add speculative preconnects.
- `LocaleLink` delegates to Next Link; division switching explicitly disables prefetch (`BusinessDivisionSwitcher.tsx:102`). Background RSC requests were observed, e.g. homepage → products (~4.83 s resource duration in one sample). Keep useful navigation prefetch; prioritize only demonstrated competition after more detailed waterfall analysis. `/contact` has a separate root layout, so transitions across it may require a document navigation. No quantified defect is assigned to that design.

## Top 10 evidence-backed bottlenecks

Rank combines impact, evidence confidence and effort. “Confirmed” refers to the implementation/network mechanism; estimated savings and user outcomes still require before/after validation. Each row is a proposed fix, **not implemented**.

### F01 — Company hero and workflow posters ship large original images (P0)

**Location:** `src/data/company.ts:52–54,89–127,160–161,235–236`; `src/components/company/CompanyPageContent.tsx:212–220,380–388,436–443,475–482,599–606`.

**Evidence:** Hero poster PNG is 2,636,303 bytes at 1672×941. Facility and QC PNGs are 2,257,277 and 2,013,395 bytes. Shipping PNG and packing JPG also appear in the live request list before scroll. Desktop company LCP is that hero PNG at 5,572 ms; mobile's last candidate is the hero video at 13,864 ms. The latter is not proof the poster alone caused all 13.86 seconds.

**Impact / root cause:** Video `poster` loads its URL directly; Next/Image config does not transform it. Large poster and workflow imagery compete with the hero and scripts.

**Minimal fix:** Produce visually approved responsive/modern posters from the *same frames*, select an appropriate viewport variant, retain stable aspect ratio and fallback. Give only the visible hero suitable discovery priority. Existing tiny homepage origin AVIF proves a smaller version exists, but 640×360 may be insufficient for the full-screen company hero; do not substitute blindly.

**Expected benefit:** Estimated 70–95% poster-byte reduction with reviewed derivatives; potentially seconds on constrained links. Exact LCP reduction unknown. **Risk:** Medium, frame matching/color/crop/readability. **Effort:** Small.

### F02 — Company mounts videos for hidden and distant sections (P0)

**Location:** `CompanyPageContent.tsx:212–220,380–388,428–455,475–482,599–606`; `CompanyPageContent.module.css:453–454,1048–1051`.

**Evidence:** Eight video elements mounted at desktop capture, including four in CSS-hidden mobile workflow. All four hidden mobile video sources were requested in production, with 206 responses; repeated origin-video range requests also appeared. Mobile capture similarly requested workflow, quality and logistics video sources without scrolling. Autoplay is set at each location and there is no per-video visibility/source attachment policy in this component. Playback was paused in the captured headless snapshots, so simultaneous active decoding is **not established**.

**Impact / root cause:** CSS hides presentation, not source attachment. `preload="metadata"` is not a prohibition on fetching, and autoplay can override preload intent.

**Minimal fix:** Attach sources only for the active breakpoint and near-visible section; play only visible video, pause when hidden/offscreen, preserve posters and reduced-motion/save-data behavior. Reuse the existing home `CompanySection.tsx:49–89` observer/source attachment pattern. Keep workflow content and semantics server visible.

**Expected benefit:** Eliminate hidden-layout media requests and reduce initial transfer, resource contention and likely decode work; MB savings depend on browser range behavior. **Risk:** Medium, autoplay transitions, breakpoint changes, tab switching. **Effort:** Medium.

### F03 — All homepage carousel sources attach immediately (P0)

**Location:** `src/components/home/HeroSection.tsx:195–248,483–510`; media registry `:61–93`.

**Evidence:** All four video URLs are in initial markup with metadata preload, although only one is active. Desktop snapshot had active origin and inactive processing/packing at readyState 4. Film source sizes: origin 1.79 MB, processing 4.13 MB, packing 5.14 MB, shipping 4.98 MB (16.03 MB total asset capacity; **not a measured initial download total**). Four poster pictures are eager by default. Existing code correctly pauses inactive/offscreen films and respects reduced motion for playback.

**Impact / root cause:** Playback is gated, but network source discovery is not. A user's first view competes with films not yet selected; auto-advance continues while offscreen (`:250–260`).

**Minimal fix:** Keep the active film/poster immediate; defer inactive source attachment, optionally warm one next film after critical resources finish. Preserve neighboring visible posters, swipe, seven-second timing and seamless transitions. Suspend auto-advance when offscreen/document hidden.

**Expected benefit:** Fewer early media/range requests; MB-scale deferred capacity, unknown initial-byte savings. **Risk:** Medium, first transition buffering. **Effort:** Small–Medium.

### F04 — Seasonal section preloads all original hero crops (P0)

**Location:** `src/components/home/season/EditorialOrbitExplorer.tsx:44–84`; `src/data/seasonalHeroes.ts:32–129`; mounted on home and products (`ProductsExplorer.tsx:18` and seasonal render).

**Evidence:** Effect immediately preloads adjacent months and schedules all eight image paths with `new Image()`. The eight originals total **1,074,566 bytes**. Live homepage capture contains original crop URLs. A visible selected crop can separately use `/_next/image?...`, so original preloading does not reliably warm the optimized URL. Set deduplication resets with every selected month. The 1.07 MB is potential unique original capacity, not a claim of eight new network downloads on every month click; browser cache can reuse originals.

**Impact / root cause:** An idle callback measures CPU availability, not network idleness. A below-fold feature competes with above-fold resources and preloads representations it may not display.

**Minimal fix:** Start only when near viewport or on month intent; warm selected/adjacent crop in the same responsive representation as displayed. Avoid broad preload on constrained/save-data connections and persist deduplication appropriately. `SeasonalHeroCrop.tsx:191` also gives unconditional priority to a below-fold selection; make priority depend on actual placement.

**Expected benefit:** Defer up to ~1.07 MB of unnecessary originals per cold visit to affected routes. Faster initial resource scheduling; no guaranteed LCP delta. **Risk:** Low–Medium, first month-switch image readiness. **Effort:** Small.

### F05 — Below-fold compact seasonal cards load eagerly (P0)

**Location:** `src/components/products/ProductCardFront.tsx:66–76`; `src/components/home/season/SeasonalCardCollection.tsx:74–100`; `EditorialOrbitExplorer.tsx:39–45,101–107`.

**Evidence:** `loading={isCompact ? "eager" : undefined}` applies to every seasonal card, up to eight. Homepage captured `w=256` optimized card image requests before scrolling; strawberry transfer alone was ~242 KB. January SSR selection is replaced with Cairo's current month after hydration, potentially requesting two different card sets. The exact waste from replacement was not isolated.

**Impact / root cause:** Small-card appearance is used to choose eagerness, independent of viewport visibility. Offscreen cards become initial work.

**Minimal fix:** Default below-fold compact cards to lazy; use explicit near-viewport/interaction warming only where necessary. Preserve correct Cairo month and stable SSR behavior; do not introduce hydration mismatch to avoid the January transition.

**Expected benefit:** Defer hundreds of KB in the observed homepage, potentially more depending on month and DPR. **Risk:** Low, late image appearance during fast scroll. **Effort:** Small.

### F06 — Certificate strip uses 8.59 MB of original PNGs (P0)

**Location:** `src/components/herbs-spices/home/QualityDocumentationSection.tsx:8–47,70–94`; used by produce and herbs homepages.

**Evidence:** Eight PNGs total **8,587,171 bytes**, typically 1254×1254, rendered in a strip configured for 80 px logos. Native lazy loading is already present; **these bytes were not all observed in the initial no-scroll window**. Repeated loop copies may share downloads but still add DOM/render work. This is primarily full-scroll/page-weight cost.

**Impact / root cause:** Large source images are served directly with no responsive derivatives. Lazy loading defers but does not reduce eventual bytes and decode resolution.

**Minimal fix:** Serve appropriately sized, visually approved AVIF/WebP or optimized PNG derivatives with intrinsic dimensions; retain original documents separately if needed. Keep lazy loading and strip layout unchanged.

**Expected benefit:** Estimated 80–95% strip-byte reduction (~6.9–8.2 MB) after visual validation. Largest straightforward full-scroll image saving. **Risk:** Low–Medium, small certificate text/seal quality. **Effort:** Small.

### F07 — Standard journey serves raw JPEG/PNG stage imagery (P0/P1)

**Location:** `src/components/standard/StandardStageBlock.tsx:167–172`; `StandardFinalStageBlock.tsx:196–201`; `src/data/stages.ts:15,33,51,69,87,105`.

**Evidence:** Six active images total **8,097,483 bytes**: three 1376×768 JPEGs (~0.69–0.74 MB each), three 1672×941 PNGs (~1.90–2.09 MB each). They are raw lazy `<img>` elements with no responsive width variants. Desktop LCP candidate was stage 1 at 6,216 ms; mobile remained text LCP at 6,040 ms in its cutoff, so image causality on mobile is not established.

**Impact / root cause:** Lazy loading is useful, but browser near-viewport heuristics can still fetch several stages and always fetch full-size originals.

**Minimal fix:** Preserve images/crops using responsive modern derivatives or Next/Image with correct `sizes` and reserved geometry. Keep lazy for below-fold stages; determine whether first stage is actually LCP at each breakpoint before assigning priority.

**Expected benefit:** Estimated 60–90% full-journey image-byte reduction (~4.9–7.3 MB). **Risk:** Medium, scroll-trigger geometry, image framing and sharpness. **Effort:** Small–Medium.

### F08 — Catalogue URL state forces request rendering; herbs family changes request RSC (P1)

**Location:** `src/app/[lang]/products/page.tsx:16–22`; `[lang]/herbs-spices/products/page.tsx:21–32`; `HerbsSpicesProductsExplorer.tsx:112–118`.

**Evidence:** Both pages await `searchParams`; production produce catalogue is no-store/MISS and neither catalogue appears in prerender routes. The produce fresh desktop sample had 1,910 ms responseStart while frozen was 61 ms; this difference is **not enough to diagnose persistent origin slowness**. Herbs family handler filters client state and also `router.push`es to the same page with a family query, causing a framework server navigation even though catalogue data is already local. Produce world changes already use `history.replaceState`.

**Impact / root cause:** Request-time URL interpretation precludes the static page cache; herbs client filtering duplicates some state work through navigation.

**Minimal fix:** Consider a static catalogue shell with a small URL-state client boundary, retaining direct-link initial selection and useful server HTML/SEO. For local herbs filters, evaluate native history updates with proper popstate synchronization rather than unnecessary server navigation. This needs installed-version routing validation; do not simply delete `searchParams`.

**Expected benefit:** More cacheable document delivery and fewer filter RSC requests; TTFB/interaction savings unknown until repeated tests. **Risk:** Medium–High, back/forward, direct links, filters and server/client parity. **Effort:** Medium.

### F09 — Frozen catalogue fallback downloads a 2.56 MB sprite (P0)

**Location:** `src/styles/products.css:948–960,1000–1002`; `src/components/products/ProductCardFront.tsx:36,61–77`; `src/data/productImages.ts:3–39`.

**Evidence:** `.export-card-visual` defaults to `/assets/three-worlds.png`, 2,556,277 bytes at 1536×1024. Dedicated-image cards correctly override that background to `none`, but the image registry has no cauliflower/sweet-corn entries for the added frozen products. The live desktop frozen catalogue downloaded the sprite (2,556,577 transfer bytes including overhead). It was not completed in the mobile capture, so that window does not quantify mobile cost.

**Impact / root cause:** A small missing-image fallback triggers a whole large atlas download through CSS, outside Next/Image's responsive optimization.

**Minimal fix:** Create a compact derivative of the existing fallback atlas preserving its visible appearance/crop, or approved per-product images for missing mappings. Keep fallback semantics and ensure no unrelated cards change.

**Expected benefit:** Estimated 70–95% lower fallback bytes, approximately 1.8–2.4 MB on a cold frozen visit. Exact derivative quality must be reviewed. **Risk:** Low–Medium, fallback identity/crop. **Effort:** Small.

### F10 — Product dossier intentionally gates controls through opening animation (P1)

**Location:** `src/components/products/ProductCardFlightOverlay.tsx:95–167,253–294`; `.module.css:63–70`.

**Evidence:** Back-frame pointer events are disabled until `data-ready=true`. That state is set on GSAP opening timeline completion: 0.22 s flight + 0.24 s turn = **~460 ms**. Closing takes ~340 ms; reduced-motion path is shorter. Transform/opacity animation, one active overlay, memoized cards and cleanup already exist. This is a deterministic usability delay, **not proof of a 460 ms INP** or slow CPU work.

**Impact / root cause:** Users see motion but cannot immediately interact with dossier controls. Network tuning does not remove the authored gate.

**Minimal fix:** Keep cinematic flight; evaluate enabling safe controls once the readable face appears, allow early close/cancel, or tune handoff timing only with design approval. Do not remove animation by default. Profile before adding memoization or changing GSAP.

**Expected benefit:** Up to a few hundred ms earlier action readiness if safe; actual visual timeline can remain intact. **Risk:** Medium, accidental clicks during handoff, keyboard/focus races. **Effort:** Small–Medium.

## Additional confirmed mechanisms and lower-priority work

These findings have evidence of avoidable work, but their contribution to perceptible slowness is not yet quantified.

### F11 — Herbs gallery eagerly mounts original images in responsive layouts (P1)

**Location:** `IngredientFamiliesSection.tsx:24–37,58–90`; `src/components/ui/AccordionGallery/AccordionGallery.tsx:319–323`.

**Evidence / root cause:** Desktop accordion uses raw `<img>` without lazy loading or responsive sizes; it remains mounted alongside the mobile alternative. Six approved family images total ~788 KB; production herbs homepage requested the family assets before interaction, including the mobile sample. CSS visibility does not defer image discovery. **Impact:** Background images compete with hero and consume decode work. **Minimal fix:** Use correctly sized local variants and viewport-aware discovery, preserve visible family previews. **Expected benefit:** Defer/reduce hundreds of KB; exact savings unmeasured. **Risk:** Medium, desktop accordion transitions and mobile swap. **Effort:** Small–Medium.

### F12 — Offscreen animation/timer work lacks visibility gating (P2)

**Location:** `src/components/ui/LogoLoop/LogoLoop.tsx:87–137`; `IngredientFormsSection.tsx:40–49`; `HeroSection.tsx:250–260`.

**Evidence / root cause:** LogoLoop schedules rAF continuously while mounted without IntersectionObserver/document-visibility gating; forms rotate every two seconds regardless of viewport. Cleanup exists. **Impact:** Avoidable offscreen work and potential battery cost, but no dropped-frame or long-task attribution proves this is a major bottleneck. **Minimal fix:** Suspend when offscreen/hidden and respect motion preferences, retaining position on resume. **Expected benefit:** Remove unnecessary callbacks; frame-rate benefit unknown. **Risk:** Low–Medium, resume cadence and reduced-motion behavior. **Effort:** Small.

### F13 — Stable public media URLs require browser revalidation (P1/P2)

**Location:** `next.config.ts:4–10` (no media cache policy); source URLs in `public/assets/` and data manifests.

**Evidence / root cause:** Live public AVIF/MP4 headers are `max-age=0,must-revalidate`, while immutable build chunks have year-long caching. CDN HIT does not remove browser round trips. **Impact:** Warm navigations may revalidate unchanged media; magnitude was not measured with warm browser cache because baseline disabled it. **Minimal fix:** Version/fingerprint media URLs before applying long browser caching to immutable assets; retain short policy for mutable PDFs/vCards as appropriate. **Expected benefit:** Fewer warm-visit round trips and transfers on eviction/revalidation; unknown milliseconds. **Risk:** Medium–High if mutable URLs become stale. **Effort:** Medium; versioning precedes header changes.

### F14 — Scroll handlers perform repeated geometry reads (P2, profile first)

**Location:** `StandardProgressThread.tsx:12–35`; `ScrollStack.tsx:110–147,206–212,333–335`; invoked with `useWindowScroll=true` in `SourceToSpecificationSection.tsx:33–44`.

**Evidence / root cause:** Standard resolves six elements and reads offsets per native scroll; ScrollStack reads geometry per card and may interleave reads/writes. Stack disables blur (`blurAmount=0`), so the nested blur loop is **not active** for this route. Navbar visibility already coalesces with rAF; do not replace working throttling indiscriminately. **Impact:** Potential layout cost on mobile; event handlers alone do not prove expensive forced layout. **Minimal fix:** If trace attribution supports it, cache measured geometry on resize/content change, batch reads then writes, coalesce scroll updates. Preserve stack behavior. **Expected benefit:** Unknown pending trace. **Risk:** Medium, variable fonts/content, viewport resizing and pin thresholds. **Effort:** Medium.

### F15 — Unrelated global CSS is delivered across localized routes (P1)

**Location:** `src/app/[lang]/layout.tsx:5–9`; `src/styles/{globals,products,standard,footer,hero}.css`.

**Evidence:** Every localized page imports all five global stylesheets, 138,740 source bytes. Product and standard styles are included even on herbs pages; hero styles are included on catalogue pages. Browser captures confirm shared CSS chunks, but CSS coverage and a precise unused-rule percentage were not collected.

**Impact / root cause:** Route-specific styling is promoted to the shared root, increasing shared CSS parsing and coupling. The performance effect is probably smaller than media savings.

**Minimal fix:** Move route-owned styles to appropriate route layouts/modules while keeping truly shared styles global. Preserve cascade order and specificity; first attribute compressed bytes by route.

**Expected benefit:** Reduce unrelated CSS transfer/parse; quantitative benefit unavailable. **Risk:** Medium–High, current global overrides and responsive/RTL cascade. **Effort:** Medium.


## Media inventory and loading assessment

The `public/` inventory contains **265 image/video/SVG assets, 217,093,314 bytes (~217.09 MB)**. This is storage capacity, not page weight. Unreferenced masters, reference images and old variants do not affect loading merely by existing. Root-level master videos and `artifacts/` were excluded from deployable-public totals; they are not page requests unless explicitly served/referenced.

The metadata image outside `public/`, `src/app/contact/opengraph-image.png`, is 36,290 bytes at 1200×630 and serves `/contact/opengraph-image.png`; it is social-preview metadata, not an initial page image.

Image dimensions were read with installed Sharp metadata; MP4 dimensions/duration were read from track/movie headers without decoding or changing files. WebM dimensions/duration were not extracted; SVG uses vector sizing. File format is derived from extension plus successful metadata where available; no content quality rating is implied.

Representative delivery policies:

| Surface | Current behavior | Assessment |
|---|---|---|
| Produce hero backdrop | AVIF/WebP picture; 176.8 KB AVIF; high priority | Already materially optimized; no width variants, so consider only measured breakpoint benefit |
| Hero films | Four mounted metadata-preload films; active/offscreen pause | Keep playback policy; improve network attachment (F03) |
| Home company film | Deferred `data-src`, near-viewport observer, visible playback, save-data/reduced-motion fallback | Existing good pattern; preserve |
| Product/world cards | Next/Image fill + responsive sizes; regular cards lazy | Generally appropriate; compact-card eagerness is the specific defect |
| Company hero/workflow | Raw video posters and mounted autoplay sources | Highest-priority loading changes |
| Certificate strip | Raw full-size PNG, native lazy | Deferred but oversized, F06 |
| Produce standard stages | Raw lazy JPEG/PNG | Responsive delivery missing, F07 |
| Herbs hero | Next/Image with sizes and priority | Appropriate initial priority; validate LCP on physical mobile |
| Herbs families/forms/process | Mix of Next/Image and raw eager/lazy images; inactive layers remain mounted | Gate discovery only when hidden content is truly not needed; opacity/aria-hidden do not prevent fetch |
| Contact | Server page; responsive Next/Image, explicit priority for key artwork/logo | Lightweight control; no high-priority refactor indicated |

Asset-route column in the full inventory below is **ownership/potential usage**, not a claim that every asset downloads on that route. “No direct reference found” means a conservative static scan of reachable source modules did not find the full literal URL; generated paths can evade that scan. Product/media manifests with generated paths are labeled by ownership. Requested assets must be established from the live waterfall, not this table.

### Full public image/video/SVG inventory

| Public path | Format | Bytes | Dimensions | Duration (s) | Ownership / direct reachable reference |
|---|---|---:|---|---:|---|
| `public/agrica-logo.png` | png | 118,421 | 1024×341 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/ChatGPT Image Sep 10, 2026, 03_47_53 AM (1).png` | png | 2,833,883 | 1536×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/ChatGPT Image Sep 10, 2026, 03_47_54 AM (2).png` | png | 2,695,954 | 1536×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/ChatGPT Image Sep 10, 2026, 03_48_05 AM (1).png` | png | 2,044,747 | 1254×1254 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/ChatGPT Image Sep 10, 2026, 03_48_06 AM (2).png` | png | 2,144,722 | 1254×1254 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/AGRICA Orange Grove Harvest Worker.png` | png | 2,445,645 | 1122×1402 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/AGRICA Warehouse Loading Scene.png` | png | 2,245,345 | 1024×1536 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Agrica Loading Dock Operations (1).png` | png | 2,431,266 | 1024×1536 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Citrus Sorting Line Worker.png` | png | 2,060,767 | 1122×1402 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Orange Grove Harvest Portrait (1).png` | png | 2,501,428 | 1122×1402 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_55.jpg` | jpg | 119,984 | 427×763 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_56.jpg` | jpg | 79,812 | 428×752 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_57.jpg` | jpg | 67,460 | 431×760 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_58.jpg` | jpg | 70,920 | 435×763 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_59.jpg` | jpg | 74,367 | 418×756 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_60.jpg` | jpg | 102,483 | 434×760 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_61.jpg` | jpg | 83,073 | 430×764 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_62.jpg` | jpg | 111,450 | 461×799 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_63.jpg` | jpg | 104,614 | 449×807 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_64.jpg` | jpg | 100,640 | 469×809 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_65.jpg` | jpg | 130,147 | 460×810 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_66.jpg` | jpg | 132,372 | 459×801 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_67.jpg` | jpg | 147,162 | 459×797 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_68.jpg` | jpg | 123,262 | 453×805 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_69.jpg` | jpg | 101,661 | 453×815 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/REF_HERO/Screenshot_70.jpg` | jpg | 129,499 | 444×808 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/agrica-leaf-mask.svg` | svg | 210 | Vector | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/agrica-leaf.svg` | svg | 198 | Vector | — | contact |
| `public/assets/agrica-logo-brand.png` | png | 11,381 | 800×206 | — | contact, {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/agrica-logo.png` | png | 11,160 | 800×206 | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/categories/fresh-master.png` | png | 1,760,721 | 880×1168 | — | {lang} |
| `public/assets/categories/frozen-master.png` | png | 2,161,171 | 880×1168 | — | {lang} |
| `public/assets/company/agrica-company-strawberry-film.mp4` | mp4 | 5,700,408 | 1280×720 | 10.0 | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/agrica-company-strawberry-poster.avif` | avif | 87,364 | 1280×720 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/agrica-company-strawberry-poster.webp` | webp | 65,432 | 1280×720 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/agrica-drone-tracking-film.mp4` | mp4 | 5,700,408 | 1280×720 | 10.0 | {lang} |
| `public/assets/company/agrica-drone-tracking-poster.avif` | avif | 87,364 | 1280×720 | — | {lang} |
| `public/assets/company/agrica-drone-tracking-poster.webp` | webp | 65,432 | 1280×720 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/agrica-strawberry-field-harvest.avif` | avif | 159,366 | 1086×1448 | — | {lang}/company |
| `public/assets/company/company-master-desktop.mp4` | mp4 | 1,719,650 | 960×540 | 9.917 | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/company-master-mobile.mp4` | mp4 | 514,574 | 640×360 | 9.917 | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/facility_reveal.png` | png | 2,257,277 | 1677×938 | — | {lang}/company |
| `public/assets/company/hero_01_origin_start_keyframe.png` | png | 2,636,303 | 1672×941 | — | {lang}/company |
| `public/assets/company/human_qc.png` | png | 2,013,395 | 1672×941 | — | {lang}/company |
| `public/assets/company/origin-poster.webp` | webp | 62,642 | 960×538 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/sizing_completion.png` | png | 2,226,994 | 1672×941 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/company/team-grower-picking-v2.avif` | avif | 188,083 | 768×1024 | — | {lang}/company |
| `public/assets/company/team-harvest-crates-v2.avif` | avif | 180,597 | 768×1024 | — | {lang}/company |
| `public/assets/company/team-quality-inspector.avif` | avif | 114,857 | 768×1024 | — | {lang}/company |
| `public/assets/company_editorial_hero.jpg` | jpg | 923,750 | 928×1152 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/flags/de.svg` | svg | 232 | Vector | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/flags/eg.svg` | svg | 306 | Vector | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/flags/fr.svg` | svg | 237 | Vector | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/flags/gb.svg` | svg | 411 | Vector | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/flags/ru.svg` | svg | 231 | Vector | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/fresh_img.png` | png | 2,328,056 | 1122×1402 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/fresh_text.png` | png | 934,306 | 2172×724 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/frozen_img.png` | png | 2,583,308 | 1122×1402 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/frozen_text.png` | png | 1,190,866 | 2172×724 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/grapes_card.png` | png | 2,115,341 | 1254×1254 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/herbs-spices/families/dehydrated-vegetables.avif` | avif | 93,729 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/dehydrated-vegetables.webp` | webp | 352,306 | 1120×1400 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/flowers.webp` | webp | 267,280 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/herbs.avif` | avif | 132,405 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/herbs.webp` | webp | 355,054 | 1120×1400 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/roots.avif` | avif | 95,905 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/roots.webp` | webp | 335,570 | 1120×1400 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/seeds.avif` | avif | 111,059 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/seeds.webp` | webp | 358,878 | 1120×1400 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/spices.avif` | avif | 88,052 | 1024×1024 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/families/spices.webp` | webp | 328,770 | 1120×1400 | — | Herbs home (generated manifest / alternatives) |
| `public/assets/herbs-spices/home/form-basil-powder.avif` | avif | 50,333 | 1024×688 | — | {lang}/herbs-spices, {lang}/herbs-spices/products |
| `public/assets/herbs-spices/home/form-crushed-basil.avif` | avif | 52,335 | 1024×688 | — | {lang}/herbs-spices, {lang}/herbs-spices/products |
| `public/assets/herbs-spices/home/form-crushed.webp` | webp | 286,924 | 1120×1400 | — | {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/form-cut-sifted-basil.avif` | avif | 45,610 | 1024×688 | — | {lang}/herbs-spices, {lang}/herbs-spices/products |
| `public/assets/herbs-spices/home/form-cut-sifted.webp` | webp | 271,356 | 1120×1400 | — | {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/form-powder.webp` | webp | 293,524 | 1120×1400 | — | {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/form-tbc-peppermint.avif` | avif | 48,480 | 1024×688 | — | {lang}/herbs-spices, {lang}/herbs-spices/products |
| `public/assets/herbs-spices/home/form-tbc.webp` | webp | 288,318 | 1120×1400 | — | {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/form-whole-basil.avif` | avif | 39,769 | 1024×688 | — | {lang}/herbs-spices, {lang}/herbs-spices/products |
| `public/assets/herbs-spices/home/form-whole.webp` | webp | 273,432 | 1120×1400 | — | {lang}/herbs-spices, {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/hero-primary.webp` | webp | 341,362 | 1120×1400 | — | contact, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard |
| `public/assets/herbs-spices/home/hero-specimen-study.jpg` | jpg | 730,097 | 1200×896 | — | {lang}/herbs-spices |
| `public/assets/herbs-spices/products/basil.webp` | webp | 379,676 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/black-cumin.webp` | webp | 317,930 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/chamomile.webp` | webp | 359,284 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/dill.webp` | webp | 362,122 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/lemon-grass.webp` | webp | 331,094 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/marjoram.webp` | webp | 350,682 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/moringa.webp` | webp | 332,850 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/oregano.webp` | webp | 342,918 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/parsley.webp` | webp | 342,346 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/peppermint.webp` | webp | 346,244 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/rosemary.avif` | avif | 50,982 | 1024×768 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/rosemary.webp` | webp | 345,870 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/herbs-spices/products/spearmint.webp` | webp | 365,466 | 1448×1086 | — | Herbs catalogue (generated manifest) |
| `public/assets/hero/card-1-crate.jpg` | jpg | 848,975 | 896×1200 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/card-2-leaves.jpg` | jpg | 115,145 | 600×800 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/card-3-orchard.jpg` | jpg | 244,066 | 900×600 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/card-4-hands.jpg` | jpg | 95,156 | 600×800 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/card-5-farm.jpg` | jpg | 93,504 | 600×800 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/hero-01-origin-poster.avif` | avif | 14,847 | 640×360 | — | {lang} |
| `public/assets/hero/hero-01-origin-poster.webp` | webp | 51,078 | 640×360 | — | {lang} |
| `public/assets/hero/hero-01-origin.mp4` | mp4 | 1,788,056 | 640×360 | 7.056 | {lang}, {lang}/company |
| `public/assets/hero/hero-01-origin.webm` | webm | 6,202,756 | Unavailable | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/hero-bg.avif` | avif | 176,758 | 1376×768 | — | {lang} |
| `public/assets/hero/hero-bg.jpg` | jpg | 796,625 | 1376×768 | — | {lang} |
| `public/assets/hero/hero-bg.webp` | webp | 152,212 | 1376×768 | — | {lang} |
| `public/assets/hero/hero_02_processing_final.mp4` | mp4 | 4,130,761 | 960×540 | 5.333 | {lang}, {lang}/company |
| `public/assets/hero/hero_02_processing_poster.avif` | avif | 212,499 | 1280×720 | — | {lang} |
| `public/assets/hero/hero_02_processing_poster.png` | png | 2,560,221 | 1920×1080 | — | {lang} |
| `public/assets/hero/hero_02_processing_poster.webp` | webp | 208,070 | 1280×720 | — | {lang} |
| `public/assets/hero/hero_03_packing_final.mp4` | mp4 | 5,136,648 | 1920×1080 | 7.0 | {lang}, {lang}/company |
| `public/assets/hero/hero_03_packing_poster.avif` | avif | 61,558 | 1280×720 | — | {lang} |
| `public/assets/hero/hero_03_packing_poster.png` | png | 2,133,847 | 1920×1080 | — | {lang} |
| `public/assets/hero/hero_03_packing_poster.webp` | webp | 52,544 | 1280×720 | — | {lang} |
| `public/assets/hero/hero_04_shipping_final.mp4` | mp4 | 4,976,497 | 1280×720 | 7.042 | {lang}, {lang}/company |
| `public/assets/hero/hero_04_shipping_poster.avif` | avif | 192,293 | 800×1200 | — | {lang} |
| `public/assets/hero/hero_04_shipping_poster.webp` | webp | 171,004 | 800×1200 | — | {lang} |
| `public/assets/hero/hero_keyframe_01_origin.png` | png | 5,908,802 | 1920×1080 | — | {lang} |
| `public/assets/hero/u1-the-land-poster.png` | png | 5,895,036 | 2688×1152 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/u1-the-land.mp4` | mp4 | 10,190,997 | 1470×630 | 5.042 | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/u2-the-standard-poster.png` | png | 4,197,656 | 2688×1152 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/hero/u2-the-standard.mp4` | mp4 | 5,203,916 | 1470×630 | 5.042 | {lang}/company |
| `public/assets/lemon_card.png` | png | 1,945,267 | 1254×1254 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/logo.png` | png | 319,652 | 2172×724 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/product-atlas.png` | png | 1,897,672 | 1536×1024 | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/products/fresh/artichokes-profile.avif` | avif | 133,595 | 750×1123 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/artichokes.avif` | avif | 58,059 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/blueberries-final.avif` | avif | 77,969 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/blueberries-profile.avif` | avif | 152,186 | 736×920 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/carrots-final.avif` | avif | 63,284 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/carrots-profile.avif` | avif | 114,276 | 736×981 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/dates-final.avif` | avif | 55,305 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/dates-profile.avif` | avif | 276,361 | 823×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/egyptian-limes-final.avif` | avif | 47,108 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/egyptian-limes-profile.avif` | avif | 188,228 | 648×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/egyptian-limes.avif` | avif | 65,218 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/garlic-profile.avif` | avif | 82,583 | 626×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/garlic.avif` | avif | 50,633 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/grapefruit.avif` | avif | 66,432 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/grapes-profile.avif` | avif | 91,401 | 648×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/green-beans-profile.avif` | avif | 23,670 | 236×354 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/green-beans.avif` | avif | 69,999 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/guava-final.avif` | avif | 54,276 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/guava-profile.avif` | avif | 62,865 | 896×712 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/lemons-final.avif` | avif | 45,248 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/lemons-profile.avif` | avif | 144,348 | 649×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/lemons.avif` | avif | 56,720 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/mandarins-final.avif` | avif | 57,264 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/mandarins-profile.avif` | avif | 89,137 | 736×736 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/mandarins.avif` | avif | 57,137 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/mangoes-final.avif` | avif | 77,879 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/mangoes-profile.avif` | avif | 84,961 | 768×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/onions-profile.avif` | avif | 18,261 | 236×360 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/onions.avif` | avif | 43,276 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/oranges-luminous-preview.avif` | avif | 49,038 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/oranges-profile.avif` | avif | 129,654 | 736×1104 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/oranges.avif` | avif | 67,381 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/pomegranates-final.avif` | avif | 65,764 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/pomegranates-profile.avif` | avif | 127,810 | 736×736 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/potatoes-final.avif` | avif | 53,025 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/potatoes-profile.avif` | avif | 81,615 | 658×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/strawberries-final.avif` | avif | 86,308 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/strawberries-profile.avif` | avif | 241,479 | 649×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/sweet-potatoes-final.avif` | avif | 77,516 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/sweet-potatoes-profile.avif` | avif | 146,619 | 648×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/taro-final.avif` | avif | 86,023 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/taro-profile.avif` | avif | 245,544 | 768×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/watermelon-final.avif` | avif | 75,060 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/fresh/watermelon-profile.avif` | avif | 200,585 | 648×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/artichokes-final.avif` | avif | 63,409 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/artichokes-profile.avif` | avif | 124,185 | 896×597 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/artichokes.avif` | avif | 79,796 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/broccoli-final.avif` | avif | 52,322 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/broccoli-profile.avif` | avif | 103,939 | 735×490 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/french-fries-profile.avif` | avif | 82,186 | 735×414 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-beans-final.avif` | avif | 63,908 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-beans-profile.avif` | avif | 156,884 | 896×896 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-beans.avif` | avif | 87,509 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-peas-profile.avif` | avif | 135,130 | 750×1001 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-peas-validation.avif` | avif | 46,778 | 896×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/green-peas.avif` | avif | 66,281 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/guava.avif` | avif | 79,921 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/mango-final.avif` | avif | 51,766 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/mango-profile.avif` | avif | 105,771 | 720×1080 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/mango.avif` | avif | 71,936 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/mixed-vegetables-final.avif` | avif | 70,035 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/mixed-vegetables-profile.avif` | avif | 78,415 | 735×412 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/molokhia-final.avif` | avif | 57,548 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/molokhia-profile.avif` | avif | 106,079 | 896×597 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/molokhia.avif` | avif | 121,175 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/okra-final.avif` | avif | 66,600 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/okra-profile.avif` | avif | 248,598 | 768×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/okra.avif` | avif | 72,530 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/pomegranate-arils-final.avif` | avif | 65,440 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/pomegranate-arils-profile.avif` | avif | 198,915 | 896×896 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/pomegranate-arils.avif` | avif | 85,798 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/pre-fried-french-fries-final.avif` | avif | 52,572 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/spinach.avif` | avif | 97,274 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/strawberries-final.avif` | avif | 60,155 | 896×1120 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/strawberries-profile.avif` | avif | 148,113 | 768×1152 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/products/frozen/strawberries.avif` | avif | 84,609 | 960×720 | — | Produce catalogue/seasonal cards (manifest) |
| `public/assets/s1.avif` | avif | 125,496 | 800×1000 | — | {lang} |
| `public/assets/s1.png` | png | 442,053 | 1122×1402 | — | {lang} |
| `public/assets/s1.webp` | webp | 155,272 | 800×1000 | — | {lang} |
| `public/assets/s2.avif` | avif | 75,708 | 900×507 | — | {lang} |
| `public/assets/s2.png` | png | 492,596 | 1672×941 | — | {lang} |
| `public/assets/s2.webp` | webp | 118,838 | 900×507 | — | {lang} |
| `public/assets/s3.avif` | avif | 124,365 | 800×800 | — | {lang} |
| `public/assets/s3.png` | png | 494,919 | 1254×1254 | — | {lang} |
| `public/assets/s3.webp` | webp | 141,188 | 800×800 | — | {lang} |
| `public/assets/season_crop_1.png` | png | 2,833,883 | 1536×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/season_crop_2.png` | png | 2,695,954 | 1536×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/season_crop_3.png` | png | 2,044,747 | 1254×1254 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/season_crop_4.png` | png | 2,144,722 | 1254×1254 | — | {lang}/standard |
| `public/assets/seasons/heroes/hero-date.avif` | avif | 170,919 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-date.png` | png | 951,585 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-date.webp` | webp | 201,648 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-grape.avif` | avif | 164,770 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-grape.png` | png | 928,897 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-grape.webp` | webp | 189,106 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-mango.avif` | avif | 115,918 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-mango.png` | png | 857,534 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-mango.webp` | webp | 141,412 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-orange.png` | png | 1,251,107 | 1024×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-orange.webp` | webp | 74,754 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-pomegranate.png` | png | 1,127,888 | 1024×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-pomegranate.webp` | webp | 99,222 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-potato.avif` | avif | 152,962 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-potato.png` | png | 1,282,352 | 1024×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-potato.webp` | webp | 130,190 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-strawberry.png` | png | 1,098,081 | 1024×1024 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-strawberry.webp` | webp | 79,002 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/seasons/heroes/hero-sweet-potato.avif` | avif | 114,035 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-sweet-potato.png` | png | 811,549 | 840×840 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/seasons/heroes/hero-sweet-potato.webp` | webp | 136,460 | 840×840 | — | {lang}, {lang}/products |
| `public/assets/stage_04.png` | png | 1,903,439 | 1672×941 | — | {lang}/standard |
| `public/assets/stage_05.png` | png | 2,093,672 | 1672×941 | — | {lang}/standard |
| `public/assets/stage_06.png` | png | 1,971,980 | 1672×941 | — | {lang}/standard |
| `public/assets/standard_stage_01_source.jpg` | jpg | 740,546 | 1376×768 | — | {lang}/standard, {lang}/company |
| `public/assets/standard_stage_02_inspect.jpg` | jpg | 695,144 | 1376×768 | — | {lang}/standard |
| `public/assets/standard_stage_03_prepare.jpg` | jpg | 692,702 | 1376×768 | — | {lang}/standard |
| `public/assets/standard_stage_04_pack.jpg` | jpg | 1,903,439 | 1672×941 | — | {lang}/company |
| `public/assets/standard_stage_05_control.jpg` | jpg | 2,093,672 | 1672×941 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/standard_stage_06_export_handover.jpg` | jpg | 1,971,980 | 1672×941 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/three-worlds.png` | png | 2,556,277 | 1536×1024 | — | {lang}, {lang}/products, {lang}/standard, {lang}/herbs-spices, {lang}/herbs-spices/products, {lang}/herbs-spices/standard, {lang}/company |
| `public/assets/three_worlds_fresh.jpg` | jpg | 937,412 | 896×1200 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/three_worlds_frozen.jpg` | jpg | 770,682 | 896×1200 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/video 2.mp4` | mp4 | 4,052,716 | 1280×720 | 5.196 | No direct reference found; verify generated paths/alternatives |
| `public/assets/video 3.mp4` | mp4 | 3,676,942 | 1280×720 | 10.006 | No direct reference found; verify generated paths/alternatives |
| `public/assets/video_hero.mp4` | mp4 | 6,305,935 | 1280×720 | 10.006 | No direct reference found; verify generated paths/alternatives |
| `public/assets/video_hero_thumb.jpg` | jpg | 82,273 | 1280×720 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/world-card-fresh.png` | png | 2,254,990 | 1145×1374 | — | No direct reference found; verify generated paths/alternatives |
| `public/assets/world-card-frozen.png` | png | 2,315,286 | 1145×1374 | — | No direct reference found; verify generated paths/alternatives |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_20_55 PM-1.png` | png | 1,216,665 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_20_57 PM-2.png` | png | 1,163,493 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_21_05 PM-1.png` | png | 1,232,336 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_21_07 PM-2.png` | png | 1,203,292 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_21_08 PM-3.png` | png | 1,122,009 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_21_12 PM.png` | png | 1,074,872 | 1254×1254 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_21_19 PM.png` | png | 947,595 | 1294×1216 | — | Produce + herbs home certificate strip |
| `public/certificates/ChatGPT Image Sep 27, 2026, 08_23_17 PM.png` | png | 626,909 | 1448×1086 | — | Produce + herbs home certificate strip |
| `public/herbs-background/dk-background.png` | png | 3,007,474 | 1672×941 | — | No direct reference found; verify generated paths/alternatives |
| `public/herbs-background/mb-background.png` | png | 2,938,528 | 941×1672 | — | No direct reference found; verify generated paths/alternatives |

## Prioritized roadmap and improvement potential

### P0 — High-impact quick wins

1. **F01 company posters**: first address the measured desktop LCP image using the same frames. Small effort, strong direct LCP evidence.
2. **F04 + F05 seasonal loading**: stop eager offscreen original/crop-card work on both home and products. Small effort, clear request evidence.
3. **F06 certificates**: reduce 8.59 MB of eventual image capacity while preserving the strip. Small effort, strongest full-scroll byte saving.
4. **F09 frozen fallback sprite**: replace oversized atlas delivery while preserving current fallback appearance. Small effort, measured 2.56 MB request.
5. **F03 hero source scheduling**: defer inactive films while retaining visible posters and seamless next-film readiness. Small–Medium effort.
6. **F07 standard imagery**: responsive derivatives for six stages; coordinate geometry checks with scroll animations. Small–Medium effort.

### P1 — Structural optimizations

1. **F02 company source lifecycle**: active breakpoint and visibility control; use the existing home company media pattern. Depends on visual posters/fallbacks being ready. Medium effort.
2. **F08 catalogue rendering/navigation**: isolate query state and remove redundant herbs filter server work if semantics can be retained. Medium effort; highest URL/SEO regression risk.
3. **F11 herbs responsive gallery loading**: reduce eager hidden-layout image work. Small–Medium effort.
4. **F15 CSS ownership**: audit compressed route bytes and cascade dependencies, then scope route styles. Medium effort, broad visual risk.
5. **F10 dossier readiness**: design-approved timing refinement; existing animation stays. Small–Medium effort.
6. **F13 immutable media delivery**: fingerprint/version first, then long browser cache; include deployment invalidation checks. Medium effort.
7. Route-specific locale payload and client boundaries: profile first; keep interactivity in islands and static content server rendered where safe. Lazy-load quote drawers/flight overlays with deliberate intent warming if this meaningfully reduces initial JS. Static imports exist, but exact exclusive bytes and hydration CPU are not yet attributed. Do not fragment every component or defer essential locale/header behavior.

### P2 — Optional, measurement-led

- F12 suspend offscreen animation/timers; F14 optimize scroll geometry only after trace attribution.
- Assess responsive hero backdrop and first-film encodes against real mobile bandwidth while preserving cinema quality.
- Validate browser warm-cache behavior before setting savings targets for F13.
- Remove unused dependencies/components only for maintenance value; do not promise a transfer reduction without bundle evidence.
- Consider RUM after checking whether existing Vercel/CrUX data is accessible. No new dependency is a prerequisite for media fixes.

### Estimated potential, with uncertainty

These estimates are **not additive site-wide** and do not predict Lighthouse scores:

| Change | Potential, estimated | Confidence / limitation |
|---|---|---|
| Company poster derivatives | 70–95% fewer poster bytes; potentially seconds under constrained delivery | High that bytes shrink; LCP outcome depends on poster/video competition and visual review |
| Certificate derivatives | ~6.9–8.2 MB less eventual strip payload | Medium; must verify readability and actual scroll download policy |
| Frozen fallback derivative | ~1.8–2.4 MB less on cold frozen catalogue visits | Medium; must preserve existing fallback appearance |
| Standard derivatives | ~4.9–7.3 MB less full-journey image payload | Medium; device widths/quality and caching affect result |
| Seasonal preload gating | Defer up to ~1.07 MB of original crops plus eager card responses | High on original capacity; actual unique savings vary by month, cache and selected representation |
| Inactive/hidden film gating | MB-scale capacity can leave critical path; avoid hidden-layout requests | High mechanism confidence; byte delta depends on partial range fetch/autoplay policy |
| Catalogue/static CSS/JS refinements | Lower server work/shared payload; magnitude unknown | Requires controlled isolated runs and attribution |
| Dossier readiness | Potentially a few hundred ms earlier safe interaction | High on authored timing, uncertain UX improvement without design testing |

The current data cannot support “X% faster site-wide,” an INP improvement percentage, or a guaranteed CWV pass. A credible target is fewer unnecessary critical-path requests and substantially smaller full-scroll payload, then a measured LCP improvement on company/home/standard. Preserve CLS near its observed baseline.

## Recommended first implementation batch — awaiting approval

Keep this first batch narrow and independently reviewable:

1. Same-frame modern company posters, preserving crops and fallback.
2. Near-viewport/intent-gated seasonal originals and lazy compact cards.
3. Sized certificate derivatives with identical strip geometry.
4. Compact frozen fallback atlas preserving current card appearance.
5. Inactive homepage film source deferral, retaining active-film autoplay and adjacent posters.

This batch covers the highest-ROI mechanisms (F01, F04/F05, F06, F09, F03). Treat company video lifecycle (F02) as the next focused batch because it has more responsive/playback state transitions. Include F07 soon afterward. Do not mix CSS restructuring, catalogue rendering changes or animation timing redesign into the first visual review.

## Tests required to prove improvement without visual regressions

### Reproducible performance proof

- Pin the deployment/commit and browser version. Run provisioned Lighthouse mobile **and** desktop at least three times for all seven English page types plus contact; report median and spread for score, LCP/FCP/TTFB/Speed Index/TBT/CLS. Retain JSON/HTML reports and trace/HAR evidence. Run home and products in Arabic; smoke all other localized URLs.
- Measure cold browser cache and warm navigation separately; test direct entry and client navigation, fresh/frozen query entry, herbs family deep link and browser back/forward. Isolate each run so unfinished media from another navigation cannot distort it.
- Define observation windows and video policy: initial viewport until stable, first 15 seconds, scroll to bottom, every carousel film, all workflow tabs, then return. Report completed and partial media transfer, unique URLs, requests, total encoded/decoded bytes and actual image selections. Avoid a single “page weight” for a looping-media page without a window definition.
- Require the first batch to eliminate unselected/offscreen seasonal originals and inactive homepage-film requests in the initial waterfall, except explicitly budgeted adjacent warming. Check both browser and edge cache headers, compression and 206 range seeking.
- Obtain field CWV/CrUX or RUM data if available; evaluate p75 LCP/INP/CLS over a comparable traffic period. Do not substitute lab TBT or the 24–32 ms scripted click for field INP.
- Capture Chrome Performance traces on a physical mid-range Android phone: rapid product open/close, search typing, filters, quote actions, month changes, hero swipes and a full-page scroll. Attribute long tasks, layout, paint, scripting and dropped frames to actual functions. The current synthetic scroll sample alone cannot prove smoothness.

### Visual, interaction, accessibility and SEO regression proof

- Screenshot current/proposed states at 390×844, 768, 1024, 1440 and 1920 widths; English and Arabic RTL minimum, plus long German/Russian/French text checks. Compare exact video poster frame, crop, color, texture, headline wrapping, card shadows and section geometry.
- Film carousel: initial poster paint, all four films, autoplay blocked, next/previous/swipe, hover pause, seven-second progression, breakpoint resize, offscreen return, tab hidden/visible, slow connection and video errors. No black flashes; selected film reliably starts.
- Company: desktop/mobile source selection, workflow tabs, scroll into each video, resize while playing, cached poster visibility, reduced motion, save-data, background tab. No hidden video should request merely because its markup exists.
- Products: fresh/frozen and all family/search states, rapid repeated open/close, Escape, backdrop close, focus trap/restore, scroll lock/restoration, quote add/remove and drawer, resized viewport while expanded. Preserve 3D handoff, Arabic alignment and readable specification layout. Test touch input on a real device, not just emulated mouse clicks.
- Seasonal orbit: correct Cairo month, month switch/swipe, selected crop readiness, eager-to-lazy handoff under fast scroll, no hydration warning or new layout shift. Test January server default transition deliberately.
- Herbs: desktop accordion, mobile alternatives, forms rotation/swipe, process stack/tab/swipe, family filter URL/history, ingredient inspection and enquiry. Preserve reduced-motion behavior.
- Contact: profiles and vCard downloads, contact links, artwork sizes and canonical/Open Graph metadata. Do not submit real external enquiries during diagnostics.
- Preserve all current language paths, query parameters, semantic content, metadata/indexing rules and accessibility state. A build/typecheck and existing focused route/i18n/product tests are appropriate during implementation; audit did not rebuild or rewrite test artifacts. Existing browser QA scripts require an external CDP endpoint and are functional/visual scaffolding, not Lighthouse.

## Completion statement

This audit produced only the two requested Markdown deliverables under `docs/performance/`. Application files, dependencies and deployment were not changed. Pre-existing changes in `.gitignore`, `next-env.d.ts`, `package.json`, `package-lock.json` and untracked `eslint.config.mjs` were present before the audit and remain untouched. **Implementation requires approval.**
