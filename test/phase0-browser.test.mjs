import assert from "node:assert/strict";

const baseUrl = process.env.PHASE0_BASE_URL ?? "http://localhost:3107";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9334";
const routes = [
  "/en",
  "/en/products",
  "/en/standard",
  "/en/herbs-spices",
  "/en/herbs-spices/products",
  "/en/herbs-spices/standard",
];

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

  if (message.method === "Runtime.exceptionThrown") {
    browserProblems.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    browserProblems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    browserProblems.push(message.params.entry.text);
  }
});

function send(method, params = {}) {
  const id = ++commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
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
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Network.enable");

for (const route of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.status, 200, `${route} returns HTTP 200`);

  await send("Page.navigate", { url: `${baseUrl}${route}` });
  await waitFor('document.readyState === "complete"', `${route} did not finish loading`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  assert.equal(await evaluate("location.pathname"), route, `${route} keeps its public URL`);
  assert.equal(await evaluate("document.querySelectorAll('main').length"), 1, `${route} renders one main landmark`);
  assert.equal(await evaluate("document.body.textContent.trim().length > 0"), true, `${route} renders content`);
  assert.equal(await evaluate("document.querySelector('nextjs-portal') === null"), true, `${route} has no Next.js error overlay`);
}

const actionableProblems = browserProblems.filter(
  (problem) => !problem.includes("favicon.ico") && !problem.includes("preloaded using link preload"),
);
assert.deepEqual(actionableProblems, [], `browser console problems: ${actionableProblems.join(" | ")}`);

socket.close();
console.log("✓ All six English locale routes render without console or hydration errors");
