import assert from "node:assert/strict";

const baseUrl = process.env.PHASE3A_BASE_URL ?? "http://localhost:3113";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9337";

const serverCases = [
  ["/ar", "منتجات مصرية"],
  ["/ru/products", "Апельсины"],
  ["/de/herbs-spices", "Vom Ursprung"],
  ["/fr/herbs-spices/products", "Catalogue"],
];
for (const [route, phrase] of serverCases) {
  const response = await fetch(`${baseUrl}${route}`);
  const html = await response.text();
  assert.equal(response.status, 200, `${route} renders`);
  assert.ok(html.includes(phrase), `${route} server-renders localized content`);
}

const targets = await (await fetch(`${debugUrl}/json`)).json();
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "a browser page target is required");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
const problems = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { const task = pending.get(message.id); pending.delete(message.id); message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result); }
  if (message.method === "Runtime.exceptionThrown") problems.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") problems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") problems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
});
function send(method, params = {}) { const commandId = ++id; socket.send(JSON.stringify({ id: commandId, method, params })); return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject })); }
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function waitFor(expression, label) { for (let i = 0; i < 160; i += 1) { if (await evaluate(expression)) return; await new Promise((resolve) => setTimeout(resolve, 50)); } assert.fail(label); }
async function navigate(route) { await send("Page.navigate", { url: `${baseUrl}${route}` }); await waitFor(`location.pathname === ${JSON.stringify(route.split("?")[0])} && document.readyState === "complete"`, `${route} did not load`); await new Promise((resolve) => setTimeout(resolve, 180)); }
async function viewport(width, height) { await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 }); }

await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
await viewport(1440, 1000);
await navigate("/ar");
assert.equal(await evaluate(`document.body.innerText.includes("جذورنا مصرية")`), true, "Arabic home content is visible");
assert.equal(await evaluate(`["Three worlds.","Every harvest has","THE COMPANY","START A TRADE"].some((text) => document.body.innerText.includes(text))`), false, "Arabic home has no English section-copy fallback");
assert.equal(await evaluate(`document.documentElement.dir`), "rtl");
await navigate("/ru/products");
assert.equal(await evaluate(`document.body.innerText.includes("Апельсины")`), true, "Russian Produce names are visible");
await evaluate(`(() => { const input=document.querySelector('#minimal-search-input'); if (!input) document.querySelector('.minimal-search-trigger').click(); })()`);
await waitFor(`document.querySelector('#minimal-search-input') !== null`, "Produce search did not open");
await evaluate(`(() => { const input=document.querySelector('#minimal-search-input'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,'Oranges'); input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
await waitFor(`document.querySelectorAll('.export-card-scene').length === 1`, "English Produce alias search failed");
assert.equal(await evaluate(`document.querySelector('.export-card-title')?.textContent`), "Апельсины");
await evaluate(`document.querySelector('.export-card-keyboard-toggle').click()`);
await waitFor(`document.querySelector('.export-card.is-flipped') !== null`, "Produce specification card did not open");
const russianSpecText = await evaluate(`document.querySelector('.export-card-back').innerText`);
assert.equal(russianSpecText.toLocaleLowerCase().includes("происхождение") && russianSpecText.toLocaleLowerCase().includes("период сбора"), true, `Produce specification labels are localized: ${russianSpecText}`);
await navigate("/de/herbs-spices");
assert.equal(await evaluate(`document.body.innerText.includes("Materialien, vom Ursprung geprägt")`), true, "German Herbs landing content is visible");
assert.equal(await evaluate(`["Ingredient families","One ingredient. Different expressions.","A distinct division. The same AGRICA standard."].some((text) => document.body.innerText.includes(text))`), false, "German Herbs landing has no English section-copy fallback");
await navigate("/fr/herbs-spices/products?family=spices");
await waitFor(`document.querySelectorAll('[data-material-specimen]').length === 2`, "French spices family did not filter");
assert.equal(await evaluate(`document.body.innerText.includes("Cumin") && document.body.innerText.includes("Piment rouge")`), true, "French Herbs product names are visible");
await evaluate(`document.querySelector('[data-material-specimen] .${""}viewAction, [data-material-specimen] button')?.click()`);
await waitFor(`document.querySelector('[data-material-reveal]') !== null`, "Herbs material reveal did not open");
const frenchRevealText = await evaluate(`document.querySelector('[data-material-reveal]').innerText`);
assert.equal(frenchRevealText.toLocaleLowerCase().includes("spécifications techniques"), true, `Herbs detail copy is localized: ${frenchRevealText}`);

await viewport(390, 844);
for (const route of ["/ar", "/fr/products", "/ru/herbs-spices", "/de/herbs-spices/products"]) {
  await navigate(route);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `${route} has no mobile overflow`);
}
const actionable = problems.filter((item) => !item.includes("favicon.ico") && !item.includes("preloaded using link preload"));
assert.deepEqual(actionable, [], `browser console problems: ${actionable.join(" | ")}`);
socket.close();
console.log("Phase 3A localized SSR, catalogue search, desktop/mobile layouts, and console verified.");
