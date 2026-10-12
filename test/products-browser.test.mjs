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
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
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
  const marker = `nav-${Date.now()}-${Math.random()}`;
  await evaluate(`document.body.dataset.browserTestNavigation = ${JSON.stringify(marker)}`);
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await waitFor(
    `document.body?.dataset.browserTestNavigation !== ${JSON.stringify(marker)}`,
    `${path} did not commit navigation`,
  );
  await waitFor('document.readyState === "complete"', `${path} did not load`);
  await waitFor(
    `document.querySelector(".products-page")?.dataset.world === ${JSON.stringify(world)}`,
    `${path} did not activate ${world}`,
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
  await send("Emulation.setTouchEmulationEnabled", {
    enabled: width < 700,
    maxTouchPoints: width < 700 ? 5 : 1,
  });
}

async function touchTap(selector) {
  const point = await evaluate(`(async () => {
    const element = document.querySelector(${JSON.stringify(selector)});
    document.documentElement.style.scrollBehavior = 'auto';
    element.scrollIntoView({ block: 'center' });
    await new Promise((resolve) => setTimeout(resolve, 700));
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...point, id: 1 }] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
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
    { path: "/en/products", world: "fresh", count: 21 },
    { path: "/en/products?world=fresh", world: "fresh", count: 21 },
    { path: "/en/products?world=frozen", world: "frozen", count: 13 },
  ]) {
    await navigate(route.path, route.world);
    await waitFor(
      `document.querySelectorAll(".atlas-grid > .export-card-scene").length === ${route.count}`,
      `${route.path} did not render ${route.count} cards on ${viewport.label}`,
    );
    assert.equal(
      await evaluate("document.documentElement.scrollWidth <= window.innerWidth"),
      true,
      `${route.path} has horizontal overflow on ${viewport.label}`,
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
await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 12', "IQF search did not return 12 products");

await evaluate(`(() => {
  const input = document.querySelector("#minimal-search-input");
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "");
  input.dispatchEvent(new Event("input", { bubbles: true }));
})()`);
await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13', "clearing search did not restore Frozen products");

await evaluate(`[...document.querySelectorAll(".taxonomy-item")]
  .find((element) => element.textContent.includes("Frozen Potato Products")).click()`);
await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 1', "FPP family filter failed");
assert.equal(await evaluate('document.querySelector(".export-card-title").textContent'), "Pre-fried Frozen French Fries");

await navigate("/en/products?world=fresh", "fresh");
await evaluate('document.querySelector(".export-card-quote").click()');
await waitFor('document.querySelector(".quote-count").textContent === "1"', "quote add failed");
await evaluate('document.querySelector(".export-card-quote").click()');
await waitFor('document.querySelector(".quote-count").textContent === "0"', "quote remove failed");

await evaluate('document.querySelector("[data-product-id=\\"produce:fresh-strawberry\\"] .export-card-keyboard-toggle").click()');
await waitFor(
  'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
  "desktop expanded card did not open",
);
assert.deepEqual(
  await evaluate(`(() => {
    const card = document.querySelector('.export-card-back.is-expanded');
    const title = getComputedStyle(card.querySelector('.export-card-back-title'));
    const reference = getComputedStyle(document.querySelector('.hero-compact-title em'));
    return [
      card.querySelectorAll('.export-spec-group').length,
      card.querySelectorAll('.export-spec-row').length,
      title.fontFamily === reference.fontFamily,
      title.fontStyle === reference.fontStyle,
      title.fontWeight === reference.fontWeight,
      getComputedStyle(document.body).position,
    ];
  })()`),
  [3, 13, true, true, true, "fixed"],
  "expanded desktop card should preserve all fields, editorial typography, and scroll lock",
);
await evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
await waitFor('document.querySelector("#product-card-flight-dialog") === null', "Escape did not close expanded card");

await setViewport(390, 844);
await navigate("/en/products?world=fresh", "fresh");
await touchTap('[data-product-id="produce:fresh-strawberry"] .export-card');
await waitFor(
  'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
  "mobile touch did not open expanded card",
);
const mobileExpansion = await evaluate(`(() => {
  const card = document.querySelector('.export-card-back.is-expanded');
  const specs = card.querySelector('.export-spec-table.is-expanded');
  const rect = card.getBoundingClientRect();
  specs.scrollTop = specs.scrollHeight;
  return {
    inside: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
    oneColumn: getComputedStyle(specs).gridTemplateColumns.split(' ').length === 1,
    endReachable: specs.scrollHeight <= specs.clientHeight + 1 || specs.scrollTop > 0,
  };
})()`);
assert.deepEqual(mobileExpansion, { inside: true, oneColumn: true, endReachable: true });
await touchTap('#product-card-flight-dialog .enquiry-notch');
await waitFor('document.querySelector(".quote-count").textContent === "1"', "expanded mobile enquiry action failed");
await touchTap('#product-card-flight-dialog .export-card-flight-close');
await waitFor('document.querySelector("#product-card-flight-dialog") === null', "mobile touch close failed");

await navigate("/ar/products?world=frozen", "frozen");
await touchTap('[data-product-id="produce:iqf-strawberry"] .export-card');
await waitFor(
  'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
  "Arabic mobile card did not open",
);
assert.deepEqual(
  await evaluate(`(() => {
    const row = document.querySelector('#product-card-flight-dialog .export-spec-row');
    return [document.documentElement.dir, getComputedStyle(row.querySelector('dt')).direction, row.querySelector('dd').dir];
  })()`),
  ["rtl", "rtl", "ltr"],
  "Arabic labels should remain RTL while technical values remain LTR",
);
await touchTap('#product-card-flight-dialog .export-card-flight-close');
await waitFor('document.querySelector("#product-card-flight-dialog") === null', "Arabic mobile close failed");

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
