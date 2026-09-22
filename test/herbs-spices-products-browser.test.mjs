import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const base = process.env.HERBS_PRODUCTS_BASE_URL ?? "http://localhost:3000";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9333";
const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "A browser page target is required");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
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
  if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) browserProblems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
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

async function waitFor(expression, message, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  assert.fail(message);
}

async function navigate(path) {
  await send("Page.navigate", { url: `${base}${path}` });
  await waitFor('document.readyState === "complete"', `Navigation to ${path} did not complete`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function capture(name) {
  if (!process.env.HERBS_PRODUCTS_SCREENSHOTS) return;
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${process.env.HERBS_PRODUCTS_SCREENSHOTS}/${name}.png`, Buffer.from(shot.data, "base64"));
}

async function setViewport(width, height = 1000) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 760 });
  await new Promise((resolve) => setTimeout(resolve, 80));
}

async function setSearch(value) {
  await evaluate(`(() => {
    const input = document.querySelector("#herbs-spices-search");
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
}

async function assertGrid(width, columns, minDiameter, maxDiameter) {
  await setViewport(width);
  const metrics = await evaluate(`(() => {
    const items = [...document.querySelectorAll("[data-material-specimen]")];
    const circles = items.map((item) => item.querySelector("[data-media-key]"));
    return {
      columns: new Set(items.map((item) => Math.round(item.getBoundingClientRect().left))).size,
      diameters: circles.map((circle) => ({ width: circle.getBoundingClientRect().width, height: circle.getBoundingClientRect().height })),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  })()`);
  assert.equal(metrics.columns, columns, `${width}px product column count`);
  assert.equal(metrics.overflow, false, `${width}px catalogue has no horizontal overflow`);
  assert.equal(metrics.diameters.every(({ width: circleWidth, height }) => Math.abs(circleWidth - height) <= 1), true, `${width}px product media remain circular`);
  assert.equal(metrics.diameters.every(({ width: circleWidth }) => circleWidth >= minDiameter && circleWidth <= maxDiameter), true, `${width}px circle diameter is in range`);
  await evaluate('document.querySelector("[data-material-grid]").scrollIntoView({ block: "start" })');
  await capture(`products-${width}`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await setViewport(1440, 1000);
await navigate("/en/herbs-spices/products");

assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1, "catalogue has one H1");
assert.equal(await evaluate('document.querySelector("meta[name=robots]")?.content'), "noindex, nofollow", "catalogue remains noindex");
assert.equal(await evaluate('document.querySelectorAll("[data-material-grid]").length'), 1, "one semantic material grid renders");
assert.equal(await evaluate('document.querySelectorAll("[data-material-specimen]").length'), 27, "all 27 source-backed products render");
assert.equal(await evaluate('document.querySelectorAll("[data-material-specimen] [data-media-status=fallback]").length'), 15, "pending product media use intentional fallbacks");
assert.equal(await evaluate('document.querySelectorAll("[data-material-specimen] img").length'), 12, "approved product media render without changing pending fallbacks");
assert.deepEqual(await evaluate('[...document.querySelectorAll("[data-material-specimen] h3")].slice(0,4).map((heading) => heading.textContent)'), ["Basil", "Dill", "Lemon Grass", "Marjoram"], "catalogue order is preserved");

await assertGrid(1440, 4, 215, 217);
await assertGrid(1024, 3, 189, 191);
await assertGrid(390, 2, 147, 149);
await assertGrid(320, 2, 125, 127);
await setViewport(1440, 1000);

await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "Basil reveal did not open");
assert.equal(await evaluate('document.querySelector("#view-material-basil").getAttribute("aria-expanded")'), "true", "view control exposes expanded state");
assert.equal(await evaluate('document.querySelectorAll("[data-material-reveal]").length'), 1, "only one reveal tree is mounted");
assert.equal(await evaluate('document.querySelector("[data-material-reveal=basil]").textContent.includes("Technical specifications and samples are available upon request.")'), true, "safe technical copy is shown");
assert.equal(await evaluate('document.querySelector("[data-material-reveal=basil]").textContent.includes("Available forms")'), false, "unverified forms are not shown for Basil");
assert.equal(await evaluate('document.querySelector("[data-material-reveal=basil] [data-media-key]")'), null, "inline reveal does not repeat product media");
assert.equal(await evaluate('document.querySelector("[data-material-specimen=basil] > [data-material-reveal=basil]") !== null'), true, "inline reveal belongs to the selected specimen");
assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-material-reveal=basil]")).backgroundColor'), "rgba(0, 0, 0, 0)", "inline reveal keeps the warm-paper catalogue surface");
if (process.env.HERBS_PRODUCTS_SCREENSHOTS) await new Promise((resolve) => setTimeout(resolve, 850));
await evaluate('document.querySelector("[data-material-reveal=basil]").scrollIntoView({ block: "start" })');
await capture("products-reveal-desktop");

await evaluate(`document.querySelector('button[aria-label="Add Basil to enquiry"]').click()`);
assert.equal(await evaluate(`document.querySelector('button[aria-label="Remove Basil from enquiry"]')?.getAttribute("aria-pressed")`), "true", "collapsed enquiry action shows selected state");
assert.equal(await evaluate('document.querySelector("button[aria-controls=herbs-spices-enquiry] strong")?.textContent'), "1", "enquiry dock count updates");

assert.equal(await evaluate('document.querySelector("#view-material-basil").textContent.trim()'), "Hide material", "expanded specimen uses the Hide Material label");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal]") === null', "reveal did not close");

await evaluate('document.querySelector("#view-material-basil").click(); document.querySelector("#view-material-dill").click(); document.querySelector("#view-material-oregano").click()');
await waitFor('document.querySelector("[data-material-reveal=oregano]") !== null', "rapid switching did not settle on the latest material");
assert.equal(await evaluate('document.querySelectorAll("[data-material-reveal]").length'), 1, "rapid switching leaves one reveal");

await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')].find((button) => button.textContent === "Flowers").click()`);
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 3 && document.querySelector("[data-material-reveal]") === null', "filter did not close excluded reveal and show Flowers");
assert.equal(await evaluate('[...document.querySelectorAll("[data-material-specimen]")].every((item) => item.getAttribute("data-family") === "flowers")'), true, "family filter shows only Flowers");

await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')].find((button) => button.textContent === "All").click()`);
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "All filter did not restore catalogue");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "Basil reveal did not reopen");
await setSearch("O");
await setSearch("On");
await setSearch("Onion");
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 1 && document.querySelector("[data-material-reveal]") === null', "search did not close excluded reveal and show Onion");
assert.equal(await evaluate('document.querySelector("[data-material-specimen] h3")?.textContent'), "Onion", "product-name search remains functional");

await evaluate('document.querySelector("#view-material-onion").click()');
await waitFor('document.querySelector("[data-material-reveal=onion]") !== null', "Onion reveal did not open");
assert.equal(await evaluate('document.querySelector("[data-material-reveal=onion]").textContent.includes("Flakes · Granules · Powder")'), true, "verified Onion forms are shown");
assert.equal(await evaluate('document.querySelector("[data-material-reveal=onion]").textContent.includes("MOQ")'), false, "unverified commercial fields are absent");
await evaluate('document.querySelector("#view-material-onion").click()');
await waitFor('document.querySelector("[data-material-reveal]") === null', "Onion reveal did not close");

await setSearch("Powder");
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 1', "confirmed-form search did not find Onion");
await setSearch("not-a-material");
await waitFor('document.querySelector("[data-material-grid]") === null && document.body.textContent.includes("No materials match this view.")', "empty state did not render");
await evaluate('[...document.querySelectorAll("button")].find((button) => button.textContent === "Reset catalogue").click()');
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "empty-state reset did not restore catalogue");

await evaluate('document.querySelector("#view-material-basil").focus()');
assert.equal(await evaluate('document.activeElement?.id'), "view-material-basil", "view control receives keyboard focus");
assert.equal(await evaluate('document.activeElement?.tagName'), "BUTTON", "view control retains native Enter and Space semantics");
await send("Page.bringToFront");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "Enter did not open the focused material control");
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await waitFor('document.querySelector("[data-material-reveal]") === null', "Escape did not close the material reveal");
assert.equal(await evaluate('document.activeElement?.id'), "view-material-basil", "Escape restores focus predictably");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " ", unmodifiedText: " ", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "Space did not open the focused material control");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal]") === null', "Space-opened material reveal did not close");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "reduced-motion reveal did not open");
assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-material-reveal=basil]")).height !== "0px"'), true, "reduced-motion reveal is immediately visible");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal]") === null', "reduced-motion reveal did not close immediately");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

await setViewport(390, 844);
assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, "mobile catalogue has no horizontal overflow");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal=basil]") !== null', "mobile material reveal did not open");
if (process.env.HERBS_PRODUCTS_SCREENSHOTS) await new Promise((resolve) => setTimeout(resolve, 850));
await evaluate('document.querySelector("[data-material-reveal=basil]").scrollIntoView({ block: "start" })');
await capture("products-reveal-mobile");
await evaluate('document.querySelector("#view-material-basil").click()');
await waitFor('document.querySelector("[data-material-reveal]") === null', "mobile material reveal did not close");
await setViewport(320, 844);
assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, "narrow mobile catalogue has no horizontal overflow");

const pageProblems = browserProblems.filter((problem) => !problem.endsWith("/favicon.ico") && !problem.includes("was preloaded using link preload but not used"));
assert.deepEqual(pageProblems, [], `browser console problems: ${pageProblems.join(" | ")}`);
socket.close();
console.log("✓ Herbs & Spices circular catalogue layout passed at 1440, 1024, 390, and 320px");
console.log("✓ Material Reveal open, close, rapid switching, keyboard, and reduced-motion checks passed");
console.log("✓ Family filtering, search, empty state, verified forms, and enquiry synchronization passed");
