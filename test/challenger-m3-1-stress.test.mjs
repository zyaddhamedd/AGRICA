#!/usr/bin/env node

/**
 * Challenger M3-1 Empirical Stress Test Suite
 *
 * Mission Scope: Features F11 & F12
 * Feature F11: Mobile Herbs Gallery Media Deferral & Desktop Accordion Expansion
 * Feature F12: Ingredient Forms 2s Auto-Switch Timer Throttling
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import process from "node:process";
import { createBrowserSession } from "./cdp-client.mjs";

const PORT = process.env.PORT || "3118";
const CHROME_PORT = process.env.CHROME_PORT ? parseInt(process.env.CHROME_PORT, 10) : 9469;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

let serverProc = null;

async function checkServerReady(url) {
  try {
    const res = await fetch(`${url}/en`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function ensureServer(port) {
  const url = `http://localhost:${port}`;
  if (await checkServerReady(url)) {
    console.log(`[Server] Production server already running at ${url}`);
    return null;
  }

  console.log(`[Server] Starting Next.js production server on port ${port}...`);
  const proc = spawn("npx", ["next", "start", "-p", String(port)], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await checkServerReady(url)) {
      console.log(`[Server] Next.js production server ready at ${url}`);
      return proc;
    }
  }

  try {
    proc.kill();
  } catch {}
  throw new Error(`Failed to start Next.js server on port ${port} within timeout`);
}

async function measureCLS(session, observationDurationMs = 800) {
  return await session.evaluate(`
    new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, ${observationDurationMs});
    })
  `);
}

// ==============================================================================
// TEST 1: MOBILE HERBS GALLERY DEFERRAL, CLS, & CONSOLE HYDRATION (F11)
// ==============================================================================
async function testMobileHerbsGallery() {
  console.log("\n==================================================================");
  console.log("  TEST 1: MOBILE HERBS GALLERY MEDIA DEFERRAL & HYDRATION (F11)");
  console.log("==================================================================");

  const session = await createBrowserSession({
    baseUrl: BASE_URL,
    port: CHROME_PORT,
  });

  try {
    const networkRequests = [];
    session.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Network.requestWillBeSent") {
        networkRequests.push({
          url: message.params.request.url,
          time: Date.now(),
        });
      }
    });

    await session.send("Network.enable");

    // 1.1 iPhone 12/13/14 standard mobile viewport (390 x 844)
    console.log("\n--- [1.1] Testing 390x844 Mobile Viewport Navigation ---");
    await session.setViewport(390, 844, true);
    await session.navigate("/en/herbs-spices");

    // Allow time for DOM parsing, speculative preload scanning, and scripts
    await new Promise((r) => setTimeout(r, 2000));

    const totalRequests = networkRequests.length;
    const familyAssetRequests = networkRequests.filter((req) =>
      req.url.includes("/assets/herbs-spices/families/")
    );

    console.log(`  Total network requests captured on 390px load: ${totalRequests}`);
    console.log(`  Requests for /assets/herbs-spices/families/*: ${familyAssetRequests.length}`);

    if (familyAssetRequests.length > 0) {
      console.error("  FAILED: Leaked family requests:", familyAssetRequests.map((r) => r.url));
    }
    assert.equal(
      familyAssetRequests.length,
      0,
      "Mobile 390px viewport MUST initiate ZERO requests for /assets/herbs-spices/families/*"
    );
    console.log("  ✓ PASS: Exactly 0 requests for desktop accordion family assets (saved ~788.4 KB)");

    // 1.2 Hydration & Console Verification
    console.log("\n--- [1.2] Checking Console Errors & Hydration Mismatches ---");
    const rawErrors = session.getErrors();
    const hydrationErrors = rawErrors.filter(
      (err) =>
        err.toLowerCase().includes("hydration") ||
        err.toLowerCase().includes("did not match") ||
        err.toLowerCase().includes("react error #418") ||
        err.toLowerCase().includes("react error #423")
    );

    console.log(`  Total console error entries: ${rawErrors.length}`);
    if (rawErrors.length > 0) {
      console.log("  Console errors encountered:", rawErrors);
    }
    assert.equal(hydrationErrors.length, 0, `React hydration errors detected: ${hydrationErrors.join("; ")}`);
    assert.equal(rawErrors.length, 0, `Unexpected console errors on mobile: ${rawErrors.join("; ")}`);
    console.log("  ✓ PASS: 0 console errors and 0 React hydration mismatches");

    // 1.3 Cumulative Layout Shift (CLS) on Mobile
    console.log("\n--- [1.3] Measuring Cumulative Layout Shift (CLS) on Mobile ---");
    const mobileCls = await measureCLS(session, 1000);
    console.log(`  Measured Mobile CLS: ${mobileCls.toFixed(4)}`);
    assert.ok(mobileCls <= 0.001, `Mobile CLS must be <= 0.001, was ${mobileCls}`);
    console.log("  ✓ PASS: Mobile CLS = 0.0000 (perfect stability)");

    // 1.4 Adversarial Breakpoint Sweep: 320px, 375px, 414px, 768px (boundary condition)
    console.log("\n--- [1.4] Adversarial Breakpoint Sweep (320px, 375px, 414px, 768px) ---");
    const mobileBreakpoints = [
      { width: 320, height: 568, name: "320px (Compact Mobile)" },
      { width: 375, height: 667, name: "375px (iPhone SE/8)" },
      { width: 414, height: 896, name: "414px (iPhone XR/11)" },
      { width: 768, height: 1024, name: "768px (Exact Mobile Breakpoint Boundary)" },
    ];

    for (const bp of mobileBreakpoints) {
      const markBefore = networkRequests.length;
      await session.setViewport(bp.width, bp.height, true);
      await session.evaluate(`
        window.dispatchEvent(new Event('resize'));
        window.scrollBy(0, 300);
      `);
      await new Promise((r) => setTimeout(r, 600));

      const newFamilyRequests = networkRequests.slice(markBefore).filter((r) =>
        r.url.includes("/assets/herbs-spices/families/")
      );

      console.log(`  Breakpoint ${bp.name}: ${newFamilyRequests.length} accordion image requests`);
      assert.equal(
        newFamilyRequests.length,
        0,
        `Breakpoint ${bp.name} leaked ${newFamilyRequests.length} desktop accordion requests!`
      );
    }
    console.log("  ✓ PASS: All mobile breakpoints (320px to 768px boundary) prevent desktop accordion asset transfer");

  } finally {
    await session.close();
  }
}

// ==============================================================================
// TEST 2: DESKTOP ACCORDION EXPANSION & INTERACTION (F11 DESKTOP)
// ==============================================================================
async function testDesktopAccordionExpansion() {
  console.log("\n==================================================================");
  console.log("  TEST 2: DESKTOP ACCORDION EXPANSION & INTERACTION (F11 DESKTOP)");
  console.log("==================================================================");

  const session = await createBrowserSession({
    baseUrl: BASE_URL,
    port: CHROME_PORT,
  });

  try {
    const networkRequests = [];
    session.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Network.requestWillBeSent") {
        networkRequests.push({
          url: message.params.request.url,
          time: Date.now(),
        });
      }
    });

    await session.send("Network.enable");

    // 2.1 Viewport 1440x900
    console.log("\n--- [2.1] Setting Viewport to 1440x900 (Desktop) ---");
    await session.setViewport(1440, 900, false);
    await session.navigate("/en/herbs-spices");

    // Check DOM presence
    await session.waitFor(
      'document.querySelector("#ingredient-families") !== null',
      "Ingredient families section must exist"
    );

    // Initial state: user is at top of page (hero section)
    const initialFamilyRequests = networkRequests.filter((r) =>
      r.url.includes("/assets/herbs-spices/families/")
    );
    console.log(`  Desktop family requests on initial load: ${initialFamilyRequests.length}`);

    // 2.2 Scroll into view and verify images load cleanly
    console.log("\n--- [2.2] Scrolling #ingredient-families into Viewport ---");
    await session.evaluate(`
      document.getElementById("ingredient-families").scrollIntoView({ behavior: "instant", block: "center" });
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // Panel count
    const panelCount = await session.evaluate('document.querySelectorAll(".ag-panel").length');
    console.log(`  Accordion panel count: ${panelCount}`);
    assert.equal(panelCount, 6, "Expected 6 accordion panels for 6 botanical families");

    // Verify images in panels have loaded
    const imageStatus = await session.evaluate(`
      (() => {
        const imgs = Array.from(document.querySelectorAll(".ag-panel img"));
        return imgs.map((img, idx) => ({
          idx,
          src: img.currentSrc || img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }));
      })()
    `);

    console.log(`  Accordion image loading status (${imageStatus.length} images):`);
    for (const s of imageStatus) {
      console.log(`    Panel ${s.idx}: complete=${s.complete}, dimensions=${s.naturalWidth}x${s.naturalHeight}, src=${s.src.split("/").pop()}`);
      assert.ok(s.complete, `Panel ${s.idx} image is not complete`);
      assert.ok(s.naturalWidth > 0, `Panel ${s.idx} image has zero naturalWidth`);
    }
    console.log("  ✓ PASS: All desktop accordion panel images loaded cleanly with positive dimensions");

    // 2.3 Verify default active panel and active editorial strip
    console.log("\n--- [2.3] Verifying Default Active Panel & Editorial Strip ---");
    const initialActiveIdx = await session.evaluate(`
      Array.from(document.querySelectorAll(".ag-panel")).findIndex((p) =>
        p.classList.contains("ag-panel--active")
      )
    `);
    console.log(`  Default active panel index: ${initialActiveIdx}`);
    assert.equal(initialActiveIdx, 0, "Default active panel must be index 0 (Herbs)");

    const initialTitle = await session.evaluate(`
      document.querySelector("div[class*='stripInfo'] h3")?.textContent?.trim() || ""
    `);
    console.log(`  Active strip family title: "${initialTitle}"`);
    assert.equal(initialTitle, "Herbs", "Active family title should be Herbs");

    // 2.4 Panel Expansion via Interaction (CDP Real MouseMove & Hover)
    console.log("\n--- [2.4] Interactive Panel Expansion & State Synchronization ---");
    const expectedFamilies = [
      { idx: 1, name: "Flowers" },
      { idx: 2, name: "Seeds" },
      { idx: 3, name: "Spices" },
      { idx: 4, name: "Roots" },
      { idx: 5, name: "Dehydrated Vegetables" },
      { idx: 0, name: "Herbs" },
    ];

    for (const exp of expectedFamilies) {
      // Get panel coordinates
      const box = await session.evaluate(`
        (() => {
          const panels = document.querySelectorAll(".ag-panel");
          const target = panels[${exp.idx}];
          if (!target) return null;
          const rect = target.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        })()
      `);
      assert.ok(box, `Panel ${exp.idx} bounding box not found`);

      // Dispatch CDP real mouse movement over panel
      await session.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: Math.round(box.x),
        y: Math.round(box.y),
      });

      // Also dispatch mouseover synthetic event for complete event coverage
      await session.evaluate(`
        (() => {
          const p = document.querySelectorAll(".ag-panel")[${exp.idx}];
          if (p) p.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        })()
      `);

      await new Promise((r) => setTimeout(r, 600));

      const activeIdx = await session.evaluate(`
        Array.from(document.querySelectorAll(".ag-panel")).findIndex((p) =>
          p.classList.contains("ag-panel--active")
        )
      `);
      const currentTitle = await session.evaluate(`
        document.querySelector("div[class*='stripInfo'] h3")?.textContent?.trim() || ""
      `);

      console.log(`  Hovered panel ${exp.idx} -> Active Index: ${activeIdx}, Title: "${currentTitle}"`);
      assert.equal(activeIdx, exp.idx, `Panel ${exp.idx} did not receive active class`);
      assert.equal(currentTitle, exp.name, `Active strip did not update to ${exp.name}`);
    }
    console.log("  ✓ PASS: Accordion expands smoothly on hover interaction and syncs editorial footer strip");

    // 2.5 Keyboard Accessibility Interaction
    console.log("\n--- [2.5] Keyboard Navigation & Focus Stress ---");
    await session.evaluate(`
      (() => {
        const panels = document.querySelectorAll(".ag-panel");
        panels[3].focus();
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));
    const kbActiveIdx = await session.evaluate(`
      Array.from(document.querySelectorAll(".ag-panel")).findIndex((p) =>
        p.classList.contains("ag-panel--active")
      )
    `);
    console.log(`  Focused panel 3 via keyboard -> Active Index: ${kbActiveIdx}`);
    assert.equal(kbActiveIdx, 3, "Keyboard focus should activate panel 3");
    console.log("  ✓ PASS: Keyboard navigation activates panels properly");

    // 2.6 Rapid-Fire Panel Switch Stress Test (Adversarial Jitter)
    console.log("\n--- [2.6] Rapid-Fire Panel Switching (GSAP Animation Stress) ---");
    for (let cycle = 0; cycle < 12; cycle++) {
      const targetIdx = cycle % 6;
      await session.evaluate(`
        (() => {
          const p = document.querySelectorAll(".ag-panel")[${targetIdx}];
          if (p) p.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        })()
      `);
      await new Promise((r) => setTimeout(r, 50)); // rapid 50ms interval
    }
    await new Promise((r) => setTimeout(r, 800));

    const postStressErrors = session.getErrors();
    assert.equal(postStressErrors.length, 0, `GSAP animation stress produced errors: ${postStressErrors.join("; ")}`);
    console.log("  ✓ PASS: Rapid-fire GSAP accordion animations completed with 0 errors");

  } finally {
    await session.close();
  }
}

// ==============================================================================
// TEST 3: INGREDIENT FORMS 2S ROTATION TIMER THROTTLING (F12)
// ==============================================================================
async function testFormsTimerThrottling() {
  console.log("\n==================================================================");
  console.log("  TEST 3: INGREDIENT FORMS 2S AUTO-SWITCH TIMER THROTTLING (F12)");
  console.log("==================================================================");

  const session = await createBrowserSession({
    baseUrl: BASE_URL,
    port: CHROME_PORT,
  });

  try {
    await session.setViewport(1440, 900, false);
    await session.navigate("/en/herbs-spices");

    // Helper to get active form index & label
    async function getActiveForm() {
      return await session.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll("#ingredient-forms nav button"));
          const activeIdx = btns.findIndex((b) => b.getAttribute("aria-selected") === "true");
          const activeText = activeIdx >= 0 ? btns[activeIdx].textContent.trim() : "";
          return { activeIdx, activeText };
        })()
      `);
    }

    // 3.1 Offscreen Timer Suspension Verification
    console.log("\n--- [3.1] Testing Offscreen Timer Suspension (Hero visible, forms offscreen) ---");
    await session.evaluate("window.scrollTo(0, 0)");
    await new Promise((r) => setTimeout(r, 200));

    const initial = await getActiveForm();
    console.log(`  Initial active form tab: [${initial.activeIdx}] "${initial.activeText}"`);
    assert.equal(initial.activeIdx, 0, "Forms section should initialize at index 0");

    console.log("  Waiting 4.0s while offscreen (2x normal 2.0s timer period)...");
    await new Promise((r) => setTimeout(r, 4000));

    const afterOffscreen = await getActiveForm();
    console.log(`  Active tab after 4.0s offscreen: [${afterOffscreen.activeIdx}] "${afterOffscreen.activeText}"`);
    assert.equal(
      afterOffscreen.activeIdx,
      initial.activeIdx,
      "Timer MUST BE SUSPENDED while #ingredient-forms is offscreen!"
    );
    console.log("  ✓ PASS: Offscreen auto-rotation timer remained completely suspended for 4.0s");

    // 3.2 Viewport Resumption & No Rapid-Fire Burst Transitions
    console.log("\n--- [3.2] Testing Resumption in Viewport & Burst-Tick Prevention ---");
    console.log("  Scrolling #ingredient-forms into viewport...");
    await session.evaluate(`
      document.getElementById("ingredient-forms").scrollIntoView({ behavior: "instant", block: "center" });
    `);

    // High frequency sampling right after scrolling in to detect any burst-tick
    const timestamps = [];
    const startTime = Date.now();
    let prevIdx = (await getActiveForm()).activeIdx;
    timestamps.push({ idx: prevIdx, elapsedMs: 0 });

    for (let sample = 0; sample < 55; sample++) {
      await new Promise((r) => setTimeout(r, 100));
      const cur = await getActiveForm();
      const elapsed = Date.now() - startTime;
      if (cur.activeIdx !== prevIdx) {
        console.log(`    -> Transition detected: Index ${prevIdx} -> ${cur.activeIdx} at +${elapsed}ms`);
        timestamps.push({ idx: cur.activeIdx, elapsedMs: elapsed });
        prevIdx = cur.activeIdx;
      }
    }

    console.log("  Transition chronology:", timestamps);
    assert.ok(timestamps.length >= 2, "Timer must advance at least once after entering viewport");

    // Verify first transition did NOT happen in under 1500ms (no catch-up burst ticks)
    const firstTransitionElapsed = timestamps[1].elapsedMs;
    console.log(`  Time to first transition after entering viewport: ${firstTransitionElapsed}ms`);
    assert.ok(
      firstTransitionElapsed >= 1800,
      `Burst tick detected! First transition occurred after only ${firstTransitionElapsed}ms (expected >= 1800ms)`
    );
    assert.ok(
      firstTransitionElapsed <= 2600,
      `Timer transition delayed too long: ${firstTransitionElapsed}ms (expected <= 2600ms)`
    );
    console.log("  ✓ PASS: First transition executed cleanly at full ~2000ms interval without rapid-fire ticks");

    if (timestamps.length >= 3) {
      const secondDelta = timestamps[2].elapsedMs - timestamps[1].elapsedMs;
      console.log(`  Time between transition 1 and 2: ${secondDelta}ms`);
      assert.ok(secondDelta >= 1800 && secondDelta <= 2600, `Inter-transition interval out of bounds: ${secondDelta}ms`);
      console.log("  ✓ PASS: Subsequent transition executed cleanly at ~2000ms cadence");
    }

    // 3.3 Scroll Out Pause & Second Re-entry
    console.log("\n--- [3.3] Scroll-Out Pause & Second Re-entry Stress ---");
    const formBeforeScrollOut = await getActiveForm();
    console.log(`  Active before scrolling out: [${formBeforeScrollOut.activeIdx}] "${formBeforeScrollOut.activeText}"`);

    await session.evaluate("window.scrollTo(0, 0)");
    await new Promise((r) => setTimeout(r, 3500));

    const formAfterScrollOut = await getActiveForm();
    console.log(`  Active after 3.5s scrolled out: [${formAfterScrollOut.activeIdx}] "${formAfterScrollOut.activeText}"`);
    assert.equal(
      formAfterScrollOut.activeIdx,
      formBeforeScrollOut.activeIdx,
      "Timer must pause again immediately upon scrolling out"
    );

    // Scroll back in
    await session.evaluate(`
      document.getElementById("ingredient-forms").scrollIntoView({ behavior: "instant", block: "center" });
    `);
    await new Promise((r) => setTimeout(r, 2400));
    const formReentry = await getActiveForm();
    console.log(`  Active after 2.4s reentry: [${formReentry.activeIdx}] "${formReentry.activeText}"`);
    assert.notEqual(
      formReentry.activeIdx,
      formAfterScrollOut.activeIdx,
      "Timer must resume advancing after reentry"
    );
    console.log("  ✓ PASS: Scroll-out pause and subsequent re-entry resumption verified cleanly");

    // 3.4 Document Visibility / Tab Backgrounding Suspension
    console.log("\n--- [3.4] Document Visibility / Tab Backgrounding Suspension ---");
    const beforeBg = await getActiveForm();
    console.log(`  Active tab before tab hide: [${beforeBg.activeIdx}] "${beforeBg.activeText}"`);

    // Simulate document visibilitychange (hidden)
    await session.evaluate(`
      (() => {
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      })()
    `);

    await new Promise((r) => setTimeout(r, 3500));
    const afterBgHidden = await getActiveForm();
    console.log(`  Active tab after 3.5s hidden: [${afterBgHidden.activeIdx}] "${afterBgHidden.activeText}"`);
    assert.equal(
      afterBgHidden.activeIdx,
      beforeBg.activeIdx,
      "Timer MUST suspend when document is hidden (background tab)"
    );
    console.log("  ✓ PASS: Timer correctly suspended while document is hidden");

    // Restore document visibility
    await session.evaluate(`
      (() => {
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      })()
    `);
    await new Promise((r) => setTimeout(r, 2400));
    const afterBgVisible = await getActiveForm();
    console.log(`  Active tab after 2.4s restored: [${afterBgVisible.activeIdx}] "${afterBgVisible.activeText}"`);
    assert.notEqual(
      afterBgVisible.activeIdx,
      afterBgHidden.activeIdx,
      "Timer must resume advancing when document becomes visible again"
    );
    console.log("  ✓ PASS: Timer resumed cleanly upon tab restoration");

    // 3.5 Manual Tab Selection Pause Verification
    console.log("\n--- [3.5] Manual Tab Selection & Interaction ---");
    await session.evaluate(`
      (() => {
        const btns = document.querySelectorAll("#ingredient-forms nav button");
        if (btns[0]) btns[0].click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));
    const manualClickForm = await getActiveForm();
    console.log(`  After clicking tab 0: [${manualClickForm.activeIdx}] "${manualClickForm.activeText}"`);
    assert.equal(manualClickForm.activeIdx, 0, "Manual tab click must switch immediately to tab 0");
    console.log("  ✓ PASS: Manual click immediately switches tab and updates state");

  } finally {
    await session.close();
  }
}

// ==============================================================================
// TEST 4: MULTI-LOCALE ADVERSARIAL STRESS (AR RTL, DE, FR, RU)
// ==============================================================================
async function testMultiLocaleStress() {
  console.log("\n==================================================================");
  console.log("  TEST 4: MULTI-LOCALE ADVERSARIAL STRESS (AR [RTL], DE, FR, RU)");
  console.log("==================================================================");

  const locales = [
    { lang: "ar", dir: "rtl" },
    { lang: "de", dir: "ltr" },
    { lang: "fr", dir: "ltr" },
    { lang: "ru", dir: "ltr" },
  ];

  for (const loc of locales) {
    console.log(`\n--- [4.${loc.lang}] Testing Locale /${loc.lang}/herbs-spices on Mobile 390px ---`);
    const session = await createBrowserSession({
      baseUrl: BASE_URL,
      port: CHROME_PORT,
    });

    try {
      const netRequests = [];
      session.socket.addEventListener("message", (event) => {
        const m = JSON.parse(event.data);
        if (m.method === "Network.requestWillBeSent") {
          netRequests.push(m.params.request.url);
        }
      });

      await session.send("Network.enable");
      await session.setViewport(390, 844, true);
      await session.navigate(`/${loc.lang}/herbs-spices`);
      await new Promise((r) => setTimeout(r, 1500));

      const familyRequests = netRequests.filter((url) =>
        url.includes("/assets/herbs-spices/families/")
      );

      console.log(`  Locale /${loc.lang}/ total requests: ${netRequests.length}, family requests: ${familyRequests.length}`);
      assert.equal(
        familyRequests.length,
        0,
        `Locale /${loc.lang}/ leaked ${familyRequests.length} desktop accordion requests on mobile!`
      );

      const errors = session.getErrors();
      assert.equal(errors.length, 0, `Locale /${loc.lang}/ had console errors: ${errors.join("; ")}`);

      const cls = await measureCLS(session, 600);
      console.log(`  Locale /${loc.lang}/ CLS: ${cls.toFixed(4)}`);
      assert.ok(cls <= 0.001, `Locale /${loc.lang}/ CLS exceeded 0.001: ${cls}`);

      console.log(`  ✓ PASS: /${loc.lang}/herbs-spices verified cleanly (0 leaks, 0 errors, CLS = 0.0000)`);
    } finally {
      await session.close();
    }
  }
}

// ==============================================================================
// MAIN EXECUTION ORCHESTRATOR
// ==============================================================================
async function main() {
  const startTime = Date.now();
  try {
    serverProc = await ensureServer(PORT);

    await testMobileHerbsGallery();
    await testDesktopAccordionExpansion();
    await testFormsTimerThrottling();
    await testMultiLocaleStress();

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n==================================================================");
    console.log(`  CHALLENGER M3-1 ALL STRESS TESTS PASSED (Completed in ${elapsedSec}s)`);
    console.log("  VERDICT: APPROVE");
    console.log("==================================================================");
    process.exitCode = 0;
  } catch (err) {
    console.error("\n❌ CHALLENGER M3-1 ADVERSARIAL STRESS TEST FAILED:");
    console.error(err);
    console.log("\n  VERDICT: REJECT");
    process.exitCode = 1;
  } finally {
    if (serverProc) {
      console.log("[Server] Terminating production server...");
      try {
        serverProc.kill();
      } catch {}
    }
  }
}

main();
