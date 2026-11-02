import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Launch an isolated headless Chrome instance if not already running.
 */
export async function launchHeadlessChrome(port = 9460) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (res.ok) {
      return { port, proc: null, isAttached: true };
    }
  } catch {}

  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Google Chrome binary not found at ${chromePath}`);
  }

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "agrica-chrome-"));

  const proc = spawn(
    chromePath,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
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
    },
  );

  let ready = false;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 100));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {}
  }

  if (!ready) {
    try {
      proc.kill();
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
    throw new Error(`Failed to launch headless Chrome on port ${port} within timeout`);
  }

  return {
    port,
    proc,
    isAttached: false,
    cleanup: () => {
      try {
        proc.kill();
      } catch {}
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch {}
    },
  };
}

/**
 * Create an isolated browser testing session over Chrome DevTools Protocol.
 */
export async function createBrowserSession(options = {}) {
  const baseUrl = options.baseUrl ?? process.env.BASE_URL ?? "http://localhost:3108";
  let chromeHandle = null;
  let debugUrl = options.debugUrl ?? process.env.CHROME_DEBUG_URL;

  if (!debugUrl) {
    const port = options.port ?? 9460;
    chromeHandle = await launchHeadlessChrome(port);
    debugUrl = `http://127.0.0.1:${chromeHandle.port}`;
  }

  // Create fresh page target
  const newTargetRes = await fetch(`${debugUrl}/json/new`, { method: "PUT" });
  const target = await newTargetRes.json();
  assert.ok(target?.webSocketDebuggerUrl, "Failed to create browser page target via CDP");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  const consoleErrors = [];

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params.exceptionDetails.text);
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      consoleErrors.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
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
          result.exceptionDetails.text,
      );
    }
    return result.result.value;
  }

  async function waitFor(expression, message, attempts = 150, delayMs = 50) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    assert.fail(message);
  }

  async function navigate(route) {
    const url = route.startsWith("http") ? route : `${baseUrl}${route}`;
    await send("Page.navigate", { url });
    await waitFor('document.readyState === "complete"', `Navigation to ${url} did not complete`);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  async function setViewport(width, height = 1000, isMobile = width <= 768) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
    });
    await send("Emulation.setTouchEmulationEnabled", {
      enabled: isMobile,
      maxTouchPoints: isMobile ? 5 : 1,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async function setEmulatedMedia(features) {
    await send("Emulation.setEmulatedMedia", { features });
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async function click(selector) {
    await waitFor(`document.querySelector(${JSON.stringify(selector)}) !== null`, `Selector ${selector} not found for click`);
    await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      el.scrollIntoView({ block: "center", behavior: "instant" });
      el.click();
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Enable CDP domains
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  return {
    socket,
    send,
    evaluate,
    waitFor,
    navigate,
    setViewport,
    setEmulatedMedia,
    click,
    getErrors: () =>
      consoleErrors.filter(
        (e) => !e.includes("favicon.ico") && !e.includes("link preload"),
      ),
    close: async () => {
      try {
        socket.close();
      } catch {}
      try {
        await fetch(`${debugUrl}/json/close/${target.id}`);
      } catch {}
      if (chromeHandle?.cleanup) {
        chromeHandle.cleanup();
      }
    },
    baseUrl,
  };
}
