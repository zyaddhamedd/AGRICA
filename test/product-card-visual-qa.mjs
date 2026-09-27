import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.PRODUCTS_BASE_URL ?? "http://localhost:3128";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9445";
const outputDirectory = path.join(process.cwd(), "artifacts", "product-card-qa");
fs.mkdirSync(outputDirectory, { recursive: true });

const cases = [
  ["fresh", "produce:orange", "oranges"],
  ["fresh", "produce:fresh-artichoke", "artichokes"],
  ["fresh", "produce:fresh-mango", "mangoes"],
  ["fresh", "produce:potato", "potatoes"],
  ["frozen", "produce:iqf-mango", "iqf-mango"],
  ["frozen", "produce:iqf-artichoke", "iqf-artichokes"],
  ["frozen", "produce:mixed-vegetables", "mixed-vegetables"],
  ["frozen", "produce:half-fried-french-fries", "pre-fried-fries"],
  ["dried", "produce:dried-lemon", "dried-lemon"],
  ["dried", "produce:dehydrated-onion", "dehydrated-onion"],
  ["dried", "produce:sun-dried-tomato", "sun-dried-tomatoes"],
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
const browserProblems = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") {
    browserProblems.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, message) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
}

async function navigate(world, locale = "en") {
  browserProblems.length = 0;
  const url = `${baseUrl}/${locale}/products?world=${world}&card-qa=${Date.now()}`;
  await send("Page.navigate", { url });
  await waitFor('document.readyState === "complete"', `${url} did not finish loading`);
  await waitFor('document.querySelectorAll(".export-card-scene").length > 0', `${url} did not render cards`);
  await evaluate(`(() => {
    let style = document.querySelector('#card-qa-motion');
    if (!style) {
      style = document.createElement('style');
      style.id = 'card-qa-motion';
      style.textContent = '.export-card,.export-card-face{transition:none!important;animation:none!important}';
      document.head.appendChild(style);
    }
  })()`);
}

async function captureCard(productId, outputName) {
  const selector = `.export-card-scene[data-product-id=${JSON.stringify(productId)}]`;
  await waitFor(`document.querySelector(${JSON.stringify(selector)}) !== null`, `${productId} was not rendered`);
  await evaluate(`(() => {
    const scene = document.querySelector(${JSON.stringify(selector)});
    scene.scrollIntoView({ block: 'center', behavior: 'instant' });
    const card = scene.querySelector('.export-card');
    if (!card.classList.contains('is-flipped')) scene.querySelector('.export-card-keyboard-toggle').click();
  })()`);
  const flipDebug = await evaluate(`(() => ({
    url: location.href,
    count: document.querySelectorAll('.export-card-scene').length,
    exists: Boolean(document.querySelector(${JSON.stringify(selector)})),
    className: document.querySelector(${JSON.stringify(selector)})?.querySelector('.export-card')?.className ?? null,
    button: Boolean(document.querySelector(${JSON.stringify(selector)})?.querySelector('.export-card-keyboard-toggle')),
  }))()`);
  if (!flipDebug.exists || !flipDebug.className?.includes('is-flipped')) {
    console.error("Flip debug", flipDebug, browserProblems);
  }
  await waitFor(
    `document.querySelector(${JSON.stringify(selector)})?.querySelector('.export-card')?.classList.contains('is-flipped') === true`,
    `${productId} did not flip`,
  );

  const metrics = await evaluate(`(() => {
    const scene = document.querySelector(${JSON.stringify(selector)});
    const face = scene.querySelector('.export-card-back');
    const rows = [...face.querySelectorAll('.export-spec-row')];
    const table = face.querySelector('.export-spec-table');
    const action = face.querySelector('.enquiry-notch');
    const lastRow = rows.at(-1);
    const sceneRect = scene.getBoundingClientRect();
    const faceRect = face.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();
    const lastRowRect = lastRow.getBoundingClientRect();
    return {
      title: face.querySelector('.export-card-back-title').textContent.trim(),
      rowCount: rows.length,
      labels: rows.map((row) => row.querySelector('dt').textContent.trim()),
      values: rows.map((row) => row.querySelector('dd').textContent.trim()),
      pageFits: document.documentElement.scrollWidth <= innerWidth,
      faceOverflow: face.scrollHeight <= face.clientHeight + 1,
      tableOverflow: table.scrollWidth <= table.clientWidth + 1,
      actionInside: actionRect.bottom <= faceRect.bottom + 1 && actionRect.left >= faceRect.left - 1,
      noCollision: lastRowRect.bottom <= actionRect.top + 1,
      minLabelFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dt')).fontSize))),
      minValueFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dd')).fontSize))),
      clip: {
        x: sceneRect.left + scrollX,
        y: sceneRect.top + scrollY,
        width: sceneRect.width,
        height: sceneRect.height,
        scale: 1,
      },
      publicText: face.innerText,
    };
  })()`);

  assert.ok(metrics.rowCount >= 6 && metrics.rowCount <= 7, `${productId} has ${metrics.rowCount} rows`);
  assert.equal(new Set(metrics.labels).size, metrics.rowCount, `${productId} has duplicate labels`);
  assert.equal(metrics.values.every((value) => value.length > 0), true, `${productId} has an empty value`);
  assert.equal(metrics.pageFits, true, `${productId} causes horizontal page overflow`);
  assert.equal(metrics.faceOverflow, true, `${productId} overflows its card face`);
  assert.equal(metrics.tableOverflow, true, `${productId} overflows its table`);
  assert.equal(metrics.actionInside, true, `${productId} action is outside the card`);
  assert.equal(metrics.noCollision, true, `${productId} rows collide with the enquiry action`);
  assert.ok(metrics.minLabelFont >= 10, `${productId} label type is too small`);
  assert.ok(metrics.minValueFont >= 12, `${productId} value type is too small`);
  assert.equal(metrics.labels.some((label) => /^(origin|condition)$/i.test(label)), false, `${productId} has a legacy row`);
  assert.doesNotMatch(metrics.publicText, /GlobalG\.A\.P\.|\bClass I\b|Phytosanitary Certified/i);

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: metrics.clip,
  });
  fs.writeFileSync(path.join(outputDirectory, outputName), Buffer.from(screenshot.data, "base64"));
  return metrics;
}

async function auditWorld(world, expectedCount, viewportName) {
  await navigate(world);
  const cards = await evaluate(`(() => {
    const scenes = [...document.querySelectorAll('.export-card-scene')];
    scenes.forEach((scene) => scene.querySelector('.export-card').classList.add('is-flipped'));
    return scenes.map((scene) => {
      const front = scene.querySelector('.export-card-front');
      const frontVisual = front.querySelector('.export-card-visual');
      const face = scene.querySelector('.export-card-back');
      const rows = [...face.querySelectorAll('.export-spec-row')];
      const table = face.querySelector('.export-spec-table');
      const action = face.querySelector('.enquiry-notch');
      const faceRect = face.getBoundingClientRect();
      const frontRect = front.getBoundingClientRect();
      const frontVisualRect = frontVisual.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      const lastRowRect = rows.at(-1).getBoundingClientRect();
      return {
        productId: scene.dataset.productId,
        frontOverflow: front.scrollHeight <= front.clientHeight + 1 && front.scrollWidth <= front.clientWidth + 1,
        frontVisualInside: frontVisualRect.bottom <= frontRect.bottom + 1,
        rowCount: rows.length,
        labels: rows.map((row) => row.querySelector('dt').textContent.trim()),
        values: rows.map((row) => row.querySelector('dd').textContent.trim()),
        faceOverflow: face.scrollHeight <= face.clientHeight + 1,
        tableOverflow: table.scrollWidth <= table.clientWidth + 1,
        actionInside: actionRect.bottom <= faceRect.bottom + 1 && actionRect.left >= faceRect.left - 1,
        noCollision: lastRowRect.bottom <= actionRect.top + 1,
        minLabelFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dt')).fontSize))),
        minValueFont: Math.min(...rows.map((row) => parseFloat(getComputedStyle(row.querySelector('dd')).fontSize))),
        publicText: face.innerText,
      };
    });
  })()`);

  assert.equal(cards.length, expectedCount, `${viewportName}/${world} rendered ${cards.length} cards`);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, `${viewportName}/${world} has page overflow`);
  for (const cardMetrics of cards) {
    assert.ok(cardMetrics.rowCount >= 6 && cardMetrics.rowCount <= 7, `${viewportName}/${cardMetrics.productId} has ${cardMetrics.rowCount} rows`);
    assert.equal(new Set(cardMetrics.labels).size, cardMetrics.rowCount, `${viewportName}/${cardMetrics.productId} has duplicate labels`);
    assert.equal(cardMetrics.values.every((value) => value.length > 0), true, `${viewportName}/${cardMetrics.productId} has an empty value`);
    assert.equal(cardMetrics.frontOverflow, true, `${viewportName}/${cardMetrics.productId} front overflows its face`);
    assert.equal(cardMetrics.frontVisualInside, true, `${viewportName}/${cardMetrics.productId} front visual escapes its face`);
    assert.equal(cardMetrics.faceOverflow, true, `${viewportName}/${cardMetrics.productId} overflows its face`);
    assert.equal(cardMetrics.tableOverflow, true, `${viewportName}/${cardMetrics.productId} overflows its table`);
    assert.equal(cardMetrics.actionInside, true, `${viewportName}/${cardMetrics.productId} action is outside the card`);
    assert.equal(cardMetrics.noCollision, true, `${viewportName}/${cardMetrics.productId} collides with the action`);
    assert.ok(cardMetrics.minLabelFont >= 10, `${viewportName}/${cardMetrics.productId} label type is too small`);
    assert.ok(cardMetrics.minValueFont >= 12, `${viewportName}/${cardMetrics.productId} value type is too small`);
    assert.equal(
      cardMetrics.labels.some((label) => /^(origin|condition)$/i.test(label)),
      false,
      `${viewportName}/${cardMetrics.productId} has a legacy row`,
    );
    assert.doesNotMatch(cardMetrics.publicText, /GlobalG\.A\.P\.|\bClass I\b|Phytosanitary Certified/i);
    console.log(`✓ ${viewportName} ${cardMetrics.productId}: rendered audit passed`);
  }
  return cards.map((cardMetrics) => cardMetrics.productId);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const auditedProductIds = new Set();
for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-320", width: 320, height: 720 },
]) {
  await setViewport(viewport.width, viewport.height);
  for (const [world, expectedCount] of [["fresh", 20], ["frozen", 11], ["dried", 6]]) {
    const ids = await auditWorld(world, expectedCount, viewport.name);
    ids.forEach((id) => auditedProductIds.add(id));
  }
}
assert.equal(auditedProductIds.size, 37, "browser audit must cover all 37 products");
console.log("✓ 37/37 product cards passed rendered desktop and mobile audits");

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  await setViewport(viewport.width, viewport.height);
  let activeWorld = "";
  for (const [world, productId, slug] of cases) {
    if (world !== activeWorld) {
      await navigate(world);
      activeWorld = world;
    }
    const metrics = await captureCard(productId, `${slug}-${viewport.name}.png`);
    console.log(`✓ ${viewport.name} ${metrics.title}: ${metrics.rowCount} rows, no overflow or collision`);
  }
}

await setViewport(390, 844);
await navigate("fresh", "ar");
const arabicMetrics = await captureCard("produce:fresh-artichoke", "artichokes-ar-mobile.png");
assert.equal(await evaluate("document.documentElement.dir"), "rtl");
assert.equal(arabicMetrics.labels.some((label) => /[\u0600-\u06ff]/.test(label)), true);

const actionableProblems = browserProblems.filter((problem) =>
  !problem.includes("favicon.ico") && !problem.includes("preloaded using link preload"),
);
assert.deepEqual(actionableProblems, [], `browser errors: ${actionableProblems.join(" | ")}`);

socket.close();
console.log(`✓ 23 product-card screenshots saved to ${outputDirectory}`);
console.log("✓ Representative Fresh, Frozen, Dried, desktop, mobile, and Arabic RTL card backs passed visual QA");
