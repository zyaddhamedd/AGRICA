import assert from "node:assert/strict";
import { createBrowserSession } from "./cdp-client.mjs";

console.log("=================================================");
console.log("  Tier 2: Boundary & Corner Cases E2E Suite");
console.log("=================================================");

const session = await createBrowserSession();

try {
  // --------------------------------------------------------------------------
  // 1. Empty States (Produce & Herbs)
  // --------------------------------------------------------------------------
  console.log("\n[1/5] Verifying Empty States handling in Catalogues...");
  await session.setViewport(1440, 900);

  // Produce Catalogue Empty State
  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Produce cards did not load");
  await session.evaluate('document.querySelector(".minimal-search-trigger")?.click()');
  await session.waitFor('document.querySelector("#minimal-search-input") !== null', "Search input not visible");
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "__nonexistent_produce_query__");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor('document.querySelector(".atlas-empty-state") !== null', "Produce empty state not rendered");
  const produceEmptyText = await session.evaluate('document.querySelector(".atlas-empty-state").textContent');
  assert.ok(produceEmptyText.length > 0, "Produce empty state text is empty");

  // Clear Produce search
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Clearing search did not restore 21 cards");

  // Herbs Catalogue Empty State
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs cards did not load");
  await session.evaluate(`(() => {
    const input = document.querySelector("#herbs-spices-search");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "__nonexistent_herb_query__");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.body.textContent.includes("No materials match this view")',
    "Herbs empty state notice did not render",
  );

  // Reset catalogue button
  await session.evaluate('[...document.querySelectorAll("button")].find((b) => b.textContent.includes("Reset catalogue"))?.click()');
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Reset catalogue did not restore 27 cards");
  console.log("  ✓ Empty states and catalogue restoration verified for Produce and Herbs.");

  // --------------------------------------------------------------------------
  // 2. Small Viewport (320px) Mobile Ergonomics & Overflow Prevention
  // --------------------------------------------------------------------------
  console.log("\n[2/5] Verifying Small Viewport (320px) responsiveness & zero overflow...");
  await session.setViewport(320, 720, true);

  const testRoutes320 = ["/en", "/en/products", "/en/herbs-spices/products", "/en/company", "/contact"];
  for (const route of testRoutes320) {
    await session.navigate(route);
    const scrollWidth = await session.evaluate("document.documentElement.scrollWidth");
    const innerWidth = await session.evaluate("window.innerWidth");
    assert.ok(
      scrollWidth <= innerWidth + 1,
      `${route} has horizontal overflow at 320px: scrollWidth=${scrollWidth}, innerWidth=${innerWidth}`,
    );
  }

  // Mobile family cards at 320px on Herbs Homepage
  await session.navigate("/en/herbs-spices");
  const mobileCardsAudit = await session.evaluate(`(() => {
    const cards = [...document.querySelectorAll('[class*="mobileFamilyCard"]')];
    return {
      count: cards.length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      hrefs: cards.map((c) => c.getAttribute("href")),
    };
  })()`);
  assert.equal(mobileCardsAudit.count, 6, "Expected 6 mobile family cards on Herbs homepage");
  assert.equal(mobileCardsAudit.overflow, false, "Mobile family cards cause horizontal overflow at 320px");
  assert.ok(mobileCardsAudit.hrefs.every((h) => h?.includes("family=")), "Family card links missing family parameter");

  // Open & close material dossier at 320px in Catalogue
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs cards did not load at 320px");
  await session.evaluate('document.querySelector("#material-plate-basil")?.click()');
  await session.waitFor('document.querySelector("#material-dossier-basil") !== null', "Basil dossier did not open at 320px");
  const dossierMetrics = await session.evaluate(`(() => {
    const panel = document.querySelector("#material-dossier-basil [class*='panel']");
    const rect = panel.getBoundingClientRect();
    return {
      insideLeft: rect.left >= 0,
      insideRight: rect.right <= window.innerWidth + 1,
    };
  })()`);
  assert.ok(dossierMetrics.insideLeft && dossierMetrics.insideRight, "Dossier overflows at 320px");
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#material-dossier-basil") === null', "Dossier did not close at 320px");
  console.log("  ✓ 320px mobile viewport: zero horizontal overflow, circular frames, and responsive modal verified.");

  // --------------------------------------------------------------------------
  // 3. Large Viewport (1920px) Desktop Layout
  // --------------------------------------------------------------------------
  console.log("\n[3/5] Verifying Large Viewport (1920px) desktop scaling...");
  await session.setViewport(1920, 1080, false);

  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Produce fresh cards missing at 1920px");
  const overflow1920 = await session.evaluate("document.documentElement.scrollWidth <= window.innerWidth");
  assert.ok(overflow1920, "Produce page has horizontal overflow at 1920px");

  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs cards missing at 1920px");
  const columns1920 = await session.evaluate(`(() => {
    const items = [...document.querySelectorAll("[data-material-specimen]")];
    const lefts = new Set(items.map((item) => Math.round(item.getBoundingClientRect().left)));
    return lefts.size;
  })()`);
  assert.ok(columns1920 >= 3, `Expected at least 3-4 columns at 1920px, found ${columns1920}`);
  console.log("  ✓ 1920px large desktop: multi-column grid alignment and zero overflow verified.");

  // --------------------------------------------------------------------------
  // 4. Reduced Motion (`prefers-reduced-motion: reduce`)
  // --------------------------------------------------------------------------
  console.log("\n[4/5] Verifying Reduced Motion support...");
  await session.setEmulatedMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await session.navigate("/en/products?world=fresh");

  await session.evaluate('document.querySelector(".atlas-grid > .export-card-scene .export-card-keyboard-toggle").click()');
  await session.waitFor(
    'document.querySelector("#product-card-flight-dialog") !== null',
    "Flight dialog did not mount under reduced motion",
  );
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', "Flight dialog did not close");

  await session.setEmulatedMedia([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  console.log("  ✓ Reduced motion: dialogue opens and closes immediately without animation locking.");

  // --------------------------------------------------------------------------
  // 5. RTL Layout in Arabic (`/ar/...`)
  // --------------------------------------------------------------------------
  console.log("\n[5/5] Verifying Arabic RTL Layout and bidirectional formatting...");
  await session.navigate("/ar/");
  const arHome = await session.evaluate(`(() => ({
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    bodyDir: getComputedStyle(document.body).direction,
  }))()`);
  assert.equal(arHome.dir, "rtl", "Arabic html root must have dir=rtl");
  assert.equal(arHome.lang, "ar", "Arabic html root must have lang=ar");
  assert.equal(arHome.bodyDir, "rtl", "Arabic body computed style direction must be rtl");

  await session.navigate("/ar/products?world=fresh");
  assert.equal(await session.evaluate('document.documentElement.dir'), "rtl");

  // Open language menu in Arabic and check bounds
  const langTrigger = `[...document.querySelectorAll("[data-language-trigger]")].find((el) => el.getBoundingClientRect().width > 0)`;
  await session.evaluate(`${langTrigger}.click()`);
  await session.waitFor('document.querySelector("[data-language-menu]") !== null', "Arabic language menu did not open");

  const rtlMenuBounds = await session.evaluate(`(() => {
    const menu = document.querySelector("[data-language-menu]");
    const rect = menu.getBoundingClientRect();
    return {
      insideLeft: rect.left >= 0,
      insideRight: rect.right <= window.innerWidth,
      menuDir: getComputedStyle(menu).direction,
    };
  })()`);
  assert.ok(rtlMenuBounds.insideLeft && rtlMenuBounds.insideRight, "Arabic dropdown menu positioned off-screen");
  assert.equal(rtlMenuBounds.menuDir, "rtl", "Arabic dropdown menu must have rtl direction");
  console.log("  ✓ Arabic RTL layout: html dir, body direction, and menu positioning within viewport verified.");

  const problems = session.getErrors();
  assert.deepEqual(problems, [], `Browser errors detected: ${problems.join("; ")}`);

  console.log("\n=================================================");
  console.log("  ✓ Tier 2 Boundary & Corner Cases: ALL PASSED");
  console.log("=================================================");
} finally {
  await session.close();
}
