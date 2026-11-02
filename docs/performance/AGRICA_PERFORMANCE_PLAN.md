# AGRICA prioritized performance implementation plan

20 October 2026. **Audit only. All changes below require approval.** Evidence, exact locations, risk and estimates: [full audit](AGRICA_PERFORMANCE_AUDIT.md).

## Current baseline

20 production Chrome load samples across ten URLs × desktop/mobile profiles. Single runs, 8/14-second windows; some pages still loading. These are CDP lab observations, not Lighthouse or field results.

| Representative route | Desktop LCP | Mobile-emulated LCP |
|---|---:|---:|
| Home | 3.26 s | 4.43 s |
| Products, fresh | 5.97 s | 7.99 s |
| Products, frozen | 0.42 s | 1.21 s |
| Company | 5.57 s | 13.86 s |
| Standard | 6.22 s | 6.04 s |
| Herbs home | 1.00 s | 3.84 s |
| Herbs products | 4.24 s | 2.18 s |
| Herbs standard | 0.98 s | 8.74 s |
| Contact | 0.68 s | 1.74 s |

LCP is the last candidate observed, not a finalized percentile. Large state/sample variation requires repeat runs. Observed CLS was effectively zero (one desktop herbs sample ~0.00002). Completed script transfer ~141–262 KB. Full media page weight remains unknown beyond the cutoff. Lighthouse/Speed Index/TBT unavailable: runner absent, no packages installed, hosted PSI returned 429 quota exceeded. Field INP/CWV unavailable. Local product overlay mounted in 22/45 ms desktop/mobile but became interactive at 494/516 ms; animation gate is the main observed readiness delay.

## P0 — High-impact quick wins, ranked by impact/effort

| Order | Approval checklist | Evidence / expected outcome | Effort | Regression concern |
|---|---|---|---|---|
| 1 | [ ] F01: same-frame company poster derivatives | Measured LCP PNG 2.64 MB; target 70–95% fewer poster bytes, validate LCP | Small | Exact frame, crop, sharpness |
| 2 | [ ] F04/F05: gate original crop preloads; lazy offscreen compact cards | Eight originals total 1.07 MB; eager card responses also observed | Small | Month-switch readiness, Cairo month, SSR parity |
| 3 | [ ] F06: sized certificate derivatives | Eight originals 8.59 MB; estimated 6.9–8.2 MB full-scroll saving | Small | Seal/text quality; preserve strip geometry |
| 4 | [ ] F09: compact frozen fallback atlas | Measured 2.56 MB sprite request; estimated 1.8–2.4 MB saving | Small | Preserve missing-product fallback appearance |
| 5 | [ ] F03: defer inactive hero-film sources | Four attached sources, 16.03 MB combined asset capacity; defer actual unwanted range traffic | Small–Medium | First transition, autoplay, swipe |
| 6 | [ ] F07: responsive standard-stage delivery | Six source images total 8.10 MB; estimated 4.9–7.3 MB full-journey saving | Small–Medium | Stage geometry, scroll triggers, framing |

**Recommended first batch:** orders 1–5, each independently reviewable. Preserve design, all four films, animations, locale behavior, SEO and functionality. Do not combine this batch with CSS or route-rendering restructuring. Estimates are not guaranteed, not additive across the whole site, and not Lighthouse score predictions.

## P1 — Structural work

- [ ] F02: company video sources only for active breakpoint and near-visible sections; visibility-aware playback. Hidden mobile sources were requested on desktop. **Medium**; depends on reliable posters. Test breakpoint changes, workflow tabs, blocked autoplay and background return.
- [ ] F08: evaluate static catalogue shells and localized URL-state boundaries; remove redundant herbs family RSC navigation where safe. **Medium**; preserve deep links, back/forward, query defaults and useful server HTML. No-store is confirmed; persistent origin slowness is not.
- [ ] F11: defer hidden/eager herbs gallery images without degrading visible previews. **Small–Medium**; test desktop accordion and mobile swap.
- [ ] F15: attribute compressed CSS, then scope products/standard/hero CSS away from unrelated routes. **Medium**; broad cascade/RTL risk, separate visual review.
- [ ] F10: design-approved earlier safe dossier readiness/close while preserving cinematic flight. **Small–Medium**; test focus races, rapid actions and accidental clicks.
- [ ] F13: version/fingerprint public media, then apply appropriate long browser caching. **Medium**; versioning must precede headers to prevent stale content.
- [ ] Profile exclusive client bundles, full dictionary serialization (~26 KB raw English JSON) and hydration before splitting drawers/overlays or locale context. **Medium**; intent warming must avoid first-click delays. Do not assume all locales ship or that client components are client-only rendered.

## P2 — Optional, profile first

- [ ] F12: pause offscreen LogoLoop and carousel timers, retain resume position and reduced-motion behavior. Small.
- [ ] F14: trace scroll geometry; batch/cache reads only if attributable layout cost matters. Medium. Existing navbar rAF throttling should remain.
- [ ] Evaluate responsive cinematic encodes on physical mobile after initial request waste is removed.
- [ ] Obtain existing CrUX/RUM/Vercel metrics access; add telemetry only if it fills a real gap.

Do not prioritize: backend/database caching, N+1 fixes, generic CDN replacement, compression packages, removing all animations, or replacing GSAP. No supporting evidence. Motion is not reachable from active routes; Lenis is imported but not instantiated by the active window-scroll stack. Google font source import was absent from inspected compiled CSS and network captures; external-font waterfall is not confirmed.

## Acceptance checklist for every implementation batch

- [ ] Pin deployment/commit; provision Lighthouse without altering application dependencies. Run ≥3 mobile and desktop samples per key route; retain median/spread and JSON/trace/HAR evidence.
- [ ] Separate cold/warm cache and direct entry/client navigation; isolate runs. Include initial viewport, 15-second media window, full scroll and all films/tabs. Report partial media bytes separately.
- [ ] Prove intended requests disappeared or shrank. Measure LCP/FCP/TTFB/CLS, requests, JS and media bytes. Use real field INP when available; scripted click time/TBT are not substitutes.
- [ ] Screenshot baseline/change at 390, 768, 1024, 1440, 1920 widths; Arabic RTL and all five languages. Match frames, crops, text wrapping, card motion and stable layout.
- [ ] Test slow connection, save-data, reduced motion, blocked autoplay, tab visibility, video errors, fast scroll and breakpoint resize.
- [ ] Test all product open/close paths, focus trap/return, scroll restore, quote actions, fresh/frozen, search/family and URL history. Test actual touch on mid-range Android.
- [ ] Verify Cairo month selection, orbit switching, herbs accordion/forms/process, all language paths, metadata and existing indexing policy. Verify contact PDFs/vCard/links without real submissions.
- [ ] Run build, typecheck and relevant existing route/i18n/product tests during implementation; verify no visual regressions. Do not add broad tests that merely mirror implementation.

**Approval gate:** no implementation, dependency changes, commits or deployment have been performed. Approve the first batch before changes begin.
