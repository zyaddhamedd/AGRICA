# AGRICA Herbs & Spices Content Review

Source reviewed: client-provided `AGRICA CP.pdf`, using the explicitly approved migration brief as the publication boundary. The PDF is a content source only; it is not a design reference.

## Migrated in this phase

- Six product families and the 27 named products are now the static, source-controlled catalogue.
- Division-level forms are Whole, Cut & Sifted, TBC (Tea Bag Cut), Crushed, and Powder.
- Onion alone has source-backed product-level forms: Flakes, Granules, and Powder. Garlic and all other products retain unknown product-level forms.
- No CMS, database, admin panel, product API, or product detail routes are required. Future catalogue changes belong in `src/data/herbs-spices/`.

## Current provisional process

Source → Prepare → Dry → Grade → Pack → Export

This sequence remains unchanged in the active Standard page pending content approval.

## PDF business capabilities

- Sourcing
- Processing
- Quality Control
- Logistics
- Documentation
- Customization

The profile also refers to direct sourcing from trusted farms across Egypt, preparation in certified facilities, whole/cut/TBC/powder formats, logistics under FOB/CIF/CFR, and export documentation. These are recorded for review, not published as active claims in this phase.

## Recommendation for the final Standard story

Use Sourcing → Processing → Quality Control → Packing/Documentation → Logistics as the candidate chronological narrative only after the client confirms the operating detail and evidence. Treat Customization as a cross-cutting commercial capability rather than a process stage. Treat documentation and Incoterms as export-readiness/support content, not proof of a physical production step. Keep the current provisional sequence until that confirmation is complete.

## Client verification required

The PDF visually references certification or quality marks including EU organic-style, USDA Organic, ISO marks, ISO 22000, ISO 45001, Halal, and HACCP. None are approved for the website yet. Before publication, confirm for each claim:

- current validity and expiry;
- certificate holder/legal entity;
- certificate number and scope;
- whether AGRICA is authorized to display the mark publicly.

No logo or certification claim has been added to active site UI.

## Brand and About material held for later review

Potential source themes include Egyptian origin, medicinal and aromatic plants, traceability, sustainable practices, and international supply. The full About, Mission, and Vision copy was not copied. Each theme needs editorial and substantiation review before replacing current brand copy.

## Contact data held for confirmation

The profile contains contact locations/numbers for Egypt, Canada, and the Netherlands, plus email/domain information. No contact value was migrated. The client must confirm the exact current contacts, legal ownership, and which locations should appear on this website before publication.

## Media status

All 27 products have stable future media paths under `public/assets/herbs-spices/products/`. PDF thumbnails were not extracted or republished. The current CSS material placeholders remain until approved production assets arrive.
