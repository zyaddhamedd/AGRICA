import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";

const base = process.env.PHASE7_BASE_URL ?? "http://localhost:3100";
const targets = await (await fetch("http://localhost:9333/json")).json();
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function navigate(path) {
  await send("Page.navigate", { url: `${base}${path}` });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate('document.readyState === "complete"')) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function waitFor(expression, message) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

async function capture(name) {
  if (!process.env.PHASE7_SCREENSHOTS) return;
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${process.env.PHASE7_SCREENSHOTS}/${name}.png`, Buffer.from(shot.data, "base64"));
}

async function assertFamilyLayout(width, expectedColumns, expectedRows, minDiameter, maxDiameter) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width <= 680 });
  const metrics = await evaluate(`(() => {
    const items = [...document.querySelectorAll("#ingredient-families li")];
    const circles = [...document.querySelectorAll('#ingredient-families [data-media-key^="family-"]')];
    const roundedUnique = (values) => new Set(values.map((value) => Math.round(value))).size;
    return {
      columns: roundedUnique(items.map((item) => item.getBoundingClientRect().left)),
      rows: roundedUnique(items.map((item) => item.getBoundingClientRect().top)),
      diameters: circles.map((circle) => {
        const rect = circle.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  })()`);
  assert.equal(metrics.columns, expectedColumns, `${width}px family grid column count`);
  assert.equal(metrics.rows, expectedRows, `${width}px family grid row count`);
  assert.equal(metrics.overflow, false, `${width}px family grid creates no horizontal overflow`);
  assert.equal(metrics.diameters.every(({ width: circleWidth, height }) => Math.abs(circleWidth - height) <= 1), true, `${width}px family media remain circular`);
  assert.equal(metrics.diameters.every(({ width: circleWidth }) => circleWidth >= minDiameter && circleWidth <= maxDiameter), true, `${width}px family circle diameter is in range`);
  await evaluate('document.querySelector("#ingredient-families").scrollIntoView({ block: "center" })');
  await capture(`families-${width}`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await navigate("/herbs-spices/standard");

assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1, "page has one H1");
assert.equal(await evaluate('document.querySelectorAll("[data-process-stage]").length'), 6, "six stages render");
assert.equal(await evaluate('document.querySelectorAll("[data-process-stage] [data-media-status=fallback]").length'), 6, "six process media fallbacks render");
assert.equal(await evaluate('document.querySelectorAll("[data-process-stage] img").length'), 0, "pending process paths do not create broken images");
assert.equal(await evaluate(`document.querySelectorAll('nav[aria-label="Process stages"] a').length`), 6, "six progress links render");
assert.equal(await evaluate('document.querySelector("meta[name=robots]")?.content'), "noindex, nofollow");
assert.equal(await evaluate('document.querySelector("a[aria-label*=Produce]")?.getAttribute("href")'), "/standard", "switch maps to Produce Standard");
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "desktop has no horizontal overflow");
await capture("desktop");

await evaluate(`document.querySelector('a[href="#stage-04"]').click()`);
await waitFor(`document.querySelector('a[href="#stage-04"]').getAttribute("aria-current") === "step"`, "progress did not activate Stage 04");
assert.equal(await evaluate('location.hash'), "#stage-04", "stage links use native anchors");
assert.equal(await evaluate(`document.querySelector('a[href="#stage-04"] em')?.textContent`), "Current", "active state has visible text");

await evaluate('document.querySelector("button[aria-controls=herbs-spices-menu]").click()');
await waitFor('document.querySelector("#herbs-spices-menu") !== null', "menu did not open");
assert.equal(await evaluate('document.querySelector("#herbs-spices-menu a[aria-current=page]")?.textContent.includes("Process")'), true, "menu marks Process current");
assert.equal(await evaluate('document.activeElement?.textContent.includes("Close")'), true, "menu receives focus");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
await waitFor('document.querySelector("#herbs-spices-menu") === null', "Escape did not close menu");

await send("Emulation.setDeviceMetricsOverride", { width: 820, height: 1000, deviceScaleFactor: 1, mobile: false });
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "tablet has no horizontal overflow");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "mobile has no horizontal overflow");
assert.equal(await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Process stages"] ol')).display`), "none", "mobile uses compact reader");
assert.equal(await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Process stages"] > p')).display`), "flex");
await evaluate('window.scrollTo(0,0)');
await capture("mobile");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
assert.ok(Number.parseFloat(await evaluate(`getComputedStyle(document.querySelector('nav[aria-label="Process stages"] a')).transitionDuration`)) <= .001, "reduced motion disables progress transitions");

await send("Emulation.clearDeviceMetricsOverride");
await navigate("/standard");
assert.equal(await evaluate('document.querySelector("a[aria-label*=Herbs]")?.getAttribute("href")'), "/herbs-spices/standard", "switch maps to Herbs & Spices Standard");
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await navigate("/herbs-spices");
assert.equal(await evaluate(`document.querySelector('a[href="/herbs-spices/standard"]')?.textContent.includes("View the process")`), true, "homepage teaser links to Process");
assert.equal(await evaluate('document.querySelectorAll("main > section").length'), 6, "homepage sections remain intact");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-families ul > li").length'), 6, "six source-backed families render as a semantic list");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-families article").length'), 0, "family specimens no longer use editorial cards");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-families li a, #ingredient-families li button, #ingredient-families li [tabindex]").length'), 0, "static family specimens create no tab stops");
assert.equal(await evaluate('document.querySelector("[data-media-key=hero-primary]")?.getAttribute("data-media-status")'), "approved", "approved hero media renders");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-families [data-media-status=approved]").length'), 6, "six approved family images render");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-families img").length'), 6, "family specimens use next/image");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-families img")].every(image => image.alt.trim().length > 0)'), true, "family images have meaningful alternative text");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-families img")].every(image => image.loading === "lazy")'), true, "family images remain lazy rather than competing with the hero");
assert.equal(await evaluate('document.querySelectorAll("[data-media-key=hero-primary] img").length'), 1, "hero uses next/image");
assert.equal(await evaluate('document.querySelector("[data-media-key=hero-primary] img").complete && document.querySelector("[data-media-key=hero-primary] img").naturalWidth > 0'), true, "hero image loads successfully");
await evaluate('document.querySelector("#ingredient-families").scrollIntoView()');
await waitFor('[...document.querySelectorAll("#ingredient-families img")].every(image => image.complete && image.naturalWidth > 0)', "family images did not load successfully");
await assertFamilyLayout(1440, 3, 2, 279, 281);
await assertFamilyLayout(1024, 2, 3, 229, 231);
await assertFamilyLayout(768, 2, 3, 199, 201);
await assertFamilyLayout(680, 2, 3, 155, 157);
await assertFamilyLayout(390, 2, 3, 155, 157);
await assertFamilyLayout(320, 2, 3, 127, 129);
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 1000, deviceScaleFactor: 1, mobile: true });
await evaluate('document.documentElement.style.fontSize = "200%"');
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "family layout has no horizontal overflow at 200% text sizing");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-families h3")].every(label => label.scrollWidth <= label.clientWidth && label.scrollHeight <= label.clientHeight)'), true, "family labels do not clip at 200% text sizing");
await evaluate('document.documentElement.style.removeProperty("font-size")');
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
assert.equal(await evaluate('document.querySelectorAll("#ingredient-forms nav button").length'), 5, "five source-backed form controls render");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-forms [data-media-status=approved]").length'), 5, "five approved form images render");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-forms img")].every(image => image.loading === "lazy")'), true, "reel images remain lazy rather than competing with the hero");
assert.equal(await evaluate('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent'), "Whole", "Whole is initially active");
assert.equal(await evaluate(`document.querySelector('#ingredient-forms button[aria-label="Previous material form"]').disabled`), true, "previous is disabled at the first state");
await evaluate('document.querySelectorAll("#ingredient-forms nav button")[2].click()');
assert.equal(await evaluate('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent'), "TBC (Tea Bag Cut)", "selector activates TBC");
assert.equal(await evaluate('document.querySelector("#material-expression-stage")?.getAttribute("aria-label")'), "Current material form: TBC (Tea Bag Cut)", "current form remains accessible");
await evaluate('document.querySelector("#ingredient-forms nav button[aria-pressed=true]").focus()');
assert.equal(await evaluate('document.activeElement === document.querySelector("#ingredient-forms nav button[aria-pressed=true]")'), true, "active form control receives focus");
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 39 });
assert.equal(await evaluate('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent'), "Crushed", "arrow keys advance the active form");
await evaluate('[...document.querySelectorAll("#ingredient-forms nav button")].forEach(button => button.click())');
assert.equal(await evaluate('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent'), "Powder", "rapid switching settles on the last selection");
assert.equal(await evaluate(`document.querySelector('#ingredient-forms button[aria-label="Next material form"]').disabled`), true, "next is disabled at the final state");
await evaluate('document.querySelectorAll("#ingredient-forms nav button")[0].click()');
await evaluate('document.querySelector("#material-expression-stage").scrollIntoView({ block: "center" })');
await capture("material-reel-desktop");
const desktopReel = await evaluate('(() => { const rect = document.querySelector("#material-expression-stage").getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()');
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: desktopReel.x, y: desktopReel.y, button: "left", buttons: 1, clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: desktopReel.x - 160, y: desktopReel.y, button: "left", buttons: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: desktopReel.x - 160, y: desktopReel.y, button: "left", buttons: 0, clickCount: 1 });
await waitFor('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent === "Cut & Sifted"', "desktop mouse drag did not advance the reel");
await evaluate('document.querySelector("#ingredient-forms").scrollIntoView()');
await waitFor('[...document.querySelectorAll("#ingredient-forms img")].every(image => image.complete && image.naturalWidth > 0)', "form images did not load successfully");
assert.deepEqual(await evaluate('[...document.querySelectorAll("#start-a-trade select[name=category] option:not([disabled])")].map(option=>option.textContent)'), ["Herbs","Flowers","Seeds","Spices","Roots","Dehydrated Vegetables"], "trade categories use catalogue families");
assert.deepEqual(await evaluate('[...document.querySelectorAll("#start-a-trade select[name=format] option:not([disabled])")].map(option=>option.textContent)'), ["Whole","Cut & Sifted","TBC (Tea Bag Cut)","Crushed","Powder"], "trade forms use division forms");
assert.equal(await evaluate('document.querySelector("header") !== null && document.querySelector("footer") !== null'), true, "homepage shell remains intact");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "homepage mobile has no horizontal overflow");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-families li")].every(item => item.getBoundingClientRect().right <= window.innerWidth)'), true, "family specimens fit the mobile viewport");
assert.notEqual(await evaluate('getComputedStyle(document.querySelector("#ingredient-forms nav")).display'), "none", "mobile keeps the compact reel selector");
assert.equal(await evaluate('document.querySelectorAll("#ingredient-forms [data-reel-item]").length'), 5, "mobile uses the same five-item reel DOM");
assert.equal(await evaluate('[...document.querySelectorAll("#ingredient-forms [data-reel-item]")].every(item => item.offsetTop === document.querySelector("#ingredient-forms [data-reel-item]").offsetTop)'), true, "mobile reel remains horizontal");
assert.ok(await evaluate('document.querySelector("#ingredient-forms [data-reel-item]").getBoundingClientRect().width / innerWidth') >= .82, "mobile active material is at least 82vw");
assert.ok(await evaluate('document.querySelector("#ingredient-forms [data-reel-item]").getBoundingClientRect().width / innerWidth') <= .88, "mobile active material is at most 88vw");
assert.equal(await evaluate('getComputedStyle(document.querySelector("#material-expression-stage")).touchAction'), "pan-y", "mobile reel preserves vertical page scrolling");
await evaluate('document.querySelectorAll("#ingredient-forms nav button")[0].click()');
await evaluate('document.querySelector("#material-expression-stage").scrollIntoView({ block: "center" })');
await capture("material-reel-mobile");
const mobileReel = await evaluate('(() => { const rect = document.querySelector("#material-expression-stage").getBoundingClientRect(); return { x: rect.x + rect.width * .72, y: rect.y + rect.height * .5 }; })()');
await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: mobileReel.x, y: mobileReel.y, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: mobileReel.x - 120, y: mobileReel.y + 2, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await waitFor('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent === "Cut & Sifted"', "mobile swipe did not advance the reel");
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "mobile reel creates no page overflow");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
assert.ok(Number.parseFloat(await evaluate('getComputedStyle(document.querySelector("#ingredient-families img")).transitionDuration')) <= .001, "reduced motion disables family image transitions");
assert.equal(await evaluate('getComputedStyle(document.querySelector("#ingredient-families img")).transform'), "none", "reduced motion disables family image transforms");
await evaluate('document.querySelectorAll("#ingredient-forms nav button")[4].click()');
await waitFor('document.querySelector("#ingredient-forms button[aria-pressed=true] strong")?.textContent === "Powder"', "reduced motion keeps every state accessible");
await send("Emulation.clearDeviceMetricsOverride");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

const pageProblems = browserProblems.filter((problem) => (
  !problem.endsWith("/favicon.ico")
  && !problem.includes("was preloaded using link preload but not used")
));
assert.deepEqual(pageProblems, [], `browser console problems: ${pageProblems.join(" | ")}`);
socket.close();
console.log("✓ Phase 7 process, progress, menu, and keyboard checks passed");
console.log("✓ Desktop, tablet, mobile, and reduced-motion checks passed");
console.log("✓ Standard switch mapping and homepage linkage passed");
