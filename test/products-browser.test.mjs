import assert from "node:assert/strict";

const baseUrl = process.env.PRODUCTS_BASE_URL ?? "http://localhost:3107";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9334";
const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "a browser page target is required");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const browserErrors = [];
const failedRequests = [];
const requestUrls = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }

  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push(message.params.exceptionDetails.text);
  }
  if (
    message.method === "Log.entryAdded" &&
    message.params.entry.level === "error" &&
    message.params.entry.url?.includes("/assets/")
  ) {
    browserErrors.push(`${message.params.entry.text} ${message.params.entry.url}`);
  }
  if (message.method === "Network.requestWillBeSent") {
    requestUrls.set(message.params.requestId, message.params.request.url);
  }
  if (message.method === "Network.loadingFailed") {
    const failedUrl = requestUrls.get(message.params.requestId) ?? "";
    if (failedUrl.includes("/assets/")) {
      failedRequests.push(`${message.params.errorText} ${failedUrl}`);
    }
  }
  if (
    message.method === "Network.responseReceived" &&
    message.params.response.status >= 400 &&
    message.params.response.url.includes("/assets/")
  ) {
    failedRequests.push(`${message.params.response.status} ${message.params.response.url}`);
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, message) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

async function navigate(path, world) {
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await waitFor('document.readyState === "complete"', `${path} did not load`);
  await waitFor(
    `document.body.dataset.world === ${JSON.stringify(world)}`,
    `${path} did not activate ${world}`,
  );
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
}

await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Network.enable");

for (const viewport of [
  { width: 1440, height: 1000, label: "desktop" },
  { width: 390, height: 844, label: "mobile" },
]) {
  await setViewport(viewport.width, viewport.height);

  for (const route of [
    { path: "/en/products", world: "fresh", count: 20 },
    { path: "/en/products?world=fresh", world: "fresh", count: 20 },
    { path: "/en/products?world=frozen", world: "frozen", count: 11 },
    { path: "/en/products?world=dried", world: "dried", count: 6 },
  ]) {
    await navigate(route.path, route.world);
    await waitFor(
      `document.querySelectorAll(".export-card-scene").length === ${route.count}`,
      `${route.path} did not render ${route.count} cards on ${viewport.label}`,
    );
    assert.equal(
      await evaluate("document.documentElement.scrollWidth <= window.innerWidth"),
      true,
      `${route.path} has horizontal overflow on ${viewport.label}`,
    );
    assert.equal(
      await evaluate('document.querySelectorAll(".export-card-visual:not(.has-dedicated-image)").length > 0'),
      true,
      `${route.path} does not expose the expected fallback visual path`,
    );
  }
}

await setViewport(1440, 1000);
await navigate("/en/products?world=frozen", "frozen");

assert.deepEqual(
  await evaluate('[...document.querySelectorAll(".taxonomy-name")].map((element) => element.textContent)'),
  ["All Families", "IQF Fruits", "IQF Vegetables", "Frozen Potato Products"],
);

await evaluate('document.querySelector(".minimal-search-trigger").click()');
await waitFor('document.querySelector("#minimal-search-input") !== null', "search did not open");
await evaluate(`(() => {
  const input = document.querySelector("#minimal-search-input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "IQF");
  input.dispatchEvent(new Event("input", { bubbles: true }));
})()`);
await waitFor('document.querySelectorAll(".export-card-scene").length === 10', "IQF search did not return 10 products");

await evaluate(`(() => {
  const input = document.querySelector("#minimal-search-input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "Dehydrated");
  input.dispatchEvent(new Event("input", { bubbles: true }));
})()`);
await waitFor('document.querySelectorAll(".export-card-scene").length === 2', "Dehydrated search did not return 2 products");

await evaluate(`(() => {
  const input = document.querySelector("#minimal-search-input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
})()`);
await waitFor('document.querySelectorAll(".export-card-scene").length === 11', "clearing search did not restore Frozen products");

await evaluate(`[...document.querySelectorAll(".taxonomy-item")]
  .find((element) => element.textContent.includes("Frozen Potato Products")).click()`);
await waitFor('document.querySelectorAll(".export-card-scene").length === 1', "FPP family filter failed");
assert.equal(await evaluate('document.querySelector(".export-card-title").textContent'), "Half-Fried French Fries");

await navigate("/en/products?world=fresh", "fresh");
await evaluate('document.querySelector(".export-card-quote").click()');
await waitFor('document.querySelector(".quote-count").textContent === "1"', "quote add failed");
await evaluate('document.querySelector(".export-card-quote").click()');
await waitFor('document.querySelector(".quote-count").textContent === "0"', "quote remove failed");

const dedicatedAssetStatuses = await evaluate(`Promise.all([
  "/assets/products/fresh/oranges.avif",
  "/assets/products/fresh/lemons.avif",
  "/assets/products/fresh/egyptian-limes.avif",
  "/assets/products/fresh/mandarins.avif",
  "/assets/products/frozen/strawberries.avif",
  "/assets/products/frozen/mango.avif",
  "/assets/products/frozen/pomegranate-arils.avif",
  "/assets/products/frozen/green-beans.avif",
  "/assets/products/frozen/green-peas.avif",
  "/assets/products/frozen/okra.avif",
  "/assets/products/frozen/molokhia.avif",
  "/assets/products/frozen/artichokes.avif"
].map((src) => fetch(src).then((response) => response.status)))`);
assert.equal(dedicatedAssetStatuses.every((status) => status === 200), true);
assert.deepEqual(browserErrors, []);
assert.deepEqual(failedRequests, []);

socket.close();
console.log("✓ Production routes, desktop/mobile layouts, search, family filtering, images, fallbacks, and quote UI verified");
