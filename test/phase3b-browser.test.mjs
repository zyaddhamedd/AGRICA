import assert from "node:assert/strict";

const baseUrl = process.env.PHASE3B_BASE_URL ?? "http://localhost:3116";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9334";

console.log(`Phase 3B browser tests connecting to server ${baseUrl} and debugger ${debugUrl}`);

// 1. SSR HTTP Verification across all 10 standard pages
const ssrCases = [
  ["/en/standard", "One lot.", "Export handover", "ltr"],
  ["/ar/standard", "شحنة إنتاج واحدة", "التسليم التصديري", "rtl"],
  ["/ru/standard", "Одна партия", "Экспортная передача", "ltr"],
  ["/de/standard", "Eine Partie", "Exportübergabe", "ltr"],
  ["/fr/standard", "Un lot", "Remise export", "ltr"],
  ["/en/herbs-spices/standard", "From source", "Prepared for the next commercial step", "ltr"],
  ["/ar/herbs-spices/standard", "من المصدر", "مُجهز للخطوة التجارية التالية", "rtl"],
  ["/ru/herbs-spices/standard", "От источника", "Подготовлено к следующему коммерческому этапу", "ltr"],
  ["/de/herbs-spices/standard", "Vom Ursprung", "Für den nächsten kommerziellen Schritt vorbereitet", "ltr"],
  ["/fr/herbs-spices/standard", "De l'origine", "Préparé pour la prochaine étape commerciale", "ltr"],
];

for (const [route, phrase1, phrase2, dir] of ssrCases) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.status, 200, `${route} returns 200`);
  const html = await response.text();
  assert.ok(html.includes(phrase1), `${route} contains phrase "${phrase1}"`);
  assert.ok(html.includes(phrase2), `${route} contains phrase "${phrase2}"`);
  assert.match(html, new RegExp(`dir="${dir}"`), `${route} has correct text direction ${dir}`);

  if (route.includes("herbs-spices")) {
    assert.ok(html.includes('content="noindex, nofollow"'), `${route} preserves noindex, nofollow`);
  }
}
console.log("✓ All 10 standard routes verified via SSR HTTP");

// 2. Chrome DevTools Protocol Client Interaction
const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "a browser page target is required");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let id = 0;
const pending = new Map();
const problems = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(message.error.message));
    else task.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") {
    problems.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    problems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    problems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
  }
});

function send(method, params = {}) {
  const commandId = ++id;
  socket.send(JSON.stringify({ id: commandId, method, params }));
  return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, label) {
  for (let i = 0; i < 160; i += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(label);
}

async function navigate(route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  const pathOnly = route.split(/[?#]/)[0];
  await waitFor(
    `location.pathname === ${JSON.stringify(pathOnly)} && document.readyState === "complete"`,
    `${route} did not load`
  );
  await new Promise((resolve) => setTimeout(resolve, 200));
}

async function viewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

// Test desktop 1440px
await viewport(1440, 1000);

// A. Test Arabic Produce Standard
await navigate("/ar/standard");
assert.equal(await evaluate(`document.documentElement.dir`), "rtl", "Arabic Standard has dir=rtl");
assert.equal(await evaluate(`document.body.innerText.includes("شحنة إنتاج واحدة")`), true, "Arabic hero text visible");
assert.equal(await evaluate(`document.body.innerText.includes("التسليم التصديري")`), true, "Arabic stage 6 handover visible");
assert.equal(await evaluate(`document.getElementById("stage-04") !== null`), true, "Stable anchor stage-04 exists in Arabic Standard");

// B. Deep-link test with hash anchor #stage-04
await navigate("/ar/standard#stage-04");
assert.equal(await evaluate(`location.hash`), "#stage-04", "Deep link hash preserved");

// C. Test Language Switcher on Standard page with hash preservation
const visibleTrigger = `[...document.querySelectorAll("[data-language-trigger]")].find((element) => element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== "hidden")`;
await evaluate(`${visibleTrigger}.click()`);
await waitFor(`document.querySelector('[data-language-option][data-locale="de"]') !== null`, "Language switcher did not open");
const deHref = await evaluate(`document.querySelector('[data-language-option][data-locale="de"]')?.getAttribute("href")`);
assert.equal(deHref, "/de/standard#stage-04", "Switcher preserves #stage-04 when switching to German");

// D. Test German Produce Standard deep-link
await navigate("/de/standard#stage-04");
assert.equal(await evaluate(`document.body.innerText.includes("Eine Partie")`), true, "German hero text visible");
assert.equal(await evaluate(`document.body.innerText.includes("04 / VERPACKUNG") || document.body.innerText.includes("Packen")`), true, "German stage 4 visible");

// E. Test Russian Produce Standard
await navigate("/ru/standard");
assert.equal(await evaluate(`document.body.innerText.includes("Одна партия")`), true, "Russian hero text visible");
assert.equal(await evaluate(`document.querySelector(".final-tag")?.textContent?.includes("Экспортная передача") || document.body.innerText.includes("ЭКСПОРТНАЯ ПЕРЕДАЧА")`), true, "Russian stage 6 visible");

// F. Test French Herbs & Spices Standard
await navigate("/fr/herbs-spices/standard");
assert.equal(await evaluate(`document.body.innerText.includes("De l'origine")`), true, "French Herbs hero text visible");
assert.equal(await evaluate(`document.body.innerText.includes("La matière évolue")`), true, "French interlude visible");
assert.equal(await evaluate(`document.body.innerText.toLocaleLowerCase().includes("remise commerciale")`), true, "French final stage visible");
assert.equal(await evaluate(`document.getElementById("stage-01") !== null`), true, "Herbs stage-01 anchor exists");
assert.equal(await evaluate(`document.getElementById("stage-06") !== null`), true, "Herbs stage-06 anchor exists");

// G. Test Arabic Herbs & Spices Standard
await navigate("/ar/herbs-spices/standard");
assert.equal(await evaluate(`document.documentElement.dir`), "rtl", "Arabic Herbs Standard has dir=rtl");
assert.equal(await evaluate(`document.body.innerText.includes("من المصدر")`), true, "Arabic Herbs hero visible");
assert.equal(await evaluate(`document.body.innerText.includes("المادة / الضبط")`), true, "Arabic Herbs interlude visible");

// H. Mobile Viewport Overflow QA across all locales
await viewport(390, 844);
for (const route of [
  "/en/standard",
  "/ar/standard",
  "/ru/standard",
  "/de/standard",
  "/fr/standard",
  "/en/herbs-spices/standard",
  "/ar/herbs-spices/standard",
  "/ru/herbs-spices/standard",
  "/de/herbs-spices/standard",
  "/fr/herbs-spices/standard",
]) {
  await navigate(route);
  const noOverflow = await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`);
  assert.equal(noOverflow, true, `${route} has no horizontal overflow on mobile`);
}

// Check for errors (filtering benign font or preload notices)
const actionable = problems.filter(
  (msg) => !msg.includes("favicon.ico") && !msg.includes("preloaded using link preload")
);
assert.deepEqual(actionable, [], `Browser problems detected: ${actionable.join(" | ")}`);

socket.close();
console.log("Phase 3B browser tests completed successfully with 0 errors!");
