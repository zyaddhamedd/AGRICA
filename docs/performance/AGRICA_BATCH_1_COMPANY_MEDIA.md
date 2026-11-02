# Batch 1 — Company media optimization

20 October 2026 (Africa/Cairo). Implemented only the approved Company scope corresponding to audit findings F01/F02 and Company loading priority. No commits, pushes, deployments, package changes or changes to other page implementations.

## What changed

- **`src/components/company/CompanyPageContent.tsx`**: routes the existing hero, desktop/mobile workflow, quality and logistics videos through a Company-only loading component. All video URLs, copy, section structure, original poster frames, styles and GSAP choreography remain intact. Removed the below-fold origin image's unconditional preload/`priority`; the hero poster receives high priority instead.
- **`src/components/company/CompanyVideo.tsx`**: sources attach only for the eligible CSS breakpoint near the viewport. Playback starts only in view. Distant, hidden-breakpoint and background-tab videos unload their sources, aborting unused range requests; playback position is retained for return. Reduced-motion/save-data users get the same-frame poster. A loaded poster remains behind a transparent-until-playing video, including errors and rejected autoplay. No video source or native poster URL is emitted in initial HTML. Existing workflow selection still resets a newly selected film as before.
- **`src/components/company/CompanyVideo.module.css`**: a Company-only stacking layer; image and video both retain `object-fit: cover` and the existing frame's dimensions. No section layout or animation styles were edited.
- **`src/components/company/companyPosters.ts`**: maps the five original frames to their prebuilt width variants, including the portrait shipping frame. Uses responsive `srcset`/`sizes`; only the hero is eager/high priority. Other posters mount within a 300 px viewport margin. A lazy `noscript` poster supports non-hydrated content. Unknown future poster URLs safely fall back to their supplied URL.
- **`public/assets/company/posters/`**: 14 new WebP derivatives, quality 86, at widths 640, 1024 and up to 1672. Shipping has only 640/1024 variants because its source is 1024 px wide; no upscaling. Full source frame retained with no crop baked into the derivative. Largest variant is selected when cover geometry/DPR requires it; small variants remain available for smaller media frames.
- **`scripts/optimize-company-posters.mjs`**: reproducible derivative generator using the Sharp already installed with Next.js. `node scripts/optimize-company-posters.mjs`. Never writes to originals.
- **`test/company-media-browser.test.mjs`**: repeatable CDP regression checks using built-in Node APIs, no new testing dependency. Run against an isolated Chrome debugging session and a production server: `COMPANY_BASE_URL=http://127.0.0.1:3189 CHROME_DEBUG_URL=http://127.0.0.1:9349 node test/company-media-browser.test.mjs`.

`src/data/company.ts`, all original images/videos, the original Company layout CSS, all locale dictionaries, routes, SEO metadata and shared components were left untouched. Hashes of package files, `.gitignore` and Company data match the pre-task snapshot; pre-existing worktree changes were preserved.

## Measured asset savings

The table uses actual local file sizes for each original versus its **largest** derivative; these are asset-size savings, not a promise of initial-page savings. Smaller selected variants can save more. Five distinct largest posters total 11,241,680 → 1,079,324 bytes (**90.4% smaller**).

| Frame | Original bytes | Largest derivative bytes | Reduction |
|---|---:|---:|---:|
| Origin | 2,636,303 | 307,754 | 88.3% |
| Sorting | 2,257,277 | 259,812 | 88.5% |
| Packing | 1,903,439 | 139,194 | 92.7% |
| Quality | 2,013,395 | 150,822 | 92.5% |
| Shipping | 2,431,266 | 221,742 | 90.9% |


## Equivalent local production measurements

Both versions were freshly built from the same working tree/package versions, changing only this batch's Company implementation. The original Company component was restored only temporarily to build the extended baseline, and the optimized source was immediately put back. The final build contains the optimized version.

Chrome 155.0.8059.85, Next 16.3.4, local `next start`, isolated fresh tab for each run, browser cache disabled, server image transformations warmed separately. No scrolling or interaction during load samples. Desktop: 1440×900/DPR1/CPU1, nominal 40 ms latency and 10 Mbps download. Mobile/Arabic: 390×844/DPR3/CPU4, nominal 150 ms and 1.6 Mbps. Chrome retained its desktop user agent; these are viewport/CPU/network emulations, not physical phones. Document responseStart was approximately 6–10 ms despite the nominal latency settings, so these are not calibrated real-world mobile network conditions. An explicit autoplay policy allowed muted playback in the diagnostic browser; rejected play() was also tested separately.

The primary nine samples per version use **15-second capture windows**, three runs per profile. Request counts are distinct observed CDP request IDs, including video ranges, not unique asset URLs. Encoded transfer includes completed request totals and `Network.dataReceived` encoded bytes for incomplete requests, avoiding the earlier audit's completed-only byte undercount. Total video transfer can include multiple ranges of one film. Totals describe a fixed initial-view interval, **not a full-scroll or lifetime page weight**. Original pages were still loading at 15 seconds; optimized pages were complete. Values are medians unless stated otherwise.

| 15-second profile (3 runs/version) | Requests before → after | Video range requests before → after | Total encoded MB before → after | Byte reduction |
|---|---:|---:|---:|---:|
| desktop | 57 → 36 | 20 → 3 | 18.642 → 2.502 | 86.6% |
| mobile | 37 → 36 | 11 → 3 | 2.959 → 2.559 | 13.5% |
| arabic-mobile | 37 → 36 | 11 → 3 | 2.962 → 2.562 | 13.5% |

Five distinct source films were requested initially before, versus **only the hero film** after. Multiple range requests for that one film are normal. No initial workflow, quality or logistics film request remained in the optimized samples.


The original 15-second mobile LCP candidates were the smaller secondary origin image, because the larger hero had not painted yet. The optimized mobile hero was already a candidate. The raw short-window LCP numbers therefore appear worse after optimization and must **not** be presented as a genuine before/after hero regression or as an improvement. Longer matched captures below include the late original hero. Desktop LCP is already a hero candidate in both versions.

| 15-second profile | Raw last-seen LCP before → after | FCP before → after | Interpretation |
|---|---:|---:|---|
| desktop | 11.912 s → 0.744 s | 0.180 s → 0.200 s | Hero in both versions; 93.8% lower lab LCP |
| mobile | 2.412 s → 4.312 s | 0.900 s → 0.904 s | Original hero censored at cutoff; use extended result below |
| arabic-mobile | 2.728 s → 4.988 s | 0.932 s → 1.048 s | Original hero censored at cutoff; use extended result below |


### Extended mobile LCP check

One additional **90-second capture per profile/version**, same device/network/CPU settings, isolated no-interaction navigation. These are single sanity-check samples rather than repeated medians. Both versions reached document `complete` by the cutoff.

| Profile | Hero LCP before → after | Total encoded MB before → after (90 s) | Requests before → after |
|---|---:|---:|---:|
| mobile | 68.040 s → 4.308 s | 17.929 → 2.559 | 57 → 36 |
| arabic-mobile | 69.948 s → 4.896 s | 17.932 → 2.562 | 57 → 36 |

The late original hero appears at ~68–70 seconds under these constrained lab settings. Optimized hero LCP remains ~4–5 seconds even with the longer capture. This resolves the misleading small-image LCP in the initial 15-second baseline; it does not predict a 60-second production improvement for actual visitors.


All captured CLS observations excluded recent-input shifts and were zero in the measured windows. FCP is broadly unchanged; this batch principally changes hero readiness and media competition. TTFB is local server timing and cannot establish a production origin improvement. No field INP or Lighthouse score was measured. No new production deployment exists, so the earlier public-production audit numbers are **not** compared directly with these local after results.

## Validation and visual review

- `npm run build`: passed on the original baseline and optimized implementation; final optimized build passed again after extended baseline capture. All five Company language routes remain prerendered.
- `npm run typecheck`: passed, including after restoring the pre-existing `next-env.d.ts` contents.
- Scoped ESLint on the changed TSX/TS files, generator and browser regression test: passed.
- Existing locale/routing/division tests passed using `node --import tsx --test test/i18n.test.ts test/routing.test.ts test/divisions.test.ts`.
- New production-browser lifecycle regression test: **PASS en/ar/ru/de/fr**. Checked initial hero-only attachment and actual playback; no eager workflow/quality/logistics media; every desktop workflow tab; every Arabic mobile workflow film; 860/861 breakpoint handoff and resizing back to 390/1440; offscreen return; simulated document visibility changes; runtime reduced-motion changes; save-data; blocked media requests; rejected autoplay; poster decode and no uncaught runtime exceptions.
- Captured **21 before/after screenshot pairs**, desktop English, mobile English and mobile Arabic: hero, each workflow poster, quality and logistics. Used identical reduced-motion mode and blocked MP4 requests to freeze the same poster frames. All section/media bounding geometry and visible text match exactly. No horizontal overflow appeared before or after. There are expected lossy-image pixel differences, concentrated in the media; mean absolute RGB channel difference across each screenshot ranges approximately 0.07–1.85 out of 255. Tiny edge/antialias differences near frame boundaries are not layout changes. No new visual regression was identified in the reviewed screenshots.
- Separately inspected original/derivative frame pairs for origin, sorting and shipping, plus page screenshots including quality, workflow and Arabic hero. Frames, cover crop, colors and cinematic overlays remain consistent at the inspected sizes. Compression is not pixel-lossless, and numeric image error alone is not proof of perceptual equivalence.
- Final production HTML: eight video elements, **zero `src` attributes**, zero native poster URLs, and exactly **one Company poster preload** (the responsive hero). Final rebuilt-artifact browser regression test passed again for all five languages.
- Original media remain unchanged in Git; derivative dimensions were checked with Sharp. No source video was re-encoded or replaced.

Durable per-run request/transfer data, poster sizes and visual-comparison results: [measurement evidence](evidence/BATCH_1_COMPANY_MEDIA.json). Detailed temporary screenshots and diagnostic scripts are under `/tmp/agrica-batch1/` in this workspace; they are not required runtime assets and may not persist indefinitely.

## Remaining risks and intentional tradeoffs

1. Mobile hero LCP still lands around 4–5 seconds in these lab profiles; the original 1.79 MB hero film is unchanged. These are local lab results. Production CDN/region/cold image transformations, hardware decode, Safari/iOS and a physical mid-range Android device still need staging/release smoke checks. This batch does not establish field CWV/INP gains or a guaranteed Lighthouse score.
2. Unloading distant/background video deliberately gives up its buffer. Returning may perform another range request or briefly show the retained poster before resuming at the saved position. Browser caching headers and original video encodes were intentionally left unchanged. This is the main tradeoff for stopping invisible transfers.
3. Fast scrolling on a constrained connection can expose the original-frame poster until the newly visible video is ready. The poster is pre-discovered near the viewport; no unrelated preload-all policy was added. Normal muted autoplay, loop and playsInline behavior is retained while visible; reduced-motion/save-data deliberately use posters.
4. Five-language route and RTL behavior passed; Company editorial copy is exactly the pre-existing copy, including any pre-existing untranslated text or clipping. No unrelated content/design corrections were mixed in.
5. WebP is lossy. The full-resolution same-frame variants and unchanged cover crop protect quality; final premium-design approval should include high-DPR physical displays. No new black-poster, transition, layout or interaction regression was observed in the stated tests.

Only this Company batch was implemented. Seasonal cards, certificates, frozen atlas, global CSS, route rendering and all other roadmap work remain unchanged. **Stop here; further implementation requires approval.**
