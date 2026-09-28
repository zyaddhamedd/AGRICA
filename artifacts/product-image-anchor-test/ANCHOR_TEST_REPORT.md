# AGRICA Product Image Anchor Test Report

Exactly three preview generations were submitted. No catalogue production was started.

## Generation setup

- Project: `AGRICA Produce Anchor Test`
- Project ID: `62135598-3213-438b-9f7e-c97e0a4a7433`
- Model: Recraft V4.1 (`recraft_v4_1`)
- Variant: `standard`
- Resolution setting: `1k`
- Requested aspect ratio: `4:5`
- Delivered dimensions: `896 × 1152` PNG for all three previews
- Input: text-only; no reference image
- Cost: 1.25 credits each; 3.75 credits total

The delivered files are slightly narrower than exact 4:5. Approved finals should be cropped to an exact 4:5 production master before derivatives are exported.

## Preview assessment

| Anchor | Job ID | Raw size | Realism | AGRICA-card fit | Angle/composition | Anchor decision |
|---|---|---:|---|---|---|---|
| Fresh — Oranges | `38c77d58-84f7-4b08-9269-89f8799f251e` | 896 × 1152; 1.46 MB PNG | Strong: convincing peel, cut flesh, colour, and contact shadows | Strong at 1440/390/320; the complete cluster stays inside the safe crop | High 3/4 works; centred pyramid and upper negative space are effective | **YES** — strong Fresh anchor candidate |
| Frozen — IQF Green Peas | `80ff5b7a-af81-440b-b1e8-bd168c715c77` | 896 × 1152; 1.36 MB PNG | Good, but frost coverage is heavier than the requested subtle IQF treatment | Strong at all three card crops; mound remains centred and readable | Angle and compact mound work well | **CONDITIONAL** — composition/light can anchor Frozen, but frost must be reduced |
| Dried — Dried Lemon Slices | `6aa9806b-34cd-40ad-ab82-80a0381879e3` | 896 × 1152; 1.57 MB PNG | Moderate-good dry texture; small green/teal edge artefacts and repeated stacking reduce credibility | Crop-safe at all three sizes | Angle works, but the stacked geometry feels too arranged | **NO** — useful direction test, not strong enough to lock the Dried category |

## Performance export plan

Keep the archival production master outside the page payload. Use an exact 4:5 master at 1600 × 2000 px or higher, then create pre-encoded static derivatives.

Recommended responsive widths:

| Use | Dimensions | AVIF target | WebP fallback target |
|---|---:|---:|---:|
| Small/mobile 1× | 320 × 400 | 18–30 KB | 30–50 KB |
| Mobile 1× | 480 × 600 | 28–45 KB | 45–70 KB |
| Small mobile 2× | 640 × 800 | 38–60 KB | 60–90 KB |
| Main mobile 2× | 768 × 960 | 50–75 KB | 75–115 KB |
| Desktop/high-density grid | 960 × 1200 | 65–100 KB | 100–150 KB |
| High-DPR ceiling | 1200 × 1500 | 90–140 KB | 140–210 KB |

Primary page targets:

- 390 px mobile card: 768 × 960 AVIF, ideally 50–75 KB.
- 320 px mobile card: 640 × 800 AVIF, ideally 38–60 KB.
- 1440 px desktop grid: 960 × 1200 AVIF, ideally 65–100 KB.
- Hard grid-image cap: 140 KB AVIF except where visual QA proves the texture needs more.

Recommended responsive source set:

`320w, 480w, 640w, 768w, 960w, 1200w`

Recommended `sizes` value for the current three/two/one-column AGRICA grid:

`(max-width: 640px) calc(100vw - 2.5rem), (max-width: 1024px) calc(50vw - 2.5rem), (max-width: 1600px) calc(33.333vw - 4rem), 418px`

Loading strategy:

- Pre-generate AVIF first and WebP fallback instead of serving the multi-megabyte PNG previews.
- Prefer prebuilt, content-hashed static derivatives to avoid first-request encoding latency.
- Lazy-load every off-screen card image.
- Give only the single most likely LCP card `fetchPriority="high"` or `loading="eager"`; do not preload the entire first row.
- Use a 16–24 px colour-aware blur placeholder capped near 1 KB, or an inline AGRICA-navy dominant-colour placeholder.
- Preserve fixed 4:5 dimensions to prevent layout shift.
- Cache immutable hashed derivatives for one year.
- Keep the exact responsive `sizes` value so browsers do not download a 1200 px asset for a 286–417 px rendered card.

No optimised derivatives were produced yet because the category styles have not all been approved.
