# AGRICA Herbs & Spices — Ingredient Family Circles Audit

Status: design audit and implementation plan only. No redesign code or image assets are included in this deliverable.

## 1. Current implementation audit

### Ownership and render path

- Route: `src/app/herbs-spices/page.tsx`
- Section component: `src/components/herbs-spices/home/IngredientFamiliesSection.tsx`
- Section styles: `src/components/herbs-spices/home/IngredientFamiliesSection.module.css`
- Homepage presentation data: `src/data/herbs-spices/homepage.ts`
- Canonical family list: `src/data/herbs-spices/catalogue.ts`
- Approved family-media mapping: `src/data/herbs-spices/media.ts`
- Shared image renderer: `src/components/herbs-spices/media/HerbsSpicesMedia.tsx` and its CSS Module
- Shared types: `src/types/herbs-spices.ts`

`HerbsSpicesHomePage` renders `IngredientFamiliesSection` immediately after the hero and before `IngredientFormsSection`. The section reads `familiesIntro` and `families` from `HERBS_SPICES_HOMEPAGE`; that family array is derived, in order, from `HERBS_SPICES_FAMILIES`. There is no CMS, API, or duplicated hand-written list in the component.

The exact active set is already correct and should remain unchanged:

1. Herbs
2. Flowers
3. Seeds
4. Spices
5. Roots
6. Dehydrated Vegetables

### Current media mapping

Each family id resolves to `/assets/herbs-spices/families/{id}.webp` through `HERBS_SPICES_MEDIA.families`. All six files exist and all six manifest entries are `approved`:

| Family | Asset | Manifest dimensions | Current focus |
| --- | --- | ---: | --- |
| Herbs | `herbs.webp` | 1120 × 1400 (4:5) | `50% 50%` |
| Flowers | `flowers.webp` | 1120 × 1400 (4:5) | `50% 50%` |
| Seeds | `seeds.webp` | 1120 × 1400 (4:5) | `50% 50%` |
| Spices | `spices.webp` | 1120 × 1400 (4:5) | `50% 50%` |
| Roots | `roots.webp` | 1120 × 1400 (4:5) | `50% 50%` |
| Dehydrated Vegetables | `dehydrated-vegetables.webp` | 1120 × 1400 (4:5) | `50% 50%` |

The images are cohesive, dark tabletop still lifes with the ingredient material concentrated through the middle of the frame. They have enough source resolution for the proposed circles, including high-density displays.

### Current desktop layout

- The section uses the existing warm-paper surface (`--hs-paper`) and a `1440px` maximum-width inner container.
- The page gutter is `clamp(1.25rem, 4vw, 4.75rem)` and section padding is `clamp(5rem, 10vw, 9rem)`.
- The header is a two-column editorial grid: eyebrow on the left; title and supporting sentence on the right.
- The family library is a 12-column grid with a `1rem` gap.
- Each family spans four columns, producing a 3 × 2 layout above `900px`.
- Each entry is an `article`, at least `430px` tall, with a border, rounded rectangular frame, full-bleed image, bottom gradient, index, name, and description.

Because global `box-sizing: border-box` applies, the real usable content width is the capped inner width less both gutters. It is approximately `1178px` at a `1280px` viewport, `1325px` at `1440px`, and `1288px` once the `1440px` container is capped on a `1920px` viewport. These measurements make three large circles comfortable; six large circles are not.

### Current tablet and mobile layout

- At `900px` and below, entries span six columns: 2 columns × 3 rows.
- At `680px` and below, the heading becomes one column and each family spans the full grid: 1 column × 6 rows.
- Mobile cards retain a `350px` minimum height, so the current section is long.
- The browser regression test checks that all six cards remain inside the mobile viewport.

### Current interactions and motion

The entries are static. They are not links, buttons, or filter controls. Pointer hover raises the whole rectangle by `5px` and adds a shadow. Reduced-motion CSS removes the transition, although the hover transform itself still applies instantly. There is no focus state because there is no focusable element, and there is no client-side JavaScript or GSAP in this section.

### Current image loading and sizing

`HerbsSpicesMedia` renders approved assets with `next/image`, `fill`, `object-fit: cover`, the manifest `sizes` string, and inline `object-position` from `cropFocus`. Its positioned parent reserves the layout area, preventing image-driven layout shift.

All six family images use the current sizes hint:

```text
(max-width: 680px) 100vw, (max-width: 900px) 50vw, 33vw
```

No family entry has `preload: true`, so the shared renderer does not preload these images. Next Image therefore leaves them lazy by default. The custom manifest value `priority: "high"` is project metadata only; it is not passed to `next/image` and does not change browser loading priority. This is appropriate for a section below the hero.

### Current accessibility

- The section is a labelled `<section>` with `aria-labelledby="families-title"`.
- Family entries are six `<article>` elements inside a generic `<div>`; they are not exposed as a semantic list.
- Family images are deliberately passed as `decorative`. The wrapper receives `aria-hidden="true"`, and each image receives `alt=""`, even though non-empty generic alt values exist in the manifest.
- Names use `<h3>` beneath the section `<h2>`, so heading order is coherent.
- Descriptions and names are always visible; no essential information is hover-only.
- Static entries do not create a misleading keyboard tab stop.

### Test coverage affected by a future redesign

`test/phase7-browser.test.mjs` currently asserts six `article` elements, six approved family media slots, six `img` elements, successful image loading, and mobile viewport containment. `test/herbs-spices-catalogue.test.ts` verifies the exact family ids, manifest entries, approval state, and asset existence. A semantic change from `article` to `li` will require the browser selector assertion to change.

## 2. PDF visual reference analysis

The reference shows a category title followed by repeated circular ingredient photographs and centered names. The strong part is its visual grammar: a real material sample is isolated inside a consistent circle, then identified immediately below. Repetition creates a calm catalogue rhythm, while generous separation prevents the circles from reading as interface icons.

The reference is showing individual seed products in a four-across arrangement, not AGRICA's six top-level families. It should therefore guide framing and rhythm, not dictate the exact grid count or art direction.

The main characteristics worth translating are:

- equal circular frames;
- rich photography clipped inside each circle;
- name directly coupled to the image;
- consistent baseline and spacing;
- enough diameter for texture to remain material and photographic.

## 3. What to preserve and what not to copy

Preserve from the reference:

- circular specimen framing;
- repeated image/name rhythm;
- centered, immediate labelling;
- clean separation between families;
- a catalogue-like sense of order.

Preserve from the current AGRICA experience:

- the exact family set and order;
- the approved imagery and media manifest;
- the warm-paper/ink/olive/copper design system;
- the existing section eyebrow, editorial title, and one short supporting line;
- the 1440px container, shared gutters, and section spacing tokens;
- Next Image and the central media wrapper.

Do not copy from the reference:

- the full green leaf background;
- its typography, large page title treatment, or pale text styling;
- page furniture, page numbering, or PDF layout artifacts;
- legacy ornamental framing;
- the exact 4 × 2 product layout.

Do not preserve from the current cards:

- rounded rectangular card shells;
- full-bleed card imagery and bottom gradients;
- per-card surface colors and material-tone decorations;
- descriptions inside every family entry;
- whole-card lift and large shadow.

The intended translation is: **PDF structure modernized into the AGRICA Ingredient Atelier design.**

## 4. Three desktop layout concepts

| Concept | Visual impact and PDF relationship | Fit, responsiveness, and maintenance | Assessment |
| --- | --- | --- | --- |
| **A — 3 × 2 specimen grid** | Three large circles per row create a composed editorial field. It keeps the reference's repeated rhythm while allowing the photography to feel substantial. | Fits `220–280px` circles comfortably inside the real container. Natural source order, simple CSS Grid, straightforward 2-column tablet/mobile fallbacks, and predictable whitespace. Section height remains balanced between the hero and Material Expression section. | **Recommended.** Best balance of specimen scale, premium whitespace, readability, and maintainability. |
| **B — 6 across** | Closest to a single PDF-style catalogue band and gives an immediate overview of all families. | Inside the capped AGRICA container, six columns plus gaps limit circles to roughly `190–200px`. “Dehydrated Vegetables” needs two lines while other labels do not, making the row baseline feel uneven. It must break earlier and can resemble ecommerce category bubbles at common laptop widths. | Useful only for an extra-wide art-directed variant; too small and UI-like as the primary layout. |
| **C — asymmetric editorial arrangement** | Alternating vertical offsets or a 2/1/3 grouping feels bespoke and art-directed, with strong negative space. | Larger total height, less direct scanning, more breakpoint-specific placement, and a risk that source order becomes visually ambiguous. The long family name makes balance fragile. Maintenance and QA cost are highest, while resemblance to the clean PDF rhythm is lower. | Visually expressive but unnecessary for this clear catalogue task. |

Option A should not look like a conventional card grid: the grid is only an alignment system. There should be no rectangular panel behind each item, and the circles should sit in open space.

## 5. Mobile layout comparison

| Mobile option | Strengths | Risks | Verdict |
| --- | --- | --- | --- |
| **A — 2-column circular grid** | Shows two rich specimens at once, keeps the section compact, preserves normal vertical scrolling, and needs no gesture instruction. At `126–156px`, images remain photographic rather than icon-like. | The longest label wraps to two lines; equal label blocks are needed to keep row rhythm. | **Recommended.** |
| **B — horizontal specimen rail** | Large circles and short vertical footprint. | Hides families off-screen, requires horizontal gesture discovery, complicates keyboard/focus behavior if later linked, and can introduce overflow or partial-card affordances. It feels closer to commerce bubbles or stories. | Reject for this section. |
| **C — 1-column editorial sequence** | Maximum image impact and simple labels. | Six entries make the homepage excessively long and recreate the current mobile-length problem. | Reject. |

Recommended mobile behavior is a two-column grid through `680px`. Use `clamp(126px, 40vw, 156px)` circles, approximately `1–1.75rem` column gap, and `2.25–2.75rem` row gap. At the narrowest supported width (`320px`), two `128px` circles plus the minimum gap fit inside the approximately `280px` usable content width. Give the label area a consistent minimum block size so “Dehydrated Vegetables” can wrap without disturbing the next row.

## 6. Recommended circle and crop sizing

### Responsive diameter strategy

| Range | Arrangement | Diameter | Reasoning |
| --- | --- | --- | --- |
| Desktop, `1100px+` | 3 × 2 | `clamp(220px, 20vw, 280px)` | Large enough to read as editorial specimens; leaves generous inter-column whitespace inside the existing container. |
| Tablet, `681–1099px` | 2 × 3 | `clamp(180px, 26vw, 230px)` | Avoids squeezing three circles and long labels into narrow columns. Maintains useful photographic detail. |
| Mobile, `≤680px` | 2 × 3 | `clamp(126px, 40vw, 156px)` | Keeps section length controlled and remains touch-friendly if links are added later. |

Use a square, positioned media wrapper with `aspect-ratio: 1`, `border-radius: 50%`, and `overflow: hidden`. Keep Next Image `fill` and `object-fit: cover`; do not resize or distort the source itself.

### How much of a 4:5 source is lost

A centered circular viewport first requires a square crop. From a 1120 × 1400 source, that square keeps the full width and approximately 1120px of height, removing about 280px total: 20% of source height, nominally 10% from the top and 10% from the bottom when centered. The circle then masks the square's corners. Those corners account for approximately 21.5% of the square area, but this is a mask rather than another rectangular focal crop.

The approved compositions are suitable because their subjects occupy the central zone. Fine loose material near the portrait frame's extreme bottom and some dark negative space at the top will be lost; the primary herbs, flowers, seeds, chilli/cumin, roots, onion, and garlic remain legible.

### Proposed crop-focus QA values

These are starting values based on inspection of the approved files, to be confirmed at all three rendered diameters:

| Family | Suggested `cropFocus` | Crop note |
| --- | --- | --- |
| Herbs | `50% 54%` | Bias slightly downward to retain the dense leaf bed; upper dark backdrop is expendable. |
| Flowers | `50% 52%` | Small downward bias preserves the lower chamomile/hibiscus spread while keeping all three flower groups. |
| Seeds | `50% 52%` | Retains the lower flax/fenugreek/fennel group without losing the upper coriander/fennel heads. |
| Spices | `49% 50%` | Near-center is already strong; a slight left bias protects the chilli arrangement while cumin remains dominant. |
| Roots | `50% 49%` | Near-center with a slight upward bias keeps the tall split root and sliced roots together. |
| Dehydrated Vegetables | `50% 52%` | Slight downward bias retains the foreground flakes; the key onion/garlic forms remain central. |

The manifest should remain the single source for these adjustments. Do not create derivative circle-cropped files. Test crop focus at `126px`, `180px`, `220px`, and `280px`, because a focus that reads well at the maximum size can become unclear at mobile size.

Update the family `sizes` hint to match the new rendered widths, approximately:

```text
(max-width: 680px) 40vw, (max-width: 1099px) 26vw, (max-width: 1440px) 20vw, 280px
```

## 7. Label typography

Recommended entry anatomy:

1. circle;
2. `0N` micro-index;
3. family name.

Keep the index because it already exists in homepage data and gives the set an archival, specimen-led tone. It should be quiet rather than another content layer: `0.6–0.65rem`, uppercase/tracked sans, copper (`--hs-accent`), centered, with roughly `1rem` between circle and index.

Set the family name in the AGRICA serif (`--hs-font-serif`) to separate the human, botanical label from the technical micro-index. Recommended size is `clamp(1.35rem, 2vw, 2rem)`, weight `400`, line-height about `1.05`, centered, ink-colored, and limited to approximately `12ch`. “Dehydrated Vegetables” may wrap deliberately to two balanced lines. Do not include descriptions or thin rules; both would dilute the circle/name clarity requested.

The current section header already has the right content quantity: eyebrow, “Materials, shaped by origin.”, and one sentence. Retain the copy. Refine only its scale and bottom spacing if needed so the heading does not overpower the specimen field; a title cap around `5.5rem` and a `4–5rem` desktop gap to the circles is sufficient.

## 8. Interaction recommendation

**Keep the family specimens static in this redesign.**

The catalogue UI does filter by family after the page loads, but `src/app/herbs-spices/products/page.tsx` does not accept or forward search parameters, and `HerbsSpicesProductsExplorer` always initializes `activeFamily` to `"all"`. Therefore a URL such as `/herbs-spices/products?family=herbs` currently opens the catalogue without applying the requested family. Making the circles links now would promise behavior the destination does not provide.

Static entries also fit the requested visual, specimen-led role and require no client component. Do not add pointer cursors, tab stops, or link-like arrows.

A later navigation enhancement is reasonable only as a separate, end-to-end change: validate the query against `HERBS_SPICES_FAMILY_IDS`, pass the initial selection into the explorer, preserve/reset URL state intentionally, use `next/link`, and test direct visits plus browser navigation. If that work is approved later, make the entire image-and-label group one link with a visible `:focus-visible` ring rather than nesting multiple controls.

## 9. Motion recommendation

Use CSS only. GSAP adds no material value for six static items.

- On devices that truly support hover, scale only the image inside its fixed circle to about `1.025` over `260–320ms` with a calm ease.
- Gently strengthen a thin circle ring from the neutral border to a low-opacity copper/olive tone.
- Keep the circle position, index, and label stable. Avoid card lift, shadow blooms, label jumps, parallax, spin, or bounce.
- Wrap hover rules in `@media (hover: hover) and (pointer: fine)` so touch devices do not retain accidental hover states.
- Under `prefers-reduced-motion: reduce`, remove the image transition and transform, not merely the transition duration.

Because the recommended specimens are static, the treatment must remain ambient and must not imply clickability.

## 10. Accessibility

- Render the family collection as a semantic `<ul>` with six `<li>` items. Reset list styling in the component CSS Module.
- Keep the existing labelled `<section>` and correct `h2` → `h3` hierarchy.
- Treat the photographs as content and improve the manifest alt text to describe what is visibly represented, for example “Assorted dried herbs including rosemary and mint” rather than the generic “Herbs ingredient family.” Remove the `decorative` flag for these six slots so the alt reaches assistive technology.
- Keep every family name as visible text; no information may exist only in alt text or on hover.
- Maintain at least WCAG AA contrast for ink labels, muted supporting copy, and micro-indices on warm paper. The existing ink-on-paper pairing is the safest base; verify the small copper index during implementation.
- Static list items need no keyboard focus. If links are added in a later routing change, use actual link semantics, one accessible name per family, a visible `2px` focus ring with adequate offset, and a target area of at least `44px`.
- Ensure two-line labels do not overlap at 200% text zoom and the layout does not rely on fixed text heights that clip content.

## 11. Performance

- Continue using the existing `next/image` wrapper and approved WebP files.
- Keep all six images lazy. This section follows a full-height hero, so none should use `preload` or compete for LCP bandwidth.
- Update `sizes` to the actual circle widths; the current `100vw/50vw/33vw` hint would over-request images, especially on mobile where each circle is at most `156px`.
- Keep the square wrapper's `aspect-ratio: 1` and explicit responsive width so layout is reserved before image decode and CLS remains avoided.
- Do not generate duplicate square thumbnails. The 1120px source width is sufficient even for a `280px` circle at high device pixel ratios.
- Preserve object-fit cropping in CSS and focus in manifest data, allowing one optimized source per family.
- No JavaScript animation, carousel, observer, or new dependency is needed.

## 12. File impact

### Existing files to modify in the recommended implementation

1. `src/components/herbs-spices/home/IngredientFamiliesSection.tsx`
   - Change the generic library wrapper and articles to a semantic list.
   - Render a circle wrapper, micro-index, and name only.
   - Stop passing `decorative` if the manifest alt text is upgraded as recommended.
2. `src/components/herbs-spices/home/IngredientFamiliesSection.module.css`
   - Replace rectangular card, gradient, tone, description, lift, and shadow rules with the 3/2/2-column specimen layout, circular clipping, typography, ring, hover, and reduced-motion rules.
3. `src/data/herbs-spices/media.ts`
   - Update family `sizes`, per-family `cropFocus`, and meaningful alt text. Because crop focus differs by family, replace the single generated default with a small typed focus/alt lookup while still deriving entries from the canonical family list.
4. `test/phase7-browser.test.mjs`
   - Update the family selector from six articles to six semantic list items.
   - Add assertions for list semantics, circular geometry, 3/2/2 column behavior at representative viewports, no horizontal overflow, and non-empty image alternatives if the images become content.

### Existing files that should remain unchanged

- `src/data/herbs-spices/catalogue.ts`: canonical set and order are already correct.
- `src/data/herbs-spices/homepage.ts`: indices and header copy already exist; descriptions and material tones can remain available even if this component stops rendering them, because the same family objects are also passed to the trade section.
- `src/components/herbs-spices/media/HerbsSpicesMedia.tsx`: it already supports fill, sizes, crop focus, lazy loading, and meaningful alt text when `decorative` is false.
- `src/app/herbs-spices/page.tsx`, products route files, theme tokens, and other homepage sections.

### New files

None. The redesign belongs in the existing component, CSS Module, and media manifest. No new component abstraction, motion utility, image derivative, or data layer is justified.

## 13. Final recommended design

Use a **warm-paper 3 × 2 circular specimen field**.

- **Desktop:** three centered specimens per row; `220–280px` diameter; generous column space and approximately `4–5rem` row gap.
- **Tablet (`681–1099px`):** two columns; `180–230px` diameter; three rows. Do not squeeze three columns.
- **Mobile (`≤680px`):** two columns; `126–156px` diameter; three rows, normal vertical scrolling, no horizontal rail.
- **Surface:** retain `--hs-paper`. The dark approved images gain definition on this warm neutral and the transition into the following olive Material Expression section remains strong. Do not add a leaf texture, split panel, or card backgrounds.
- **Circle finish:** one restrained `1px` ring using the existing border color, with an optional subtle inset separation from the dark photo edge. No shadow-heavy framing.
- **Content:** photo, `01–06` micro-index, family name. Remove per-family descriptions from the rendered section.
- **Typography:** copper tracked sans micro-index; centered ink serif family name. Keep the existing eyebrow, heading, and single support sentence.
- **Interaction:** static for now. The products page does not consume a family query parameter.
- **Motion:** CSS-only image zoom to about `1.025` and gentle ring tint on fine-pointer hover; no movement under reduced motion.
- **Cropping:** Next Image `fill` + `object-fit: cover`; per-family manifest focus values; never distort or create duplicate assets.
- **Loading:** all six lazy, none preloaded; accurate `sizes`; square wrappers reserve layout.
- **Semantics:** labelled section containing a real list; meaningful visible names and descriptive image alternatives.

This is close enough to the reference to preserve its circle/image/label rhythm, but unmistakably part of AGRICA's current Ingredient Atelier system.

## 14. Exact implementation sequence

1. Record baseline screenshots and computed geometry at `1440px`, `1024px`, `768px`, `680px`, `375px`, and `320px`; keep all other homepage sections out of the change set.
2. Update the family media entries in `src/data/herbs-spices/media.ts` with descriptive alt text, the new responsive `sizes` hint, and the proposed per-family focus values.
3. Refactor only `IngredientFamiliesSection.tsx`: retain its section/header, replace the library with `ul/li`, render the media circle, index, and `h3`, and omit descriptions and material-tone presentation.
4. Rebuild only `IngredientFamiliesSection.module.css`: implement the warm-paper 3/2/2 grid, circle clamps, consistent label blocks, restrained ring/hover behavior, fine-pointer guard, and complete reduced-motion override.
5. Visually QA every approved image at the four critical diameters (`126`, `180`, `220`, and `280px`). Adjust only manifest `cropFocus` values if a subject loses clarity.
6. Verify “Dehydrated Vegetables” at 200% text zoom and at `320px`; allow wrapping and confirm it does not collide with the following row.
7. Update `test/phase7-browser.test.mjs` for the new semantics and responsive geometry. Retain its approved-image, successful-load, and viewport-containment checks.
8. Run TypeScript, Herbs & Spices catalogue tests, browser regression tests, and a production build. Confirm that no family image receives preload and the hero remains the LCP candidate.
9. Compare final screenshots with the reference using only four criteria: circle framing, contained image, label below, and repeated rhythm. Reject any accidental reintroduction of the leaf background, legacy type, PDF decoration, or icon-grid styling.
10. Review the diff and confirm no file outside the four listed implementation files changed. Stop before adding catalogue query routing; that remains a separate enhancement.
