# AGRICA — Antigravity Handoff

## What this package is

This is the approved static visual base for the AGRICA website. It contains three responsive routes:

- `/` — Homepage and brand direction
- `/products/` — Approved Product Explorer with Fresh, Frozen and Dried catalogues
- `/standard/` — Modern AGRICA Trace journey

The base intentionally contains no GSAP scroll choreography. Interactions that clarify state already work; cinematic motion should be added route by route without redesigning the approved layouts.

## Run locally

Serve the `dist` directory through a local HTTP server. Do not review the project by double-clicking the HTML files.

Example:

```bash
python -m http.server 4173 -d dist
```

Then open `http://localhost:4173`.

## Approved product experience

- All 60 products remain in one page.
- Users switch between Fresh, Frozen and Dried.
- Users choose a family, then a product from the Living Shelf.
- Product information expands inside the same page.
- Products can be added to a quotation drawer without navigation.
- Mobile has a persistent quotation action.

Do not replace this with the rejected Product Passport/search redesign unless the client requests it again.

## Motion-ready targets

### Homepage

- `.headline-line`
- `.hero-portals`
- `.portal`
- `.world-image`
- `.journey-marker`

### Products

- `.world-button`
- `.family-button`
- `.stage-media`
- `.stage-content`
- `.rail-product`
- `.quote-drawer`

### Our Standard

- `.stage-watermark`
- `.lot-card`
- `.lot-stamp`
- `.route-line i`
- `.stage-detail`
- `.register-grid article`

Detailed choreography principles are in `MOTION_DIRECTOR.md`.

## Non-negotiable implementation rules

- Preserve AGRICA Navy `#002050`, Fresh Green `#50A010`, and the warm-white canvas.
- Keep natural scrolling. Do not add scroll-jacking.
- Use `gsap.matchMedia()` and create separate desktop and mobile motion.
- Respect `prefers-reduced-motion`.
- Do not animate layout properties when transforms and opacity can achieve the same result.
- Keep keyboard focus, touch targets, quotation controls, and semantic HTML working.
- Never trade usability or readable product information for an effect.

## Suggested production migration

The package is a design prototype built with plain HTML, CSS and JavaScript. For the production Next.js application:

1. Rebuild each route as semantic React components.
2. Move the product library into typed data.
3. Preserve the visual output before adding motion.
4. Connect the quotation form to the approved backend or CRM endpoint.
5. Add GSAP one section at a time and verify mobile after every section.

