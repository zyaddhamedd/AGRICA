import assert from "node:assert/strict";
import { createBrowserSession } from "./cdp-client.mjs";

console.log("=================================================");
console.log("  Tier 3: Cross-Feature Combinations E2E Suite");
console.log("=================================================");

const session = await createBrowserSession();

try {
  await session.setViewport(1440, 900);

  // --------------------------------------------------------------------------
  // 1. Filter Combinations (Family Filter + Search Query + World Switch)
  // --------------------------------------------------------------------------
  console.log("\n[1/3] Verifying Multi-Filter Combinations in Produce & Herbs...");

  // Produce: Frozen world -> Family "IQF Fruits" -> Search "Strawberry"
  await session.navigate("/en/products?world=frozen");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13', "Frozen cards did not load");

  // Select IQF Fruits family
  await session.evaluate(`[...document.querySelectorAll(".taxonomy-item")]
    .find((el) => el.textContent.includes("IQF Fruits"))?.click()`);
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 3',
    "IQF Fruits family filter did not filter to 3 items",
  );

  // Apply search query "IQF Strawberries"
  await session.evaluate('document.querySelector(".minimal-search-trigger")?.click()');
  await session.waitFor('document.querySelector("#minimal-search-input") !== null', "Search input not visible");
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "IQF Strawberries");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 1',
    "Search for IQF Strawberries did not narrow to 1 item",
  );

  // Clear search query: family filter must remain active (3 items)
  await session.evaluate(`(() => {
    const input = document.querySelector("#minimal-search-input");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 3',
    "Clearing search did not preserve active IQF Fruits family filter",
  );

  // Switch world to Fresh: should load 21 items and reset family
  await session.navigate("/en/products?world=fresh");
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21',
    "Switching world to Fresh did not reset to 21 Fresh items",
  );

  // Herbs: Family "Flowers" -> Search "Chamomile"
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs cards did not load");

  // Select Flowers family button
  await session.evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
    .find((b) => b.textContent === "Flowers")?.click()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 3',
    "Flowers family filter did not narrow to 3 items",
  );

  // Search "Chamomile"
  await session.evaluate(`(() => {
    const input = document.querySelector("#herbs-spices-search");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "Chamomile");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 1',
    "Combining Flowers family + Chamomile search did not narrow to 1 item",
  );

  // Clear search: should restore 3 Flowers
  await session.evaluate(`(() => {
    const input = document.querySelector("#herbs-spices-search");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 3',
    "Clearing search did not restore 3 Flowers items",
  );
  console.log("  ✓ Multi-filter combinations and state persistence verified.");

  // --------------------------------------------------------------------------
  // 2. Language + Division Switches
  // --------------------------------------------------------------------------
  console.log("\n[2/3] Verifying Cross-Language + Cross-Division Switching...");
  // Start on German Frozen produce
  await session.navigate("/de/products?world=frozen");
  await session.waitFor('location.pathname === "/de/products" && location.search === "?world=frozen"', "German products did not load");

  // Switch language to Arabic
  const langTrigger = `[...document.querySelectorAll("[data-language-trigger]")].find((el) => el.getBoundingClientRect().width > 0)`;
  await session.evaluate(`${langTrigger}.click()`);
  await session.waitFor('document.querySelector("[data-language-menu]") !== null', "Language menu did not open");
  await session.evaluate('document.querySelector("[data-language-option][data-locale=ar]").click()');
  await session.waitFor('location.pathname === "/ar/products" && location.search === "?world=frozen"', "Switch to Arabic failed");
  assert.equal(await session.evaluate('document.documentElement.dir'), "rtl", "Arabic root direction is not RTL");

  // Switch division to Herbs & Spices
  await session.navigate("/ar/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Arabic Herbs catalogue did not render 27 items");
  assert.equal(await session.evaluate('document.documentElement.lang'), "ar", "Arabic locale not preserved across division switch");

  // Switch language to Russian
  await session.evaluate(`${langTrigger}.click()`);
  await session.waitFor('document.querySelector("[data-language-menu]") !== null', "Language menu did not open in Arabic Herbs");
  await session.evaluate('document.querySelector("[data-language-option][data-locale=ru]").click()');
  await session.waitFor('location.pathname === "/ru/herbs-spices/products"', "Switch to Russian failed");
  assert.equal(await session.evaluate('document.documentElement.lang'), "ru", "Russian locale not set");

  // Switch division back to Produce
  await session.navigate("/ru/products");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Russian Produce catalogue did not load");
  assert.equal(await session.evaluate('document.documentElement.lang'), "ru", "Russian locale not preserved in Produce");
  console.log("  ✓ Language + Division matrix switching verified with state preservation.");

  // --------------------------------------------------------------------------
  // 3. Modal Open + Viewport Resize & Scroll Lock Integrity
  // --------------------------------------------------------------------------
  console.log("\n[3/3] Verifying Modal Open + Dynamic Viewport Resize & Scroll Lock...");
  // Start desktop 1440px on Produce
  await session.setViewport(1440, 900, false);
  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Fresh products did not load");

  // Open Flight Dialog on desktop
  await session.evaluate('document.querySelector(".atlas-grid > .export-card-scene .export-card-keyboard-toggle")?.click()');
  await session.waitFor('document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"', "Flight dialog did not open");

  // Verify scroll lock on desktop
  const desktopScrollLocked = await session.evaluate(`(() => {
    return document.body.style.position === "fixed" || document.body.style.overflow === "hidden";
  })()`);
  assert.ok(desktopScrollLocked, "Body scroll not locked when flight dialog is open on desktop");

  // Dynamically resize viewport to mobile (390px) while modal is open
  await session.setViewport(390, 844, true);
  const mobileModalBounds = await session.evaluate(`(() => {
    const dialog = document.querySelector("#product-card-flight-dialog");
    const rect = dialog?.getBoundingClientRect();
    return {
      exists: Boolean(dialog),
      inside: rect && rect.left >= 0 && rect.right <= window.innerWidth + 1,
    };
  })()`);
  assert.ok(mobileModalBounds.exists, "Dialog unmounted unexpectedly during resize");
  assert.ok(mobileModalBounds.inside, "Dialog overflowed viewport after resizing to mobile 390px");

  // Close dialog via Escape
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', "Flight dialog did not close on Escape");

  // Verify scroll lock cleanly released
  const scrollLockReleased = await session.evaluate(`(() => {
    return document.body.style.position !== "fixed" && document.body.style.overflow !== "hidden";
  })()`);
  assert.ok(scrollLockReleased, "Body scroll lock was not released after closing flight dialog");

  // Test Herbs Material Dossier resize integrity
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs cards did not load");
  await session.evaluate('document.querySelector("#material-plate-basil")?.click()');
  await session.waitFor('document.querySelector("#material-dossier-basil") !== null', "Basil dossier did not open on mobile");

  assert.equal(
    await session.evaluate('document.body.style.overflow'),
    "hidden",
    "Body overflow not set to hidden when dossier is open",
  );

  // Resize up to desktop (1440px) while dossier is open
  await session.setViewport(1440, 900, false);
  // Allow CSS slideInRight transition (260ms) to complete layout settling
  await new Promise((resolve) => setTimeout(resolve, 350));
  const dossierDesktopBounds = await session.evaluate(`(() => {
    const dossier = document.querySelector("#material-dossier-basil [class*='panel']");
    const rect = dossier?.getBoundingClientRect();
    return {
      exists: Boolean(dossier),
      inside: rect && rect.left >= 0 && rect.right <= window.innerWidth + 1,
    };
  })()`);
  assert.ok(dossierDesktopBounds.exists && dossierDesktopBounds.inside, "Dossier did not adapt smoothly to desktop resize");

  // Close dossier via Escape
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#material-dossier-basil") === null', "Dossier did not close on Escape");

  assert.notEqual(
    await session.evaluate('document.body.style.overflow'),
    "hidden",
    "Body overflow lock was not restored after closing dossier",
  );
  console.log("  ✓ Modal open + dynamic resize + scroll lock restoration verified across desktop & mobile.");

  const problems = session.getErrors();
  assert.deepEqual(problems, [], `Browser errors detected: ${problems.join("; ")}`);

  console.log("\n=================================================");
  console.log("  ✓ Tier 3 Cross-Feature Combinations: ALL PASSED");
  console.log("=================================================");
} finally {
  await session.close();
}
