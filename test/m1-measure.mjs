import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3189";
const CHROME_PORT = process.env.CHROME_DEBUG_PORT ?? "9349";
const DEBUG_URL = `http://127.0.0.1:${CHROME_PORT}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer() {
  try {
    const res = await fetch(`${BASE_URL}/en`);
    if (res.ok) {
      console.log(`Server already running at ${BASE_URL}`);
      return null;
    }
  } catch {}

  console.log(`Starting Next.js production server on ${BASE_URL}...`);
  const server = spawn("npx", ["next", "start", "-p", "3189"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${BASE_URL}/en`);
      if (res.ok) {
        console.log(`Next.js server ready at ${BASE_URL}`);
        return server;
      }
    } catch {}
  }
  throw new Error("Failed to start Next.js production server");
}

async function ensureChrome() {
  try {
    const res = await fetch(`${DEBUG_URL}/json/version`);
    if (res.ok) {
      console.log(`Chrome already running on port ${CHROME_PORT}`);
      return null;
    }
  } catch {}

  console.log(`Launching headless Chrome on port ${CHROME_PORT}...`);
  const profileDir = `/tmp/agrica-chrome-m1-${Date.now()}`;
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless=new",
    `--remote-debugging-port=${CHROME_PORT}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-client-side-phishing-detection",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-features=Translate,BackForwardCache,AcceptCHFrame,AvoidUnnecessaryBeforeUnloadCheckSync",
    "--disable-hang-monitor",
    "--disable-ipc-flooding-protection",
    "--disable-popup-blocking",
    "--disable-prompt-on-repost",
    "--disable-renderer-backgrounding",
    "--disable-sync",
    "--force-color-profile=srgb",
    "--metrics-recording-only",
    "--no-service-autorun",
    "--mute-audio"
  ], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${DEBUG_URL}/json/version`);
      if (res.ok) {
        console.log(`Chrome CDP ready on port ${CHROME_PORT}`);
        return chrome;
      }
    } catch {}
  }
  throw new Error("Failed to launch Chrome");
}

async function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  const listeners = [];

  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    for (const listener of listeners) {
      try { listener(message); } catch {}
    }
    if (!message.id) {
      events.push(message);
      return;
    }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };

  const onEvent = (cb) => {
    listeners.push(cb);
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const reqId = ++id;
      const timer = setTimeout(() => {
        pending.delete(reqId);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
      pending.set(reqId, { resolve, reject, timer });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });

  const evaluate = async (expression) => {
    const response = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails) {
      throw new Error(JSON.stringify(response.exceptionDetails));
    }
    return response.result?.value;
  };

  return { ws, send, evaluate, events, onEvent };
}

const PRELOAD_SCRIPT = `
window.__perf_metrics = {
  lcp: 0,
  lcpElement: '',
  lcpUrl: '',
  fcp: 0,
  cls: 0
};
try {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__perf_metrics.lcp = entry.startTime;
      window.__perf_metrics.lcpElement = entry.element ? entry.element.tagName : '';
      window.__perf_metrics.lcpUrl = entry.url || '';
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        window.__perf_metrics.fcp = entry.startTime;
      }
    }
  }).observe({ type: 'paint', buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        window.__perf_metrics.cls += entry.value;
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
`;

async function measureRoute(browser, route, viewportConfig, settleMs = 5000) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const targets = await (await fetch(`${DEBUG_URL}/json`)).json();
  const pageTarget = targets.find((t) => t.id === targetId);
  assert.ok(pageTarget, `Target ${targetId} not found`);

  const page = await connectCdp(pageTarget.webSocketDebuggerUrl);
  const requestMap = new Map();

  page.onEvent((msg) => {
    if (msg.method === "Network.requestWillBeSent") {
      const { requestId, request, type } = msg.params;
      if (!requestMap.has(requestId)) {
        requestMap.set(requestId, {
          url: request.url,
          type: type || "Other",
          encodedBytes: 0,
          encodedBytesFromData: 0,
          dataBytes: 0,
          status: null,
          mimeType: null,
        });
      }
    } else if (msg.method === "Network.responseReceived") {
      const { requestId, type, response } = msg.params;
      const req = requestMap.get(requestId) || {
        url: response.url,
        type: type || "Other",
        encodedBytes: 0,
        encodedBytesFromData: 0,
        dataBytes: 0,
      };
      req.status = response.status;
      req.mimeType = response.mimeType;
      if (type) req.type = type;
      requestMap.set(requestId, req);
    } else if (msg.method === "Network.dataReceived") {
      const { requestId, dataLength, encodedDataLength } = msg.params;
      const req = requestMap.get(requestId);
      if (req) {
        req.dataBytes += dataLength || 0;
        req.encodedBytesFromData += encodedDataLength || 0;
      }
    } else if (msg.method === "Network.loadingFinished") {
      const { requestId, encodedDataLength } = msg.params;
      const req = requestMap.get(requestId);
      if (req) {
        if (encodedDataLength > 0) {
          req.encodedBytes = encodedDataLength;
        } else {
          req.encodedBytes = req.encodedBytesFromData || req.dataBytes;
        }
      }
    }
  });

  try {
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Network.enable");
    await page.send("Network.setCacheDisabled", { cacheDisabled: true });

    await page.send("Page.addScriptToEvaluateOnNewDocument", {
      source: PRELOAD_SCRIPT,
    });

    await page.send("Emulation.setDeviceMetricsOverride", {
      width: viewportConfig.width,
      height: viewportConfig.height,
      deviceScaleFactor: viewportConfig.dpr,
      mobile: viewportConfig.mobile,
    });

    const targetUrl = `${BASE_URL}${route}`;
    await page.send("Page.navigate", { url: targetUrl });

    let loaded = false;
    for (let i = 0; i < 100; i++) {
      await sleep(100);
      try {
        const readyState = await page.evaluate("document.readyState");
        if (readyState === "complete") {
          loaded = true;
          break;
        }
      } catch {}
    }

    await sleep(settleMs);

    const inPageMetrics = await page.evaluate(`
      (()=>{
        const nav = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(p => p.name === 'first-contentful-paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        const lastLcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null;
        const observerMetrics = window.__perf_metrics || {};

        return {
          dcl: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
          ttfb: nav ? Math.round(nav.responseStart - nav.startTime) : null,
          load: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
          fcp: fcpEntry ? Math.round(fcpEntry.startTime) : (observerMetrics.fcp ? Math.round(observerMetrics.fcp) : null),
          lcp: lastLcp ? Math.round(lastLcp.startTime) : (observerMetrics.lcp ? Math.round(observerMetrics.lcp) : null),
          lcpElement: lastLcp?.element?.tagName || observerMetrics.lcpElement || null,
          cls: observerMetrics.cls || 0,
        };
      })()
    `);

    let totalRequests = 0;
    let totalBytes = 0;
    let imageBytes = 0;
    let mediaBytes = 0;
    let jsBytes = 0;
    let cssBytes = 0;
    let docBytes = 0;
    let otherBytes = 0;

    const requestDetails = [];

    for (const [id, req] of requestMap.entries()) {
      totalRequests++;
      const effectiveBytes = req.encodedBytes || req.encodedBytesFromData || req.dataBytes || 0;
      totalBytes += effectiveBytes;

      const isImage = req.type === "Image" || (req.mimeType && req.mimeType.startsWith("image/"));
      const isMedia = req.type === "Media" || (req.mimeType && (req.mimeType.startsWith("video/") || req.mimeType.startsWith("audio/")));
      const isScript = req.type === "Script" || (req.mimeType && req.mimeType.includes("javascript"));
      const isCss = req.type === "Stylesheet" || (req.mimeType && req.mimeType.includes("css"));
      const isDoc = req.type === "Document";

      if (isImage) imageBytes += effectiveBytes;
      else if (isMedia) mediaBytes += effectiveBytes;
      else if (isScript) jsBytes += effectiveBytes;
      else if (isCss) cssBytes += effectiveBytes;
      else if (isDoc) docBytes += effectiveBytes;
      else otherBytes += effectiveBytes;

      requestDetails.push({
        url: req.url,
        type: req.type,
        status: req.status,
        mimeType: req.mimeType,
        bytes: effectiveBytes,
      });
    }

    return {
      route,
      viewport: viewportConfig.name,
      metrics: {
        requestsCount: totalRequests,
        totalTransferBytes: totalBytes,
        imageTransferBytes: imageBytes,
        mediaTransferBytes: mediaBytes,
        imageMediaTransferBytes: imageBytes + mediaBytes,
        jsTransferBytes: jsBytes,
        cssTransferBytes: cssBytes,
        docTransferBytes: docBytes,
        otherTransferBytes: otherBytes,
        domContentLoadedMs: inPageMetrics.dcl,
        ttfbMs: inPageMetrics.ttfb,
        fcpMs: inPageMetrics.fcp,
        lcpMs: inPageMetrics.lcp,
        lcpElement: inPageMetrics.lcpElement,
        cls: Number(inPageMetrics.cls.toFixed(4)),
      },
      requests: requestDetails,
    };
  } finally {
    try {
      page.ws.close();
      await browser.send("Target.closeTarget", { targetId });
    } catch {}
  }
}

async function main() {
  let serverProcess = null;
  let chromeProcess = null;

  try {
    serverProcess = await ensureServer();
    chromeProcess = await ensureChrome();

    const version = await (await fetch(`${DEBUG_URL}/json/version`)).json();
    const browser = await connectCdp(version.webSocketDebuggerUrl);

    const viewports = [
      { name: "Desktop (1440px)", width: 1440, height: 900, dpr: 1, mobile: false },
      { name: "Mobile (390px)", width: 390, height: 844, dpr: 3, mobile: true },
    ];

    const routes = [
      "/en",
      "/en/herbs-spices",
    ];

    console.log("\n=======================================================");
    console.log("  AGRICA M1 OPTIMIZATION PERFORMANCE MEASUREMENT RUNNER ");
    console.log("=======================================================\n");

    const results = [];

    for (const viewport of viewports) {
      console.log(`\n--- Viewport: ${viewport.name} ---`);
      for (const route of routes) {
        process.stdout.write(`Measuring ${route.padEnd(28)} ... `);
        const startTime = Date.now();
        const data = await measureRoute(browser, route, viewport, 5000);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Done (${duration}s) | Req: ${data.metrics.requestsCount} | Total: ${(data.metrics.totalTransferBytes / 1024 / 1024).toFixed(2)} MB | Img+Media: ${(data.metrics.imageMediaTransferBytes / 1024 / 1024).toFixed(2)} MB | DCL: ${data.metrics.domContentLoadedMs}ms | LCP: ${data.metrics.lcpMs}ms | CLS: ${data.metrics.cls}`);
        results.push(data);
      }
    }

    browser.ws.close();

    const fs = await import("node:fs/promises");
    await fs.writeFile(
      "/Users/zyad/Projects/AGRICA/.agents/teamwork/worker_m1/m1_metrics.json",
      JSON.stringify(results, null, 2),
      "utf8"
    );
    console.log("\n✓ Results written to .agents/teamwork/worker_m1/m1_metrics.json");

    return results;
  } finally {
    if (chromeProcess) {
      chromeProcess.kill("SIGTERM");
    }
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
