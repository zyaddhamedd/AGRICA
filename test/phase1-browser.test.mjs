import assert from "node:assert/strict";

const baseUrl = process.env.PHASE1_BASE_URL ?? "http://localhost:3107";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9334";
const locales = ["en", "ar", "ru", "de", "fr"];
const routeSuffixes = [
  "",
  "/products",
  "/standard",
  "/herbs-spices",
  "/herbs-spices/products",
  "/herbs-spices/standard",
];

for (const locale of locales) {
  for (const suffix of routeSuffixes) {
    const route = `/${locale}${suffix}`;
    const response = await fetch(`${baseUrl}${route}`);
    const html = await response.text();
    assert.equal(response.status, 200, `${route} returns HTTP 200`);
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`), `${route} exposes its locale`);
    assert.match(html, new RegExp(`<html[^>]+dir="${locale === "ar" ? "rtl" : "ltr"}"`), `${route} exposes its direction`);
    if (suffix.startsWith("/herbs-spices")) {
      assert.match(html, /<meta name="robots" content="noindex, nofollow"\/>/, `${route} remains noindex, nofollow`);
    }
  }
}

for (const route of ["/es", "/it/products", "/xx/herbs-spices"]) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
  assert.equal(response.status, 404, `${route} returns not found`);
}

const redirectCases = [
  ["/", "/en/"],
  ["/products", "/en/products"],
  ["/standard", "/en/standard"],
  ["/herbs-spices", "/en/herbs-spices"],
  ["/herbs-spices/products", "/en/herbs-spices/products"],
  ["/herbs-spices/standard", "/en/herbs-spices/standard"],
  ["/products?world=frozen", "/en/products?world=frozen"],
  ["/herbs-spices/products?family=spices", "/en/herbs-spices/products?family=spices"],
];

for (const [source, destination] of redirectCases) {
  const response = await fetch(`${baseUrl}${source}`, { redirect: "manual" });
  assert.equal(response.status, 308, `${source} redirects permanently`);
  assert.equal(new URL(response.headers.get("location"), baseUrl).pathname + new URL(response.headers.get("location"), baseUrl).search, destination);
}

for (const [route, world] of [
  ["/en/products?world=frozen", "frozen"],
  ["/ar/products?world=dried", "dried"],
  ["/fr/products?world=invalid", "fresh"],
]) {
  const html = await (await fetch(`${baseUrl}${route}`)).text();
  assert.match(html, new RegExp(`data-world="${world}"`), `${route} server-renders ${world}`);
}

const familyHtml = await (await fetch(`${baseUrl}/fr/herbs-spices/products?family=flowers`)).text();
assert.match(familyHtml, /data-family="flowers"/, "the requested family is present in server HTML");
assert.doesNotMatch(familyHtml, /data-family="herbs"/, "unselected families are absent from server HTML");

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
const browserProblems = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") browserProblems.push(message.params.exceptionDetails.text);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    browserProblems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
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
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

async function navigate(route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await waitFor('document.readyState === "complete"', `${route} did not load`);
  await new Promise((resolve) => setTimeout(resolve, 150));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

await navigate("/ru/");
assert.equal(await evaluate(`document.querySelector('a[href="/ru/products"]') !== null`), true, "Produce links retain Russian");
assert.equal(await evaluate(`document.querySelector('a[href="/ru/standard"]') !== null`), true, "Standard links retain Russian");

await navigate("/de/products?world=frozen");
await waitFor('document.querySelector("[data-world=frozen]") !== null', "Frozen state did not hydrate");
assert.equal(await evaluate(`document.querySelector('a[href="/de/herbs-spices/products"]') !== null`), true, "division switching retains German");

await navigate("/de/herbs-spices");
assert.equal(
  await evaluate(`document.querySelector('a[aria-label="Gewürze-Produkte entdecken"]')?.getAttribute("href")`),
  "/de/herbs-spices/products?family=spices",
  "Spices family link retains German and its query",
);
await evaluate(`document.querySelector('a[aria-label="Gewürze-Produkte entdecken"]').click()`);
await waitFor('location.pathname === "/de/herbs-spices/products" && new URL(location.href).searchParams.get("family") === "spices"', "Spices family navigation failed");
await waitFor('document.querySelectorAll("[data-material-specimen]").length === 2', "Spices family did not render two products");

const actionableProblems = browserProblems.filter(
  (problem) => !problem.includes("favicon.ico") && !problem.includes("preloaded using link preload"),
);
assert.deepEqual(actionableProblems, [], `browser console problems: ${actionableProblems.join(" | ")}`);

socket.close();
console.log("✓ All 30 locale-prefixed public routes render with the correct lang and dir");
console.log("✓ Invalid locales, permanent legacy redirects, and query preservation verified");
console.log("✓ Server-visible filter state and locale-preserving navigation verified");
