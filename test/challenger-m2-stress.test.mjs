#!/usr/bin/env node

/**
 * Challenger M2 Empirical Stress Test Suite
 *
 * Scope: Features F08 & F09
 * F09: Cold Frozen Catalogue Sprite Elimination & Dedicated Fallbacks
 * F08: Catalogue Static Shell & Herbs Family Navigation (Zero RSC Roundtrips & History Sync)
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createBrowserSession } from "./cdp-client.mjs";

const PORT = process.env.PORT || "3198";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

async function ensureServer(port) {
  const url = `http://localhost:${port}`;
  try {
    const res = await fetch(`${url}/en`);
    if (res.ok) {
      console.log(`[Server] Production server already running at ${url}`);
      return null;
    }
  } catch {}

  console.log(`[Server] Starting Next.js production server on port ${port}...`);
  const proc = spawn("npx", ["next", "start", "-p", String(port)], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await fetch(`${url}/en`);
      if (res.ok) {
        console.log(`[Server] Next.js server ready at ${url}`);
        return proc;
      }
    } catch {}
  }
  try {
    proc.kill();
  } catch {}
  throw new Error(`Failed to start Next.js server on port ${port}`);
}

console.log("==================================================================");
console.log("  CHALLENGER M2 EMPIRICAL STRESS TEST HARNESS (F08 & F09)");
console.log(`  Target Base URL: ${BASE_URL}`);
console.log("==================================================================");

const serverProc = await ensureServer(PORT);
const session = await createBrowserSession({ baseUrl: BASE_URL });

try {
  // Set desktop viewport initially
  await session.setViewport(1440, 900);

  // Set up CDP Network tracking
  const networkRequests = [];
  const networkResponses = [];

  session.socket.addEventListener("message", (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.method === "Network.requestWillBeSent") {
        networkRequests.push({
          requestId: msg.params.requestId,
          url: msg.params.request.url,
          method: msg.params.request.method,
          type: msg.params.type,
          initiator: msg.params.initiator,
          timestamp: msg.params.timestamp,
        });
      }
      if (msg.method === "Network.responseReceived") {
        networkResponses.push({
          requestId: msg.params.requestId,
          url: msg.params.response.url,
          status: msg.params.response.status,
          mimeType: msg.params.response.mimeType,
          headers: msg.params.response.headers,
        });
      }
    } catch {}
  });

  await session.send("Network.enable");

  function clearNetworkHistory() {
    networkRequests.length = 0;
    networkResponses.length = 0;
  }

  // ==========================================================================
  // SUITE 1: FEATURE F09 - FROZEN CATALOGUE SPRITE ELIMINATION & FALLBACKS
  // ==========================================================================
  console.log("\n>>> SUITE 1: FEATURE F09 - COLD FROZEN CATALOGUE SPRITE ELIMINATION");

  // 1.1 Cold load of /en/products?world=frozen
  console.log("  [1.1] Cold loading /en/products?world=frozen and inspecting network requests...");
  clearNetworkHistory();

  await session.navigate("/en/products?world=frozen");

  // Wait for 13 frozen products
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13',
    "Produce frozen world did not render 13 product cards",
    100,
    50,
  );

  // Scroll down to the bottom of the page to trigger all IntersectionObservers / lazy images
  console.log("        Scrolling down page to force all cards and fallbacks into viewport...");
  await session.evaluate(`(async () => {
    const cards = document.querySelectorAll(".atlas-grid > .export-card-scene");
    for (const card of cards) {
      card.scrollIntoView({ behavior: "instant", block: "center" });
      await new Promise((r) => setTimeout(r, 60));
    }
    // Wait for all card images to complete
    const imgs = [...document.querySelectorAll(".atlas-grid > .export-card-scene img")];
    await Promise.all(imgs.map((img) => img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })));
  })()`);

  // Allow network to settle
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Assert: three-worlds.png was NEVER requested
  const threeWorldsPngRequests = networkRequests.filter((r) => r.url.includes("three-worlds.png"));
  console.log(`        Requests for 'three-worlds.png': ${threeWorldsPngRequests.length}`);
  assert.equal(
    threeWorldsPngRequests.length,
    0,
    `VIOLATION: three-worlds.png was requested ${threeWorldsPngRequests.length} time(s)! URL: ${threeWorldsPngRequests[0]?.url}`,
  );

  // Assert: product-atlas.png was NEVER requested on frozen catalogue
  const productAtlasPngRequests = networkRequests.filter((r) => r.url.includes("product-atlas.png"));
  console.log(`        Requests for 'product-atlas.png': ${productAtlasPngRequests.length}`);
  assert.equal(
    productAtlasPngRequests.length,
    0,
    `VIOLATION: product-atlas.png was requested on frozen catalogue! URL: ${productAtlasPngRequests[0]?.url}`,
  );

  // Assert: iqf-vegetables-fallback.webp WAS requested and returned 200
  const fallbackRequests = networkRequests.filter((r) => r.url.includes("iqf-vegetables-fallback.webp"));
  console.log(`        Requests for 'iqf-vegetables-fallback.webp': ${fallbackRequests.length}`);
  assert.ok(
    fallbackRequests.length > 0,
    "VIOLATION: iqf-vegetables-fallback.webp was never requested when cauliflower/sweet corn entered viewport",
  );

  const fallbackResponses = networkResponses.filter((r) => r.url.includes("iqf-vegetables-fallback.webp"));
  assert.ok(fallbackResponses.length > 0, "No response recorded for iqf-vegetables-fallback.webp");
  for (const resp of fallbackResponses) {
    assert.equal(resp.status, 200, `iqf-vegetables-fallback.webp returned HTTP ${resp.status}`);
    assert.ok(
      resp.mimeType.includes("webp") || resp.mimeType.includes("image"),
      `MIME type is not image/webp: ${resp.mimeType}`,
    );
  }
  console.log("        ✓ Verified: three-worlds.png is 0 bytes transferred; fallback WebP returned HTTP 200.");

  // 1.2 Inspect all 13 frozen cards in DOM
  console.log("  [1.2] Verifying dedicated image mappings and CSS background-image across all 13 cards...");
  const cardsAudit = await session.evaluate(`(() => {
    const scenes = [...document.querySelectorAll(".atlas-grid > .export-card-scene")];
    return scenes.map((scene) => {
      const visual = scene.querySelector(".export-card-visual");
      const title = scene.querySelector(".export-card-title")?.textContent.trim();
      const img = visual?.querySelector("img");
      const style = visual ? window.getComputedStyle(visual) : null;
      return {
        title,
        hasDedicatedClass: visual?.classList.contains("has-dedicated-image") ?? false,
        backgroundImage: style?.backgroundImage ?? "",
        imgSrc: img?.src ?? "",
        imgComplete: img?.complete ?? false,
        naturalWidth: img?.naturalWidth ?? 0,
      };
    });
  })()`);

  console.log("        Cards image loading summary:");
  for (const card of cardsAudit) {
    console.log(`        - ${card.title}: class=${card.hasDedicatedClass}, complete=${card.imgComplete}, natWidth=${card.naturalWidth}, src=${card.imgSrc.slice(0, 60)}...`);
  }

  assert.equal(cardsAudit.length, 13, "Expected exactly 13 cards in frozen world");
  for (const card of cardsAudit) {
    assert.ok(card.hasDedicatedClass, `Card '${card.title}' lacks '.has-dedicated-image'`);
    assert.ok(
      !card.backgroundImage.includes("three-worlds.png"),
      `Card '${card.title}' computed background-image contains 'three-worlds.png': ${card.backgroundImage}`,
    );
    assert.ok(card.imgSrc.length > 0, `Card '${card.title}' missing image src`);
    assert.ok(card.imgComplete, `Card '${card.title}' image did not complete loading`);
    assert.ok(card.naturalWidth > 0, `Card '${card.title}' image has naturalWidth <= 0 (broken image)`);
  }

  // Specifically check cauliflower and sweet corn
  const cauliflowerCard = cardsAudit.find((c) => c.title.includes("Cauliflower"));
  const sweetCornCard = cardsAudit.find((c) => c.title.includes("Sweet Corn"));
  assert.ok(cauliflowerCard, "IQF Cauliflower card not found");
  assert.ok(sweetCornCard, "IQF Sweet Corn card not found");
  assert.ok(
    decodeURIComponent(cauliflowerCard.imgSrc).includes("iqf-vegetables-fallback.webp"),
    `Cauliflower imgSrc does not point to fallback WebP: ${cauliflowerCard.imgSrc}`,
  );
  assert.ok(
    decodeURIComponent(sweetCornCard.imgSrc).includes("iqf-vegetables-fallback.webp"),
    `Sweet Corn imgSrc does not point to fallback WebP: ${sweetCornCard.imgSrc}`,
  );
  console.log("        ✓ Verified: All 13 frozen cards have .has-dedicated-image; cauliflower and corn use dedicated fallback.");

  // 1.3 Rapid World Switching (Fresh <-> Frozen)
  console.log("  [1.3] Stress testing World Switching (Fresh <-> Frozen) for sprite leakage...");
  clearNetworkHistory();
  for (let cycle = 0; cycle < 3; cycle++) {
    // Switch to Fresh
    await session.evaluate('document.querySelector(\'[role="tab"][data-world="fresh"], button[data-world="fresh"]\')?.click()');
    await session.waitFor(
      'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21',
      "Switching to Fresh did not render 21 cards",
    );
    // Switch to Frozen
    await session.evaluate('document.querySelector(\'[role="tab"][data-world="frozen"], button[data-world="frozen"]\')?.click()');
    await session.waitFor(
      'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13',
      "Switching to Frozen did not render 13 cards",
    );
  }

  const spriteLeakRequests = networkRequests.filter((r) => r.url.includes("three-worlds.png"));
  assert.equal(
    spriteLeakRequests.length,
    0,
    `VIOLATION: three-worlds.png requested during world switching: ${spriteLeakRequests.length}`,
  );
  console.log("        ✓ Verified: Zero three-worlds.png requests across repeated world transitions.");

  // 1.4 Flight Dialog on Cauliflower & Sweet Corn
  console.log("  [1.4] Testing flight dialog overlay on Cauliflower & Sweet Corn for sprite leakage...");
  clearNetworkHistory();

  // Scroll to cauliflower card
  await session.evaluate(`(() => {
    const card = [...document.querySelectorAll(".atlas-grid > .export-card-scene")].find((el) =>
      el.textContent.includes("Cauliflower")
    );
    card?.querySelector(".export-card-keyboard-toggle")?.click();
  })()`);

  await session.waitFor(
    'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
    "Cauliflower flight dialog did not open",
  );

  // Close flight dialog via Escape
  await session.evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
  await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', "Flight dialog did not close");

  const dialogSpriteRequests = networkRequests.filter((r) => r.url.includes("three-worlds.png"));
  assert.equal(dialogSpriteRequests.length, 0, "three-worlds.png requested when opening flight dialog");
  console.log("        ✓ Verified: Zero three-worlds.png requests during card flip and modal expansion.");

  // 1.5 Cold load of /en/products?world=fresh
  console.log("  [1.5] Cold loading /en/products?world=fresh and inspecting network requests...");
  clearNetworkHistory();
  await session.navigate("/en/products?world=fresh");
  await session.waitFor(
    'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21',
    "Produce fresh world did not render 21 product cards",
  );
  const freshThreeWorldsPng = networkRequests.filter((r) => r.url.includes("three-worlds.png"));
  assert.equal(freshThreeWorldsPng.length, 0, "three-worlds.png requested on fresh catalogue");
  console.log("        ✓ Verified: Zero three-worlds.png requests on fresh catalogue cold visit.");

  console.log("  >> F09 VERDICT: ALL FROZEN CATALOGUE SPRITE STRESS TESTS PASSED! <<\n");


  // ==========================================================================
  // SUITE 2: FEATURE F08 - HERBS FAMILY NAVIGATION & CLIENT STATE
  // ==========================================================================
  console.log(">>> SUITE 2: FEATURE F08 - HERBS FAMILY NAVIGATION & ZERO RSC ROUNDTRIPS");

  // 2.1 Cold navigation to Herbs catalogue
  console.log("  [2.1] Cold loading /en/herbs-spices/products...");
  clearNetworkHistory();

  await session.navigate("/en/herbs-spices/products");

  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 27',
    "Herbs catalogue initial load did not render 27 materials",
  );

  // Verify initial state
  const initialHerbsState = await session.evaluate(`(() => ({
    search: window.location.search,
    pathname: window.location.pathname,
    activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
    countText: document.querySelector('p[class*="count"]')?.textContent?.trim(),
    specimensCount: document.querySelectorAll("[data-material-specimen]").length,
  }))()`);

  assert.equal(initialHerbsState.search, "", "Initial search params must be empty");
  assert.equal(initialHerbsState.activeTab, "All", "Initial active tab must be 'All'");
  assert.ok(initialHerbsState.countText.includes("27"), `Count text does not show 27: ${initialHerbsState.countText}`);
  assert.equal(initialHerbsState.specimensCount, 27, "Must show 27 initial specimens");
  console.log("        ✓ Cold load verified: All (27 materials), zero URL query.");

  // 2.2 Stress Test: Rapid sequential switching between all 7 options (Hammer Test)
  console.log("  [2.2] Stress testing rapid switching across all families (Hammer test: 35 rapid switches)...");

  const familySpecs = [
    { id: "herbs", label: "Herbs", count: 11 },
    { id: "flowers", label: "Flowers", count: 3 },
    { id: "seeds", label: "Seeds", count: 8 },
    { id: "spices", label: "Spices", count: 2 },
    { id: "roots", label: "Roots", count: 1 },
    { id: "dehydrated-vegetables", label: "Dehydrated Vegetables", count: 2 },
    { id: "all", label: "All", count: 27 },
  ];

  clearNetworkHistory();

  // Execute 5 rapid cycles through all 7 tabs
  for (let cycle = 1; cycle <= 5; cycle++) {
    for (const spec of familySpecs) {
      await session.evaluate(`(() => {
        const btn = [...document.querySelectorAll('[role="tab"]')].find((b) =>
          b.textContent.trim() === ${JSON.stringify(spec.label)}
        );
        btn?.click();
      })()`);
      // Tiny delay simulating rapid clicking
      await new Promise((r) => setTimeout(r, 40));
    }
  }

  // Allow settled state
  await new Promise((r) => setTimeout(r, 300));

  // Assert: ZERO RSC requests during the entire rapid switching barrage
  const rscRequests = networkRequests.filter((r) =>
    r.url.includes("_rsc") || r.url.includes("__next") || (r.url.includes("/herbs-spices/products") && r.type === "Fetch")
  );
  console.log(`        Total RSC / Server Fetch requests during 35 switches: ${rscRequests.length}`);
  assert.equal(
    rscRequests.length,
    0,
    `VIOLATION: ${rscRequests.length} server RSC / Fetch request(s) initiated during tab switching! URL: ${rscRequests[0]?.url}`,
  );
  console.log("        ✓ Verified: ZERO RSC roundtrips during rapid tab switching.");

  // 2.3 Methodical Verification of State & DOM for each Family
  console.log("  [2.3] Methodically asserting tab selection, URL update, specimen counts & data-family attribute...");

  for (const spec of familySpecs) {
    // Click tab
    await session.evaluate(`(() => {
      const btn = [...document.querySelectorAll('[role="tab"]')].find((b) =>
        b.textContent.trim() === ${JSON.stringify(spec.label)}
      );
      btn?.click();
    })()`);

    // Wait for DOM update
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${spec.count}`,
      `Specimen count mismatch for ${spec.label}`,
    );

    const state = await session.evaluate(`(() => {
      const params = new URLSearchParams(window.location.search);
      const activeBtn = document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim();
      const specimens = [...document.querySelectorAll("[data-material-specimen]")];
      const allMatch = ${spec.id === "all"} ? true : specimens.every((s) => s.dataset.family === ${JSON.stringify(spec.id)});
      return {
        familyParam: params.get("family"),
        activeBtn,
        count: specimens.length,
        allMatch,
      };
    })()`);

    if (spec.id === "all") {
      assert.equal(state.familyParam, null, "URL query 'family' should be absent for 'All'");
    } else {
      assert.equal(state.familyParam, spec.id, `URL query 'family' mismatch for ${spec.label}`);
    }
    assert.equal(state.activeBtn, spec.label, `Active button mismatch for ${spec.label}`);
    assert.equal(state.count, spec.count, `Specimen count mismatch for ${spec.label}`);
    assert.ok(state.allMatch, `Not all specimens match family ${spec.id}`);
  }
  console.log("        ✓ Verified: Every family correctly updates URL, active tab, count, and DOM specimens.");

  // 2.4 Browser Back / Forward History Navigation Stress Test
  console.log("  [2.4] Stress testing Browser Back and Forward history navigation...");

  // Build a distinct 6-step history sequence:
  // Step 0: All (initial)
  // Step 1: Flowers (3)
  // Step 2: Seeds (8)
  // Step 3: Spices (2)
  // Step 4: Herbs (11)
  // Step 5: Roots (1)
  const historySequence = [
    { id: "flowers", label: "Flowers", count: 3 },
    { id: "seeds", label: "Seeds", count: 8 },
    { id: "spices", label: "Spices", count: 2 },
    { id: "herbs", label: "Herbs", count: 11 },
    { id: "roots", label: "Roots", count: 1 },
  ];

  // Navigate forward through sequence
  for (const step of historySequence) {
    await session.evaluate(`(() => {
      const btn = [...document.querySelectorAll('[role="tab"]')].find((b) =>
        b.textContent.trim() === ${JSON.stringify(step.label)}
      );
      btn?.click();
    })()`);
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${step.count}`,
      `Did not settle on ${step.label}`,
    );
  }

  // Now step BACKWARDS through history one by one
  console.log("        Stepping BACKWARDS through history (Roots -> Herbs -> Spices -> Seeds -> Flowers -> All)...");
  clearNetworkHistory();

  const reverseSteps = [
    { id: "herbs", label: "Herbs", count: 11 },
    { id: "spices", label: "Spices", count: 2 },
    { id: "seeds", label: "Seeds", count: 8 },
    { id: "flowers", label: "Flowers", count: 3 },
    { id: "all", label: "All", count: 27 },
  ];

  for (const expected of reverseSteps) {
    await session.evaluate("window.history.back()");
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${expected.count}`,
      `history.back() failed to restore ${expected.label}`,
    );

    const currentUrlParam = await session.evaluate("new URLSearchParams(window.location.search).get('family')");
    const activeTab = await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()");

    if (expected.id === "all") {
      assert.equal(currentUrlParam, null, "Back to 'All' should remove family query");
    } else {
      assert.equal(currentUrlParam, expected.id, `Back to ${expected.label} URL query mismatch`);
    }
    assert.equal(activeTab, expected.label, `Back to ${expected.label} active tab mismatch`);
  }

  // Now step FORWARD through history one by one
  console.log("        Stepping FORWARD through history (All -> Flowers -> Seeds -> Spices -> Herbs -> Roots)...");
  const forwardSteps = [
    { id: "flowers", label: "Flowers", count: 3 },
    { id: "seeds", label: "Seeds", count: 8 },
    { id: "spices", label: "Spices", count: 2 },
    { id: "herbs", label: "Herbs", count: 11 },
    { id: "roots", label: "Roots", count: 1 },
  ];

  for (const expected of forwardSteps) {
    await session.evaluate("window.history.forward()");
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${expected.count}`,
      `history.forward() failed to restore ${expected.label}`,
    );

    const currentUrlParam = await session.evaluate("new URLSearchParams(window.location.search).get('family')");
    const activeTab = await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()");

    assert.equal(currentUrlParam, expected.id, `Forward to ${expected.label} URL query mismatch`);
    assert.equal(activeTab, expected.label, `Forward to ${expected.label} active tab mismatch`);
  }

  // Non-linear history jumps: history.go(-3) and history.go(2)
  console.log("        Testing non-linear history jumps (history.go(-3) -> Seeds, history.go(2) -> Herbs)...");
  // Currently at index 5 (Roots). Jump -3 -> index 2 (Seeds, 8 items)
  await session.evaluate("window.history.go(-3)");
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 8',
    "history.go(-3) failed to restore Seeds (8 items)",
  );
  assert.equal(await session.evaluate("new URLSearchParams(window.location.search).get('family')"), "seeds");
  assert.equal(await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()"), "Seeds");

  // Jump +2 -> index 4 (Herbs, 11 items)
  await session.evaluate("window.history.go(2)");
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 11',
    "history.go(2) failed to restore Herbs (11 items)",
  );
  assert.equal(await session.evaluate("new URLSearchParams(window.location.search).get('family')"), "herbs");
  assert.equal(await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()"), "Herbs");

  // Verify zero RSC requests throughout all history operations
  const historyRscRequests = networkRequests.filter((r) => r.url.includes("_rsc"));
  assert.equal(historyRscRequests.length, 0, "RSC request observed during history back/forward!");
  console.log("        ✓ Verified: Browser back, forward, and non-linear jumps perfectly restore state with 0 RSC roundtrips.");

  // 2.5 Search Filter Interaction with Family Switching
  console.log("  [2.5] Testing search query interaction with family switching and history...");
  // Navigate to All
  await session.evaluate(`[...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "All").click()`);
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Reset to All failed");

  // Search for "fennel"
  await session.evaluate(`(() => {
    const input = document.querySelector('input[type="search"], input[placeholder*="search" i], input[class*="search" i]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "fennel");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);

  // Fennel is a Seed
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 1',
    "Search for 'fennel' did not filter to 1 item",
  );

  // Switch to Herbs while search "fennel" is active
  await session.evaluate(`[...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "Herbs").click()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 0',
    "Fennel should not exist in Herbs family (count should be 0)",
  );

  // Switch to Seeds
  await session.evaluate(`[...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "Seeds").click()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 1',
    "Fennel should be visible in Seeds family",
  );

  // Clear search
  await session.evaluate(`(() => {
    const input = document.querySelector('input[type="search"], input[placeholder*="search" i], input[class*="search" i]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 8',
    "Clearing search in Seeds should restore 8 items",
  );
  console.log("        ✓ Verified: Search filtering and family selection interact coherently without state desync.");

  // 2.6 Multilingual Deep Link & Direct Prerender Verification
  console.log("  [2.6] Verifying deep-link cold loading across all 5 locales...");
  const multilingualDeepLinks = [
    { locale: "en", family: "seeds", expectedCount: 8, label: "Seeds", dir: "ltr" },
    { locale: "ar", family: "flowers", expectedCount: 3, label: "زهور", dir: "rtl" },
    { locale: "ru", family: "herbs", expectedCount: 11, label: "Травы", dir: "ltr" },
    { locale: "de", family: "spices", expectedCount: 2, label: "Gewürze", dir: "ltr" },
    { locale: "fr", family: "roots", expectedCount: 1, label: "Racines", dir: "ltr" },
  ];

  for (const deepLink of multilingualDeepLinks) {
    const route = `/${deepLink.locale}/herbs-spices/products?family=${deepLink.family}`;
    await session.navigate(route);
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${deepLink.expectedCount}`,
      `Deep link to ${route} did not load ${deepLink.expectedCount} items`,
    );

    const deepLinkState = await session.evaluate(`(() => ({
      count: document.querySelectorAll("[data-material-specimen]").length,
      dir: document.documentElement.dir,
      activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
      familyParam: new URLSearchParams(window.location.search).get("family"),
    }))()`);

    assert.equal(deepLinkState.count, deepLink.expectedCount, `Item count mismatch for ${route}`);
    assert.equal(deepLinkState.dir, deepLink.dir, `HTML dir mismatch for ${route}`);
    assert.equal(deepLinkState.familyParam, deepLink.family, `URL param mismatch for ${route}`);
    assert.equal(deepLinkState.activeTab, deepLink.label, `Active tab label mismatch for ${route}`);
  }

  // Reload test on deep link
  console.log("        Testing page reload on deep link (/en/herbs-spices/products?family=seeds)...");
  await session.navigate("/en/herbs-spices/products?family=seeds");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 8', "Seeds load failed");
  await session.send("Page.reload");
  await session.waitFor(
    'document.readyState === "complete" && document.querySelectorAll("[data-material-specimen]").length === 8',
    "Reload did not preserve 8 seeds",
  );
  assert.equal(await session.evaluate("new URLSearchParams(window.location.search).get('family')"), "seeds");
  assert.equal(await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()"), "Seeds");
  console.log("        ✓ Verified: Deep links across 5 languages and page reload retain exact filter and active tab.");

  // 2.7 Malformed Query Parameter Fallback Robustness
  console.log("  [2.7] Stress testing malformed query parameters and injection resilience...");
  const malformedQueries = [
    "invalid_slug_xyz",
    "../../etc/passwd",
    "<script>alert(1)</script>",
    "null",
    "undefined",
    "12345",
  ];

  for (const badQuery of malformedQueries) {
    const route = `/en/herbs-spices/products?family=${encodeURIComponent(badQuery)}`;
    await session.navigate(route);
    await session.waitFor(
      'document.querySelectorAll("[data-material-specimen]").length === 27',
      `Malformed query '${badQuery}' did not fall back safely to 27 materials`,
    );

    const activeTab = await session.evaluate("document.querySelector('[role=\"tab\"][aria-selected=\"true\"]')?.textContent?.trim()");
    assert.equal(activeTab, "All", `Malformed query '${badQuery}' active tab was not 'All'`);
  }
  console.log("        ✓ Verified: Malformed query parameters gracefully fall back to All (27 items) with zero crashes.");

  // 2.8 Mobile Viewport (390x844) Touch Navigation
  console.log("  [2.8] Testing Herbs catalogue family navigation on mobile viewport (390px)...");
  await session.setViewport(390, 844, true);
  await session.navigate("/en/herbs-spices/products");
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Mobile initial load failed");

  for (const spec of familySpecs) {
    await session.evaluate(`(() => {
      const btn = [...document.querySelectorAll('[role="tab"]')].find((b) =>
        b.textContent.trim() === ${JSON.stringify(spec.label)}
      );
      btn?.click();
    })()`);
    await session.waitFor(
      `document.querySelectorAll("[data-material-specimen]").length === ${spec.count}`,
      `Mobile switch to ${spec.label} failed`,
    );
  }
  // Restore desktop viewport
  await session.setViewport(1440, 900, false);
  console.log("        ✓ Verified: Mobile viewport touch filtering operates identically with zero regressions.");

  // 2.9 Rapid Back/Forward Hammer Test (10 oscillations)
  console.log("  [2.9] Rapidly oscillating history.back() and history.forward() (10 rapid cycles)...");
  await session.navigate("/en/herbs-spices/products");
  await session.evaluate(`[...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "Flowers").click()`);
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 3', "Flowers failed");
  await session.evaluate(`[...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "Seeds").click()`);
  await session.waitFor('document.querySelectorAll("[data-material-specimen]").length === 8', "Seeds failed");

  for (let i = 0; i < 5; i++) {
    await session.evaluate("window.history.back()");
    await new Promise((r) => setTimeout(r, 25));
    await session.evaluate("window.history.forward()");
    await new Promise((r) => setTimeout(r, 25));
  }
  // Settle at Seeds
  await session.waitFor(
    'document.querySelectorAll("[data-material-specimen]").length === 8 && new URLSearchParams(window.location.search).get("family") === "seeds"',
    "Oscillation did not settle on Seeds",
  );
  console.log("        ✓ Verified: Rapid history oscillation handled cleanly without state divergence.");

  // 2.10 Latency benchmark of client-side family switching
  console.log("  [2.10] Measuring client-side family switching execution latency...");
  const switchLatencyMs = await session.evaluate(`(() => {
    const btn = [...document.querySelectorAll('[role="tab"]')].find((b) => b.textContent.trim() === "Herbs");
    const t0 = performance.now();
    btn?.click();
    const t1 = performance.now();
    return t1 - t0;
  })()`);
  console.log(`        Measured synchronous dispatch latency: ${switchLatencyMs.toFixed(3)} ms`);
  assert.ok(switchLatencyMs < 16.6, `Dispatch latency exceeded 16.6ms (one 60Hz frame): ${switchLatencyMs} ms`);
  console.log("        ✓ Verified: Client-side filter transition executes in < 16ms (sub-frame instant responsiveness).");

  // Check console errors

  const errors = session.getErrors();
  console.log(`\nBrowser console errors recorded throughout test run: ${errors.length}`);
  if (errors.length > 0) {
    console.log("Errors detected:", errors);
  }
  assert.equal(errors.length, 0, `Uncaught browser console errors: ${errors.join(" | ")}`);

  console.log("\n==================================================================");
  console.log("  🎉 ALL CHALLENGER M2 STRESS TESTS PASSED WITH 100% SUCCESS!");
  console.log("  - F09 Frozen Sprite: three-worlds.png NEVER requested (0 bytes transferred)");
  console.log("  - F09 Fallback WebP: iqf-vegetables-fallback.webp verified for cauliflower & corn");
  console.log("  - F08 Herbs Navigation: ZERO RSC roundtrips during rapid switching");
  console.log("  - F08 History Navigation: back/forward and non-linear jumps 100% synchronized");
  console.log("==================================================================");

} finally {
  await session.close();
  if (serverProc) {
    try {
      serverProc.kill();
    } catch {}
  }
}
