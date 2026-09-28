import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.PRODUCTS_BASE_URL ?? "http://localhost:3140";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9445";
const phase = process.env.DENSITY_PHASE ?? "after";
const shouldAssertFit = phase !== "before";
const outputDirectory = path.join(process.cwd(), "artifacts", "product-card-density", phase);
fs.mkdirSync(outputDirectory, { recursive: true });

const cases = [
  ["fresh", "produce:orange", "oranges"],
  ["fresh", "produce:fresh-mango", "mangoes"],
  ["fresh", "produce:potato", "potatoes"],
  ["fresh", "produce:fresh-artichoke", "artichokes"],
  ["frozen", "produce:iqf-mango", "iqf-mango"],
  ["frozen", "produce:mixed-vegetables", "mixed-vegetables"],
  ["frozen", "produce:half-fried-french-fries", "pre-fried-fries"],
  ["dried", "produce:dried-lemon", "dried-lemon"],
  ["dried", "produce:dehydrated-onion", "dehydrated-onion"],
];
const viewports = [
  [1920, 1200],
  [1440, 1000],
  [1024, 900],
  [768, 1024],
  [390, 844],
  [320, 720],
];

const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target?.webSocketDebuggerUrl, "a Chrome page target is required");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const task = pending.get(message.id);
  pending.delete(message.id);
  message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result);
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
  for (let attempt = 0; attempt < 240; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(label);
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
}

async function navigate(world, width) {
  const url = `${baseUrl}/en/products?world=${world}&density=${phase}-${width}-${Date.now()}`;
  await send("Page.navigate", { url });
  await waitFor('document.readyState === "complete"', `${url} did not load`);
  await waitFor('document.querySelectorAll(".export-card-scene").length > 0', `${url} rendered no cards`);
  await evaluate(`(() => {
    let style = document.querySelector('#density-qa-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'density-qa-style';
      style.textContent = '.export-card,.export-card-face{transition:none!important;animation:none!important}.global-navbar-capsule{visibility:hidden!important}';
      document.head.appendChild(style);
    }
  })()`);
}

async function screenshot(sceneSelector, filename) {
  const clip = await evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(sceneSelector)}).getBoundingClientRect();
    return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height, scale: 1 };
  })()`);
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip });
  fs.writeFileSync(path.join(outputDirectory, filename), Buffer.from(result.data, "base64"));
}

const measurements = [];
await send("Page.enable");
await send("Runtime.enable");

for (const [width, height] of viewports) {
  await setViewport(width, height);
  for (const world of ["fresh", "frozen", "dried"]) {
    await navigate(world, width);
    for (const [, productId, slug] of cases.filter(([candidateWorld]) => candidateWorld === world)) {
      const sceneSelector = `.export-card-scene[data-product-id="${productId}"]`;
      await waitFor(`document.querySelector(${JSON.stringify(sceneSelector)}) !== null`, `${productId} missing at ${width}px`);
      await evaluate(`document.querySelector(${JSON.stringify(sceneSelector)}).scrollIntoView({block:'center',behavior:'instant'})`);

      const front = await evaluate(`(() => {
        const scene = document.querySelector(${JSON.stringify(sceneSelector)});
        const card = scene.querySelector('.export-card');
        card.classList.remove('is-flipped');
        const face = scene.querySelector('.export-card-front');
        const title = face.querySelector('.export-card-title');
        const visual = face.querySelector('.export-card-visual');
        const faceRect = face.getBoundingClientRect();
        const visualRect = visual.getBoundingClientRect();
        return {
          height: scene.getBoundingClientRect().height,
          noOverflow: face.scrollHeight <= face.clientHeight + 1 && face.scrollWidth <= face.clientWidth + 1,
          titleFont: parseFloat(getComputedStyle(title).fontSize),
          titleLineHeight: parseFloat(getComputedStyle(title).lineHeight),
          visualInside: visualRect.bottom <= faceRect.bottom + 1,
        };
      })()`);
      if (shouldAssertFit) {
        assert.equal(front.noOverflow, true, `${productId} front overflows at ${width}px`);
        assert.equal(front.visualInside, true, `${productId} front visual escapes at ${width}px`);
      }

      if ((width === 1440 || width === 390 || width === 320) && productId === "produce:orange") {
        await screenshot(sceneSelector, `oranges-front-${width}.png`);
      }

      await evaluate(`document.querySelector(${JSON.stringify(sceneSelector)}).querySelector('.export-card-keyboard-toggle').click()`);
      await waitFor(
        `document.querySelector(${JSON.stringify(sceneSelector)})?.querySelector('.export-card')?.classList.contains('is-flipped') === true`,
        `${productId} did not flip at ${width}px`,
      );
      const back = await evaluate(`(() => {
        const scene = document.querySelector(${JSON.stringify(sceneSelector)});
        const face = scene.querySelector('.export-card-back');
        const rows = [...face.querySelectorAll('.export-spec-row')];
        const lastRow = rows.at(-1).getBoundingClientRect();
        const action = face.querySelector('.enquiry-notch');
        const actionRect = action.getBoundingClientRect();
        const faceRect = face.getBoundingClientRect();
        return {
          noOverflow: face.scrollHeight <= face.clientHeight + 1 && face.scrollWidth <= face.clientWidth + 1,
          noCollision: lastRow.bottom <= actionRect.top + 1,
          actionInside: actionRect.bottom <= faceRect.bottom + 1,
          actionHeight: actionRect.height,
          rowCount: rows.length,
          minLabelFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dt')).fontSize))),
          minValueFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dd')).fontSize))),
          maxValueLines: Math.max(...rows.map((row) => {
            const value = row.querySelector('dd');
            return Math.round(value.getBoundingClientRect().height / parseFloat(getComputedStyle(value).lineHeight));
          })),
        };
      })()`);
      if (shouldAssertFit) {
        assert.equal(back.noOverflow, true, `${productId} back overflows at ${width}px`);
        assert.equal(back.noCollision, true, `${productId} rows collide with CTA at ${width}px`);
        assert.equal(back.actionInside, true, `${productId} CTA escapes at ${width}px`);
        assert.ok(back.rowCount >= 6 && back.rowCount <= 7, `${productId} row count changed`);
        assert.ok(back.minLabelFont >= 10, `${productId} labels are too small at ${width}px`);
        assert.ok(back.minValueFont >= 12, `${productId} values are too small at ${width}px`);
        assert.ok(back.actionHeight >= 44, `${productId} CTA touch target is below 44px at ${width}px`);
      }

      if (width === 1440 || width === 390 || width === 320) await screenshot(sceneSelector, `${slug}-back-${width}.png`);

      await evaluate(`document.querySelector(${JSON.stringify(sceneSelector)}).querySelector('.export-card-keyboard-toggle').click()`);
      await waitFor(
        `document.querySelector(${JSON.stringify(sceneSelector)})?.querySelector('.export-card')?.classList.contains('is-flipped') === false`,
        `${productId} did not return to front at ${width}px`,
      );

      measurements.push({ phase, width, productId, front, back });
      console.log(`✓ ${phase} ${width}px ${productId}: front/back fit at ${front.height}px`);
    }
  }
}

fs.writeFileSync(path.join(outputDirectory, "metrics.json"), JSON.stringify(measurements, null, 2));
socket.close();
console.log(`✓ ${phase} density QA: ${measurements.length} front/back cases passed`);
