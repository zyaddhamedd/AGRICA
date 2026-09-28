# AGRICA Produce Product Image Production Report

Status: planning only. No product images have been generated.

## A. Executive Recommendation

Adopt one system: **Controlled Export Realism** — a hybrid of commercial packshot accuracy and restrained editorial still-life photography.

The product must always remain the evidence. Images should show believable colour, surface texture, cut geometry, moisture or frost, and commercially credible condition. Editorial treatment is limited to composition, light, and depth; it must never invent a variety, cut, recipe, pack format, maturity stage, or processing claim.

Use a **4:5 portrait master** for every final product image, produced at the highest practical native resolution and archived at approximately 1600 × 2000 px or higher. Deliver a web-optimised AVIF/WebP derivative around 1200 × 1500 px. The 4:5 master is substantially safer than the current 4:3 landscape assets across AGRICA's desktop and mobile card crops.

Production must be gated by the final commercial form. Of the 37 products:

- **11 are ready** for final image production under the current conservative briefs.
- **25 must be held** until a form, colour, variety, cut, maturity, recipe, or active programme is confirmed.
- **1 is blocked:** Mixed Vegetables must not be produced until the complete blend recipe is approved.

## B. Product Card Image Audit

### Measured live card geometry

Measurements were taken from the current rendered AGRICA product grid after the latest compact-card changes.

| Viewport | Card size | Image viewport | Image aspect | Share of card height |
|---|---:|---:|---:|---:|
| 1440 px | 417.3 × 518.4 px | 415.7 × 431.2 px | 0.964:1 | 83.2% |
| 390 px | 351.4 × 488 px | 349.8 × 416.0 px | 0.841:1 | 85.2% |
| 320 px | 288 × 465 px | 286.4 × 397.2 px | 0.721:1 | 85.4% |

The implementation uses `object-fit: cover`, `object-position: 50% 56%`, and a 1.025 image scale. The image window therefore becomes progressively more portrait-oriented on smaller screens.

### Current source problem

All current category AVIF assets are 960 × 720 px, or 4:3 landscape. The grape exception is square. With the current 4:3 sources, the card retains approximately:

- 70% of source width at 1440 px.
- 62% of source width at 390 px.
- 53% of source width at 320 px.

This explains why edge subjects, wide arrangements, and multiple equal-weight objects crop unpredictably on mobile.

The current UI has 12 mapped product-specific AVIF images plus one dedicated grape image. The remaining 24 products rely on shared atlas/category imagery, so the new system should ultimately supply one dedicated asset for every product.

### Recommended master and safe area

A 4:5 master provides the best compromise across all three live card shapes. With the current `cover` behaviour and zoom, it retains approximately 81% of vertical content on desktop, 93% vertically at 390 px, and 88% horizontally at 320 px.

Mandatory composition safe zone:

- Keep the defining product form inside the central **70% width × 68% height**.
- Put the primary focal point at approximately **50% horizontal / 58% vertical**.
- Treat the outer 12–15% on every side as expendable crop space.
- Keep the top 25% free of irreplaceable detail. The card applies a strong fade there, with the top gradient continuing to roughly 31%.
- Keep essential cut faces and form-identifying details above the bottom 12%; the UI introduces a dark lower gradient.
- Never place a single indispensable object at the extreme left or right.
- A central triangular or shallow-pyramid arrangement is safer than a horizontal row.

### What works in the card

- One dominant hero unit or a compact cluster with a clear centre.
- A secondary cut/open unit positioned close to the hero, not at an edge.
- Moderate foreground scale with enough background continuity for cropping.
- Texture and environment in the upper fade area, not product-defining information.
- Backgrounds that naturally darken toward AGRICA navy without crushing the product.

What fails:

- Wide table spreads, crates, fields, or multiple equal subjects across the frame.
- Product details placed near corners.
- Packaging, labels, hands, utensils, or decorative ingredients.
- Very shallow focus that makes the commercial form ambiguous.

## C. Final Visual Direction

### Selected system: Controlled Export Realism

Pure packshot realism is accurate but too sterile for the card. Natural close-up photography can feel fresh but becomes inconsistent and often reads as farm or consumer advertising. Full editorial still-life risks props, drama, and product claims. The selected hybrid keeps packshot-level truth while using editorial control only for premium composition and lighting.

Core identity:

- Photoreal, tactile, minimal, and B2B credible.
- Product occupies roughly 68–80% of the useful frame.
- Natural, commercially acceptable variation; never cosmetically perfect to the point of looking synthetic.
- Clean surfaces with controlled imperfections appropriate to the product.
- No labels, logos, typography, branded packs, consumer serving scenes, or country-of-origin theatre.
- No excessive saturation, fake gloss, floating particles, dramatic smoke, impossible condensation, or AI-perfect repetition.
- Existing AGRICA palette only: deep navy, green accents, cream highlights, and restrained existing warm dried-category tones. Frozen images may feel cooler through neutral light and frost, not through added cyan or teal colour grading.

## D. Category Art Direction Rules

### Fresh

- Show export-quality produce with believable natural variation in size, shape, and skin.
- Use intact stems or leaves only where botanically normal and commercially plausible. Do not add decorative leaves to products that would normally be trimmed.
- Moisture must be selective: zero to a few small droplets on firm-skinned fruit; no misted “wet look.” Dry bulb, root, and cured products should remain dry.
- One cut/open specimen is allowed only when it does not assert an unconfirmed seed status, flesh colour, variety, or maturity stage.
- Avoid visible fields or farm storytelling. At most, use a very soft, unidentifiable organic background hint.
- Colour must remain cultivar-neutral when variety is unconfirmed.
- Condition should be premium but real: no rot, bruising, mould, severe scars, waxy plastic skin, or identical cloned units.

### Frozen

- Show separated IQF pieces, not a solid frozen block unless the confirmed commercial form is a block.
- Use light micro-frost on edges and recesses, normally 5–15% visual coverage. Frost must not hide the cut or product identity.
- Ice crystals should be small and irregular. Avoid snow, ice cubes, blue fog, frozen vapour, and consumer-freezer clichés.
- The product form must be immediately readable: whole, halves, slices, dice, florets, cuts, hearts, bottoms, or chopped material cannot be improvised.
- Maintain natural food colour under neutral-cool light; do not grade the product blue.
- Keep pieces physically believable, separately frozen, and varied enough to avoid pattern repetition.

### Dried

- Prioritise texture, shrinkage, edge irregularity, porosity, and particle definition.
- The exact commercial form must be visible and therefore must be approved first: whole, slice, strip, flake, granule, minced, crushed, or powder.
- Use loose material on a matte surface or in a low, unbranded shallow vessel only where containment is necessary.
- No retail packaging. Bulk packaging should also remain absent unless it is the subject of a separate approved pack-format image.
- Keep colour dry and natural. Avoid orange warmth, oily shine, rustic burlap, scattered herbs, wooden spoons, and recipe styling.
- Oil-packed and dry-packed products must never be visually conflated.

## E. Composition, Lighting, and Background System

### Composition

- Master aspect ratio: 4:5 portrait.
- Camera: consistent close 3/4 angle, approximately 20–35 degrees above the product.
- Lens character: natural compression comparable to a 70–90 mm full-frame lens; no wide-angle distortion.
- Framing: close but not macro-only; the entire commercial form must be recognisable.
- Hero placement: centred slightly below midpoint.
- Negative space: 18–25%, concentrated above and around the shoulders of the product arrangement.
- Depth of field: moderate. Hero and form-defining secondary pieces sharp; background softly resolved, never fully abstract.
- Shadows: soft contact shadows that prove weight and surface contact. No floating products.
- Environment: no more than 10–15% of the visual story.

### Lighting

Unified base:

- One large soft key from upper left at roughly 45 degrees.
- Gentle frontal fill that preserves shadow detail.
- Very restrained rear or side separation light.
- Medium-low contrast, clean specular highlights, and neutral white balance.
- Product colour takes precedence over cinematic mood.

Category adjustments:

- Fresh: neutral daylight feel around 5000–5400 K; crisp but soft highlights.
- Frozen: neutral-cool 4800–5200 K impression, with frost supplying the cold cue. No blue wash.
- Dried: warm-neutral 4300–4800 K impression and slightly more raking side light to reveal texture. No sepia treatment.

### Background and surface

Use one shared family of matte, low-reflection surfaces derived from the existing AGRICA palette:

- Base background: deep AGRICA navy/charcoal, visually aligned with `#002050` and `#00142F`.
- Fresh: the base with a restrained existing green bounce, aligned with `#50A010` / `#91BD71`.
- Frozen: the same navy base under neutral-cool light. Existing frozen values may inform contrast, but do not introduce new cyan or teal.
- Dried: the navy base with a restrained warm-neutral reflection aligned with the existing `#C7A36B` dried accent.
- Surface texture: fine matte stone or seamless coated studio surface. Avoid recognisable marble, rustic wood, soil, burlap, stainless-kitchen scenes, or glossy acrylic.

## F. Product Image Readiness Notes

Legend: **READY** = can proceed after style approval. **HOLD** = safe proxy may be used for composition study, but final production must wait for the listed dependency. **BLOCKED** = do not spend generation credits yet.

### Fresh — 20 products

| Product | Status | Exact commercial form / dependency | Safe visual now |
|---|---|---|---|
| Oranges | READY | Whole fruit; no variety claim | Whole oranges plus one cut fruit |
| Lemons | READY | Whole yellow fruit | Whole lemons plus one cut half |
| Egyptian Limes | HOLD | Exact lime type | Generic green limes only as a style proxy |
| Mandarins | READY | Whole fruit | Whole mandarins plus one naturally peeled fruit |
| Grapes | HOLD | Colour and variety | Neutral bunch composition study; not final |
| Pomegranates | READY | Whole fruit | Whole fruit plus one opened fruit, no named variety cues |
| Strawberries | READY | Fresh whole berries | Loose whole berries with natural variation |
| Blueberries | HOLD | Active AGRICA programme | Generic loose berries only as a non-published proxy |
| Mangoes | HOLD | Variety, skin colour, maturity | Neutral mango arrangement; final colour waits |
| Guava | HOLD | Variety and active programme | Generic whole and cut guava study only |
| Dates | HOLD | Khalal/Rutab/Tamar stage and variety | Do not lock colour or moisture before confirmation |
| Watermelon | READY | Whole plus cut section | Keep seed-status evidence visually non-committal |
| Potatoes | HOLD | Table/processing end use and variety | Generic clean whole potatoes as proxy |
| Sweet Potatoes | HOLD | Skin and flesh colour | Whole roots; avoid exposed flesh until confirmed |
| Onions | HOLD | Red/yellow/other colour | Cured bulb composition only after colour selection |
| Garlic | READY | Whole/cured bulb presentation | Whole bulbs plus one separated clove |
| Green Beans | READY | Fresh whole pods | Loose pods without measurable calibre cue |
| Artichokes | READY | Whole globe form | Whole globe artichokes only |
| Carrots | HOLD | Topped/bunched/washed presentation | Neutral topped carrot study only |
| Taro | HOLD | Species and corm/cormel form | Generic whole clean corm study only |

### Frozen — 11 products

| Product | Status | Exact commercial form / dependency | Safe visual now |
|---|---|---|---|
| IQF Strawberries | HOLD | Whole, halves, slices, or dice | Frost and lighting study without final cut claim |
| IQF Mango | HOLD | Cut, dimensions, colour, maturity | Non-calibrated pieces as style proxy only |
| IQF Pomegranate Arils | READY | Loose arils | Individually frozen arils with light natural frost |
| IQF Green Beans | HOLD | Whole or cut form and calibre | Frosted material study only |
| IQF Green Peas | READY | Loose whole peas | Separated peas with natural size variation |
| IQF Okra | HOLD | Whole/cut form, trim, calibre | Do not finalise before form selection |
| IQF Molokhia | HOLD | Whole-leaf or chopped | Form is visually decisive; wait for confirmation |
| IQF Artichokes | HOLD | Hearts, bottoms, quarters, or pieces | Form is visually decisive; wait for confirmation |
| IQF Broccoli | HOLD | Floret/cut form and calibration | Generic frozen pieces only as style proxy |
| Mixed Vegetables | BLOCKED | Complete recipe, proportions, and cuts | Nothing is safe: any visible mix becomes a claim |
| Pre-fried Frozen French Fries | HOLD | Cut, potato, oil/coating, finish | Generic cut study only; not final |

### Dried — 6 products

| Product | Status | Exact commercial form / dependency | Safe visual now |
|---|---|---|---|
| Dried Lemon | HOLD | Whole, slices, peel, granules, or powder | Style anchor only after one form is selected |
| Raisins | HOLD | Colour, variety, seed status, size | Loose arrangement only after style/colour approval |
| Sun-Dried Tomatoes | HOLD | Halves/strips/pieces and dry/oil-packed state | Do not show oil, herbs, or a cut before confirmation |
| Dehydrated Onion | HOLD | Flakes, granules, minced, or powder | Final image waits for form and particle size |
| Dehydrated Garlic | HOLD | Flakes, granules, minced, or powder | Final image waits for form and particle size |
| Dried Molokhia | HOLD | Whole leaf, crushed, or powder | Final image waits for form and particle size |

## G. Higgsfield Credit-Saving Workflow

### 1. Commercial preflight — zero generation credits

Create a one-line locked visual specification for every HOLD/BLOCKED product before generation:

`product form + variety/colour + cut/calibre + maturity/condition + treatment + packaging excluded/included`

Do not infer missing choices from generic market conventions. Mixed Vegetables remains blocked until its complete recipe is supplied.

### 2. Three category anchors

Generate only two candidates per approved anchor: six exploratory images total. Use one controlled variable between the two candidates, normally subject scale or secondary cut placement. Do not change the entire art direction between candidates.

Score every output before any refinement:

- Product and botanical/form accuracy: 30 points.
- Crop robustness at 1440/390/320: 25 points.
- Photographic realism and physical plausibility: 20 points.
- Clear Fresh/Frozen/Dried signal: 15 points.
- AGRICA brand fit: 10 points.

Pass threshold: 85/100 with no critical product-form defect. Allow at most one refinement per anchor, creating a hard exploratory cap of nine outputs.

### 3. Lock the style DNA

After approval, freeze:

- 4:5 framing and safe-zone instructions.
- Camera angle and lens character.
- Key-light direction and softness.
- Surface/background family.
- Contrast, depth of field, and colour restraint.
- Category-specific moisture, frost, or texture rules.
- Negative constraints.

Use the approved category anchor as the only style reference for that category. Do not create long chains of generated-image references, which accumulate visual errors.

### 4. References versus prompt-only work

Prompt-only is acceptable for the 11 READY products when the form is generic and unambiguous.

A real client or supplier reference is strongly recommended for:

- Grapes, mangoes, dates, potatoes, sweet potatoes, onions, carrots, taro.
- Every frozen item where cut/form is pending.
- Fries cut and surface finish.
- Every dried product form.
- The final Mixed Vegetables recipe.

References should prove product form and colour, not dictate art direction. The locked AGRICA anchor dictates style.

### 5. Efficient batch execution

- Work in category batches of four to six products.
- Generate one primary output per locked, straightforward product.
- Generate a second candidate only when a known ambiguity remains.
- Review contact sheets at card crop sizes before requesting refinements.
- Reject anatomical, botanical, cut, frost, repetition, or texture errors immediately; do not try to rescue them through upscaling.
- Upscale/export only the selected final image.
- Preserve prompt, seed/reference, category anchor, approval state, and final filename in a production ledger.

## H. Recommended Three-Image Test Phase

### 1. Fresh anchor — Oranges

Why: ready now, immediately recognisable, already visible in the live UI, and capable of testing skin texture, realistic colour, limited moisture, leaf restraint, and a cut interior.

Must prove: premium realism without oversaturation; a central composition that survives all three crops; believable peel texture; clean navy integration.

Risks uncovered: plastic skin, fake droplets, excessive leaves, edge cropping, orange colour clipping, and overly consumer-ad styling.

### 2. Frozen anchor — IQF Green Peas

Why: ready now and technically demanding. Many small repeated objects reveal weak AI patterning quickly and make IQF separation and frost physics easy to judge.

Must prove: individually frozen pieces, subtle irregular frost, natural green colour, believable size variation, and a cold signal without blue grading.

Risks uncovered: cloned peas, snow-like frost, melted surfaces, blue/cyan casts, and insufficient product-form clarity.

### 3. Dried anchor — Dried Lemon, after form confirmation

Why: it tests dry texture, edge irregularity, colour restraint, and the warm-neutral dried lighting system while remaining visually distinct from the fresh citrus anchor.

Mandatory gate: select one form — whole, sliced, peel, granules, or powder — before spending credits.

Must prove: clearly dried rather than rotten or burnt; detailed texture; premium dry-goods language without rustic props.

Risks uncovered: ambiguous form, artificial browning, excessive warmth, fresh-looking moisture, and decorative culinary styling.

If the dried-lemon form is not confirmed, pause the dried anchor. Do not substitute an invented form merely to complete the test set.

## I. Full Production Plan

### Phase 0 — approvals

1. Confirm all HOLD dependencies.
2. Lock the Mixed Vegetables recipe.
3. Collect supplier/reference photographs for form-critical items.
4. Approve the 4:5 safe-zone template and filename convention.

### Phase 1 — six-output anchor test

Produce two candidates each for Oranges, IQF Green Peas, and confirmed-form Dried Lemon. Review them inside the real AGRICA card at 1440, 390, and 320 px, front only, before scaling.

### Phase 2 — READY products

After anchor approval, produce the remaining ready set:

- Fresh: Lemons, Mandarins, Pomegranates, Strawberries, Watermelon, Garlic, Green Beans, Artichokes.
- Frozen: IQF Pomegranate Arils.

Oranges and IQF Green Peas are already covered by the anchor phase. No dried product is currently READY without a form decision.

### Phase 3 — Fresh conditional products

After their dependencies are confirmed: Egyptian Limes, Grapes, Blueberries, Mangoes, Guava, Dates, Potatoes, Sweet Potatoes, Onions, Carrots, and Taro.

### Phase 4 — Frozen conditional products

After exact cut/form approval: IQF Strawberries, IQF Mango, IQF Green Beans, IQF Okra, IQF Molokhia, IQF Artichokes, IQF Broccoli, and Pre-fried Frozen French Fries. Produce Mixed Vegetables last, only after recipe approval.

### Phase 5 — Dried products

After exact form approval: Dried Lemon, Raisins, Sun-Dried Tomatoes, Dehydrated Onion, Dehydrated Garlic, and Dried Molokhia. Produce one form per approved commercial offer; do not imply a range in a single image.

### Phase 6 — final QA and delivery

For every final:

1. Verify product form against the approved specification.
2. Inspect at 100% for duplicated geometry, impossible stems, cut errors, false frost, texture smearing, and invented ingredients.
3. Preview the same 4:5 master in the live 1440, 390, and 320 px cards.
4. Confirm the hero remains legible inside the central safe zone.
5. Check colour against the product reference and AGRICA background system.
6. Export one archival master and one optimised web derivative.
7. Replace the atlas fallback only after the dedicated image passes all checks.

No generation should begin until the three anchor specifications — especially the dried form — are approved.
