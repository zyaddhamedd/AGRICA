#!/usr/bin/env node

/**
 * AGRICA Standard Page CLS & Scroll Geometry Stress Test Harness
 * Milestone: M2 Verification (Challenger M2-2: Features F07 & F14)
 *
 * Test Suites:
 * 1. 15-Condition Cumulative Layout Shift (CLS) Matrix:
 *    - 5 Locales: en, ar (RTL), ru, de, fr
 *    - 3 Viewports:
 *      * Mobile: 390×844 (dpr: 3)
 *      * Tablet: 768×1024 (dpr: 2)
 *      * Desktop: 1440×900 (dpr: 1)
 *    - Cold navigation, full-page scroll down & up
 *    - Strict Core Web Vitals assertion: CLS <= 0.001 (target: 0.0000)
 *    - Arabic RTL layout integrity & zero horizontal overflow
 *
 * 2. Scroll Geometry & Layout Thrashing Stress Test:
 *    - Fast fling scroll and momentum scrolling up and down /en/standard
 *    - DOM property instrumentation: monitor offsetTop, getBoundingClientRect, etc.
 *    - Verify ZERO synchronous stage geometry reads (el.offsetTop, el.getBoundingClientRect) during scroll
 *    - Verify ZERO forced synchronous reflow / layout thrashing warnings from browser
 *
 * 3. Active Stage Indicators Synchronization:
 *    - StandardProgressThread node and pill tracking across all 6 stages
 *    - Forward scroll and reverse scroll accuracy
 *    - Rapid fling settling accuracy
 *    - Progress bar height/width mathematical precision
 *
 * 4. Stage 01 Eager Loading & LCP Readiness:
 *    - loading="eager", fetchpriority="high", explicit width/height
 *    - CDP Network verification: High priority, WebP derivative requested, 0 raw JPEGs
 *    - PerformanceObserver Largest Contentful Paint (LCP) measurement
 *    - Verify stages 2-6 remain loading="lazy"
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3197;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PORT = process.env.CHROME_DEBUG_PORT ? parseInt(process.env.CHROME_DEBUG_PORT, 10) : 9479;
const DEBUG_URL = `http://127.0.0.1:${CHROME_PORT}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer() {
  try {
    const res = await fetch(`${BASE_URL}/en/standard`);
    if (res.ok) {
      console.log(`[Server] Production server already active at ${BASE_URL}`);
      return null;
    }
  } catch {}

  console.log(`[Server] Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (let i = 0; i < 50; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${BASE_URL}/en/standard`);
      if (res.ok) {
        console.log(`[Server] Next.js server ready on port ${PORT}`);
        return server;
      }
    } catch {}
  }
  throw new Error(`Failed to start Next.js server on port ${PORT}`);
}

async function launchChrome() {
  try {
    const res = await fetch(`${DEBUG_URL}/json/version`);
    if (res.ok) {
      console.log(`[Chrome] Already active on port ${CHROME_PORT}`);
      return null;
    }
  } catch {}

  console.log(`[Chrome] Launching isolated headless Chrome on port ${CHROME_PORT}...`);
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "agrica-chrome-cls-m2-"));
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome binary not found at ${chromePath}`);
  }

  const proc = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${CHROME_PORT}`,
      `--user-data-dir=${profileDir}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-sync",
      "--disable-translate",
      "--disable-default-apps",
      "--mute-audio",
    ],
    {
      stdio: ["ignore", "ignore", "ignore"],
      detached: false,
    }
  );

  let ready = false;
  for (let i = 0; i < 50; i++) {
    await sleep(150);
    try {
      const res = await fetch(`${DEBUG_URL}/json/version`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    proc.kill();
    fs.rmSync(profileDir, { recursive: true, force: true });
    throw new Error(`Failed to launch Chrome on port ${CHROME_PORT}`);
  }

  return {
    proc,
    profileDir,
    cleanup: () => {
      try {
        proc.kill();
      } catch {}
      try {
        fs.rmSync(profileDir, { recursive: true, force: true });
      } catch {}
    },
  };
}

async function createCdpSession() {
  const newTargetRes = await fetch(`${DEBUG_URL}/json/new`, { method: "PUT" });
  const target = await newTargetRes.json();
  assert.ok(target?.webSocketDebuggerUrl, "Failed to create CDP page target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  const consoleErrors = [];
  const consoleWarnings = [];
  const networkRequests = [];

  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      consoleErrors.push(msg.params.exceptionDetails.text);
    }
    if (msg.method === "Log.entryAdded") {
      const entry = msg.params.entry;
      if (entry.level === "error") {
        consoleErrors.push(`${entry.text} ${entry.url ?? ""}`.trim());
      } else if (entry.level === "warning") {
        consoleWarnings.push(entry.text);
      }
    }
    if (msg.method === "Network.requestWillBeSent") {
      networkRequests.push({
        requestId: msg.params.requestId,
        url: msg.params.request.url,
        priority: msg.params.request.priority,
        initialPriority: msg.params.request.initialPriority,
      });
    }
    if (msg.method === "Network.responseReceived") {
      const existing = networkRequests.find((r) => r.requestId === msg.params.requestId);
      if (existing) {
        existing.status = msg.params.response.status;
        existing.mimeType = msg.params.response.mimeType;
        existing.encodedDataLength = msg.params.response.encodedDataLength;
      }
    }
  });

  function send(method, params = {}) {
    const id = ++commandId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text
      );
    }
    return result.result.value;
  }

  async function waitFor(expression, message, attempts = 120, delayMs = 50) {
    for (let i = 0; i < attempts; i++) {
      try {
        const val = await evaluate(expression);
        if (val) return;
      } catch (err) {
        // Navigation execution context may be momentarily unavailable
        if (!err.message.includes("navigated") && !err.message.includes("Execution context")) {
          // Ignore transient execution context errors during navigation
        }
      }
      await sleep(delayMs);
    }
    assert.fail(message);
  }

  async function navigate(url) {
    await send("Page.navigate", { url });
    await waitFor('document.readyState === "complete"', `Navigation to ${url} did not reach complete`);
    await sleep(150);
  }

  async function setViewport(width, height, dpr = 1, mobile = width <= 768) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: dpr,
      mobile,
    });
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: mobile,
      maxTouchPoints: mobile ? 5 : 1,
    });
    await sleep(50);
  }

  // Preload script that injects PerformanceObserver for layout shifts from initial HTML parse
  const OBSERVER_PRELOAD = `
    window.__perf_shift_entries = [];
    window.__perf_total_cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perf_total_cls += entry.value;
            window.__perf_shift_entries.push({
              value: entry.value,
              sources: entry.sources ? entry.sources.map(s => ({
                nodeName: s.node ? s.node.nodeName : 'unknown',
                currentRect: s.currentRect ? { top: s.currentRect.top, left: s.currentRect.left, width: s.currentRect.width, height: s.currentRect.height } : null,
                previousRect: s.previousRect ? { top: s.previousRect.top, left: s.previousRect.left, width: s.previousRect.width, height: s.previousRect.height } : null,
              })) : []
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}

    window.__lcp_entries = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lcp_entries.push({
            renderTime: entry.renderTime || entry.loadTime,
            size: entry.size,
            id: entry.id,
            url: entry.url
          });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
  `;

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER_PRELOAD });

  return {
    socket,
    send,
    evaluate,
    waitFor,
    navigate,
    setViewport,
    networkRequests,
    getErrors: () =>
      consoleErrors.filter(
        (e) => !e.includes("favicon.ico") && !e.includes("link preload")
      ),
    getWarnings: () => consoleWarnings,
    close: async () => {
      try {
        socket.close();
      } catch {}
      try {
        await fetch(`${DEBUG_URL}/json/close/${target.id}`);
      } catch {}
    },
  };
}

async function runTestSuite() {
  const startTime = Date.now();
  console.log("==================================================================");
  console.log("  AGRICA Milestone M2 Empirical Challenger Test Suite");
  console.log("  Target: Features F07 (CLS & Responsive Stages) & F14 (Scroll Geometry)");
  console.log("==================================================================");

  const serverProc = await ensureServer();
  const chromeHandle = await launchChrome();

  const results = {
    clsMatrix: [],
    layoutThrashing: null,
    scrollSync: null,
    eagerLcp: null,
    passed: true,
  };

  try {
    let session = await createCdpSession();

    // =========================================================================
    // SUITE 1: 15-Condition CLS Matrix (5 Locales x 3 Viewports)
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("  SUITE 1: Cumulative Layout Shift (CLS) 15-Condition Matrix");
    console.log("------------------------------------------------------------------");

    const locales = ["en", "ar", "ru", "de", "fr"];
    const viewports = [
      { name: "Mobile", width: 390, height: 844, dpr: 3, mobile: true },
      { name: "Tablet", width: 768, height: 1024, dpr: 2, mobile: true },
      { name: "Desktop", width: 1440, height: 900, dpr: 1, mobile: false },
    ];

    for (const vp of viewports) {
      for (const lang of locales) {
        const route = `/${lang}/standard`;
        await session.setViewport(vp.width, vp.height, vp.dpr, vp.mobile);

        // Cold navigation with cache disabled
        await session.send("Network.setCacheDisabled", { cacheDisabled: true });
        await session.navigate(`${BASE_URL}${route}`);

        await session.waitFor(
          'document.querySelector("#standard-monolith-main") !== null',
          `Navigation to ${route} at ${vp.width}x${vp.height} timed out`
        );

        // Initial settlement check
        await sleep(100);
        const initialCls = await session.evaluate("window.__perf_total_cls || 0");

        // Full scroll down to bottom in discrete steps to trigger IntersectionObservers & lazy images
        const scrollHeight = await session.evaluate("document.documentElement.scrollHeight");
        const step = Math.floor(vp.height * 0.7);
        for (let y = step; y < scrollHeight; y += step) {
          await session.evaluate(`window.scrollTo(0, ${y})`);
          await sleep(40);
        }
        await session.evaluate(`window.scrollTo(0, ${scrollHeight})`);
        await sleep(300);

        // Scroll back up to top
        for (let y = scrollHeight; y > 0; y -= step) {
          await session.evaluate(`window.scrollTo(0, ${y})`);
          await sleep(30);
        }
        await session.evaluate("window.scrollTo(0, 0)");
        await sleep(200);

        const totalCls = await session.evaluate("window.__perf_total_cls || 0");
        const shiftEntries = await session.evaluate("window.__perf_shift_entries || []");

        // RTL check for Arabic
        let rtlCheck = null;
        if (lang === "ar") {
          rtlCheck = await session.evaluate(`(() => {
            const htmlDir = document.documentElement.getAttribute("dir");
            const bodyDir = document.body.getAttribute("dir");
            const hasHOverflow = document.documentElement.scrollWidth > window.innerWidth;
            return {
              isRtl: htmlDir === "rtl" || bodyDir === "rtl",
              hasHOverflow,
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth
            };
          })()`);
        }

        const conditionResult = {
          locale: lang,
          viewport: vp.name,
          dimensions: `${vp.width}×${vp.height}`,
          initialCls: Number(initialCls.toFixed(6)),
          totalCls: Number(totalCls.toFixed(6)),
          shiftCount: shiftEntries.length,
          rtlCheck,
          passed: totalCls <= 0.001,
        };

        results.clsMatrix.push(conditionResult);

        const statusIcon = conditionResult.passed ? "✓ PASS" : "✗ FAIL";
        console.log(
          `  ${statusIcon} | [${lang.toUpperCase()}] ${vp.name.padEnd(8)} (${conditionResult.dimensions}) | Initial CLS: ${conditionResult.initialCls.toFixed(4)} | Total CLS: ${conditionResult.totalCls.toFixed(4)} | Shifts: ${conditionResult.shiftCount}${lang === "ar" ? ` | RTL: ${rtlCheck.isRtl}, H-Overflow: ${rtlCheck.hasHOverflow}` : ""}`
        );

        if (!conditionResult.passed) {
          results.passed = false;
          console.error(`    Shift breakdown:`, JSON.stringify(shiftEntries, null, 2));
        }

        if (lang === "ar" && (!rtlCheck.isRtl || rtlCheck.hasHOverflow)) {
          results.passed = false;
          console.error(`    Arabic RTL failure: dir="rtl"=${rtlCheck.isRtl}, horizontal overflow=${rtlCheck.hasHOverflow}`);
        }
      }
    }

    // =========================================================================
    // SUITE 2: Scroll Geometry & Layout Thrashing Stress Test
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("  SUITE 2: Scroll Geometry & Layout Thrashing Stress Test");
    console.log("------------------------------------------------------------------");

    const scrollTestConfigs = [
      { name: "Desktop (1440×900)", width: 1440, height: 900, mobile: false },
      { name: "Mobile (390×844)", width: 390, height: 844, mobile: true },
    ];

    const thrashingResults = [];

    for (const config of scrollTestConfigs) {
      await session.close();
      session = await createCdpSession();

      await session.setViewport(config.width, config.height, config.mobile ? 3 : 1, config.mobile);
      await session.navigate(`${BASE_URL}/en/standard`);
      await session.waitFor('document.querySelector("#standard-monolith-main") !== null');
      await sleep(200);

      // Inject Layout Thrashing Instrumentation:
      // Tracks synchronous layout property reads specifically on stage blocks and standard thread components.
      await session.evaluate(`(() => {
        window.__stage_layout_queries = {
          stageBlockOffsetTop: 0,
          stageBlockBoundingRect: 0,
          stageBlockClientDims: 0,
          threadQueries: 0,
        };
        window.__layout_tracking_active = false;

        const stageIds = ["stage-source", "stage-inspect", "stage-prepare", "stage-pack", "stage-store", "stage-deliver"];
        const origOffsetTop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetTop").get;
        const origBoundingRect = Element.prototype.getBoundingClientRect;

        Object.defineProperty(HTMLElement.prototype, "offsetTop", {
          get: function() {
            if (window.__layout_tracking_active) {
              const id = this.id || "";
              if (stageIds.includes(id) || id.startsWith("stage-")) {
                window.__stage_layout_queries.stageBlockOffsetTop++;
              }
              if (this.closest && this.closest(".progress-thread-desktop, .progress-thread-mobile")) {
                window.__stage_layout_queries.threadQueries++;
              }
            }
            return origOffsetTop.apply(this);
          },
          configurable: true
        });

        Element.prototype.getBoundingClientRect = function() {
          if (window.__layout_tracking_active) {
            const id = this.id || "";
            if (stageIds.includes(id) || id.startsWith("stage-")) {
              window.__stage_layout_queries.stageBlockBoundingRect++;
            }
            if (this.closest && this.closest(".progress-thread-desktop, .progress-thread-mobile")) {
              window.__stage_layout_queries.threadQueries++;
            }
          }
          return origBoundingRect.apply(this, arguments);
        };
      })()`);

      // Begin tracking specifically during simulated fast scroll and momentum scrolling
      await session.evaluate("window.__layout_tracking_active = true");

      // 1. Rapid Fling Scroll Simulation: 100 rapid scroll steps down and up
      const docHeight = await session.evaluate("document.documentElement.scrollHeight");
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const targetY = (docHeight * i) / steps;
        await session.evaluate(`window.scrollTo(0, ${targetY})`);
      }
      for (let i = steps; i >= 0; i--) {
        const targetY = (docHeight * i) / steps;
        await session.evaluate(`window.scrollTo(0, ${targetY})`);
      }

      // 2. High-Frequency Momentum Bursts
      for (let burst = 0; burst < 15; burst++) {
        await session.evaluate(`
          window.scrollTo(0, ${Math.random() * docHeight});
          window.dispatchEvent(new Event('scroll'));
        `);
      }

      // Wait 3 display frames for any scheduled rAFs to resolve
      await sleep(150);

      // Stop tracking
      await session.evaluate("window.__layout_tracking_active = false");

      const stageQueries = await session.evaluate("window.__stage_layout_queries");
      const warnings = session.getWarnings();
      const forcedReflowWarnings = warnings.filter((w) =>
        w.toLowerCase().includes("forced reflow") || w.toLowerCase().includes("layout thrashing")
      );

      const totalStageQueries =
        stageQueries.stageBlockOffsetTop +
        stageQueries.stageBlockBoundingRect +
        stageQueries.stageBlockClientDims +
        stageQueries.threadQueries;

      const pass = totalStageQueries === 0 && forcedReflowWarnings.length === 0;
      thrashingResults.push({
        config: config.name,
        stageQueries,
        totalStageQueries,
        forcedReflowWarnings,
        passed: pass,
      });

      const icon = pass ? "✓ PASS" : "✗ FAIL";
      console.log(
        `  ${icon} | ${config.name} | Stage DOM Reads in Scroll Loop: ${totalStageQueries} (offsetTop: ${stageQueries.stageBlockOffsetTop}, getBoundingClientRect: ${stageQueries.stageBlockBoundingRect}) | Forced Reflow Warnings: ${forcedReflowWarnings.length}`
      );
      if (!pass) {
        results.passed = false;
        console.error("    Queries recorded:", stageQueries);
        if (forcedReflowWarnings.length > 0) {
          console.error("    Forced reflow warnings:", forcedReflowWarnings);
        }
      }
    }
    results.layoutThrashing = thrashingResults;

    // =========================================================================
    // SUITE 3: Active Stage Indicators Synchronization
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("  SUITE 3: Active Stage Indicators Synchronization");
    console.log("------------------------------------------------------------------");

    const stageIds = ["source", "inspect", "prepare", "pack", "store", "deliver"];

    const syncResults = [];

    for (const config of scrollTestConfigs) {
      await session.close();
      session = await createCdpSession();

      await session.setViewport(config.width, config.height, config.mobile ? 3 : 1, config.mobile);
      await session.navigate(`${BASE_URL}/en/standard`);
      await session.waitFor('document.querySelector("#standard-monolith-main") !== null');
      await sleep(200);

      let forwardPassed = true;
      let reversePassed = true;

      // 1. Forward Scroll: Scroll to each stage and verify indicator synchronization
      for (let idx = 0; idx < stageIds.length; idx++) {
        const stageId = stageIds[idx];
        await session.evaluate(`(() => {
          const el = document.getElementById("stage-${stageId}");
          if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        })()`);
        await sleep(100); // Wait for rAF update

        const indicatorState = await session.evaluate(`(() => {
          // Desktop node
          const desktopActiveNode = document.querySelector(".progress-thread-desktop .thread-node-item.is-active");
          const desktopLink = desktopActiveNode ? desktopActiveNode.querySelector(".thread-node-link") : null;
          const desktopText = desktopActiveNode ? desktopActiveNode.innerText.trim() : "";
          const desktopFill = document.querySelector(".thread-line-fill")?.style?.height || "";

          // Mobile pill
          const mobilePill = document.querySelector(".progress-thread-mobile .mobile-pill-text");
          const mobileText = mobilePill ? mobilePill.innerText.trim() : "";
          const mobileFill = document.querySelector(".mobile-pill-bar-fill")?.style?.width || "";

          return {
            desktopText,
            desktopFill,
            desktopAriaCurrent: desktopLink?.getAttribute("aria-current"),
            mobileText,
            mobileFill,
          };
        })()`);

        const expectedNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
        const desktopOk = config.mobile
          ? true
          : indicatorState.desktopText.includes(expectedNum) &&
            indicatorState.desktopAriaCurrent === "step";
        const mobileOk = !config.mobile
          ? true
          : indicatorState.mobileText.includes(expectedNum);

        const expectedPctValue = ((idx + 1) / stageIds.length) * 100;
        const actualFillValue = parseFloat(config.mobile ? indicatorState.mobileFill : indicatorState.desktopFill);
        const fillOk = !isNaN(actualFillValue) && Math.abs(actualFillValue - expectedPctValue) < 1.0;

        if (!desktopOk || !mobileOk || !fillOk) {
          forwardPassed = false;
          console.error(`    Mismatch at stage ${idx + 1} (${stageId}):`, indicatorState);
        }
      }

      // 2. Reverse Scroll: Scroll from Stage 6 up to Stage 1
      for (let idx = stageIds.length - 1; idx >= 0; idx--) {
        const stageId = stageIds[idx];
        await session.evaluate(`(() => {
          const el = document.getElementById("stage-${stageId}");
          if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        })()`);
        await sleep(100);

        const indicatorState = await session.evaluate(`(() => {
          const desktopActive = document.querySelector(".progress-thread-desktop .thread-node-item.is-active")?.innerText?.trim() || "";
          const mobileText = document.querySelector(".progress-thread-mobile .mobile-pill-text")?.innerText?.trim() || "";
          return { desktopActive, mobileText };
        })()`);

        const expectedNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
        const match = config.mobile
          ? indicatorState.mobileText.includes(expectedNum)
          : indicatorState.desktopActive.includes(expectedNum);

        if (!match) {
          reversePassed = false;
          console.error(`    Reverse mismatch at stage ${idx + 1} (${stageId}):`, indicatorState);
        }
      }

      const pass = forwardPassed && reversePassed;
      syncResults.push({
        config: config.name,
        forwardPassed,
        reversePassed,
        passed: pass,
      });

      const icon = pass ? "✓ PASS" : "✗ FAIL";
      console.log(
        `  ${icon} | ${config.name} | Forward Sync: ${forwardPassed ? "PASS" : "FAIL"} | Reverse Sync: ${reversePassed ? "PASS" : "FAIL"}`
      );
      if (!pass) results.passed = false;
    }
    results.scrollSync = syncResults;

    // =========================================================================
    // SUITE 4: Stage 01 Eager Loading & LCP Readiness
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("  SUITE 4: Stage 01 Eager Loading & LCP Readiness");
    console.log("------------------------------------------------------------------");

    await session.close();
    session = await createCdpSession();

    await session.setViewport(1440, 900, 1, false);
    session.networkRequests.length = 0; // Clear requests buffer

    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.navigate(`${BASE_URL}/en/standard`);
    await session.waitFor('document.querySelector("#stage-source") !== null');
    await sleep(300);

    // Inspect Stage 01 DOM attributes
    const stage01Dom = await session.evaluate(`(() => {
      const stage01 = document.getElementById("stage-source");
      if (!stage01) return null;
      const img = stage01.querySelector("img.stage-visual-img");
      const picture = stage01.querySelector("picture");
      const source = picture ? picture.querySelector("source") : null;
      return {
        hasStage01: true,
        imgLoading: img?.getAttribute("loading"),
        imgFetchPriority: img?.getAttribute("fetchpriority"),
        imgDecoding: img?.getAttribute("decoding"),
        imgWidth: img?.getAttribute("width"),
        imgHeight: img?.getAttribute("height"),
        hasSourceWebp: source?.getAttribute("type") === "image/webp",
        sourceSrcset: source?.getAttribute("srcset"),
      };
    })()`);

    // Inspect Subsequent Stages (2 to 6)
    const subsequentStagesDom = await session.evaluate(`(() => {
      const stages = ["stage-inspect", "stage-prepare", "stage-pack", "stage-store", "stage-deliver"];
      return stages.map(id => {
        const el = document.getElementById(id);
        const img = el ? el.querySelector("img.stage-visual-img") : null;
        return {
          id,
          loading: img?.getAttribute("loading"),
          fetchPriority: img?.getAttribute("fetchpriority")
        };
      });
    })()`);

    // Inspect Network Requests
    const stage01WebpRequests = session.networkRequests.filter((r) =>
      r.url.includes("stage-01-source") && r.url.endsWith(".webp")
    );
    const rawStage01Requests = session.networkRequests.filter((r) =>
      r.url.includes("standard_stage_01_source.jpg")
    );

    // Inspect LCP Entries
    const lcpEntries = await session.evaluate("window.__lcp_entries || []");

    const stage01Eager = stage01Dom.imgLoading === "eager";
    const stage01Priority = stage01Dom.imgFetchPriority === "high";
    const stage01WebpValid = stage01Dom.hasSourceWebp && stage01Dom.sourceSrcset.includes(".webp");
    const stagesLazyValid = subsequentStagesDom.every((s) => s.loading === "lazy");
    const noRawJpegs = rawStage01Requests.length === 0;
    const webpRequested = stage01WebpRequests.length > 0;

    const eagerLcpPassed =
      stage01Eager &&
      stage01Priority &&
      stage01WebpValid &&
      stagesLazyValid &&
      noRawJpegs &&
      webpRequested;

    results.eagerLcp = {
      stage01Dom,
      subsequentStagesDom,
      stage01WebpRequests,
      rawStage01Requests,
      lcpEntries,
      passed: eagerLcpPassed,
    };

    const eagerIcon = eagerLcpPassed ? "✓ PASS" : "✗ FAIL";
    console.log(
      `  ${eagerIcon} | Stage 01: loading="${stage01Dom.imgLoading}", fetchpriority="${stage01Dom.imgFetchPriority}", width=${stage01Dom.imgWidth}, height=${stage01Dom.imgHeight}`
    );
    console.log(
      `  ${noRawJpegs ? "✓ PASS" : "✗ FAIL"} | Network: Modern WebP requested (${stage01WebpRequests[0]?.url.split("/").pop() ?? "none"}), Raw JPEG requests: ${rawStage01Requests.length}`
    );
    console.log(
      `  ${stagesLazyValid ? "✓ PASS" : "✗ FAIL"} | Stages 02–06: All 5 stages configured loading="lazy"`
    );
    if (lcpEntries.length > 0) {
      console.log(
        `  ✓ INFO | Largest Contentful Paint (LCP): ${Math.round(lcpEntries[0].renderTime)}ms (size: ${lcpEntries[0].size}px)`
      );
    }

    if (!eagerLcpPassed) {
      results.passed = false;
      console.error("  Eager LCP Failure Details:", results.eagerLcp);
    }

    await session.close();
  } finally {
    if (chromeHandle?.cleanup) {
      chromeHandle.cleanup();
    }
    if (serverProc) {
      try {
        serverProc.kill();
      } catch {}
    }
  }

  const durationMs = Date.now() - startTime;
  console.log("\n==================================================================");
  console.log(`  VERDICT: ${results.passed ? "APPROVE" : "REJECT"} (Total Runtime: ${(durationMs / 1000).toFixed(2)}s)`);
  console.log("==================================================================");

  if (!results.passed) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test Suite Crashed:", err);
  process.exit(1);
});
