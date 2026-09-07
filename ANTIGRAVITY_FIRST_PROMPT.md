# First Prompt for Antigravity

You are working on the AGRICA website production build.

Use the attached static prototype as the visual and UX source of truth. Read `ANTIGRAVITY_HANDOFF.md` and `MOTION_DIRECTOR.md` before making changes.

## First task only

Audit the existing project and prepare a route-by-route migration plan for:

1. Homepage `/`
2. Products `/products`
3. Our Standard `/standard`

The production target is Next.js App Router with TypeScript strict mode. Preserve the approved desktop and mobile layouts, all 60 products, in-page product selection, and quotation drawer behavior.

Do not implement GSAP yet. Do not redesign the UI. Do not generate new assets. Do not rename or delete the supplied prototype files.

Your response must include:

- the exact current project structure;
- the proposed component and data structure;
- which prototype selectors map to each React component;
- any missing assets or business data;
- risks that could change the approved visual output;
- a phased implementation plan where every phase ends with desktop and mobile verification.

Stop after the plan and wait for approval before editing production code.
