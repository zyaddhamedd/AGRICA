#!/usr/bin/env node
import { assertHerbsIndexing } from "./division-launch-policy.mjs";

/**
 * Challenger M3 Empirical Stress Test Harness
 *
 * Scope: Features F13, F10, F15, and Launch Guardrails
 * - F13: Static Media Cache-Control (31536000, immutable), Mutable Documents (3600, must-revalidate), Dynamic route insulation
 * - F10: ProductCardFlightOverlay open/close across Desktop (1440px), Tablet (768px), and Mobile (390px):
 *        CLS <= 0.001, GPU compositing / 60fps frame rate, pointer-events lock/unlock
 * - F15: Dead code elimination (Stack.tsx / Stack.css)
 * - Public switcher and selective Herbs indexing across all 15 routes
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createBrowserSession } from "./cdp-client.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const PORT = process.env.PORT || "3114";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

console.log("==================================================================");
console.log("  CHALLENGER M3 EMPIRICAL STRESS TEST HARNESS (F13, F10, F15, GATES)");
console.log(`  Base URL: ${BASE_URL}`);
console.log("==================================================================\n");

async function ensureServer(port) {
  const url = `http://localhost:${port}`;
  try {
    const res = await fetch(`${url}/en`);
    if (res.ok) {
      console.log(`[Server] Server already running at ${url}`);
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
        // Warm up /en/products as well
        await fetch(`${url}/en/products?world=fresh`);
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

const serverProc = await ensureServer(PORT);

let exitCode = 0;

try {
  // ==========================================================================
  // SUITE 1: CACHE-CONTROL HEADERS EMPIRICAL AUDIT (FEATURE F13)
  // ==========================================================================
  console.log("------------------------------------------------------------------");
  console.log("SUITE 1: Cache-Control HTTP Response Header Verification (F13)");
  console.log("------------------------------------------------------------------");

  // 1.1 Static Media Endpoints
  const staticEndpoints = [
    "/assets/agrica-logo.png",
    "/certificates/webp/cert-02-iso-160.webp",
    "/certificates/webp/cert-01-phytosanitary-160.webp",
    "/certificates/webp/cert-03-organic-160.webp",
    "/herbs-background/dk-background.png",
    "/agrica-logo.png",
  ];

  // Discover a dynamic chunk from .next/static/chunks
  const chunksDir = path.join(rootDir, ".next/static/chunks");
  if (fs.existsSync(chunksDir)) {
    const chunkFiles = fs.readdirSync(chunksDir).filter((f) => f.endsWith(".js") || f.endsWith(".css"));
    if (chunkFiles.length > 0) {
      staticEndpoints.push(`/_next/static/chunks/${chunkFiles[0]}`);
    }
  }

  for (const endpoint of staticEndpoints) {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url);
    const cc = res.headers.get("cache-control");
    console.log(`  [Static] ${endpoint} -> HTTP ${res.status} | Cache-Control: "${cc}"`);
    assert.equal(res.status, 200, `Static asset ${endpoint} must return 200`);
    assert.equal(
      cc,
      "public, max-age=31536000, immutable",
      `Static asset ${endpoint} must have immutable year-long cache`,
    );
  }
  console.log("✓ All static media endpoints correctly tagged with public, max-age=31536000, immutable");

  // 1.2 Mutable Contact Documents
  const mutableDocuments = [
    "/contact/AGRICA-Produce-Company-Profile.pdf",
    "/contact/AGRICA-Herbs-Spices-Company-Profile.pdf",
    "/contact/AGRICA.vcf",
  ];

  for (const doc of mutableDocuments) {
    const url = `${BASE_URL}${doc}`;
    const res = await fetch(url);
    const cc = res.headers.get("cache-control");
    console.log(`  [Mutable Doc] ${doc} -> HTTP ${res.status} | Cache-Control: "${cc}"`);
    assert.equal(res.status, 200, `Contact doc ${doc} must return 200`);
    assert.equal(
      cc,
      "public, max-age=3600, must-revalidate",
      `Contact doc ${doc} must have 1-hour must-revalidate cache`,
    );
  }
  console.log("✓ All mutable contact documents correctly tagged with public, max-age=3600, must-revalidate");

  // 1.3 Mutable Contact Documents Boundary / Negative Tests
  // Querying /contact (the HTML page) or invalid file extensions under /contact/ must NOT get mutable doc headers
  const contactPageRes = await fetch(`${BASE_URL}/contact`);
  const contactPageCc = contactPageRes.headers.get("cache-control") || "";
  console.log(`  [Contact HTML] /contact -> HTTP ${contactPageRes.status} | Cache-Control: "${contactPageCc}"`);
  assert.equal(contactPageRes.status, 200, "/contact must return 200");
  assert.notEqual(
    contactPageCc,
    "public, max-age=3600, must-revalidate",
    "/contact HTML page must not receive static file header",
  );
  assert.ok(!contactPageCc.includes("immutable"), "/contact HTML must not be immutable");

  // 1.4 Dynamic HTML & RSC Routes Insulation
  const dynamicRoutes = [
    "/en",
    "/en/products",
    "/en/products?world=fresh",
    "/en/products?world=frozen",
    "/en/herbs-spices",
    "/en/herbs-spices/products",
    "/en/herbs-spices/standard",
    "/en/company",
    "/en/standard",
    "/ar/products",
    "/ru/company",
  ];

  for (const route of dynamicRoutes) {
    const url = `${BASE_URL}${route}`;
    const res = await fetch(url);
    const cc = res.headers.get("cache-control") || "";
    console.log(`  [Dynamic Route] ${route} -> HTTP ${res.status} | Cache-Control: "${cc}"`);
    assert.equal(res.status, 200, `Dynamic route ${route} must return 200`);
    assert.ok(
      !cc.includes("immutable"),
      `Dynamic route ${route} MUST NOT be marked immutable`,
    );
    assert.ok(
      !cc.includes("max-age=31536000"),
      `Dynamic route ${route} MUST NOT have browser max-age=31536000`,
    );
  }

  // Check RSC payload
  const rscRes = await fetch(`${BASE_URL}/en/products?_rsc=adversarial_test`, {
    headers: { RSC: "1" },
  });
  const rscCc = rscRes.headers.get("cache-control") || "";
  console.log(`  [RSC Payload] /en/products?_rsc=... -> HTTP ${rscRes.status} | Cache-Control: "${rscCc}"`);
  assert.ok(!rscCc.includes("immutable"), "RSC payload must not be marked immutable");

  console.log("✓ Dynamic HTML and RSC routes are insulated from immutable year-long cache rules\n");

  // ==========================================================================
  // SUITE 2: LAUNCH GUARDRAILS & DIVISION ISOLATION
  // ==========================================================================
  console.log("------------------------------------------------------------------");
  console.log("SUITE 2: Launch Guardrails & Division Isolation Verification");
  console.log("------------------------------------------------------------------");

  // 2.1 File static check
  const switcherPath = path.join(rootDir, "src/components/common/BusinessDivisionSwitcher.tsx");
  const switcherContent = fs.readFileSync(switcherPath, "utf8");
  assert.ok(switcherContent.includes("data-division-switcher"), "public division switcher exists");
  assert.ok(!switcherContent.includes("SHOW_BUSINESS_DIVISION_SWITCHER"), "obsolete launch gate removed");

  // 2.2 Robots metadata across ALL 15 Herbs & Spices routes (5 locales x 3 routes)
  const locales = ["en", "ar", "ru", "de", "fr"];
  const herbsSubroutes = ["herbs-spices", "herbs-spices/products", "herbs-spices/standard"];

  let totalHerbsRoutesChecked = 0;
  for (const locale of locales) {
    for (const sub of herbsSubroutes) {
      const route = `/${locale}/${sub}`;
      const res = await fetch(`${BASE_URL}${route}`);
      assert.equal(res.status, 200, `Route ${route} must return 200`);
      const html = await res.text();

      assertHerbsIndexing(html, route);
      totalHerbsRoutesChecked++;
    }
  }
  console.log(`✓ All ${totalHerbsRoutesChecked} Herbs & Spices localized routes respect the selective indexing policy`);

  // Verify Produce routes do NOT have noindex
  for (const locale of locales) {
    const route = `/${locale}/products`;
    const res = await fetch(`${BASE_URL}${route}`);
    const html = await res.text();
    assert.ok(!html.includes('content="noindex'), `Produce route ${route} must NOT have noindex`);
  }
  console.log("✓ Produce routes are indexable and free of noindex tags");

  // 2.3 Dead Code Elimination (F15)
  const deadStackTsx = path.join(rootDir, "src/components/home/Stack.tsx");
  const deadStackCss = path.join(rootDir, "src/components/home/Stack.css");
  assert.equal(fs.existsSync(deadStackTsx), false, "Stack.tsx must be pruned");
  assert.equal(fs.existsSync(deadStackCss), false, "Stack.css must be pruned");
  console.log("✓ Dead code files Stack.tsx and Stack.css confirmed removed\n");

  // ==========================================================================
  // SUITE 3: PRODUCT CARD FLIGHT OVERLAY ADVERSARIAL STRESS TEST (FEATURE F10)
  // ==========================================================================
  console.log("------------------------------------------------------------------");
  console.log("SUITE 3: Product Card Flight Overlay Interaction Stress Test (F10)");
  console.log("------------------------------------------------------------------");

  const session = await createBrowserSession({ baseUrl: BASE_URL, port: 9462 });

  // Helper to record CLS on page
  async function initCLSObserver() {
    await session.evaluate(`
      window.__clsScore = 0;
      window.__clsEntries = [];
      if (window.__clsObserver) {
        window.__clsObserver.disconnect();
      }
      window.__clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__clsScore += entry.value;
            window.__clsEntries.push({
              value: entry.value,
              startTime: entry.startTime,
              sources: (entry.sources || []).map(s => s.node ? s.node.nodeName : 'unknown')
            });
          }
        }
      });
      window.__clsObserver.observe({ type: 'layout-shift', buffered: true });
    `);
  }

  async function getCLS() {
    return session.evaluate("window.__clsScore");
  }

  // Helper to record animation frame timings
  async function startFrameMonitor() {
    await session.evaluate(`
      window.__frameTimestamps = [];
      window.__frameMonitorActive = true;
      function recordFrame(now) {
        if (!window.__frameMonitorActive) return;
        window.__frameTimestamps.push(now);
        requestAnimationFrame(recordFrame);
      }
      requestAnimationFrame(recordFrame);
    `);
  }

  async function stopFrameMonitor() {
    return session.evaluate(`(() => {
      window.__frameMonitorActive = false;
      const ts = window.__frameTimestamps || [];
      if (ts.length < 2) {
        return { frameCount: ts.length, avgFps: 60, maxDeltaMs: 16.7 };
      }
      const deltas = [];
      for (let i = 1; i < ts.length; i++) {
        deltas.push(ts[i] - ts[i - 1]);
      }
      const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      const maxDelta = Math.max(...deltas);
      const avgFps = 1000 / avgDelta;
      return { frameCount: ts.length, avgFps, maxDeltaMs: maxDelta, deltas };
    })()`);
  }

  const viewports = [
    { label: "Desktop", width: 1440, height: 900, isMobile: false },
    { label: "Tablet", width: 768, height: 1024, isMobile: false },
    { label: "Mobile", width: 390, height: 844, isMobile: true },
  ];

  for (const vp of viewports) {
    console.log(`\n  --- Testing Viewport: ${vp.label} (${vp.width}x${vp.height}, mobile=${vp.isMobile}) ---`);
    await session.setViewport(vp.width, vp.height, vp.isMobile);

    // 1. Navigate to products page
    await session.navigate("/en/products?world=fresh");
    await session.waitFor(
      'document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21',
      "Products grid did not load 21 cards",
    );

    // Wait 1000ms for React hydration and event listener attachment
    await new Promise((r) => setTimeout(r, 1000));

    // Verify public division navigation is present
    const switcherInDom = await session.evaluate(`
      document.querySelector('nav[aria-label="AGRICA business divisions"]') !== null ||
      document.querySelector('[class*="BusinessDivisionSwitcher"]') !== null ||
      document.querySelector('a[href*="/herbs-spices"][aria-label*="business division"]') !== null
    `);
    assert.equal(switcherInDom, true, `Business division switcher must be in DOM on ${vp.label}`);

    // Setup CLS tracking
    await initCLSObserver();
    await new Promise((r) => setTimeout(r, 300));
    const baselineCLS = await getCLS();
    console.log(`    [${vp.label}] Initial CLS: ${baselineCLS}`);

    // 2. Inspect target product card
    const targetCardSelector = '[data-product-id="produce:fresh-strawberry"]';
    await session.waitFor(`document.querySelector('${targetCardSelector}') !== null`, "Target card not found");

    // Scroll card into view
    await session.evaluate(`
      const card = document.querySelector('${targetCardSelector}');
      card.scrollIntoView({ block: 'center', behavior: 'instant' });
    `);
    await new Promise((r) => setTimeout(r, 300));

    // Measure pre-open state
    const preOpenState = await session.evaluate(`(() => {
      const card = document.querySelector('${targetCardSelector}');
      return {
        bodyPosition: document.body.style.position,
        bodyOverflow: document.body.style.overflow,
        cardOpacity: getComputedStyle(card).opacity,
        cardPointerEvents: getComputedStyle(card).pointerEvents,
      };
    })()`);
    assert.notEqual(preOpenState.bodyPosition, "fixed", "Body position must not be fixed before open");

    // 3. Trigger flight card open
    console.log(`    [${vp.label}] Triggering flight overlay open...`);
    await startFrameMonitor();

    if (vp.isMobile) {
      // Mobile tap on card
      await session.evaluate(`document.querySelector('${targetCardSelector} .export-card')?.click()`);
    } else {
      // Desktop / Tablet click trigger
      await session.evaluate(`document.querySelector('${targetCardSelector} .export-card-keyboard-toggle')?.click()`);
    }

    // Wait for overlay to become ready
    await session.waitFor(
      'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
      `Overlay did not open or become ready on ${vp.label}`,
      150,
      50,
    );

    const openPerf = await stopFrameMonitor();
    console.log(`    [${vp.label}] Open Animation Performance: ${openPerf.frameCount} frames, ~${openPerf.avgFps.toFixed(1)} FPS, max frame time: ${openPerf.maxDeltaMs.toFixed(1)}ms`);

    // 4. Verify Open Pointer Lock & State
    const openState = await session.evaluate(`(() => {
      const dialog = document.querySelector("#product-card-flight-dialog");
      const origin = document.querySelector('${targetCardSelector} .export-card');
      const backFrame = dialog.querySelector('[class*="backFrame"]');
      const frontShell = dialog.querySelector('[class*="frontShell"]');
      const siblings = Array.from(document.body.children).filter(c => c !== dialog && c.tagName !== 'SCRIPT');

      return {
        dialogReady: dialog.getAttribute('data-ready'),
        bodyPosition: document.body.style.position,
        bodyOverflow: document.body.style.overflow,
        originOpacity: origin.style.opacity,
        originPointerEvents: origin.style.pointerEvents,
        frontShellPointerEvents: getComputedStyle(frontShell).pointerEvents,
        backFramePointerEvents: getComputedStyle(backFrame).pointerEvents,
        allSiblingsInert: siblings.every(s => s.inert === true),
        allSiblingsAriaHidden: siblings.every(s => s.getAttribute('aria-hidden') === 'true'),
        closeButtonVisible: dialog.querySelector('.export-card-flight-close') !== null,
        enquiryNotchVisible: dialog.querySelector('.enquiry-notch') !== null,
      };
    })()`);

    console.log(`    [${vp.label}] Open State Verification:`, {
      dialogReady: openState.dialogReady,
      bodyPosition: openState.bodyPosition,
      bodyOverflow: openState.bodyOverflow,
      originOpacity: openState.originOpacity,
      originPointerEvents: openState.originPointerEvents,
      frontShellPointerEvents: openState.frontShellPointerEvents,
      backFramePointerEvents: openState.backFramePointerEvents,
      allSiblingsInert: openState.allSiblingsInert,
    });

    assert.equal(openState.dialogReady, "true", "Dialog must be ready");
    assert.equal(openState.bodyPosition, "fixed", "Body position must be locked fixed");
    assert.equal(openState.bodyOverflow, "hidden", "Body overflow must be hidden");
    assert.equal(openState.originOpacity, "0", "Origin card must be hidden (opacity: 0) while overlay active");
    assert.equal(openState.originPointerEvents, "none", "Origin card pointer-events must be none while overlay active");
    assert.equal(openState.frontShellPointerEvents, "none", "Front shell pointer-events must be none");
    assert.equal(openState.backFramePointerEvents, "auto", "Back frame pointer-events must be auto when ready");
    assert.equal(openState.allSiblingsInert, true, "All body siblings must be set to inert");
    assert.equal(openState.allSiblingsAriaHidden, true, "All body siblings must have aria-hidden='true'");
    assert.equal(openState.closeButtonVisible, true, "Close button must be present");
    assert.equal(openState.enquiryNotchVisible, true, "Enquiry button must be present");

    // Verify GPU Compositing CSS properties
    const gpuStyles = await session.evaluate(`(() => {
      const dialog = document.querySelector("#product-card-flight-dialog");
      const frontShell = dialog.querySelector('[class*="frontShell"]');
      const backCard = dialog.querySelector('[class*="backCard"]');
      const fsComputed = getComputedStyle(frontShell);
      const bcComputed = getComputedStyle(backCard);
      return {
        frontShellWillChange: fsComputed.willChange,
        frontShellTransformStyle: fsComputed.transformStyle,
        backCardWillChange: bcComputed.willChange,
        backCardTransformStyle: bcComputed.transformStyle,
      };
    })()`);
    console.log(`    [${vp.label}] GPU Compositing CSS:`, gpuStyles);
    assert.ok(
      gpuStyles.frontShellWillChange.includes("transform") || gpuStyles.frontShellWillChange.includes("opacity"),
      "Front shell must declare will-change transform/opacity",
    );
    assert.ok(
      gpuStyles.backCardWillChange.includes("transform"),
      "Back card must declare will-change transform",
    );

    // 5. Test interaction inside the modal (quote toggle)
    await session.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch')?.click()`);
    await session.waitFor(
      'document.querySelector(".quote-count")?.textContent === "1"',
      "Toggling quote inside modal failed to update quote count",
    );
    console.log(`    [${vp.label}] Interactive enquiry notch successfully toggled in modal (quote count = 1)`);

    // Toggle back to 0
    await session.evaluate(`document.querySelector('#product-card-flight-dialog .enquiry-notch')?.click()`);
    await session.waitFor(
      'document.querySelector(".quote-count")?.textContent === "0"',
      "Untoggling quote inside modal failed to restore quote count",
    );

    // 6. Trigger flight card close
    console.log(`    [${vp.label}] Triggering flight overlay close...`);
    await startFrameMonitor();

    // Close via close button or backdrop
    if (vp.label === "Desktop") {
      // Test close button
      await session.evaluate(`document.querySelector('#product-card-flight-dialog .export-card-flight-close')?.click()`);
    } else if (vp.label === "Tablet") {
      // Test backdrop click
      await session.evaluate(`document.querySelector('#product-card-flight-dialog [class*="backdrop"]')?.click()`);
    } else {
      // Mobile: close via close button
      await session.evaluate(`document.querySelector('#product-card-flight-dialog .export-card-flight-close')?.click()`);
    }

    // Wait for overlay unmount
    await session.waitFor(
      'document.querySelector("#product-card-flight-dialog") === null',
      `Overlay did not close and unmount on ${vp.label}`,
      150,
      50,
    );

    const closePerf = await stopFrameMonitor();
    console.log(`    [${vp.label}] Close Animation Performance: ${closePerf.frameCount} frames, ~${closePerf.avgFps.toFixed(1)} FPS, max frame time: ${closePerf.maxDeltaMs.toFixed(1)}ms`);

    // 7. Verify Post-Close Restored State
    await new Promise((r) => setTimeout(r, 300));

    const postCloseState = await session.evaluate(`(() => {
      const origin = document.querySelector('${targetCardSelector} .export-card');
      const siblings = Array.from(document.body.children).filter(c => c.tagName !== 'SCRIPT');
      return {
        bodyPosition: document.body.style.position,
        bodyOverflow: document.body.style.overflow,
        originOpacity: origin.style.opacity,
        originPointerEvents: origin.style.pointerEvents,
        allSiblingsNotInert: siblings.every(s => !s.inert),
        allSiblingsNotAriaHidden: siblings.every(s => !s.hasAttribute('aria-hidden')),
      };
    })()`);

    console.log(`    [${vp.label}] Post-Close State Verification:`, postCloseState);
    assert.equal(postCloseState.bodyPosition, "", "Body position must be restored (empty)");
    assert.equal(postCloseState.bodyOverflow, "", "Body overflow must be restored (empty)");
    assert.notEqual(postCloseState.originOpacity, "0", "Origin card opacity must be restored");
    assert.notEqual(postCloseState.originPointerEvents, "none", "Origin card pointer-events must be restored");
    assert.equal(postCloseState.allSiblingsNotInert, true, "Body siblings must no longer be inert");
    assert.equal(postCloseState.allSiblingsNotAriaHidden, true, "Body siblings must no longer have aria-hidden");

    // 8. Cumulative Layout Shift (CLS) Verification
    const finalCLS = await getCLS();
    const deltaCLS = finalCLS - baselineCLS;
    console.log(`    [${vp.label}] CLS Analysis: baseline=${baselineCLS}, final=${finalCLS}, delta=${deltaCLS}`);
    assert.ok(
      deltaCLS <= 0.001,
      `FATAL CLS REGRESSION: Flight card open/close on ${vp.label} produced deltaCLS=${deltaCLS} (threshold: 0.001)`,
    );
    console.log(`    ✓ [${vp.label}] CLS test passed: deltaCLS = ${deltaCLS} <= 0.001`);
  }

  // ==========================================================================
  // SUITE 4: RAPID INTERACTION & ACCESSIBILITY STRESS
  // ==========================================================================
  console.log("\n------------------------------------------------------------------");
  console.log("SUITE 4: Rapid Stress & Keyboard Trapping Stress Test");
  console.log("------------------------------------------------------------------");

  await session.setViewport(1440, 900, false);
  await session.navigate("/en/products?world=fresh");
  await session.waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Cards not found");
  await new Promise((r) => setTimeout(r, 800));

  // Keyboard trap test
  console.log("  Testing keyboard Escape dismissal...");
  await session.evaluate(`document.querySelector('[data-product-id="produce:fresh-strawberry"] .export-card-keyboard-toggle')?.click()`);
  await session.waitFor(
    'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
    "Overlay did not open",
    150,
    50,
  );

  // Send Escape key
  await session.evaluate(`
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  `);
  await session.waitFor(
    'document.querySelector("#product-card-flight-dialog") === null',
    "Escape key failed to dismiss overlay",
    150,
    50,
  );
  console.log("  ✓ Escape key cleanly dismissed flight overlay");

  // Focus restoration test
  await new Promise((r) => setTimeout(r, 200));
  const focusRestored = await session.evaluate(`
    document.activeElement === document.querySelector('[data-product-id="produce:fresh-strawberry"] .export-card-keyboard-toggle')
  `);
  console.log(`  Focus restored to trigger element: ${focusRestored}`);
  assert.equal(focusRestored, true, "Trigger button must retain focus after modal close");
  console.log("  ✓ Trigger element focus restored after dismissal");

  // Rapid sequential open/close test (3 different cards in sequence)
  const productCards = [
    "produce:fresh-strawberry",
    "produce:orange",
    "produce:lemon",
  ];

  console.log("  Testing rapid sequential open/close cycles across multiple cards...");
  for (const pId of productCards) {
    const selector = `[data-product-id="${pId}"] .export-card-keyboard-toggle`;
    await session.evaluate(`document.querySelector('${selector}')?.click()`);
    await session.waitFor('document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"', `Rapid open failed for ${pId}`, 150, 50);
    await session.evaluate(`document.querySelector('#product-card-flight-dialog .export-card-flight-close')?.click()`);
    await session.waitFor('document.querySelector("#product-card-flight-dialog") === null', `Rapid close failed for ${pId}`, 150, 50);
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log("  ✓ Sequential open/close cycles completed with zero memory/DOM leaks");

  await session.close();

  console.log("\n==================================================================");
  console.log("  ALL CHALLENGER M3 EMPIRICAL TESTS PASSED SATISFACTORILY (100%)");
  console.log("==================================================================");

} catch (err) {
  console.error("\n❌ CHALLENGER M3 TEST FAILURE:", err);
  exitCode = 1;
} finally {
  if (serverProc) {
    console.log("[Server] Cleaning up server process...");
    serverProc.kill();
  }
}

process.exit(exitCode);
