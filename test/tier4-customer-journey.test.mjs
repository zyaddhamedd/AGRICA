import assert from "node:assert/strict";
import { createBrowserSession } from "./cdp-client.mjs";

console.log("=================================================");
console.log("  Tier 4: Real-World Scenarios E2E Suite");
console.log("  Full Customer Journey: Homepage -> Produce -> Herbs -> Enquiry -> Contact");
console.log("=================================================");

const session = await createBrowserSession();

try {
  await session.setViewport(1440, 900);

  // --------------------------------------------------------------------------
  // Step 1: Initial Arrival & Brand Discovery on Homepage
  // --------------------------------------------------------------------------
  console.log("\n[Step 1/5] Importer lands on AGRICA English homepage...");
  await session.navigate("/en");

  const brandDiscovery = await session.evaluate(`(() => ({
    title: document.title,
    hasOriginHero: Boolean(document.querySelector("#top, .hero")),
    hasWorldsSection: Boolean(document.querySelector("#products, .worlds")),
    produceLink: document.querySelector('a[href="/en/products"]')?.getAttribute("href"),
  }))()`);

  assert.ok(brandDiscovery.title.includes("AGRICA"), "Homepage title missing AGRICA branding");
  assert.ok(brandDiscovery.hasOriginHero, "Homepage origin hero missing");
  assert.ok(brandDiscovery.hasWorldsSection, "Three Worlds section missing");
  console.log("  ✓ Homepage brand arrival and navigation routes discovered.");

  // --------------------------------------------------------------------------
  // Step 2: Produce Catalogue Sourcing & Quote Accumulation
  // --------------------------------------------------------------------------
  console.log("\n[Step 2/5] Navigating to Produce Catalogue & accumulating quote items...");
  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Produce Fresh cards missing");

  // Inspect Oranges card via 3D Flight Overlay
  await session.evaluate(`(() => {
    const orangeCard = document.querySelector('[data-product-id="produce:orange"] .export-card-keyboard-toggle');
    orangeCard?.click();
  })()`);
  await session.waitFor('document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"', "Orange flight dialog did not open");

  const orangeSpecs = await session.evaluate(`(() => {
    const dialog = document.querySelector("#product-card-flight-dialog");
    const back = dialog?.querySelector(".export-card-back.is-expanded");
    return {
      title: back?.querySelector(".export-card-back-title")?.textContent.trim(),
      rows: back?.querySelectorAll(".export-spec-row").length || 0,
    };
  })()`);
  assert.ok(orangeSpecs.title?.includes("Orange") || orangeSpecs.title?.includes("produce"), "Orange spec title mismatch");
  assert.ok(orangeSpecs.rows >= 5, "Orange technical specifications missing rows");

  // Close flight overlay
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', "Flight dialog did not close");

  // Add Oranges to quote
  await session.evaluate('document.querySelector(\'[data-product-id="produce:orange"] .export-card-quote\')?.click()');
  await session.waitFor('document.querySelector(".quote-count")?.textContent === "1"', "Quote count did not increment to 1 for Oranges");

  // Switch to Frozen produce via in-page WorldSwitch (preserving client quote state)
  await session.evaluate('document.querySelector(\'.editorial-world-item[data-world="frozen"]\')?.click()');
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13', "Frozen cards missing");

  await session.evaluate('document.querySelector(\'[data-product-id="produce:half-fried-french-fries"] .export-card-quote\')?.click()');
  await session.waitFor('document.querySelector(".quote-count")?.textContent === "2"', "Quote count did not increment to 2 for French Fries");
  console.log("  ✓ Produce sourcing: inspected technical specs and accumulated 2 products in quote dock.");

  // --------------------------------------------------------------------------
  // Step 3: Division Transition to Herbs & Spices
  // --------------------------------------------------------------------------
  console.log("\n[Step 3/5] Transitioning to Herbs & Spices catalogue...");
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs catalogue cards missing");

  // Filter by Herbs family
  await session.evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
    .find((b) => b.textContent === "Herbs")?.click()`);
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 11', "Herbs family filter did not narrow to 11");

  // Inspect Basil in Material Dossier
  await session.evaluate('document.querySelector("#material-plate-basil")?.click()');
  await session.waitFor('document.querySelector("#material-dossier-basil") !== null', "Basil dossier did not open");

  const basilDossierTitle = await session.evaluate('document.querySelector("#material-dossier-basil [class*=\'materialCode\'], #dossier-item-title")?.textContent');
  assert.ok(basilDossierTitle?.includes("BASIL") || basilDossierTitle?.includes("Basil"), "Basil dossier title missing");

  // Close dossier
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#material-dossier-basil") === null', "Basil dossier did not close");

  // Add Basil to Herbs enquiry list
  await session.evaluate('document.querySelector(\'[data-material-specimen="basil"] [class*="enquiryBtn"]\')?.click()');
  await session.waitFor('document.querySelector("button[aria-controls=herbs-spices-enquiry] strong")?.textContent === "1"', "Herbs enquiry dock did not update to 1");
  console.log("  ✓ Herbs sourcing: filtered family, inspected Basil dossier, and added item to enquiry.");

  // --------------------------------------------------------------------------
  // Step 4: Reviewing Enquiry Drawer & Submitting Buyer Details
  // --------------------------------------------------------------------------
  console.log("\n[Step 4/5] Opening Enquiry Drawer & completing commercial enquiry...");
  await session.evaluate('document.querySelector("button[aria-controls=herbs-spices-enquiry]")?.click()');
  await session.waitFor('document.querySelector("#herbs-spices-enquiry") !== null', "Enquiry drawer did not open");

  // Verify Basil is in the drawer selection
  const selectedItemText = await session.evaluate('document.querySelector("#herbs-spices-enquiry ul")?.textContent');
  assert.ok(selectedItemText?.includes("Basil"), "Basil not listed in enquiry drawer items");

  // Fill in enquiry form
  await session.evaluate(`(() => {
    const setVal = (selector, val) => {
      const input = document.querySelector(selector);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setVal('#herbs-spices-enquiry input[name="destination"]', 'Germany');
    setVal('#herbs-spices-enquiry input[name="volume"]', '2x 40ft FCL');
    setVal('#herbs-spices-enquiry input[name="company"]', 'Hamburg Botanical Trading GmbH');
    setVal('#herbs-spices-enquiry input[name="email"]', 'procurement@hamburg-botanicals.de');
  })()`);

  // Submit enquiry form
  await session.evaluate('document.querySelector("#herbs-spices-enquiry form button[type=\'submit\']")?.click()');
  await session.waitFor('document.querySelector("#herbs-spices-enquiry [role=\'status\']") !== null', "Enquiry submission confirmation not displayed");

  const confirmationNotice = await session.evaluate('document.querySelector("#herbs-spices-enquiry [role=\'status\']").textContent');
  assert.ok(confirmationNotice.length > 0, "Confirmation notice is empty");

  // Close enquiry drawer
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#herbs-spices-enquiry") === null', "Enquiry drawer did not close on Escape");
  console.log("  ✓ Commercial enquiry: filled buyer details, submitted form, and verified confirmation.");

  // --------------------------------------------------------------------------
  // Step 5: Direct Contact & Export Team Verification
  // --------------------------------------------------------------------------
  console.log("\n[Step 5/5] Navigating to AGRICA Contact page for final connection...");
  await session.navigate("/contact");

  const contactVerification = await session.evaluate(`(() => ({
    title: document.title,
    produceProfile: document.querySelector('a[href*="Produce-Company-Profile.pdf"]')?.getAttribute("href"),
    herbsProfile: document.querySelector('a[href*="Herbs-Spices-Company-Profile.pdf"]')?.getAttribute("href"),
    phoneDirectoryCount: document.querySelectorAll('.phone-options a').length,
    vcfLink: document.querySelector('a[href$=".vcf"]')?.getAttribute("href"),
    emailLink: document.querySelector('a[href^="mailto:"]')?.getAttribute("href"),
  }))()`);

  assert.ok(contactVerification.produceProfile?.endsWith(".pdf"), "Produce company profile PDF link missing");
  assert.ok(contactVerification.herbsProfile?.endsWith(".pdf"), "Herbs company profile PDF link missing");
  assert.equal(contactVerification.phoneDirectoryCount, 3, "Contact page missing office phone numbers");
  assert.equal(contactVerification.vcfLink, "/contact/AGRICA.vcf", "AGRICA vCard download link missing");
  assert.equal(contactVerification.emailLink, "mailto:info@agriculturecairo.com", "Primary email link missing");
  console.log("  ✓ Contact hub: confirmed company profiles, office phones, mailto, and vCard.");

  const problems = session.getErrors();
  assert.deepEqual(problems, [], `Browser errors detected: ${problems.join("; ")}`);

  console.log("\n=================================================");
  console.log("  ✓ Tier 4 Real-World Scenario: BUYER JOURNEY COMPLETE");
  console.log("=================================================");
} finally {
  await session.close();
}
