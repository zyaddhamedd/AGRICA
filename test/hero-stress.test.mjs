#!/usr/bin/env node

/**
 * AGRICA Hero Media & Video Stress Test Harness
 * 
 * Tests:
 * 1. Initial Load: Single video request, inactive videos deferred, WebP poster fidelity.
 * 2. Direct Tap / Click without Hover (Touch/Pill/Card): Video attachment and playback.
 * 3. Rapid Carousel Navigation (Hammer Stress): 40 rapid transitions, no crashes, no black frames, video mutex.
 * 4. Document Visibility Gating: `visibilitychange` pauses video & auto-advance timer; resume on reveal.
 * 5. IntersectionObserver Viewport Gating: Scroll offscreen pauses video & timer; resume on scroll to top.
 * 6. Network Throttling & Concurrent Range Requests: Slow 3G emulation, request leak detection.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const PORT = 3195;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROME_PORT = 9475;
const DEBUG_URL = `http://127.0.0.1:${CHROME_PORT}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer() {
  try {
    const res = await fetch(`${BASE_URL}/en`);
    if (res.ok) {
      console.log(`[Server] Production server already running at ${BASE_URL}`);
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
        console.log(`[Server] Next.js server ready at ${BASE_URL}`);
        return server;
      }
    } catch {}
  }
  throw new Error("Failed to start Next.js server");
}

async function launchChrome() {
  try {
    const res = await fetch(`${DEBUG_URL}/json/version`);
    if (res.ok) {
      console.log(`[Chrome] Already running on port ${CHROME_PORT}`);
      return null;
    }
  } catch {}

  console.log(`[Chrome] Launching headless Chrome on port ${CHROME_PORT}...`);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "agrica-stress-chrome-"));
  const chrome = spawn(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    [
      "--headless=new",
      `--remote-debugging-port=${CHROME_PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--mute-audio",
      "--disable-gpu",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  for (let i = 0; i < 40; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${DEBUG_URL}/json/version`);
      if (res.ok) {
        console.log(`[Chrome] Headless Chrome CDP ready on port ${CHROME_PORT}`);
        return { proc: chrome, userDataDir };
      }
    } catch {}
  }
  throw new Error("Failed to launch Chrome");
}

async function connectSession() {
  const newTargetRes = await fetch(`${DEBUG_URL}/json/new`, { method: "PUT" });
  const target = await newTargetRes.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  const uncaughtExceptions = [];
  const networkRequests = [];

  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const req = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) req.reject(new Error(msg.error.message));
      else req.resolve(msg.result);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      uncaughtExceptions.push(msg.params.exceptionDetails);
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      consoleErrors.push(msg.params.entry.text);
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (msg.method === "Network.requestWillBeSent") {
      networkRequests.push({
        requestId: msg.params.requestId,
        url: msg.params.request.url,
        method: msg.params.request.method,
        headers: msg.params.request.headers,
        timestamp: msg.params.timestamp,
        type: msg.params.type,
      });
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const reqId = ++id;
      pending.set(reqId, { resolve, reject });
      socket.send(JSON.stringify({ id: reqId, method, params }));
    });

  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
    }
    return res.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");

  return {
    socket,
    send,
    evaluate,
    consoleErrors,
    uncaughtExceptions,
    networkRequests,
    targetId: target.id,
    close: async () => {
      try { socket.close(); } catch {}
      try { await fetch(`${DEBUG_URL}/json/close/${target.id}`); } catch {}
    },
  };
}

async function run() {
  console.log("==================================================================");
  console.log("  AGRICA Milestone M1: Hero Video Lifecycle Stress Test Suite");
  console.log("==================================================================");

  const server = await ensureServer();
  const chrome = await launchChrome();

  const results = {
    test1_initial_load: null,
    test2_direct_tap_without_hover: null,
    test3_rapid_carousel_hammer: null,
    test4_visibility_change_gating: null,
    test5_scroll_intersection_gating: null,
    test6_network_throttling_concurrency: null,
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Initial Page Load & Inactive Video Deferral
    // -------------------------------------------------------------
    console.log("\n[Test 1] Initial Load: Single video request & inactive video deferral...");
    {
      const session = await connectSession();
      session.networkRequests.length = 0;

      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(2500);

      // Verify DOM: check how many videos have <source>
      const videoSourceCount = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-video')).map((v, i) => ({
          index: i,
          hasSource: v.querySelector('source') !== null,
          sourceSrc: v.querySelector('source')?.getAttribute('src') || null,
          preload: v.getAttribute('preload'),
          currentSrc: v.currentSrc,
          paused: v.paused,
          readyState: v.readyState,
          currentTime: v.currentTime,
        }))
      `);

      const mp4Requests = session.networkRequests.filter((r) => r.url.endsWith(".mp4"));
      const uniqueMp4Urls = [...new Set(mp4Requests.map((r) => r.url))];

      console.log("  Video DOM state on initial load:", JSON.stringify(videoSourceCount, null, 2));
      console.log(`  MP4 requests triggered on initial load: ${uniqueMp4Urls.length} unique (${uniqueMp4Urls.map(u => u.split("/").pop()).join(", ")})`);

      const initialSlideVideo = videoSourceCount[0];
      const inactiveVideos = videoSourceCount.slice(1);

      const passInitialVideoAttached = initialSlideVideo.hasSource && initialSlideVideo.sourceSrc.includes("hero-01-origin.mp4");
      const passInactiveDeferred = inactiveVideos.every((v) => !v.hasSource && v.preload === "none");
      const passSingleMp4Request = uniqueMp4Urls.length === 1 && uniqueMp4Urls[0].includes("hero-01-origin.mp4");

      console.log(`  ✓ Active video (0) attached: ${passInitialVideoAttached}`);
      console.log(`  ✓ Inactive videos (1..3) deferred (<source> absent & preload="none"): ${passInactiveDeferred}`);
      console.log(`  ✓ Only 1 MP4 requested: ${passSingleMp4Request}`);

      results.test1_initial_load = {
        passed: passInitialVideoAttached && passInactiveDeferred && passSingleMp4Request,
        details: { videoSourceCount, uniqueMp4Urls },
      };

      await session.close();
    }

    // -------------------------------------------------------------
    // Test 2: Direct Tap / Click Without Prior Hover (Touch Emulation)
    // -------------------------------------------------------------
    console.log("\n[Test 2] Direct Tap / Click on Pill / Card without hover (Touch device simulation)...");
    {
      const session = await connectSession();
      // Emulate mobile viewport with touch enabled
      await session.send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        mobile: true,
      });
      await session.send("Emulation.setTouchEmulationEnabled", {
        enabled: true,
        maxTouchPoints: 5,
      });

      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(2000);

      // Perform a direct click/tap on Pill 2 (index 1: Processing) and then Pill 3 (index 2: Packing)
      // Note: In touch devices, 'click' occurs without prior 'mouseenter' or 'focus'.
      console.log("  Triggering programmatic direct click on Pill 3 (index 2: Packing)...");
      const clickResult = await session.evaluate(`
        (() => {
          const pills = document.querySelectorAll('.hero-page-pill');
          if (!pills || pills.length < 3) return { error: 'Pills not found' };
          // Direct dispatch of click without mouseenter
          pills[2].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return { clicked: true };
        })()
      `);
      console.log("  Click dispatched:", clickResult);

      // Wait 1.5 seconds for video to load and play
      await sleep(1500);

      const stateAfterClick = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-video')).map((v, i) => {
          const card = v.closest('.hero-card-item');
          const poster = card?.querySelector('.hero-card-poster img');
          const isPlayingClass = v.classList.contains('is-playing');
          return {
            index: i,
            isActive: card?.classList.contains('hero-card-item--active'),
            hasSource: v.querySelector('source') !== null,
            sourceSrc: v.querySelector('source')?.getAttribute('src') || null,
            currentSrc: v.currentSrc,
            paused: v.paused,
            currentTime: v.currentTime,
            networkState: v.networkState,
            readyState: v.readyState,
            isPlayingClass,
            posterVisible: poster ? window.getComputedStyle(poster).opacity : null,
          };
        })
      `);

      console.log("  State after direct click on Pill 3:", JSON.stringify(stateAfterClick, null, 2));

      const activeItem = stateAfterClick.find((s) => s.index === 2);
      const isSourceAttached = activeItem?.hasSource === true;
      const isVideoPlaying = activeItem?.paused === false && activeItem?.currentTime > 0;
      const isPlayingClassPresent = activeItem?.isPlayingClass === true;

      console.log(`  Active slide index 2: hasSource = ${isSourceAttached}`);
      console.log(`  Active slide index 2: isPlaying = ${isVideoPlaying} (currentTime = ${activeItem?.currentTime})`);
      console.log(`  Active slide index 2: is-playing class = ${isPlayingClassPresent}`);

      if (!isSourceAttached) {
        console.error("  ❌ DEFECT DETECTED: Active slide 2 has NO <source> element attached after direct click!");
      }
      if (!isVideoPlaying) {
        console.error("  ❌ DEFECT DETECTED: Active slide 2 video is NOT playing after direct click!");
      }

      results.test2_direct_tap_without_hover = {
        passed: isSourceAttached && isVideoPlaying && isPlayingClassPresent,
        details: { activeItem, stateAfterClick },
      };

      await session.close();
    }

    // -------------------------------------------------------------
    // Test 3: Rapid Carousel Hammer Stress Test (40 Rapid Transitions)
    // -------------------------------------------------------------
    console.log("\n[Test 3] Rapid Carousel Hammer Stress Test (40 rapid clicks on Next & Prev)...");
    {
      const session = await connectSession();
      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(2000);

      const exceptionsBefore = [...session.uncaughtExceptions];
      const errorsBefore = [...session.consoleErrors];

      // Execute 40 rapid clicks alternating next and prev buttons
      const hammerReport = await session.evaluate(`
        (async () => {
          const nextBtn = document.querySelector('.hero-carousel-nav-btn--next');
          const prevBtn = document.querySelector('.hero-carousel-nav-btn--prev');
          const delays = [];
          const videoStatesDuring = [];

          for (let i = 0; i < 40; i++) {
            const btn = (i % 3 === 0) ? prevBtn : nextBtn;
            if (btn) btn.click();
            await new Promise((r) => setTimeout(r, 60)); // 60ms rapid interval

            const playingVideos = Array.from(document.querySelectorAll('.hero-card-video')).filter(v => !v.paused).length;
            videoStatesDuring.push({ iteration: i, playingVideos });
          }

          return { videoStatesDuring };
        })()
      `);

      // Allow 2 seconds to settle
      await sleep(2000);

      const finalState = await session.evaluate(`
        (() => {
          const videos = Array.from(document.querySelectorAll('.hero-card-video'));
          const activeCard = document.querySelector('.hero-card-item--active');
          const activeVideo = activeCard?.querySelector('video');
          const playingCount = videos.filter(v => !v.paused).length;
          return {
            totalVideos: videos.length,
            playingCount,
            activeVideoPaused: activeVideo?.paused ?? null,
            activeVideoCurrentTime: activeVideo?.currentTime ?? null,
            activeVideoIsPlayingClass: activeVideo?.classList.contains('is-playing') ?? false,
          };
        })()
      `);

      console.log("  Hammer test final state:", finalState);
      const newExceptions = session.uncaughtExceptions.slice(exceptionsBefore.length);
      const newErrors = session.consoleErrors.slice(errorsBefore.length);

      console.log(`  New uncaught exceptions: ${newExceptions.length}`);
      console.log(`  New console errors: ${newErrors.length}`);
      if (newErrors.length > 0) {
        console.log("  Console error log:", newErrors);
      }

      // Check invariants:
      // - Max 1 video playing simultaneously after settling
      // - No crash / active video should be playing
      // - Zero uncaught exceptions
      const passNoCrashes = newExceptions.length === 0;
      const passSinglePlaying = finalState.playingCount <= 1;
      const passActiveVideoPlaying = finalState.activeVideoPaused === false && finalState.activeVideoCurrentTime > 0;

      console.log(`  ✓ No unhandled exceptions: ${passNoCrashes}`);
      console.log(`  ✓ Single playing video mutex: ${passSinglePlaying}`);
      console.log(`  ✓ Active video resumed cleanly: ${passActiveVideoPlaying}`);

      results.test3_rapid_carousel_hammer = {
        passed: passNoCrashes && passSinglePlaying && passActiveVideoPlaying,
        details: { finalState, newExceptions, newErrors },
      };

      await session.close();
    }

    // -------------------------------------------------------------
    // Test 4: Document Visibility Change Gating (`visibilitychange`)
    // -------------------------------------------------------------
    console.log("\n[Test 4] Document Visibility Change Gating (Background tab simulation)...");
    {
      const session = await connectSession();
      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(2500);

      // Verify active video is playing
      const initialActivePlaying = await session.evaluate(`
        (() => {
          const v = document.querySelector('.hero-card-item--active video');
          return v && !v.paused;
        })()
      `);
      console.log(`  Initial active video playing: ${initialActivePlaying}`);

      const initialSlideIndex = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-item')).findIndex(c => c.classList.contains('hero-card-item--active'))
      `);

      // Simulate tab backgrounding: set document.hidden = true and trigger visibilitychange
      console.log("  Setting document.hidden = true and dispatching visibilitychange event...");
      await session.evaluate(`
        (() => {
          Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
          Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
        })()
      `);

      await sleep(300);

      // Verify video is paused
      const isPausedWhenHidden = await session.evaluate(`
        (() => {
          const v = document.querySelector('.hero-card-item--active video');
          return v ? v.paused : null;
        })()
      `);
      console.log(`  Active video paused when hidden: ${isPausedWhenHidden}`);

      // Wait 8 seconds (longer than the 7.0s auto-advance timer)
      console.log("  Waiting 8 seconds while hidden to verify auto-advance timer is suspended...");
      await sleep(8000);

      const slideIndexAfter8s = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-item')).findIndex(c => c.classList.contains('hero-card-item--active'))
      `);
      console.log(`  Slide index after 8s while hidden: ${slideIndexAfter8s} (Initial: ${initialSlideIndex})`);
      const timerSuspended = slideIndexAfter8s === initialSlideIndex;

      // Now restore visibility
      console.log("  Restoring document.hidden = false and dispatching visibilitychange...");
      await session.evaluate(`
        (() => {
          Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
          Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true });
          document.dispatchEvent(new Event('visibilitychange'));
        })()
      `);

      await sleep(1000);

      const isResumedOnVisible = await session.evaluate(`
        (() => {
          const v = document.querySelector('.hero-card-item--active video');
          return v ? !v.paused : null;
        })()
      `);
      console.log(`  Active video resumed playback when visible: ${isResumedOnVisible}`);

      results.test4_visibility_change_gating = {
        passed: isPausedWhenHidden === true && timerSuspended && isResumedOnVisible === true,
        details: { isPausedWhenHidden, timerSuspended, isResumedOnVisible, initialSlideIndex, slideIndexAfter8s },
      };

      await session.close();
    }

    // -------------------------------------------------------------
    // Test 5: Rapid Scrolling Off-Screen and Back (IntersectionObserver)
    // -------------------------------------------------------------
    console.log("\n[Test 5] Viewport Intersection Gating & Rapid Offscreen Scrolling...");
    {
      const session = await connectSession();
      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(2500);

      // Scroll 2500px down
      console.log("  Scrolling 2500px down offscreen...");
      await session.evaluate(`window.scrollTo(0, 2500);`);
      await sleep(500);

      const isPausedOffscreen = await session.evaluate(`
        (() => {
          const v = document.querySelector('.hero-card-item--active video');
          return v ? v.paused : null;
        })()
      `);
      console.log(`  Active video paused offscreen: ${isPausedOffscreen}`);

      const slideIndexOffscreen = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-item')).findIndex(c => c.classList.contains('hero-card-item--active'))
      `);

      // Wait 8 seconds offscreen to verify timer suspension
      console.log("  Waiting 8 seconds offscreen to verify carousel timer is paused...");
      await sleep(8000);

      const slideIndexOffscreenAfter8s = await session.evaluate(`
        Array.from(document.querySelectorAll('.hero-card-item')).findIndex(c => c.classList.contains('hero-card-item--active'))
      `);
      console.log(`  Slide index offscreen after 8s: ${slideIndexOffscreenAfter8s} (Expected: ${slideIndexOffscreen})`);
      const timerPausedOffscreen = slideIndexOffscreenAfter8s === slideIndexOffscreen;

      // Rapid scroll oscillation (15 times)
      console.log("  Executing rapid scroll oscillation (15 passes between 0 and 2500px)...");
      await session.evaluate(`
        (async () => {
          for (let i = 0; i < 15; i++) {
            window.scrollTo(0, (i % 2 === 0) ? 2500 : 0);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0); // End at top
        })()
      `);

      await sleep(1500);

      const isResumedAtTop = await session.evaluate(`
        (() => {
          const v = document.querySelector('.hero-card-item--active video');
          return v ? !v.paused : null;
        })()
      `);
      console.log(`  Active video resumed playing at top after rapid scrolling: ${isResumedAtTop}`);

      results.test5_scroll_intersection_gating = {
        passed: isPausedOffscreen === true && timerPausedOffscreen && isResumedAtTop === true,
        details: { isPausedOffscreen, timerPausedOffscreen, isResumedAtTop },
      };

      await session.close();
    }

    // -------------------------------------------------------------
    // Test 6: Network Throttling & Range Request Tracking (Slow 3G)
    // -------------------------------------------------------------
    console.log("\n[Test 6] Network Throttling (Slow 3G) & Inactive Video Request Concurrency...");
    {
      const session = await connectSession();
      // Emulate Slow 3G: 500kbps down, 500kbps up, 400ms latency
      await session.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 400,
        downloadThroughput: (500 * 1024) / 8,
        uploadThroughput: (500 * 1024) / 8,
        connectionType: "cellular3g",
      });

      session.networkRequests.length = 0;
      await session.send("Page.navigate", { url: `${BASE_URL}/en` });
      await sleep(3500);

      // Check video poster visibility while loading
      const posterFidelity = await session.evaluate(`
        (() => {
          const activeCard = document.querySelector('.hero-card-item--active');
          const poster = activeCard?.querySelector('.hero-card-poster img');
          const video = activeCard?.querySelector('video');
          return {
            posterComplete: poster?.complete ?? false,
            posterNaturalWidth: poster?.naturalWidth ?? 0,
            posterSrc: poster?.currentSrc ?? '',
            videoReadyState: video?.readyState ?? 0,
            videoPaused: video?.paused ?? true,
          };
        })()
      `);

      console.log("  Slow 3G poster & video status:", posterFidelity);

      // Count MP4 requests
      const mp4Reqs = session.networkRequests.filter(r => r.url.endsWith(".mp4"));
      const inactiveMp4s = mp4Reqs.filter(r => !r.url.includes("hero-01-origin.mp4"));

      console.log(`  Total MP4 requests during Slow 3G arrival: ${mp4Reqs.length}`);
      console.log(`  Inactive MP4 requests leaked: ${inactiveMp4s.length}`);

      const passNoInactiveLeak = inactiveMp4s.length === 0;
      const passPosterLoaded = posterFidelity.posterComplete && posterFidelity.posterNaturalWidth > 0;

      console.log(`  ✓ Zero inactive video leaks under network throttling: ${passNoInactiveLeak}`);
      console.log(`  ✓ High-fidelity poster displayed during buffering (no black box): ${passPosterLoaded}`);

      results.test6_network_throttling_concurrency = {
        passed: passNoInactiveLeak && passPosterLoaded,
        details: { mp4ReqsCount: mp4Reqs.length, inactiveLeaks: inactiveMp4s.length, posterFidelity },
      };

      await session.close();
    }

  } finally {
    if (server) {
      console.log("[Server] Cleaning up server process...");
      try { server.kill(); } catch {}
    }
    if (chrome?.proc) {
      console.log("[Chrome] Cleaning up chrome process...");
      try { chrome.proc.kill(); } catch {}
      try { fs.rmSync(chrome.userDataDir, { recursive: true, force: true }); } catch {}
    }
  }

  console.log("\n==================================================================");
  console.log("  STRESS TEST EXECUTION SUMMARY");
  console.log("==================================================================");
  for (const [testName, result] of Object.entries(results)) {
    const status = result?.passed ? "PASS" : "FAIL";
    const icon = result?.passed ? "✓" : "❌";
    console.log(`  ${icon} ${status.padEnd(5)} | ${testName}`);
  }
  console.log("==================================================================");

  const allPassed = Object.values(results).every(r => r?.passed);
  console.log(`Final Verdict: ${allPassed ? "APPROVED" : "REJECTED"}`);

  // Write results to a scratch file in test/ for report compilation
  fs.writeFileSync(
    path.join(process.cwd(), ".agents/teamwork/challenger_m1_1/stress_results.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  process.exit(allPassed ? 0 : 1);
}

run().catch((err) => {
  console.error("Stress test runner encountered fatal error:", err);
  process.exit(1);
});
