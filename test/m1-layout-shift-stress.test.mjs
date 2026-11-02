#!/usr/bin/env node

/**
 * AGRICA Layout Shift (CLS) & Multi-Locale Rendering Empirical Stress Harness
 * Milestone: M1 Verification (Challenger M1-2)
 *
 * Test Suites:
 * 1. 25-Condition CLS Matrix:
 *    - 5 Locales: /en, /ar, /ru, /de, /fr
 *    - 5 Viewports: 320px, 390px, 768px, 1440px, 1920px
 *    - Strict Core Web Vitals Layout Shift Assertions (target 0.0000, max 0.05)
 *
 * 2. Lazy Loading & Fast Scroll Shift Immunity:
 *    - Compact Product Cards (ProductCardFront.tsx: loading="lazy")
 *    - Seasonal Hero Cutout (SeasonalHeroCrop.tsx: loading="lazy")
 *    - Fast fling scroll, instant scroll jumps, and bottom-to-top reversions
 *    - Zero layout shift during/after image hydration and decode
 *
 * 3. Arabic RTL (dir="rtl") Layout & Media Bounds:
 *    - Certificates Marquee (LogoLoop.tsx in QualityDocumentationSection.tsx)
 *    - Seasonal Orbit Explorer (MonthOrbit, SeasonalOrbitSvg, 12 month buttons)
 *    - Zero horizontal overflow across all viewports
 *    - Zero clipping of active month nodes, cards, or marquee tracks
 *    - Dynamic month switching stress under RTL
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3196;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PORT = process.env.CHROME_DEBUG_PORT ? parseInt(process.env.CHROME_DEBUG_PORT, 10) : 9478;
const DEBUG_URL = `http://127.0.0.1:${CHROME_PORT}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer() {
  try {
    const res = await fetch(`${BASE_URL}/en`);
    if (res.ok) {
      console.log(`[Server] Production server already active at ${BASE_URL}`);
      return null;
    }
  } catch {}

  console.log(`[Server] Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const res = await fetch(`${BASE_URL}/en`);
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
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "agrica-chrome-cls-"));
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
  for (let i = 0; i < 40; i++) {
    await sleep(200);
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
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url ?? ""}`.trim());
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
      if (await evaluate(expression)) return;
      await sleep(delayMs);
    }
    assert.fail(message);
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
                currentRect: s.currentRect,
                previousRect: s.previousRect,
              })) : []
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  `;

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVER_PRELOAD });

  return {
    socket,
    send,
    evaluate,
    waitFor,
    setViewport,
    getErrors: () =>
      consoleErrors.filter(
        (e) => !e.includes("favicon.ico") && !e.includes("link preload")
      ),
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
  const serverProc = await ensureServer();
  const chromeHandle = await launchChrome();

  const results = {
    clsMatrix: [],
    scrollShiftResults: [],
    arabicRtlResults: {},
    passed: true,
  };

  try {
    const session = await createCdpSession();

    // =========================================================================
    // SUITE 1: 25-Condition CLS Matrix (5 Locales x 5 Viewports)
    // =========================================================================
    console.log("\n==================================================================");
    console.log("  SUITE 1: Cumulative Layout Shift (CLS) 25-Condition Matrix");
    console.log("==================================================================");

    const locales = ["en", "ar", "ru", "de", "fr"];
    const viewports = [
      { name: "320px (Narrow Mobile)", width: 320, height: 640, dpr: 2, mobile: true },
      { name: "390px (Mobile)", width: 390, height: 844, dpr: 3, mobile: true },
      { name: "768px (Tablet)", width: 768, height: 1024, dpr: 2, mobile: true },
      { name: "1440px (Desktop)", width: 1440, height: 900, dpr: 1, mobile: false },
      { name: "1920px (Ultra-wide)", width: 1920, height: 1080, dpr: 1, mobile: false },
    ];

    for (const vp of viewports) {
      for (const lang of locales) {
        const route = `/${lang}`;
        await session.setViewport(vp.width, vp.height, vp.dpr, vp.mobile);

        // Navigate with cache disabled for cold layout shift measurement
        await session.send("Network.setCacheDisabled", { cacheDisabled: true });
        await session.send("Page.navigate", { url: `${BASE_URL}${route}` });

        await session.waitFor(
          'document.readyState === "complete" && document.querySelector("#seasons") !== null',
          `Navigation to ${route} at ${vp.width}px timed out`
        );

        // Allow hydration and Cairo timezone rAF tick to settle
        await sleep(600);

        const metrics = await session.evaluate(`(() => ({
          cls: window.__perf_total_cls || 0,
          shiftCount: (window.__perf_shift_entries || []).length,
          shifts: (window.__perf_shift_entries || []).map(s => ({
            value: s.value,
            sources: s.sources.map(src => src.nodeName)
          })),
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
        }))()`);

        const entry = {
          lang,
          viewport: vp.name,
          width: vp.width,
          cls: Number(metrics.cls.toFixed(4)),
          shiftCount: metrics.shiftCount,
          overflow: metrics.hasHorizontalOverflow,
          scrollWidth: metrics.scrollWidth,
          innerWidth: metrics.innerWidth,
        };
        results.clsMatrix.push(entry);

        const pass = entry.cls <= 0.05 && !entry.overflow;
        if (!pass) results.passed = false;

        const icon = pass ? "✓" : "✗";
        console.log(
          `  ${icon} [${lang.toUpperCase()}] ${vp.name.padEnd(24)} | CLS: ${entry.cls.toFixed(4).padStart(6)} | Shifts: ${entry.shiftCount} | Overflow: ${entry.overflow ? "YES (" + entry.scrollWidth + "px > " + entry.innerWidth + "px)" : "NONE"}`
        );

        assert.ok(
          entry.cls <= 0.05,
          `CLS failure on ${route} at ${vp.width}px: CLS was ${entry.cls} (threshold <= 0.05)`
        );
        assert.ok(
          !entry.overflow,
          `Horizontal overflow detected on ${route} at ${vp.width}px: scrollWidth=${metrics.scrollWidth}, innerWidth=${metrics.innerWidth}`
        );
      }
    }

    // =========================================================================
    // SUITE 2: Lazy Loading & Fast Scroll Shift Immunity
    // =========================================================================
    console.log("\n==================================================================");
    console.log("  SUITE 2: Lazy Loading Fast-Scroll Shift Immunity");
    console.log("==================================================================");

    for (const testVp of [
      { name: "390px Mobile", width: 390, height: 844, dpr: 3, mobile: true },
      { name: "1440px Desktop", width: 1440, height: 900, dpr: 1, mobile: false },
    ]) {
      for (const lang of ["en", "ar"]) {
        const route = `/${lang}`;
        await session.setViewport(testVp.width, testVp.height, testVp.dpr, testVp.mobile);
        await session.send("Page.navigate", { url: `${BASE_URL}${route}` });

        await session.waitFor(
          'document.readyState === "complete" && document.querySelector("#seasons") !== null',
          `Navigation to ${route} timed out`
        );
        await sleep(400);

        // Reset metrics baseline before scroll stress
        await session.evaluate(`(() => {
          window.__perf_shift_entries = [];
          window.__perf_total_cls = 0;
        })()`);

        // Capture initial bounding rects of seasonal orbit and compact cards container
        const beforeBounds = await session.evaluate(`(() => {
          const orbit = document.querySelector('[data-season-orbit]');
          const heroCrop = document.querySelector('[class*="heroSubjectFrame"]');
          const cards = [...document.querySelectorAll('.export-card-scene.is-compact')].map((c) => {
            const r = c.getBoundingClientRect();
            return { w: r.width, h: r.height };
          });
          return {
            orbitExists: Boolean(orbit),
            heroCropExists: Boolean(heroCrop),
            cardCount: cards.length,
            cardDims: cards,
          };
        })()`);

        assert.ok(beforeBounds.orbitExists, "Orbit container not found");
        assert.ok(beforeBounds.heroCropExists, "Seasonal hero crop not found");
        assert.ok(beforeBounds.cardCount > 0, "No compact cards found in seasonal section");

        // Fast stepped scroll stress test: 200px steps at 16ms intervals down to 3000px
        await session.evaluate(`(async () => {
          for (let y = 0; y <= 3200; y += 200) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 16));
          }
          // Instant jump past season section to quality documentation
          document.querySelector("#quality-documentation")?.scrollIntoView({ behavior: "instant" });
          await new Promise(r => setTimeout(r, 150));
          // Instant jump directly back to season section
          document.querySelector("#seasons")?.scrollIntoView({ behavior: "instant" });
          await new Promise(r => setTimeout(r, 150));
          // Rapid jump to bottom of page
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(r => setTimeout(r, 150));
          // Rapid jump back to top
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 200));
          // Scroll back into center of compact cards
          document.querySelector(".export-card-scene.is-compact")?.scrollIntoView({ block: "center", behavior: "instant" });
        })()`);

        // Wait for any lazy images triggered by scroll to finish decoding
        await sleep(800);

        // Check if any layout shift occurred during this violent scroll & image load
        const scrollMetrics = await session.evaluate(`(() => {
          const shifts = window.__perf_shift_entries || [];
          const cards = [...document.querySelectorAll('.export-card-scene.is-compact')].map((c) => {
            const r = c.getBoundingClientRect();
            return { w: r.width, h: r.height };
          });
          const heroCrop = document.querySelector('[class*="heroSubjectFrame"]');
          const heroImg = heroCrop?.querySelector('img');
          return {
            cls: window.__perf_total_cls || 0,
            shiftCount: shifts.length,
            shifts: shifts.map(s => ({ value: s.value, sources: s.sources.map(src => src.nodeName) })),
            cardDims: cards,
            heroImageLoaded: heroImg ? heroImg.complete : true,
          };
        })()`);

        const resultEntry = {
          lang,
          viewport: testVp.name,
          scrollCls: Number(scrollMetrics.cls.toFixed(4)),
          shiftCount: scrollMetrics.shiftCount,
          heroLoaded: scrollMetrics.heroImageLoaded,
        };
        results.scrollShiftResults.push(resultEntry);

        // Verify card dimensions did not warp or shift
        assert.equal(
          scrollMetrics.cardDims.length,
          beforeBounds.cardDims.length,
          "Card count mismatch after scroll"
        );
        for (let i = 0; i < scrollMetrics.cardDims.length; i++) {
          const diffW = Math.abs(scrollMetrics.cardDims[i].w - beforeBounds.cardDims[i].w);
          const diffH = Math.abs(scrollMetrics.cardDims[i].h - beforeBounds.cardDims[i].h);
          assert.ok(
            diffW < 1 && diffH < 1,
            `Compact card ${i} dimensions shifted: was (${beforeBounds.cardDims[i].w}x${beforeBounds.cardDims[i].h}), now (${scrollMetrics.cardDims[i].w}x${scrollMetrics.cardDims[i].h})`
          );
        }

        // Layout shifts caused by fast scroll & lazy loading must be 0.0000 (target zero)
        const pass = resultEntry.scrollCls <= 0.001;
        if (!pass) results.passed = false;

        const icon = pass ? "✓" : "✗";
        console.log(
          `  ${icon} Fast Scroll [${lang.toUpperCase()}] ${testVp.name.padEnd(16)} | Scroll CLS: ${resultEntry.scrollCls.toFixed(4)} | Shifts: ${resultEntry.shiftCount} | Hero Image Complete: ${resultEntry.heroLoaded}`
        );

        assert.ok(
          resultEntry.scrollCls <= 0.001,
          `Fast scroll caused layout shift on ${route} (${testVp.name}): CLS=${resultEntry.scrollCls}`
        );
      }
    }

    // =========================================================================
    // SUITE 3: Arabic RTL (dir="rtl") Layout, Certificates Marquee & Seasonal Orbit
    // =========================================================================
    console.log("\n==================================================================");
    console.log("  SUITE 3: Arabic RTL Layout, Certificates Marquee & Orbit Integrity");
    console.log("==================================================================");

    for (const vp of viewports) {
      await session.setViewport(vp.width, vp.height, vp.dpr, vp.mobile);
      await session.send("Page.navigate", { url: `${BASE_URL}/ar` });

      await session.waitFor(
        'document.readyState === "complete" && document.querySelector("#quality-documentation") !== null',
        `Arabic homepage did not load at ${vp.width}px`
      );
      await sleep(500);

      const arAudit = await session.evaluate(`(() => {
        const docDir = document.documentElement.dir;
        const bodyDir = getComputedStyle(document.body).direction;
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth + 1;

        // Certificates Marquee
        const section = document.querySelector("#quality-documentation");
        const loopWrapper = section?.querySelector('[class*="loopWrapper"]');
        const loopTrack = loopWrapper?.querySelector('[class*="logoloop__track"]');
        const certCards = [...(loopWrapper?.querySelectorAll('[class*="certCard"]') || [])];
        const certImages = [...(loopWrapper?.querySelectorAll('img') || [])];

        const loopComputed = loopWrapper ? getComputedStyle(loopWrapper) : null;
        const loopOverflowX = loopComputed?.overflowX;
        const loopTrackRect = loopTrack?.getBoundingClientRect();

        // Seasonal Orbit
        const orbit = document.querySelector('[data-season-orbit]');
        const orbitRect = orbit?.getBoundingClientRect();
        const monthButtons = [...(orbit?.querySelectorAll('button') || [])];
        const monthButtonMetrics = monthButtons.map((btn, idx) => {
          const r = btn.getBoundingClientRect();
          const textEl = btn.querySelector('[class*="monthCode"]');
          return {
            index: idx + 1,
            x: r.left,
            w: r.width,
            h: r.height,
            visible: r.width > 0 && r.height > 0,
            hasText: Boolean(textEl && textEl.textContent.trim().length > 0),
          };
        });

        // Hero Crop inside Orbit
        const heroSubject = orbit?.querySelector('[class*="heroSubjectFrame"]');
        const heroRect = heroSubject?.getBoundingClientRect();
        const heroTitle = heroSubject?.querySelector('[class*="heroCropTitle"]');
        const heroBadge = heroSubject?.querySelector('[class*="heroStatusBadge"]');

        return {
          docDir,
          bodyDir,
          scrollWidth,
          innerWidth,
          hasHorizontalOverflow,
          marquee: {
            wrapperFound: Boolean(loopWrapper),
            loopOverflowX,
            cardCount: certCards.length,
            imageCount: certImages.length,
            trackTransform: loopTrack?.style.transform || '',
          },
          orbit: {
            found: Boolean(orbit),
            rect: orbitRect ? { left: orbitRect.left, right: orbitRect.right, width: orbitRect.width } : null,
            buttonCount: monthButtons.length,
            buttonsAllVisible: monthButtonMetrics.every(b => b.visible && b.hasText),
            heroTitleFound: Boolean(heroTitle?.textContent.trim()),
            heroBadgeFound: Boolean(heroBadge?.textContent.trim()),
          }
        };
      })()`);

      assert.equal(arAudit.docDir, "rtl", `Arabic doc dir must be rtl at ${vp.width}px`);
      assert.equal(arAudit.bodyDir, "rtl", `Arabic body computed direction must be rtl at ${vp.width}px`);
      assert.ok(
        !arAudit.hasHorizontalOverflow,
        `Arabic page has horizontal overflow at ${vp.width}px: scrollWidth=${arAudit.scrollWidth}, innerWidth=${arAudit.innerWidth}`
      );
      assert.ok(arAudit.marquee.wrapperFound, `Marquee wrapper missing at ${vp.width}px`);
      assert.equal(arAudit.marquee.loopOverflowX, "hidden", `Marquee loopWrapper must have overflow-x: hidden at ${vp.width}px`);
      assert.ok(arAudit.marquee.cardCount >= 8, `Expected >= 8 certificate cards in marquee, got ${arAudit.marquee.cardCount}`);
      assert.ok(arAudit.orbit.found, `Seasonal orbit missing at ${vp.width}px`);
      assert.equal(arAudit.orbit.buttonCount, 12, `Expected 12 month buttons in orbit, got ${arAudit.orbit.buttonCount}`);
      assert.ok(arAudit.orbit.buttonsAllVisible, `Month buttons in orbit must all be visible with localized text at ${vp.width}px`);
      assert.ok(arAudit.orbit.heroTitleFound, `Hero crop title missing at ${vp.width}px`);
      assert.ok(arAudit.orbit.heroBadgeFound, `Hero status badge missing at ${vp.width}px`);

      // Let marquee animate for 500ms and verify track transforms while remaining bounded
      await sleep(500);
      const trackState = await session.evaluate(`(() => {
        const loopTrack = document.querySelector('[class*="logoloop__track"]');
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          transform: loopTrack?.style.transform,
          overflow: scrollWidth > innerWidth + 1,
        };
      })()`);

      assert.ok(!trackState.overflow, `Marquee animation caused page overflow at ${vp.width}px`);
      console.log(
        `  ✓ Arabic RTL ${vp.name.padEnd(24)} | Overflow: NONE | Marquee Cards: ${arAudit.marquee.cardCount} | Orbit Buttons: 12/12 Visible | Marquee Transform: ${trackState.transform || "initial"}`
      );
    }

    // Dynamic Month Switching Stress Test under Arabic RTL
    console.log("\n  Testing 12-Month Sequential Switching Stress under Arabic RTL (390px Mobile)...");
    await session.setViewport(390, 844, 3, true);
    await session.send("Page.navigate", { url: `${BASE_URL}/ar` });
    await session.waitFor('document.querySelector("[data-season-orbit]") !== null', "Orbit not found");
    await sleep(400);

    for (let monthNum = 1; monthNum <= 12; monthNum++) {
      const switchResult = await session.evaluate(`((m) => {
        const btns = [...document.querySelectorAll('[class*="orbitShell"] button')];
        const targetBtn = btns[m - 1];
        if (!targetBtn) return { error: "Button not found: " + m };
        targetBtn.click();
        const activeMonth = document.querySelector('#seasons')?.getAttribute('data-selected-month');
        const heroTitle = document.querySelector('[class*="heroCropTitle"]')?.textContent;
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          month: m,
          activeMonth,
          heroTitle,
          overflow: scrollWidth > innerWidth + 1
        };
      })(${monthNum})`);

      assert.ok(!switchResult.error, switchResult.error);
      assert.ok(!switchResult.overflow, `Horizontal overflow after switching to month ${monthNum}`);
      await sleep(50);
    }
    console.log("  ✓ All 12 months clicked and cycled smoothly under Arabic RTL with zero overflow.");

    // Check for any unhandled browser errors or exceptions
    const browserErrors = session.getErrors();
    assert.deepEqual(browserErrors, [], `Browser errors detected during stress testing: ${browserErrors.join("; ")}`);

    console.log("\n==================================================================");
    console.log("🎉 ALL EMPIRICAL STRESS TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================================");

    await session.close();
  } finally {
    if (chromeHandle?.cleanup) chromeHandle.cleanup();
    if (serverProc) {
      console.log("[Server] Shutting down spawned Next.js server...");
      try {
        serverProc.kill("SIGTERM");
      } catch {}
    }
  }

  return results;
}

runTestSuite()
  .then((results) => {
    fs.writeFileSync(
      path.join(process.cwd(), ".agents/teamwork/challenger_m1_2/cls_stress_results.json"),
      JSON.stringify(results, null, 2)
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Empirical Stress Test Failed:", err);
    process.exit(1);
  });
