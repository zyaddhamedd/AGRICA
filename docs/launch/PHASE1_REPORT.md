# AGRICA Phase 1 — Herbs & Spices launch

Verdict: **GO for Phase 1 review and the next SEO planning/audit phase.** No production deployment performed. The unverified process route remains excluded from indexing.

## Isolation

- Baseline reconfirmed: `main` at `043dc5d` (latest performance commit).
- Branch: `codex/phase1-herbs-launch`; worktree: `/private/tmp/agrica-phase1`.
- Original `/Users/zyad/Projects/AGRICA` remains on `main` with exactly its pre-existing `next-env.d.ts` modification.
- Dependencies were copied locally from the existing installation, with separate build output. No dependency installation or versions changed.
- No commits, push or deployment. No OpenCode or external coding agents used.

## Implementation

- Shared CSS-only segmented navigation uses complete translated division names, visible active state, keyboard focus and reduced-motion support. Existing semantic route mapping preserves locale and corresponding home/catalogue/standard page roles.
- Both division headers and the Produce hero navbar expose the switch. Removed obsolete hero CSS that suppressed its design; tightened Herbs header proportions on narrow screens.
- Home and catalogue now declare `index, follow`. Process/standard retains `noindex, nofollow`: all six process stages are explicitly provisional and unverified in the existing data.
- Six division page roles have locale-specific absolute canonicals using the same origin as the existing contact route. Catalogue filters canonicalize to the base catalogue. No inherited homepage canonical or broad indexing rule leaks through the Herbs layout.
- Herbs metadata uses existing localized dictionary copy. Invalid locales return 404 before dictionary lookup.
- The homepage form now identifies itself as a local preview before and after submission, uses existing translated preview labels, and offers the existing email contact. No delivery/backend capability is claimed or added.
- Obsolete dormant-launch tests now enforce public navigation and selective indexing. A stale pre-atlas standard test now checks the existing tab/panel structure.

## Validation

| Check | Result |
| --- | --- |
| Baseline and final `npm run build` | PASS, Next.js 16.3.4 Turbopack |
| Baseline and final `npm run typecheck` | PASS |
| Baseline `npm run test:phase1`, prior launch gates | PASS |
| Final `npm run test:phase3b` | PASS, including i18n, product/catalogue, season, Herbs data/process, routing and localization suites |
| Final `npm run test:launch` | PASS |
| Final `npm run test:division-launch-browser` | PASS |
| Existing `BASE_URL=http://localhost:3117 node test/tier1-feature-coverage.test.mjs` | PASS, all eight feature groups |
| Changed production TypeScript files: targeted ESLint | PASS |
| Full lint | Existing debt remains: 26 baseline errors reduced to 20; 24 warnings unchanged |
| `git diff --check` | PASS |
| Independent native Codex review | No remaining blockers |

Browser QA covered all 30 localized division routes at 1440px, 390px and 320px (90 layouts), real catalogue switching in both directions, RTL, full labels, no header overlap or horizontal overflow, language controls, keyboard traversal and reduced motion. Supplemental checks covered 20 catalogue layouts/menu interactions at 768px and 1024px plus preview-only form submission in all five languages. No runtime errors in the passing suites.

Rendered HTTP checks verified self canonicals and robots on 30 routes, base-catalogue canonicals for 10 filter variants, permanent legacy Herbs redirects, no conflicting HTTP noindex, and 404s for four unsupported-locale URLs.

Screenshots were visually inspected for English desktop, Arabic mobile, Russian 320px and French mobile. Machine results and screenshots: `/private/tmp/agrica-phase1-qa`. Supplemental reproducible harness: `/private/tmp/agrica-phase1-supplemental.mjs`. Build/test logs: `/private/tmp/agrica-phase1-*.log`. Compact evidence summary: [PHASE1_EVIDENCE.json](PHASE1_EVIDENCE.json).

## Performance and limits

All eight sampled production routes recorded CLS 0. Cold homepage JavaScript transfer changed from 246,342 to 246,855 bytes (+513 bytes / +0.21%). No dependencies, media, catalogue filtering, animation scheduling or cache headers changed. The switch removes JavaScript measurement effects and observers.

These are bounded local samples with cache/timing variation, not a new Lighthouse audit or field Core Web Vitals certification. Existing custom static-cache header build warning and unrelated lint debt remain.

## Remaining issues and next phase

- Process content needs business approval before indexing; no verified process facts were invented.
- Enquiry forms remain previews. Real contact remains available, but submission integration is a separate mission.
- Some Herbs display/decorative text is already hardcoded English; navigation, locale routing and existing translations are preserved. A full translation/content audit remains necessary.
- Full repository lint is not green because of pre-existing unrelated errors; no broad refactor was attempted.

Next: conduct the comprehensive SEO audit and prioritize a separate implementation plan covering route/product discoverability, multilingual content and hreflang, sitemap/robots coverage, metadata/social coverage, factual structured data, internal linking, buyer/export search intent and performance budgets. Confirm business facts before new copy/schema and preserve the provisional process restriction. Full SEO implementation has not started.

## Changed files

- `docs/launch/PHASE1_EVIDENCE.json`
- `package.json`
- `src/app/[lang]/herbs-spices/layout.tsx`
- `src/app/[lang]/herbs-spices/page.tsx`
- `src/app/[lang]/herbs-spices/products/page.tsx`
- `src/app/[lang]/herbs-spices/standard/page.tsx`
- `src/app/[lang]/page.tsx`
- `src/app/[lang]/products/page.tsx`
- `src/app/[lang]/standard/page.tsx`
- `src/components/common/BusinessDivisionSwitcher.module.css`
- `src/components/common/BusinessDivisionSwitcher.tsx`
- `src/components/herbs-spices/home/HerbsSpicesTradeSection.tsx`
- `src/components/herbs-spices/layout/HerbsSpicesHeader.module.css`
- `src/divisions/metadata.ts`
- `src/i18n/get-dictionary.ts`
- `src/styles/hero.css`
- `test/browser-qa-m5-verification.mjs`
- `test/challenger-m3-stress.test.mjs`
- `test/challenger-m4-adversarial.test.mjs`
- `test/division-launch-browser.test.mjs`
- `test/division-launch-policy.mjs`
- `test/herbs-spices-products-browser.test.mjs`
- `test/launch-gates.test.ts`
- `test/phase1-browser.test.mjs`
- `test/phase3b.test.ts`
- `test/phase6a-browser.test.mjs`
