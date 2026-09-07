# AGRICA — Motion Director Notes

Phase 01 is intentionally static. The DOM is already divided into motion-ready layers and marked with `data-motion` attributes.

## Opening sequence

1. Reveal the header rule from the center, then the wordmark.
2. Reveal each `.headline-line` through its own overflow mask.
3. Bring the three `.portal` elements in on different Y offsets; never bounce.
4. Settle the origin metadata and arrow link last.

## Hero to Three Worlds

- Pin `.hero` for the first transition only.
- Expand `.hero-portals` to the viewport grid.
- Straighten the three initial Y offsets while widening the gaps.
- Move the headline up and out through a mask.
- Match the active portal geometry to `.world-visual` before releasing the pin.

## Product world switch

- The full Phase 02 state machine now lives at `/products/` and is driven by the body `data-world` value.
- Animate background position, surface tint and copy as one controlled state change.
- Fresh: high-key and quick organic easing.
- Frozen: slower desaturation, crystalline mask from edges.
- Dried: paper wipe with the longest ease.

## Product universe opening

1. Enter with the chosen query state (`?world=fresh`, `frozen` or `dried`).
2. Reveal the active `.world-plane` from the originating homepage portal bounds.
3. Bring the oversized world title through a horizontal mask.
4. Keep the selector stable so it remains the user's spatial anchor.

## Product catalogue

- Phase 02 uses one persistent Product Explorer: condition switch, family index, inline product stage and the `.living-shelf` rail.
- Keep the stage footprint fixed. On product selection, expand the active `.rail-product`, crossfade `.stage-media`, then replace the product name and specification values through clipped text lines.
- World changes should recolour the existing interface instead of navigating or opening an overlay. The condition selector remains the spatial anchor.
- Family changes replace the rail as one coordinated group; never animate every item independently for long durations.
- The quotation drawer is a separate task layer. Open it from the right on desktop and from the bottom/full viewport on mobile, preserving the selected product behind it.
- Added products should give one concise confirmation in place; no celebratory motion or blocking modal.

## Season index

- Keep scroll passive. Interaction should be pointer/drag or month clicks.
- Rotate the circular guide and swap month/product content through clipped text lines.
- Product availability must come from approved client data before production.

## Our Standard

- The full Phase 03 state machine lives at `/standard/` and is driven by the body `data-stage` value.
- On desktop, keep `.journey-workspace` stable while the Digital Lot Passport advances along the route and the selected control changes.
- Treat stage changes as one edit: oversized `.stage-watermark`, progress line, passport position/status, approval stamp, then operational detail.
- On mobile, retain direct taps and horizontal stage navigation; do not pin the whole workspace or intercept natural scroll.
- The eight-discipline register should reveal in restrained rows, never as eight independent floating cards.
- End by carrying the route line into the closing statement before revealing the quotation CTA.

## Principles

- No elastic motion, random floating, continuous scroll-jacking or decorative particle noise.
- Motion should clarify state, hierarchy and progress.
- Use `gsap.matchMedia()` and provide a separate mobile choreography.
- Respect `prefers-reduced-motion` with direct state changes.
