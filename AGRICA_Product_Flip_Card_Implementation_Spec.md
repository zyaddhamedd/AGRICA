# AGRICA `/products` — Flip Export Card Implementation Specification

## Goal

Replace the current product card system on `/products` with a new premium **front/back flip card** experience inspired by the approved dark AGRICA concept.

The new card must feel like a **luxury export trading card** rather than an ecommerce tile.

Core interaction:

- Front = product identity / visual
- Tap or click the card = flip 180° to reveal the back
- Back = structured product specification table
- Tap/click again = return to the front
- No modal
- No drawer
- No separate “View details” button
- No extra detail CTA
- The entire card itself is the interaction

The system must support all 60 AGRICA products across:

- Fresh
- Frozen
- Dried

All three worlds use the **same card architecture and AGRICA identity**, but each world has its own restrained atmospheric theme.

---

# 1. Design Direction

## Approved visual language

The card should feel:

- dark
- premium
- tactile
- collectible
- elegant
- export-focused
- slightly game-card inspired
- serious enough for international B2B buyers
- visually floating above the page
- strongly aligned with AGRICA Navy + Green

The card must NOT feel like:

- ecommerce
- SaaS
- dashboard
- generic glassmorphism
- childish trading card
- gaming UI
- overly futuristic sci-fi

The result should be a **luxury export specimen card**.

---

# 2. Core Card Geometry

Use one strict card shell for every product.

## Shape

- portrait card
- rounded corners
- suggested radius: `18px–24px`
- dark premium surface
- subtle thin inner edge/highlight
- deep soft shadow
- slight elevation from page background
- consistent height per breakpoint
- front and back must share EXACTLY the same dimensions

Suggested mobile ratio:

`~ 0.72–0.76 width / height`

Example:

- width: `100%`
- height: approximately `520px–580px` depending on current catalogue width

Desktop:
- preserve portrait card character
- do not flatten into wide ecommerce tiles

---

# 3. 3D Flip Architecture

The entire card is a 3D flip object.

Recommended structure:

```tsx
<div className="export-card-scene">
  <article
    className={cn("export-card", isFlipped && "is-flipped")}
    onClick={toggleFlip}
  >
    <section className="export-card-face export-card-front">
      ...
    </section>

    <section className="export-card-face export-card-back">
      ...
    </section>
  </article>
</div>
```

Core CSS concept:

```css
.export-card-scene {
  perspective: 1400px;
}

.export-card {
  position: relative;
  transform-style: preserve-3d;
  transition:
    transform 620ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 400ms ease,
    box-shadow 400ms ease;
}

.export-card.is-flipped {
  transform: rotateY(180deg);
}

.export-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.export-card-back {
  transform: rotateY(180deg);
}
```

Do not use hover-to-flip.

Desktop:
- click to flip

Mobile:
- tap to flip

The flip should feel controlled and premium.

No bounce.
No spring.
No exaggerated 3D wobble.

---

# 4. Floating / Elevated Card Feel

The card must visibly float above the page.

Use a layered shadow system.

Suggested direction:

```css
box-shadow:
  0 28px 70px rgba(0, 32, 80, 0.16),
  0 8px 24px rgba(0, 0, 0, 0.10),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

On desktop hover:

- translateY only `-3px` to `-5px`
- shadow deepens slightly
- image may settle/scale subtly
- do NOT flip automatically

On mobile:
- no hover dependency

---

# 5. Shared AGRICA Card Identity

## Base colors

AGRICA Navy:

`#002050`

AGRICA Green:

`#50A010`

The card should use Navy as the main family anchor.

Use green as:
- micro accent
- status
- small separators
- category code
- selected quote state
- fine structural detail

Do NOT use large full green areas.

No AGRICA logo is required on the card.

The card should communicate AGRICA through:
- palette
- typography
- layout
- product photography
- disciplined information design

---

# 6. Front Face — Shared Architecture

Every product front must follow the same structure.

## Anatomy

```text
FR / CIT                                      +

ORANGES

FRESH PRODUCE · CITRUS
Valencia · Navel · Baladi


             [ PRODUCT IMAGE / CUTOUT ]


small bottom micro-meta / decorative line
```

The front should feel visually strong even before interaction.

---

# 7. Front Face — Detailed Layout

## 7.1 Product Code

Example:

`FR / CIT`

Position:
- top-left

Style:
- very small uppercase
- wide letter spacing
- AGRICA Green
- shared global meta font
- visually quiet

Do not create a chunky badge.

---

## 7.2 Product Name

The product name must be one of the strongest visual elements.

Examples:

`ORANGES`
`LEMONS`
`STRAWBERRIES`
`MIXED VEGETABLES`

Use:
- approved AGRICA sans or approved editorial display typography
- large scale
- tight tracking
- strong line-height
- off-white/ivory text

Do not shrink long names excessively.

Handle 2-line names intentionally.

Suggested mobile:
`clamp(2.2rem, 10vw, 3.8rem)`

Desktop:
larger where space allows.

---

# 8. Product Image System

The image should be integrated into the card, not placed inside a generic rectangle.

Preferred treatment:

- transparent/cutout product asset where available
- large product composition
- crop allowed to slightly overlap internal visual zones
- subtle grounding shadow
- no white ecommerce image box
- no framed photo unless intentionally required

For existing non-transparent assets:
- use clean masked imagery
- keep background consistent with the card theme
- do not allow mixed random source backgrounds

The image should feel like part of the card artwork.

---

# 9. Variety / Supporting Line

Keep one supporting variety line.

Example:

`Valencia · Navel · Baladi`

Use:
- small body typography
- muted off-white / cool gray
- maximum 1–2 lines
- clamp long text

Do not display technical specifications on the front.

---

# 10. Quote Add Action

Keep the current quote functionality.

Use a minimal `+` / `✓` action.

Placement:
- top-right or aligned with the product title

Important interaction rule:

Clicking `+` must NOT flip the card.

Use:

```tsx
event.stopPropagation()
```

Selected state:

- `✓`
- AGRICA Green
- subtle visual feedback only

No circle button.
No heavy CTA.

---

# 11. Back Face — Product Specification Table

The back is the key innovation.

The back should NOT open another drawer/modal.

All useful product details must be presented directly on the card back.

Use a clean structured specification table.

## Back hierarchy

```text
FR / CIT

ORANGES

PRODUCT SPECIFICATIONS

--------------------------------
Origin              Egypt
Condition           Fresh Produce
Harvest Window      Dec — May
Varieties           Valencia / Navel / Baladi
Size / Calibre      56 — 88 mm
Brix                11.5° — 13.0°
Acidity             0.8% — 1.0%
Average Weight      180 — 240 g
Packaging           10kg / 15kg cartons
Shelf Life          45 Days Refrigerated
--------------------------------
```

The exact available rows depend on approved product data.

---

# 12. Back Table Styling

Do not make it look like Excel.

Use:
- no boxed cells
- no heavy borders
- thin horizontal separators
- optional thin green vertical accent
- label column on left
- value column on right
- strong spacing rhythm
- navy / ivory dark-surface contrast

Recommended grid:

```css
grid-template-columns: minmax(90px, 38%) 1fr;
```

Labels:
- uppercase
- small
- wide tracked
- muted cool gray

Values:
- brighter ivory/white
- normal case
- easier reading

Green:
- separators / tiny accent only

---

# 13. Missing Data Rules

Never invent technical values.

If a specification field does not have approved data:

- omit the row completely

Do NOT render:
- `N/A`
- `—`
- `TBD`
- fake placeholder numbers

The back must gracefully support partial data.

---

# 14. World Variants

All worlds use the SAME card system.

Only atmosphere changes.

## Fresh

Primary:
- deep AGRICA Navy

Accent:
- AGRICA Green

Surface nuance:
- dark navy with soft botanical green undertone

Image treatment:
- fresh natural saturation
- warm highlights
- subtle organic texture

Code examples:
- `FR / CIT`
- `FR / FRT`
- `FR / VEG`

---

## Frozen

Primary:
- deep blue/navy

Accent:
- cool icy blue + restrained AGRICA Green

Surface nuance:
- colder navy
- slight blue-gray depth

Image treatment:
- crisp frost
- cold highlights
- clean IQF look

Code examples:
- `FZ / IQF-F`
- `FZ / IQF-V`

Do not turn the card cyan or bright blue.

It must still look like AGRICA.

---

## Dried

Primary:
- deep navy with a warmer undertone

Accent:
- AGRICA Green + muted warm sand/bronze micro-accent

Surface nuance:
- slightly warmer dark surface

Image treatment:
- warm tactile textures
- natural dried tones
- controlled amber light

Code examples:
- `DR / FRUIT`
- `DR / VEG`

Do not use brown as the main brand surface.

Navy remains dominant.

---

# 15. Flip State UX

When a card flips:

- preserve page height
- preserve grid geometry
- no layout shift
- no reflow
- no scroll jump

Only the 3D face changes.

If several cards exist:
- each card owns its own flip state

Preferred behavior:
- only one card may remain flipped at a time on mobile
- clicking another card may close the previous card

This avoids visual confusion.

---

# 16. Mobile UX

Mobile is the priority.

Requirements:

- natural vertical page scroll
- tap card to flip
- no accidental flip while scrolling
- maintain stable card height
- back table fully readable
- no horizontal table scroll
- comfortable text size
- no tiny technical values
- no giant card that takes multiple screens

Use internal layout compression intelligently if many spec rows exist.

If a product has many rows:
- prioritize approved key export specs
- keep card readable
- do not create internal scrolling unless absolutely unavoidable

---

# 17. Desktop UX

Desktop:
- 3-column grid preferred
- same card architecture
- slightly taller cards if needed
- subtle hover elevation
- click to flip
- no hover flip

Cards should feel like a collection of premium export specimen cards.

---

# 18. Accessibility

Use proper keyboard interaction.

Each card should be reachable via keyboard.

Support:
- Enter / Space to flip
- visible focus state
- `aria-pressed` or equivalent flip-state semantics
- reduced motion preference

For reduced motion:

Do not perform 3D spin.

Use a fast crossfade/front-back state swap instead.

---

# 19. Performance

Do not implement heavy per-card GSAP instances for 60 cards.

Preferred:
- CSS transform for flip
- CSS transitions
- GSAP only if required for page-level reveal

This keeps the catalogue fast.

Use:
- `will-change: transform` carefully
- only while interacting if possible
- no permanent unnecessary GPU pressure on 60 cards

---

# 20. Data Architecture

Reuse the current `ProductAtlasItem` data.

Extend only where necessary for structured specs.

Possible shape:

```ts
type ProductSpecification = {
  label: string;
  value: string;
};

type ProductAtlasItem = {
  ...
  specifications?: ProductSpecification[];
};
```

If variety-specific data exists:

```ts
type ProductVariety = {
  name: string;
  specifications?: ProductSpecification[];
};
```

Do not fabricate missing content.

---

# 21. Component Architecture

Recommended:

```text
ProductFlipCard
├── ProductCardFront
├── ProductCardBack
├── ProductSpecTable
└── QuoteMicroAction
```

Do not create separate components per world.

Use:

```tsx
<ProductFlipCard world="fresh" />
<ProductFlipCard world="frozen" />
<ProductFlipCard world="dried" />
```

World-specific styling comes from data attributes/classes:

```html
data-world="fresh"
data-world="frozen"
data-world="dried"
```

---

# 22. Remove Old Product Card System

Replace the current visual card structure.

Remove/deprecate:

- current separated image/title/meta stack
- old card-specific large whitespace
- old “detail click opens sheet” as the default card interaction
- old card visual framing
- duplicated detail-preview UI

Do NOT remove quote functionality.

Do NOT delete product detail architecture blindly if it is still used elsewhere.

First detach it safely from the card interaction.

---

# 23. Product Detail Sheet Relationship

The primary interaction should now be:

CARD FRONT
→ CLICK
→ CARD BACK

Do NOT automatically open Product Detail Sheet from the card.

If the sheet remains needed elsewhere in the project:
- keep it internally
- do not delete unless proven dead
- remove it only after safe dependency audit

The flip card is now the main catalogue detail experience.

---

# 24. Visual Quality Bar

The result should feel comparable to:

- luxury collectible card
- premium wine specification card
- high-end agricultural export specimen card
- editorial packaging system

It should NOT feel like:

- Amazon product card
- grocery ecommerce
- dashboard widget
- children’s trading card
- generic Bootstrap flip card

---

# 25. Implementation Order

Implement in this order:

1. Audit current `ProductAtlasCard.tsx`
2. Audit existing product detail data
3. Build shared flip shell
4. Build front face
5. Build back spec table
6. Add quote micro-action
7. Add Fresh theme
8. Add Frozen theme
9. Add Dried theme
10. Mobile responsive pass
11. Desktop responsive pass
12. Accessibility
13. reduced-motion fallback
14. detach old sheet-opening behavior
15. TypeScript/build verification

---

# 26. Verification Checklist

Verify:

- all Fresh cards use the same structure
- all Frozen cards use the same structure
- all Dried cards use the same structure
- world themes are distinct but clearly AGRICA
- card heights remain consistent
- flip does not move the page
- `+` does not trigger flip
- card tap/click flips
- back table stays readable on mobile
- no invented spec data
- no horizontal overflow
- keyboard interaction works
- reduced motion works
- quote state remains intact

Run:

```bash
npx tsc --noEmit
```

and the normal project build.

---

# 27. Final Deliverable

When complete, return a concise report containing:

- files created/modified
- old card behavior removed/replaced
- front card anatomy
- back table anatomy
- Fresh theme
- Frozen theme
- Dried theme
- flip interaction details
- mobile behavior
- accessibility behavior
- any product data limitations found
- confirmation that no specifications were invented

Do not generate screenshots.
I will inspect the implementation manually.
