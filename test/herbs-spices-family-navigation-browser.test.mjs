import assert from "node:assert/strict";

const base = process.env.HERBS_PRODUCTS_BASE_URL ?? "http://localhost:3000";
const expectedFamilies = [
  ["herbs", "Herbs", 11],
  ["flowers", "Flowers", 3],
  ["seeds", "Seeds", 8],
  ["spices", "Spices", 2],
  ["roots", "Roots", 1],
  ["dehydrated-vegetables", "Dehydrated Vegetables", 2],
];

const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9333";
const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "A browser page target is required");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const browserProblems = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") browserProblems.push(message.params.exceptionDetails.text);
  if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
    browserProblems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
  }
});

function send(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, message, attempts = 150) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  assert.fail(message);
}

async function navigate(path) {
  await send("Page.navigate", { url: `${base}${path}` });
  await waitFor('document.readyState === "complete"', `Navigation to ${path} did not complete`);
  await new Promise((resolve) => setTimeout(resolve, 150));
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 760,
  });
}

async function assertFilteredFamily(id, label, count) {
  assert.equal(await evaluate("new URL(location.href).searchParams.get('family')"), id, `${label} query is preserved`);
  assert.equal(await evaluate(`document.querySelector('[aria-label="Filter catalogue by ingredient family"] button[aria-pressed="true"]')?.textContent`), label, `${label} filter is active`);
  assert.equal(await evaluate('document.querySelectorAll("[data-material-specimen]").length'), count, `${label} product count`);
  assert.equal(await evaluate(`[...document.querySelectorAll("[data-material-specimen]")].every((item) => item.dataset.family === ${JSON.stringify(id)})`), true, `${label} grid only contains its family`);
}

async function activateHomepageCard(id, label, mobile) {
  await navigate("/en/herbs-spices");
  const selector = `a[href="/en/herbs-spices/products?family=${id}"]`;
  await waitFor(`document.querySelector(${JSON.stringify(selector)}) !== null`, `${label} family link is missing`);
  const semantics = await evaluate(`(() => {
    const link = document.querySelector(${JSON.stringify(selector)});
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    link.scrollIntoView({ block: 'center' });
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    link.focus({ preventScroll: true });
    const linkRect = link.getBoundingClientRect();
    const mediaRect = link.querySelector('[data-media-key]').getBoundingClientRect();
    const headingRect = link.querySelector('h3').getBoundingClientRect();
    return {
      tag: link.tagName,
      focused: document.activeElement === link,
      coversMedia: linkRect.top <= mediaRect.top && linkRect.bottom >= mediaRect.bottom,
      coversHeading: linkRect.top <= headingRect.top && linkRect.bottom >= headingRect.bottom,
      cursor: getComputedStyle(link).cursor,
      center: { x: linkRect.left + linkRect.width / 2, y: linkRect.top + linkRect.height / 2 },
    };
  })()`);
  assert.deepEqual(
    { tag: semantics.tag, focused: semantics.focused, coversMedia: semantics.coversMedia, coversHeading: semantics.coversHeading, cursor: semantics.cursor },
    { tag: "A", focused: true, coversMedia: true, coversHeading: true, cursor: "pointer" },
    `${label} uses a full-card accessible link`,
  );

  if (mobile) {
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...semantics.center, radiusX: 1, radiusY: 1, force: 1 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } else {
    await send("Input.dispatchMouseEvent", { type: "mousePressed", ...semantics.center, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...semantics.center, button: "left", clickCount: 1 });
  }
  await waitFor(`location.pathname === "/en/herbs-spices/products" && new URL(location.href).searchParams.get("family") === ${JSON.stringify(id)}`, `${label} card did not navigate`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

for (const [width, height, mobile] of [[1440, 1000, false], [390, 844, true]]) {
  await setViewport(width, height);
  for (const [id, label, count] of expectedFamilies) {
    await activateHomepageCard(id, label, mobile);
    await waitFor(`document.querySelectorAll("[data-material-specimen]").length === ${count}`, `${label} grid did not settle at ${width}px`);
    await assertFilteredFamily(id, label, count);
  }
}

await setViewport(1440, 1000);
await navigate("/en/herbs-spices/products?family=seeds");
await assertFilteredFamily("seeds", "Seeds", 8);
await send("Page.reload");
await waitFor('document.readyState === "complete" && document.querySelectorAll("[data-material-specimen]").length === 8', "Refresh did not preserve Seeds");
await assertFilteredFamily("seeds", "Seeds", 8);

await navigate("/en/herbs-spices/products");
assert.equal(await evaluate('document.querySelectorAll("[data-material-specimen]").length'), 27, "Direct unfiltered route shows the full catalogue");
assert.equal(await evaluate(`document.querySelector('[aria-label="Filter catalogue by ingredient family"] button[aria-pressed="true"]')?.textContent`), "All", "Direct route activates All");

await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')].find((button) => button.textContent === "Flowers").click()`);
await waitFor('new URL(location.href).searchParams.get("family") === "flowers" && document.querySelectorAll("[data-material-specimen]").length === 3', "Flowers filter did not update the URL");
await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')].find((button) => button.textContent === "Spices").click()`);
await waitFor('new URL(location.href).searchParams.get("family") === "spices" && document.querySelectorAll("[data-material-specimen]").length === 2', "Spices filter did not update the URL");
await evaluate("history.back()");
await waitFor('new URL(location.href).searchParams.get("family") === "flowers" && document.querySelectorAll("[data-material-specimen]").length === 3', "Browser back did not restore Flowers");
await assertFilteredFamily("flowers", "Flowers", 3);
await evaluate("history.forward()");
await waitFor('new URL(location.href).searchParams.get("family") === "spices" && document.querySelectorAll("[data-material-specimen]").length === 2', "Browser forward did not restore Spices");
await assertFilteredFamily("spices", "Spices", 2);

const pageProblems = browserProblems.filter((problem) => !problem.includes("favicon.ico") && !problem.includes("was preloaded using link preload but not used"));
assert.deepEqual(pageProblems, [], `browser console problems: ${pageProblems.join(" | ")}`);
socket.close();
console.log("✓ All six family cards navigate and filter correctly at desktop and mobile viewports");
console.log("✓ Query refresh, direct unfiltered navigation, and browser back/forward passed");
console.log("✓ Full-card link semantics, focus, pointer behavior, and console checks passed");
