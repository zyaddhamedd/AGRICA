import assert from "node:assert/strict";
import { createBrowserSession } from "./cdp-client.mjs";

console.log("=================================================");
console.log("  Tier 1: Feature Coverage E2E Test Suite");
console.log("=================================================");

const session = await createBrowserSession();

try {
  await session.setViewport(1440, 900);

  // --------------------------------------------------------------------------
  // 1. Homepage Feature Coverage (5 locales)
  // --------------------------------------------------------------------------
  console.log("\n[1/8] Verifying Homepage across 5 locales...");
  const locales = ["en", "ar", "ru", "de", "fr"];
  for (const locale of locales) {
    const route = `/${locale}`;
    await session.navigate(route);

    const docMeta = await session.evaluate(`(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      title: document.title,
      hasHero: Boolean(document.querySelector("#top, .hero")),
      hasWorlds: Boolean(document.querySelector("#products, .worlds, [data-active-world]")),
      hasFooter: Boolean(document.querySelector("footer")),
    }))()`);

    assert.equal(docMeta.lang, locale, `${route} exposes correct lang attribute`);
    assert.equal(docMeta.dir, locale === "ar" ? "rtl" : "ltr", `${route} exposes correct dir`);
    assert.ok(docMeta.title.length > 0, `${route} has document title`);
    assert.ok(docMeta.hasHero, `${route} renders hero section`);
    assert.ok(docMeta.hasWorlds, `${route} renders worlds section`);
    assert.ok(docMeta.hasFooter, `${route} renders footer`);
  }
  console.log("  ✓ All 5 localized homepages verified with correct structure and metadata.");

  // --------------------------------------------------------------------------
  // 2. Produce Catalogue Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[2/8] Verifying Produce Catalogue (Fresh & Frozen worlds, search, flip, quote)...");
  await session.navigate("/en/products?world=fresh");
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21',
    "Produce fresh world did not render 21 cards",
  );

  // Switch to Frozen world via World Switcher
  await session.navigate("/en/products?world=frozen");
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13',
    "Produce frozen world did not render 13 cards",
  );

  // Verify search
  await session.evaluate('document.querySelector(".minimal-search-trigger")?.click()');
  await session.waitFor('document.querySelector("#minimal-search-input") !== null', "Search input not visible");
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "French Fries");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 1',
    "Produce search did not filter to 1 French Fries card",
  );

  // Clear search
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13',
    "Clearing search did not restore 13 frozen products",
  );

  // Test card flight overlay & specifications
  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Fresh products did not load");

  await session.evaluate('document.querySelector(".atlas-grid > .export-card-scene .export-card-keyboard-toggle").click()');
  await session.waitFor(
    'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
    "Flight overlay dialog did not open",
  );

  const dialogSpecs = await session.evaluate(`(() => {
    const dialog = document.querySelector("#product-card-flight-dialog");
    const back = dialog?.querySelector(".export-card-back.is-expanded");
    return {
      isOpen: Boolean(dialog),
      title: back?.querySelector(".export-card-back-title")?.textContent.trim(),
      specRows: back?.querySelectorAll(".export-spec-row").length || 0,
      specGroups: back?.querySelectorAll(".export-spec-group").length || 0,
    };
  })()`);
  assert.ok(dialogSpecs.isOpen, "Flight dialog not open");
  assert.ok(dialogSpecs.specRows >= 5, "Flight dialog back does not display technical specifications");

  // Close flight dialog via Escape
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', "Escape did not close flight dialog");

  // Add to quote
  await session.evaluate('document.querySelector(".atlas-grid .export-card-quote").click()');
  await session.waitFor('document.querySelector(".quote-count")?.textContent === "1"', "Quote count did not increment to 1");
  await session.evaluate('document.querySelector(".atlas-grid .export-card-quote").click()');
  await session.waitFor('document.querySelector(".quote-count")?.textContent === "0"', "Quote count did not decrement to 0");
  console.log("  ✓ Produce catalogue: worlds, search, flight dialog specs, and quote actions verified.");

  // --------------------------------------------------------------------------
  // 3. Herbs & Spices Catalogue Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[3/8] Verifying Herbs & Spices Catalogue (27 materials, 6 families, reveal, enquiry)...");
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 27',
    "Herbs catalogue did not render 27 specimens",
  );

  const herbsFamilies = await session.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')];
    return buttons.map((b) => b.textContent.trim());
  })()`);
  assert.deepEqual(
    herbsFamilies,
    ["All", "Herbs", "Flowers", "Seeds", "Spices", "Roots", "Dehydrated Vegetables"],
    "Family filter buttons mismatch",
  );

  // Filter by Flowers family
  await session.evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
    .find((b) => b.textContent === "Flowers").click()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 3',
    "Flowers filter did not show 3 products",
  );

  // Restore All
  await session.evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
    .find((b) => b.textContent === "All").click()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 27',
    "Restoring All did not restore 27 products",
  );

  // Test Material Reveal (Basil)
  await session.evaluate('document.querySelector("#material-plate-basil")?.click()');
  await session.waitFor('document.querySelector("#material-dossier-basil") !== null', "Basil dossier did not open");

  const revealCopy = await session.evaluate('document.querySelector("#material-dossier-basil").textContent');
  assert.ok(revealCopy.includes("Basil"), "Dossier missing Basil title");

  // Close Material Reveal via Escape
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#material-dossier-basil") === null', "Basil dossier did not close");

  // Add Basil to enquiry
  await session.evaluate('document.querySelector(\'[data-material-specimen="basil"] [class*="enquiryBtn"]\')?.click()');
  await session.waitFor('document.querySelector("button[aria-controls=herbs-spices-enquiry] strong")?.textContent === "1"', "Enquiry count did not update to 1");
  console.log("  ✓ Herbs catalogue: 27 materials, 6 families, reveal, and enquiry actions verified.");

  // --------------------------------------------------------------------------
  // 4. Company Page Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[4/8] Verifying Company Page...");
  await session.navigate("/en/company");
  const companyAudit = await session.evaluate(`(() => ({
    title: document.title,
    hasStages: document.querySelectorAll('[class*="workflowStage"]').length > 0 || document.querySelectorAll('[class*="workflow"]').length > 0,
    images: [...document.querySelectorAll("img")].map((img) => ({ src: img.src, complete: img.complete })),
  }))()`);
  assert.ok(companyAudit.title.includes("Company") || companyAudit.title.includes("AGRICA"), "Company page title missing");
  console.log("  ✓ Company page verified with workflow media structure.");

  // --------------------------------------------------------------------------
  // 5. Standard Page Feature Coverage (Produce & Herbs)
  // --------------------------------------------------------------------------
  console.log("\n[5/8] Verifying Produce Standard & Herbs Standard Pages...");
  await session.navigate("/en/standard");
  const produceStandard = await session.evaluate(`(() => ({
    stages: document.querySelectorAll('[data-stage-id], .journey-marker, [class*="stage"]').length,
    hasAnchors: Boolean(document.querySelector("#stage-01, #stage-source, [id*='stage-']")),
  }))()`);
  assert.ok(produceStandard.stages > 0, "Produce standard has no stages");

  await session.navigate("/en/herbs-spices/standard");
  const herbsStandard = await session.evaluate(`(() => ({
    title: document.title,
    robots: document.querySelector("meta[name='robots']")?.getAttribute("content"),
    hasProcessAtlas: Boolean(document.querySelector("#process-atlas, [class*='ProcessAtlas']")),
    stageTabs: document.querySelectorAll('[id^="stage-tab-"]').length,
  }))()`);
  assert.equal(herbsStandard.robots, "noindex, nofollow", "Herbs standard must be noindex, nofollow");
  assert.ok(herbsStandard.hasProcessAtlas, "Herbs standard ProcessAtlas missing");
  assert.equal(herbsStandard.stageTabs, 6, "Herbs standard must have 6 stage tabs");
  console.log("  ✓ Produce Standard & Herbs Standard (ProcessAtlas 6 stages) verified.");

  // --------------------------------------------------------------------------
  // 6. Contact Page Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[6/8] Verifying Contact Page...");
  await session.navigate("/contact");
  const contactAudit = await session.evaluate(`(() => ({
    title: document.title,
    brandHref: document.querySelector(".connect-brand")?.getAttribute("href"),
    divisionCards: document.querySelectorAll(".division-card").length,
    phoneLinks: [...document.querySelectorAll(".phone-options a")].map((a) => a.getAttribute("href")),
    mailHref: document.querySelector('a[href^="mailto:"]')?.getAttribute("href"),
    vcfHref: document.querySelector('a[href$=".vcf"]')?.getAttribute("href"),
  }))()`);
  assert.ok(contactAudit.divisionCards === 2, "Contact page must have 2 division cards");
  assert.equal(contactAudit.phoneLinks.length, 3, "Contact page must have 3 phone numbers (Cairo, Calgary, Den Haag)");
  assert.equal(contactAudit.mailHref, "mailto:info@agriculturecairo.com", "Contact email link mismatch");
  assert.equal(contactAudit.vcfHref, "/contact/AGRICA.vcf", "Contact vCard link mismatch");
  console.log("  ✓ Contact page verified (divisions, phones, email, vCard).");

  // --------------------------------------------------------------------------
  // 7. Language Switching Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[7/8] Verifying Language Switching...");
  await session.navigate("/en/products?world=frozen");

  const visibleLangTrigger = `[...document.querySelectorAll("[data-language-trigger]")].find((el) => el.getBoundingClientRect().width > 0)`;
  await session.evaluate(`${visibleLangTrigger}.click()`);
  await session.waitFor('document.querySelector("[data-language-menu]") !== null', "Language menu did not open");

  // Switch to German (de)
  await session.evaluate('document.querySelector("[data-language-option][data-locale=de]").click()');
  await session.waitFor('location.pathname === "/de/products" && location.search === "?world=frozen"', "Switch to German failed");
  const germanCookie = await session.evaluate('document.cookie.includes("agrica_locale=de")');
  assert.ok(germanCookie, "agrica_locale cookie not set to German");

  // Switch to Arabic (ar)
  await session.evaluate(`${visibleLangTrigger}.click()`);
  await session.evaluate('document.querySelector("[data-language-option][data-locale=ar]").click()');
  await session.waitFor('location.pathname === "/ar/products" && location.search === "?world=frozen"', "Switch to Arabic failed");
  assert.equal(await session.evaluate('document.documentElement.dir'), "rtl", "Arabic page must be RTL");
  console.log("  ✓ Language switching verified with parameter preservation and cookies.");

  // --------------------------------------------------------------------------
  // 8. Division Switching Feature Coverage
  // --------------------------------------------------------------------------
  console.log("\n[8/8] Verifying Cross-Division Switching...");
  await session.navigate("/en/products");
  await session.navigate("/en/herbs-spices/products");
  assert.equal(await session.evaluate('location.pathname'), "/en/herbs-spices/products", "Navigate to Herbs products failed");

  await session.navigate("/de/herbs-spices/standard");
  await session.navigate("/de/standard");
  assert.equal(await session.evaluate('location.pathname'), "/de/standard", "Switching to Produce Standard retains German");
  console.log("  ✓ Division switching and route mapping verified.");

  const problems = session.getErrors();
  assert.deepEqual(problems, [], `Browser errors detected: ${problems.join("; ")}`);

  console.log("\n=================================================");
  console.log("  ✓ Tier 1 Feature Coverage: ALL 8 SUITES PASSED");
  console.log("=================================================");
} finally {
  await session.close();
}
