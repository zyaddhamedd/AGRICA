# AGRICA Herbs & Spices Media Requirements

This is the production inventory for the division's approved web media. The central implementation manifest is `src/data/herbs-spices/media.ts`. A planned file path is not rendered until its manifest status is changed from `awaiting-approved-asset` to `approved`.

## Ratio system

| Usage | Ratio | Orientation | Delivery guidance |
| --- | --- | --- | --- |
| Homepage hero | 4:5 | Portrait | Approved asset: 1120 × 1400 WebP; allow responsive edge cropping |
| Supporting editorial visual | 3:2 | Landscape | 1800 × 1200 WebP |
| Family visual | 4:5 | Portrait | Approved set: 1120 × 1400 WebP; safe central subject area |
| Product specimen | 4:3 | Landscape | 1600 × 1200 WebP; consistent scale and surface treatment |
| Process stage | 4:3 | Landscape | 1600 × 1200 WebP; documentary/editorial composition |
| Process teaser | 16:9 | Landscape | 1920 × 1080 WebP |

Final exports should retain the declared ratio and sufficient resolution for high-density screens. Crop focus and alt text must be reviewed against the actual approved image before its status changes to `approved`.

## Homepage inventory

| Key | Planned file | Ratio | Orientation | Usage | Priority | Style note |
| --- | --- | --- | --- | --- | --- | --- |
| `hero-primary` | `home/hero-primary.webp` | 4:5 | Portrait | Primary hero slot / LCP candidate; approved at 1120 × 1400 | Critical | Single tactile ingredient-led composition with dark negative space |
| `hero-detail-one` | `home/hero-detail-one.webp` | 3:2 | Landscape | Optional supporting detail | Optional | Macro material detail |
| `hero-detail-two` | `home/hero-detail-two.webp` | 3:2 | Landscape | Optional supporting detail | Optional | Complementary texture, distinct from the primary crop |
| `process-teaser` | `home/process-teaser.webp` | 16:9 | Landscape | Optional homepage process teaser | Optional | Controlled process detail without unverifiable claims |
| `trust-primary` | `home/trust-primary.webp` | 3:2 | Landscape | Optional trust/editorial section | Optional | Origin-led but contemporary and restrained |

The current page consumes `hero-primary`. The two detail visuals, process teaser, and trust visual are reserved for later use only if the existing layout calls for them; they do not justify a redesign.

## Family inventory

| Key | Planned file | Ratio | Orientation | Usage | Priority |
| --- | --- | --- | --- | --- | --- |
| `family-herbs` | `families/herbs.webp` | 4:5 | Portrait | Herbs family card; approved | High |
| `family-flowers` | `families/flowers.webp` | 4:5 | Portrait | Flowers family card; approved | High |
| `family-seeds` | `families/seeds.webp` | 4:5 | Portrait | Seeds family card; approved | High |
| `family-spices` | `families/spices.webp` | 4:5 | Portrait | Spices family card; approved | High |
| `family-roots` | `families/roots.webp` | 4:5 | Portrait | Roots family card; approved | High |
| `family-dehydrated-vegetables` | `families/dehydrated-vegetables.webp` | 4:5 | Portrait | Dehydrated Vegetables family card; approved | High |

Family images should read as a coordinated set. Avoid mixing radically different lighting, camera angles, backgrounds, or degrees of magnification.

## Product inventory

All product images use 4:3 landscape, 1600 × 1200, standard priority, and the Products specimen-card slot.

| Key | Planned file | Product |
| --- | --- | --- |
| `product-basil` | `products/basil.webp` | Basil |
| `product-dill` | `products/dill.webp` | Dill |
| `product-lemon-grass` | `products/lemon-grass.webp` | Lemon Grass |
| `product-marjoram` | `products/marjoram.webp` | Marjoram |
| `product-moringa` | `products/moringa.webp` | Moringa |
| `product-oregano` | `products/oregano.webp` | Oregano |
| `product-parsley` | `products/parsley.webp` | Parsley |
| `product-peppermint` | `products/peppermint.webp` | Peppermint |
| `product-rosemary` | `products/rosemary.webp` | Rosemary |
| `product-spearmint` | `products/spearmint.webp` | Spearmint |
| `product-thyme` | `products/thyme.webp` | Thyme |
| `product-calendula` | `products/calendula.webp` | Calendula |
| `product-chamomile` | `products/chamomile.webp` | Chamomile |
| `product-hibiscus` | `products/hibiscus.webp` | Hibiscus |
| `product-anise` | `products/anise.webp` | Anise |
| `product-black-cumin` | `products/black-cumin.webp` | Black Cumin |
| `product-caraway` | `products/caraway.webp` | Caraway |
| `product-coriander` | `products/coriander.webp` | Coriander |
| `product-fennel` | `products/fennel.webp` | Fennel |
| `product-fenugreek` | `products/fenugreek.webp` | Fenugreek |
| `product-flaxseed` | `products/flaxseed.webp` | Flaxseed |
| `product-sesame` | `products/sesame.webp` | Sesame |
| `product-cumin` | `products/cumin.webp` | Cumin |
| `product-red-chilli-pepper` | `products/red-chilli-pepper.webp` | Red Chilli Pepper |
| `product-licorice-root` | `products/licorice-root.webp` | Licorice Root |
| `product-onion` | `products/onion.webp` | Onion |
| `product-garlic` | `products/garlic.webp` | Garlic |

Use clean, ingredient-focused specimen compositions with consistent material scale. Do not imply a product form that the catalogue has not verified.

## Standard / process inventory

These are optional until process content and photography are approved. All use 4:3 landscape, 1600 × 1200, optional priority, and the existing stage specimen slot.

| Key | Planned file | Intended stage |
| --- | --- | --- |
| `process-source` | `process/source.webp` | Source |
| `process-prepare` | `process/prepare.webp` | Prepare |
| `process-dry` | `process/dry.webp` | Dry |
| `process-grade` | `process/grade.webp` | Grade |
| `process-pack` | `process/pack.webp` | Pack |
| `process-export` | `process/export.webp` | Export |

Images must not introduce machinery, facilities, certifications, control steps, or operational claims that have not been approved.

## Visual direction

- Moody, premium, dark/warm, tactile, ingredient-focused, and contemporary.
- Material-driven macro still life with controlled lighting and deliberate negative space.
- Clean isolated compositions where the product card requires them.
- Avoid rustic clichés, grocery-commercial styling, bright supermarket language, decorative clutter, and inconsistent stock-photo treatments.
- Build family and product sets under one lighting and color-grading system.

## Alt-text and accessibility workflow

- Product entries currently use concise material labels such as “Basil ingredient material.” Review each against the final photograph.
- Family and process visuals sit beside equivalent headings and are treated as decorative in the current UI to avoid repetition.
- Hero and supporting editorial entries use empty alt text until the real asset is selected. Decide whether each final image carries information; keep `alt=""` if decorative, otherwise add concise replacement text.
- CSS fallbacks are always decorative and hidden from assistive technology.

## PDF image reference note

The product thumbnails in `AGRICA CP.pdf` may help identify the intended ingredients during art direction. They are not suitable as final production web imagery and must not be cropped, upscaled, or published as site assets.

## Approval checklist

1. Place the approved WebP at the exact planned path.
2. Confirm dimensions, ratio, crop focus, and visual consistency.
3. Replace provisional alt text where the actual image requires it.
4. Change only that entry's manifest status to `approved`.
5. Run typecheck, build, browser console, responsive overflow, and broken-image checks.
