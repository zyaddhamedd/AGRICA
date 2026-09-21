# AGRICA Herbs & Spices — Material Expression Audit

Status: audit and implementation blueprint only. No redesign code or media assets were created in this phase.

## 1. Current implementation audit

### Ownership and page position

- Component: `src/components/herbs-spices/home/IngredientFormsSection.tsx`
- Styles: `src/components/herbs-spices/home/IngredientFormsSection.module.css`
- Content source: `HERBS_SPICES_HOMEPAGE.formsIntro` and `HERBS_SPICES_HOMEPAGE.forms` in `src/data/herbs-spices/homepage.ts`
- Canonical form taxonomy: `HERBS_SPICES_AVAILABLE_FORMS` in `src/data/herbs-spices/catalogue.ts`
- Homepage composition: `src/app/herbs-spices/page.tsx`
- Position: after Ingredient Families and before Process Teaser.

The section is a React Server Component. It contains no local state, event handlers, client boundary, or media-manifest lookup.

### Approved content

The rendered form values are derived from the single catalogue source and must remain:

1. Whole — “Whole format”
2. Cut & Sifted — “Cut and sifted”
3. TBC (Tea Bag Cut) — “Tea bag cut”
4. Crushed — “Crushed format”
5. Powder — “Powder format”

These are division-level possible formats, not a product-by-product availability matrix.

### Current desktop structure

- A two-column heading: the micro-label occupies the narrow first column; headline and supporting copy occupy the second.
- Below it, `.expression` uses a two-column grid: approximately 40% abstract material field and 60% form list.
- The abstract field has a minimum height of 560px, an arched top, a dark background, and four CSS-generated shapes.
- The ordered list contains five rows of at least 110px. Each row is index + large serif form name + small descriptor.
- The section uses the dark olive `--hs-accent-secondary` background and light typography.

### Current mobile structure

- At 820px the media field and list become a single vertical column; the 440px abstract field appears first.
- At 680px the heading becomes one column.
- Each form row becomes a two-column index/name layout, with the descriptor placed beneath the name.
- Desktop and mobile preserve essentially the same media-then-list model; mobile is a stack rather than a purpose-designed material narrative.

### Interaction and motion

- There is no interaction: the list items are not buttons or links.
- There is no hover state, active state, selected form, media replacement, or progressive reveal.
- There are no animations or transitions in this CSS Module.
- Reduced-motion handling is unnecessary in the current version because nothing moves.

### Accessibility

- The section is correctly labelled with `aria-labelledby="forms-title"`.
- The five forms are exposed as an ordered list, which is meaningful for reading but can accidentally suggest a required process sequence.
- The CSS artwork is correctly `aria-hidden="true"`.
- Because the section has no controls, it creates no keyboard or touch barriers, but it also offers no accessible interactive experience.

### Current media/fallback architecture

- The section does not use `HerbsSpicesMedia` or `HERBS_SPICES_MEDIA`.
- The current central manifest has homepage, family, product, and process collections, but no form-media collection.
- The abstract artwork is a hard-coded fallback rather than a manifest-aware fallback.
- Consequently, approved form imagery cannot be introduced through a status change alone; the component must first be connected to the media system.

## 2. Current UX weaknesses

1. The abstract circles, grain pattern, and axis line no longer relate to the approved photographic Ingredient Atelier language established by the Hero and six family images.
2. The visual field does not change, so it communicates “decoration beside a list,” not material transformation.
3. Five equally structured rows dominate the information architecture and read like a conventional contents list.
4. The headline promises “different expressions,” but the page supplies no visible evidence of difference in size, texture, granularity, or silhouette.
5. There is no single material focal point connecting Whole to Powder.
6. The descriptors largely restate the labels and do not add useful editorial or commercial meaning.
7. Desktop and mobile differ only through grid collapse; neither receives a distinctive narrative rhythm.
8. The section has no memorable action or reveal, while the surrounding Hero and family photography now provide strong visual anchors.
9. The ordered-list presentation can be read as a universal sequence even though the content is only a division-level set of possible formats.

## 3. Media strategy comparison

### Option A — One ingredient, five forms

Use one recognizable botanical material across the five images.

**Strengths**

- Clearest visual statement of “one material, multiple expressions.”
- Matched lighting, color, and subject make subtle particle-size differences legible.
- Creates a controlled B2B specimen-study character.
- Simplest interaction and media mapping.

**Risk**

Showing a named product in all five forms can imply confirmed product-specific availability.

**Mitigation**

- Keep the existing availability sentence visible throughout the experience.
- Add a quiet non-interactive qualifier near the media: “Illustrative material study.”
- Do not name the featured ingredient in commercial copy or connect the controls to a product record.
- Treat the material as art direction, not a catalogue specification.
- Never add form data to the selected product record unless separately verified.

### Option B — Different ingredient for each form

Use a different catalogue material for every format.

**Strengths**

- Broader color and texture range.
- Can reference more catalogue families.
- Reduces the impression that one product offers all formats.

**Weaknesses**

- Breaks the transformation idea: the user sees five examples, not one material changing.
- Risks resembling five product cards or a mini catalogue.
- Makes comparisons of scale and texture unreliable.
- Requires more explanatory copy and weakens the headline.

This option is not recommended for the primary concept.

### Option C — Hybrid material system

Keep one primary material constant while subtle peripheral fragments reference other families.

**Strengths**

- Can preserve transformation continuity while connecting to the wider catalogue.
- Offers richer art direction and creates visual links to the family section.

**Weaknesses**

- Secondary materials can confuse what is transforming.
- More difficult to produce a rigorously matched five-image series.
- Decorative fragments can make the experience less precise and more lifestyle-oriented.

This is viable only if secondary fragments remain identical, quiet, and outside the main transformation zone. It is a useful art-direction refinement, not the core information model.

**Recommended media strategy:** Option A, with the restrained qualifier and no product-level data claim. A trace of Option C may be used only as a constant atmospheric background across all five frames.

## 4. Three redesign concepts

### Concept 1 — Material Stage

**Desktop:** A large 4:5 media stage occupies roughly seven columns. A five-row editorial control rail occupies five columns. The active row gains scale, a drawn rule, and its short descriptor; the others remain restrained. The heading stays above the stage.

**Mobile:** Do not reproduce the desktop switcher. Present five compact vertical editorial specimens in natural document flow, each with its index, form name, and image. The same master assets receive tighter 5:4 crops through `object-fit: cover` and per-entry crop focus.

**Media behavior:** Desktop renders one active image at a time over the existing fallback surface. Mobile lazy-loads the five images as their specimens approach the viewport.

**Navigation:** Desktop rows are real buttons. Selecting a form changes the central stage. Mobile uses semantic figures in natural reading order; an optional compact index can use native anchor links, not a carousel.

**Motion:** 280–360ms crossfade with a restrained vertical mask and a maximum 1–1.5% settling scale. The active rule draws horizontally. No automatic cycling.

**Accessibility:** Ordered button list with `aria-pressed`, visible focus, and `aria-controls` pointing to the media stage. The active form remains visible as text. Mobile figures use headings/figcaptions and require no interaction.

**Complexity:** Medium. Requires a small client component for desktop state plus a responsive static mobile rendering.

**Performance:** Good. One desktop image is mounted at a time; mobile images are lazy. No form image is preloaded or marked LCP.

### Concept 2 — Scroll Transformation

**Desktop:** Five natural-height chapters pass beside a short-lived sticky media stage. The stage remains sticky only within the chapter group, never across an artificially long pinned sequence.

**Mobile:** The sticky behavior is removed. Each form becomes a vertical media-and-copy beat.

**Media behavior:** IntersectionObserver activates the image corresponding to the chapter nearest the reading line.

**Navigation:** Natural scroll; a small progress index may link to chapter anchors.

**Motion:** Crossfade and masked texture transition when chapter activation changes. No scroll-jacking and no scrubbed frame animation.

**Accessibility:** All five headings and descriptions remain in document order. Intersection state is enhancement only; keyboard and assistive technology receive the full static story.

**Complexity:** Medium-high because observer thresholds, sticky containment, resize behavior, and hydration must be tested carefully.

**Performance:** Potentially good with lazy images, but the observer and overlapping media layers create more runtime work. A sticky stage also increases visual and QA risk near mobile/tablet breakpoints.

### Concept 3 — Editorial Specimen Strip

**Desktop:** Five oversized specimens form an asymmetrical vertical sequence. Image crops alternate between wide and narrow columns, with large form names crossing the grid. The layout reads like an editorial feature rather than cards.

**Mobile:** A single-column sequence uses controlled shallow crops and alternating label placement. No horizontal swipe is required.

**Media behavior:** Every form has its own figure. Images reveal naturally as they enter the viewport.

**Navigation:** No control state; native scrolling is the interaction. Optional anchor index at the start.

**Motion:** Subtle clip reveal and 8–12px typographic rise once per specimen. Reduced motion renders everything immediately.

**Accessibility:** Straightforward semantic figures and headings. No custom keyboard behavior.

**Complexity:** Low-medium and robust.

**Performance:** All five assets exist in the DOM but remain lazy. The section is longer and may decode several large images during one scroll.

**Trade-off:** Visually rich, but it consumes considerably more page length and makes the five formats feel like separate editorial stories rather than a direct comparison.

## 5. Hero ingredient recommendation

### Candidate assessment

| Candidate | Recognition | Whole-to-powder clarity | Color/texture | Main concern |
| --- | --- | --- | --- | --- |
| Basil | High | Good | Refined olive leaf | Cut, TBC, and crushed may look too similar |
| Chamomile | High | Moderate | Light, delicate contrast | Powder loses the recognizable floral identity |
| Hibiscus | High | Excellent | Burgundy, sculptural, premium | Must avoid implying verified forms for Hibiscus |
| Rosemary | High | Moderate | Strong needles and silhouette | TBC/cut differences are subtle |
| Peppermint | High | Good | Familiar leaf texture | Can drift toward consumer tea imagery |
| Cumin | High | Weak | Strong seed texture | Cut & Sifted and TBC are visually implausible as a story |
| Red Chilli Pepper | High | Good | Dramatic red and flakes | Easily becomes loud food photography |
| Onion | High | Good for flakes/granules/powder | Strong pale contrast | Only Flakes, Granules, and Powder are source-backed; unsuitable for a five-form metaphor |

### Recommendation

Use a **hibiscus-inspired dried botanical material study** as the visual subject. Its intact calyx, medium cut pieces, smaller tea-cut-like fragments, irregular crushed texture, and powder state can be distinguished clearly under one lighting system. Burgundy tones connect to the approved Hero and Flowers imagery while remaining highly legible against the olive/dark section palette.

The public UI should not state that Hibiscus is available in all five forms. The subject remains an illustrative visual metaphor; the existing division-level availability copy remains the commercial truth.

## 6. Exact asset requirements

Produce one matched five-image series. All images should use the same surface, lens character, camera height, warm directional light, shadow direction, color grade, and central safe area.

### `form-whole`

- Ratio/delivery: 4:5 portrait, recommended 1600×2000 WebP.
- Subject: intact dried hibiscus-inspired calyces with recognizable folded structure.
- Composition: one restrained sculptural cluster; the largest silhouette of the series.
- Crop: central mass safe for a 5:4 mobile crop; breathing room in the upper third.
- Lighting: warm grazing light showing ridges and papery surfaces.
- Placement: default desktop stage and first mobile specimen.

### `form-cut-sifted`

- Ratio/delivery: 4:5 portrait, recommended 1600×2000 WebP.
- Subject: medium, relatively even cut botanical pieces.
- Composition: controlled layered field retaining visible petal/calyx character; no bowl or scoop.
- Crop: same scale reference and focal zone as `form-whole`.
- Lighting: identical to the series; highlights describe cut edges.
- Placement: second stage state/specimen.

### `form-tbc`

- Ratio/delivery: 4:5 portrait, recommended 1600×2000 WebP.
- Subject: smaller, controlled tea-cut-like botanical particles.
- Composition: denser central contour with clearly smaller granularity than Cut & Sifted, without displaying measurements or claiming a grade.
- Crop: macro emphasis; central safe zone for mobile.
- Lighting: raking light to preserve separation between small fragments.
- Placement: third stage state/specimen.

### `form-crushed`

- Ratio/delivery: 4:5 portrait, recommended 1600×2000 WebP.
- Subject: irregular crushed fragments with mixed folds and broken edges.
- Composition: a deliberate broken relief, less uniform than TBC but not randomly scattered.
- Crop: strong tactile detail across the center and lower third.
- Lighting: deeper micro-shadows communicating roughness.
- Placement: fourth stage state/specimen.

### `form-powder`

- Ratio/delivery: 4:5 portrait, recommended 1600×2000 WebP.
- Subject: fine muted-burgundy botanical powder.
- Composition: a smooth sculptural plane or restrained mound with one clean ridge; no dust explosion.
- Crop: broad quiet form with visible fine grain at the focus plane.
- Lighting: low grazing highlight revealing powder texture without oversaturation.
- Placement: fifth stage state/specimen.

### Mobile crop policy

Do not commission separate mobile files initially. Art-direct all five masters with a central 5:4-safe crop. Add mobile-specific assets only if real-device review shows that a form becomes illegible after cropping. This keeps the initial inventory at exactly five images.

## 7. Desktop UX blueprint

- Keep the micro-label, headline, and supporting copy at the top using the current two-column editorial heading rhythm.
- Use a natural-height section, not a forced `100vh` and not a pinned scroll sequence.
- Place the stage and form rail in a 7/5 grid with a 64–96px editorial gap.
- Stage width should remain bounded around 560–680px; its 4:5 ratio reserves space before image load and prevents layout shift.
- Preserve a softened version of the current arched upper mask as a distinctive division motif, but let photography occupy the frame.
- Overlay only a small index and “Illustrative material study” note. Do not overlay commercial specifications.
- The rail remains border-led and open; it must not become five cards, pills, or dashboard tabs.
- Each button occupies a generous row. The active row enlarges the serif name slightly and reveals its descriptor with a copper rule.
- Nothing remains sticky. The entire section should pass through the viewport with native scrolling.

## 8. Mobile UX blueprint

- At approximately 820px, switch from the interactive stage to a natural five-specimen editorial sequence.
- Keep the intro concise, then pair each form name with its own media crop immediately below or beside it.
- Use a 5:4 rendered crop around 260–300px high on a 390px viewport; do not render five 440px portrait panels.
- Use the source index and form name as the dominant caption. Keep descriptors small and adjacent.
- Avoid horizontal swipe, carousel dots, sticky media, and horizontal scrolling.
- Each image should be full-width within the page gutter and lazy-loaded as it approaches.
- Maintain at least 44px for any optional anchor control and clear visible focus.
- Keep the total section purposeful: five compact beats, approximately 1.5–2 mobile viewports beyond the intro, rather than five near-full-screen slides.

## 9. Motion language

- Desktop media: opacity crossfade plus a restrained bottom-to-top mask reveal over 280–360ms.
- Incoming texture: settle from `scale(1.012)` to `scale(1)`; no continuous zoom.
- Active rail: copper line expands horizontally; name shifts no more than 6–8px.
- Do not autoplay or rotate states.
- Do not animate powder particles, scatter fragments, or simulate processing.
- Mobile: one-time clip/opacity reveal per specimen only if it remains inexpensive; content must already be usable without it.
- `prefers-reduced-motion: reduce`: remove mask, scale, and positional movement; switch images instantly or with no more than a simple near-instant opacity change.

## 10. Accessibility blueprint

- Desktop: render the forms as an `<ol>` containing `<button type="button">` controls.
- Use `aria-pressed="true"` on the active form and `aria-controls="material-expression-stage"` on every button.
- Keep the current form name visible outside the image; do not rely on the photograph to convey state.
- Support Tab/Shift+Tab naturally. Arrow-key enhancement is optional; if added, implement roving focus consistently with Home/End.
- Provide a 2px visible focus outline with sufficient contrast against the olive surface.
- Do not require hover. Hover may preview emphasis but must not be the only activation method.
- Touch activation must not depend on precision gestures.
- Suggested image alt pattern: “Illustrative dried botanical material study representing the Whole format.” Repeat with the relevant form. This describes the visual metaphor without asserting product availability.
- Mobile figures should use captions. If the caption fully conveys the form and the image is decorative in context, use empty alt to avoid repetition; otherwise use the illustrative alt pattern.
- Do not announce every crossfade through `aria-live`; the pressed control and visible name already communicate the selected state.

## 11. Performance blueprint

- Use the existing `HerbsSpicesMedia`/`next/image` path with explicit dimensions, `fill`, and meaningful `sizes`.
- Keep the stage at a fixed aspect ratio so fallback, loading, and approved media occupy identical geometry.
- No form image receives `preload`, `priority`, eager loading, or high fetch priority. `hero-primary` remains the only homepage LCP preload candidate.
- Desktop should mount the active image only. The CSS fallback remains behind the loading state so a newly selected asset never flashes an empty frame.
- Mobile may render all five images because they form the content sequence, but they must remain native-lazy.
- Recommended `sizes`: `(max-width: 820px) calc(100vw - 2.5rem), (max-width: 1200px) 52vw, 640px`.
- Target approximately 180–320KB per WebP after visual review; retain enough detail for macro texture.
- Avoid video, frame sequences, canvas, WebGL, and scroll-scrub libraries for this section.
- The current `motion` and `gsap` dependencies do not justify using them here; CSS transitions plus a small state component are sufficient.

## 12. Copy review

### Recommendation

Keep the approved copy exactly as-is:

> One ingredient. Different expressions.

> Available division-level formats. Product-specific availability is confirmed on request.

It is concise, supports the proposed visual metaphor, and already contains the necessary commercial qualifier.

### Optional refinement

If the client wants a slightly clearer qualifier without changing meaning:

> One material. Different expressions.

> Explore available division-level formats. Product-specific formats are confirmed on request.

Do not use “five stages,” “from whole to powder,” or similar public copy because it could imply a universal production sequence.

## 13. Design relationship

- **Hero continuity:** reuse dark stone, warm directional light, rich shadow, and tactile macro focus—not the Hero composition itself.
- **Family-image continuity:** preserve the same color grade and material realism, while narrowing the subject to one controlled transformation study.
- **Products continuity:** use specimen discipline, precise labels, and material detail, but avoid cards, grid browsing, enquiry actions, and catalogue chrome.
- **Section distinction:** the Material Stage is one immersive comparison surface, not another collection of products. The olive section background and arched mask retain its unique homepage identity.

## 14. File impact for a future implementation

### Existing files to modify

- `src/components/herbs-spices/home/IngredientFormsSection.tsx` — retain server-owned intro and pass forms/media into the interactive stage.
- `src/components/herbs-spices/home/IngredientFormsSection.module.css` — replace the static field/list layout with stage, rail, responsive specimen sequence, focus, loading, and reduced-motion states.
- `src/data/herbs-spices/media.ts` — add the form collection and flatten it into the central manifest.
- `src/types/herbs-spices.ts` — extend `HerbsSpicesMediaKey` with `form-${string}` and `HerbsSpicesMediaKind` with `form`.
- `src/data/herbs-spices/homepage.ts` — optionally attach explicit media keys to the derived forms; do not duplicate names or change taxonomy.
- `HERBS_SPICES_MEDIA_REQUIREMENTS.md` — add the five-image production inventory and approval status.
- `test/herbs-spices-catalogue.test.ts` — verify five exact keys, unique paths, dimensions, and approved-file existence.
- `test/phase7-browser.test.mjs` — verify desktop activation, keyboard/focus, mobile sequence, lazy images, reduced motion, no overflow, and no console errors.

### New components/files

- `src/components/herbs-spices/home/MaterialExpressionStage.tsx` — small client component owning only active-form state and desktop control behavior.
- A separate CSS Module is optional. Prefer the existing section module unless separation materially improves readability.

### New media manifest entries

- `form-whole`
- `form-cut-sifted`
- `form-tbc`
- `form-crushed`
- `form-powder`

Recommended structure: `HERBS_SPICES_MEDIA.forms.{whole, cutSifted, tbc, crushed, powder}`. Keep this collection at manifest top level because it describes reusable division formats, even though the first consumer is the homepage.

Each entry begins as `awaiting-approved-asset` and becomes `approved` only when the exact file exists, dimensions/ratio are verified, crop focus and alt text match the actual asset, and responsive browser review passes.

### New assets

- `public/assets/herbs-spices/forms/whole.webp`
- `public/assets/herbs-spices/forms/cut-sifted.webp`
- `public/assets/herbs-spices/forms/tbc.webp`
- `public/assets/herbs-spices/forms/crushed.webp`
- `public/assets/herbs-spices/forms/powder.webp`

### Fallback behavior

If an entry is pending or absent, preserve the current dark arched material field and CSS geometry. Adapt its grain/shape treatment subtly to the selected state, but do not show a missing-image icon, empty rectangle, or network-broken image. Text and controls remain fully usable.

## 15. Final recommended concept

Implement **Concept 1 — Material Stage**, using the Option A matched-image strategy and the native vertical mobile sequence.

### Why it is strongest

- It makes the headline immediately visible: one subject changes in front of the user while the frame remains constant.
- It is more memorable than a list without turning the homepage into an animation demo.
- The specimen-like comparison feels appropriate for international B2B ingredient conversations.
- It stays distinct from Products because there are no product cards, filters, specifications, or enquiry actions.
- Desktop receives a deliberate interactive focal point, while mobile receives a readable, tactile narrative instead of a compressed desktop control.
- Five static images plus one small state component are maintainable and testable.
- It reuses the existing media manifest, image component, fallback contract, tokens, and natural-scrolling principle.

## Exact implementation sequence

1. Approve the Material Stage direction and the visual-metaphor qualifier.
2. Art-direct and produce the matched five-image hibiscus-inspired series.
3. Review the series side-by-side for constant camera, surface, light direction, crop safety, and credible granularity differences.
4. Export the five 4:5 WebP masters to `public/assets/herbs-spices/forms/`.
5. Extend media key/kind types without changing catalogue or form taxonomy.
6. Add `HERBS_SPICES_MEDIA.forms` entries as pending with explicit dimensions, sizes, crop focus, and alt strategy.
7. Build `MaterialExpressionStage` with the existing CSS fallback first.
8. Implement desktop button state, focus, `aria-pressed`, and image replacement.
9. Implement the separate mobile vertical specimen composition using the same five data records.
10. Add CSS motion and a complete reduced-motion override.
11. Verify each approved file, then change entries individually to `approved`.
12. Run typecheck, build, manifest integrity, desktop keyboard/touch, 390px mobile, lazy loading, broken-image, console, layout-shift, and overflow tests.
13. Confirm the supporting availability sentence remains visible and that no product record received inferred forms.

Stop after these implementation checks; do not expand the redesign into adjacent homepage sections.
