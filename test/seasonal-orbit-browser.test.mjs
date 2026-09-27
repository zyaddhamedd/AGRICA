import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.SEASON_BASE_URL ?? "http://localhost:3128";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9334";
const outputDirectory = path.join(process.cwd(), "artifacts", "season-editorial-orbit");
fs.mkdirSync(outputDirectory, { recursive: true });

const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page" && entry.url.startsWith("http"));
assert.ok(target?.webSocketDebuggerUrl, "a browser page target is required");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const problems = [];
const expectedCairoMonth = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  timeZone: "Africa/Cairo",
}).format(new Date());
let navigationSequence = 0;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") problems.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    problems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    problems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
  }
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

async function waitFor(expression, label) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(label);
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
}

async function navigate(route) {
  const [pathname, hash = ""] = route.split("#");
  navigationSequence += 1;
  const url = `${baseUrl}${pathname}?season-review=${navigationSequence}${hash ? `#${hash}` : ""}`;
  await evaluate(`location.assign(${JSON.stringify(url)})`);
  await waitFor(
    `location.href === ${JSON.stringify(url)} && document.readyState !== "loading" && document.querySelector('[data-season-orbit]') !== null`,
    `${route} did not load the Editorial Orbit`,
  );
  await waitFor(
    `document.querySelector('#seasons')?.dataset.selectedMonth === ${JSON.stringify(expectedCairoMonth)}`,
    `${route} did not select the current Cairo month after hydration`,
  );
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(path.join(outputDirectory, name), Buffer.from(result.data, "base64"));
}

async function sectionScreenshot(name) {
  await evaluate(`document.querySelectorAll('.skip-link, nextjs-portal').forEach((node) => { node.dataset.reviewVisibility = node.style.visibility; node.style.visibility = 'hidden'; })`);
  const clip = await evaluate(`(() => {
    const rect = document.querySelector('#seasons').getBoundingClientRect();
    return { x: 0, y: rect.top + scrollY, width: document.documentElement.clientWidth, height: rect.height, scale: 1 };
  })()`);
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
  fs.writeFileSync(path.join(outputDirectory, name), Buffer.from(result.data, "base64"));
  await evaluate(`document.querySelectorAll('.skip-link, nextjs-portal').forEach((node) => { node.style.visibility = node.dataset.reviewVisibility; delete node.dataset.reviewVisibility; })`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await new Promise((resolve) => setTimeout(resolve, 100));
problems.length = 0;

const viewports = [
  [1920, 1200],
  [1440, 1000],
  [1024, 900],
  [768, 1024],
  [390, 844],
  [320, 720],
];

for (const [width, height] of viewports) {
  await setViewport(width, height);
  await navigate("/en#seasons");
  const metrics = await evaluate(`(() => {
    const orbit = document.querySelector('[data-season-orbit]');
    const panel = orbit.nextElementSibling;
    const section = orbit.closest('section');
    const header = section.querySelector('header');
    const layout = orbit.parentElement;
    const sectionRect = section.getBoundingClientRect();
    const buttons = [...orbit.querySelectorAll('button')];
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      buttonCount: buttons.length,
      pressedCount: buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length,
      supportingCount: Number(panel.dataset.supportingCount),
      hasRemovedUi: /Featured crop|Next month|Explore fresh products|Research baseline/i.test(section.innerText),
      sectionHeight: section.getBoundingClientRect().height,
      verticalRhythm: {
        header: [header.getBoundingClientRect().top - sectionRect.top, header.getBoundingClientRect().bottom - sectionRect.top],
        layout: [layout.getBoundingClientRect().top - sectionRect.top, layout.getBoundingClientRect().bottom - sectionRect.top],
      },
      sectionRight: section.getBoundingClientRect().right,
      orbit: orbit.getBoundingClientRect().toJSON(),
      panel: panel.getBoundingClientRect().toJSON(),
    };
  })()`);

  assert.ok(metrics.scrollWidth <= metrics.innerWidth, `${width}px has no horizontal overflow`);
  assert.equal(metrics.buttonCount, 12, `${width}px renders all twelve month buttons`);
  assert.equal(metrics.pressedCount, 1, `${width}px has exactly one selected month`);
  assert.ok(metrics.supportingCount <= 3, `${width}px limits supporting crops to three`);
  assert.equal(metrics.hasRemovedUi, false, `${width}px omits the removed secondary UI`);
  assert.ok(metrics.sectionRight <= width + 1, `${width}px seasonal section remains inside the viewport`);
  console.log(`Season section at ${width}px: ${Math.round(metrics.sectionHeight)}px high`);
  if (width === 1440 || width === 390) console.log(`Vertical rhythm at ${width}px: ${JSON.stringify(metrics.verticalRhythm)}`);
  if (width > 820) assert.ok(metrics.panel.x > metrics.orbit.x, `${width}px keeps the editorial panel beside the orbit`);
  if (width <= 820) assert.ok(metrics.panel.y >= metrics.orbit.y + metrics.orbit.height, `${width}px stacks details below the orbit`);

  await evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('[data-season-orbit]').scrollIntoView({block:${JSON.stringify(width <= 820 ? "start" : "center")}, behavior:'auto'});
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 120));
  await screenshot(`orbit-en-${width}.png`);
  if (width === 1440 || width === 390) await sectionScreenshot(`orbit-refined-en-${width}-full.png`);
}

await setViewport(1024, 900);
await navigate("/en#seasons");
await evaluate(`document.querySelectorAll('[data-season-orbit] button')[7].click()`);
await waitFor(`document.querySelector('#seasons').dataset.selectedMonth === '8'`, "August selection did not update");
assert.equal(await evaluate(`document.querySelector('#season-selected-month').textContent`), "August");
assert.equal(await evaluate(`document.querySelector('#seasons').innerText.includes('Mangoes')`), true);
await evaluate(`document.querySelector('[data-season-orbit] button[aria-pressed="true"]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
await waitFor(`document.querySelector('#seasons').dataset.selectedMonth === '9'`, "keyboard navigation did not advance to September");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
assert.equal(
  await evaluate(`getComputedStyle(document.querySelector('[data-season-orbit] [role="img"]')).animationName`),
  "none",
  "reduced motion disables the hero reveal",
);
await send("Emulation.setEmulatedMedia", { features: [] });

await setViewport(390, 844);
await navigate("/ar#seasons");
assert.equal(await evaluate(`document.documentElement.dir`), "rtl", "Arabic remains RTL");
assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), "Arabic mobile has no horizontal overflow");
assert.equal(await evaluate(`document.querySelectorAll('[data-season-orbit] button').length`), 12, "Arabic keeps the full orbit");
await evaluate(`(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  document.querySelector('[data-season-orbit]').scrollIntoView({block:'start', behavior:'auto'});
})()`);
await new Promise((resolve) => setTimeout(resolve, 120));
await screenshot("orbit-ar-390.png");

const actionable = problems.filter((item) => !item.includes("favicon.ico") && !item.includes("preloaded using link preload"));
assert.deepEqual(actionable, [], `browser console problems: ${actionable.join(" | ")}`);

socket.close();
console.log("Editorial Orbit responsive, interaction, keyboard, RTL, reduced-motion, and console validation passed.");
