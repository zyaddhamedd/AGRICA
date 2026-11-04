# Mobile language-switcher hotfix

Base: production `393c958fda54e7229174e1dfd0ad563b0a585738`. Isolated branch `codex/hotfix-mobile-language`, worktree `/private/tmp/agrica-language-hotfix`. No push or deployment is included in this task.

## Cause and minimal correction

The mobile `.popover` changed to fixed positioning with a bottom offset while inside transformed/backdrop-filtered navbars. The ancestor established the fixed containing block; the menu therefore rendered above the viewport (around -200px) rather than at its bottom. Browser inspection reproduced this across Home, global Produce and Herbs headers in EN/AR at 320px before editing.

Remove that mobile-only positioning override and use the existing absolute dropdown anchored to the switcher's relative root. Its logical inline-end alignment already supports RTL. All existing dimensions, fonts, colors, trigger/option styles, keyboard behavior, fade animation and navbar transforms/blur remain intact. No portals, positioning JavaScript, dependencies or global-style changes.

## Exact file scope

- `src/components/common/LanguageSwitcher.module.css`: only production change; remove seven override lines and explain the anchored positioning.
- `test/language-switcher-hotfix-browser.mjs`: actual hit/touch/mouse/keyboard regression coverage.
- `docs/hotfixes/mobile-language-switcher.md`: verification/release notes.

## Verification

- Production build and TypeScript PASS.
- i18n, routing/division, launch policy and SEO unit checks PASS.
- All 47 canonical URLs PASS HTTP SEO verification, including normal/Googlebot, robots, sitemap, canonical/hreflang, structured data, indexing restrictions and redirects.
- Focused browser matrix: **75 menu layouts / 375 option hit targets and 75 real navigations**, plus 12 keyboard, 6 sticky and 10 division cases; no runtime errors. Coverage: 320/375/390/430px touch and 1440px mouse; all five source locales across all three header variants. Every option is in the viewport and is its actual browser hit target.
- Actual selection of all five destinations on every header/width verifies URL, validated query preservation, locale cookie and Arabic RTL.
- Keyboard: ArrowUp/Down wrapping, Home/End, Tab, Enter, Escape with trigger-focus restoration, plus outside dismissal.
- Existing sticky hide/reveal and menu-open pinning checked on Home, Herbs and the shared global header on a product profile; division navigation and reduced motion checked. The catalogue wrapper already lets its header scroll offscreen; paired baseline/hotfix geometry at scroll 0/400/200 is identical. That unrelated behavior is preserved, not repaired by this popup fix.
- Paired baseline/hotfix performance: 12 closed-navbar geometry/font/color comparisons are identical; local CLS 0 and JavaScript transfer deltas 0 across the eight route/viewport samples. CSS transfer is smaller. These are bounded local observations, not field CWV/FPS.
- Independent native Codex review: GO, no blockers; independent 320px EN/AR global+Herbs real-touch checks passed with all five options reachable, queries preserved and no runtime errors.

Run a production server on 3118, then `node test/language-switcher-hotfix-browser.mjs`. Override `BASE_URL` and `QA_OUTPUT_DIR` if necessary. The test waits for the existing fade before hit-testing and allows subpixel rounding for the unchanged 38px targets; it never substitutes programmatic link clicks for real activation.

Evidence/logs and paired performance results are under `/private/tmp/agrica-language-hotfix-qa/`. Before screenshot: `before-320.png`; after examples: `en-produce-320.png`, `ar-produce-320.png`, `en-home-390.png`, `ar-herbs-390.png`. `cause-check.json` records the pre-edit browser-only proof.

Local build setup: Turbopack rejected an external node_modules symlink. An ignored local copy of the same installed dependencies and a clean generated-output rebuild resolved the isolated environment/build-router issue without installation, dependency/version/configuration changes or original-worktree modifications. Previous generated output was preserved outside the repository. The final full focused suite passed on the clean build; the independent reviewer rechecked actual desktop mouse/keyboard division navigation successfully.

Browser verification uses Chrome with actual CDP touch/mouse/keyboard input and mobile emulation; physical iOS/Safari and field CWV/FPS are not certified by these local checks.

## Release boundary

GO for the hotfix checkpoint after the recorded checks passed. Production remains at `393c958`; the hotfix requires separate push/deployment approval. Original main and its pre-existing next-env modification, and the prior release worktree, are preserved.
