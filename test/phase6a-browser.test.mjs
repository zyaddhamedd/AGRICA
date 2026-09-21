import assert from "node:assert/strict";

const base = "http://localhost:3100";
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

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await navigate("/herbs-spices/products");

assert.equal(await evaluate('document.querySelectorAll("article").length'), 27, "all source-backed records render");
assert.equal(await evaluate('document.querySelectorAll("article [data-media-status=fallback]").length'), 27, "all product fallbacks render intentionally");
assert.equal(await evaluate('document.querySelectorAll("article img").length'), 0, "pending product paths do not create broken images");
assert.equal(await evaluate('[...document.querySelectorAll("article [data-media-status=fallback]")].every(slot => slot.getBoundingClientRect().height > 0)'), true, "fallback slots reserve layout space");
assert.equal(await evaluate('document.querySelector("meta[name=robots]")?.content'), "noindex, nofollow");
assert.equal(await evaluate('document.querySelector("a[aria-label*=Produce]")?.getAttribute("href")'), "/products", "switch maps to Produce Products");

await evaluate('[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Herbs").click()');
assert.equal(await evaluate('document.querySelectorAll("article").length'), 11, "family filtering works");
assert.equal(await evaluate('[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Herbs").getAttribute("aria-pressed")'), "true");

await evaluate('(()=>{const input=document.querySelector("input[type=search]"); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; setter.call(input,"peppermint"); input.dispatchEvent(new Event("input",{bubbles:true}))})()');
assert.equal(await evaluate('document.querySelectorAll("article").length'), 1, "search covers names");
await evaluate('(()=>{const input=document.querySelector("input[type=search]"); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; setter.call(input,"unmatched material"); input.dispatchEvent(new Event("input",{bubbles:true}))})()');
assert.equal(await evaluate('document.body.textContent.includes("No materials match this view.")'), true, "empty results render");
await evaluate('[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Reset catalogue").click()');
assert.equal(await evaluate('document.querySelectorAll("article").length'), 27, "reset restores catalogue");

await evaluate('document.querySelector("article button[aria-expanded]").click()');
assert.equal(await evaluate('document.querySelectorAll("article [id^=material-details]").length'), 1, "details expand");
await evaluate('document.querySelectorAll("article button[aria-expanded]")[1].click()');
assert.equal(await evaluate('document.querySelectorAll("article [id^=material-details]").length'), 1, "only one detail remains open");

await evaluate('[...document.querySelectorAll("article button")].filter((button) => button.textContent.includes("Add to enquiry")).slice(0,2).forEach((button) => button.click())');
assert.equal(await evaluate('document.querySelector("button[aria-controls=herbs-spices-enquiry] strong")?.textContent'), "2", "enquiry count updates");
await evaluate('document.querySelector("button[aria-controls=herbs-spices-enquiry]").click()');
await new Promise((resolve) => setTimeout(resolve, 80));
assert.equal(await evaluate('document.activeElement?.textContent.includes("Close")'), true, "drawer receives focus");
assert.equal(await evaluate('document.querySelectorAll("#herbs-spices-enquiry li").length'), 2);
await evaluate('document.querySelector("#herbs-spices-enquiry li button").click()');
assert.equal(await evaluate('document.querySelectorAll("#herbs-spices-enquiry li").length'), 1, "drawer removal works");
await evaluate('[...document.querySelectorAll("#herbs-spices-enquiry input")].forEach((input,index)=>{input.value=["Germany","1 container","Example Co","buyer@example.com"][index];input.dispatchEvent(new Event("input",{bubbles:true}))}); document.querySelector("#herbs-spices-enquiry form button[type=submit]").click()');
assert.equal(await evaluate('document.querySelector("#herbs-spices-enquiry [role=status]")?.textContent.includes("submission integration coming next")'), true, "local submit message renders");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
await new Promise((resolve) => setTimeout(resolve, 80));
assert.equal(await evaluate('document.querySelector("#herbs-spices-enquiry") === null'), true, "Escape closes drawer");
assert.equal(await evaluate('document.activeElement === document.querySelector("button[aria-controls=herbs-spices-enquiry]")'), true, "focus returns to dock");

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, "mobile has no horizontal overflow");
assert.equal(await evaluate('getComputedStyle(document.querySelector("main")).overflowX !== "scroll"'), true);
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await evaluate('document.querySelector("article button[aria-expanded]").click()');
assert.equal(await evaluate('getComputedStyle(document.querySelector("article [id^=material-details]")).animationName'), "none", "reduced motion disables detail animation");

await send("Emulation.clearDeviceMetricsOverride");
await navigate("/products");
assert.equal(await evaluate('document.querySelector("a[aria-label*=Herbs]")?.getAttribute("href")'), "/herbs-spices/products", "switch maps to Herbs & Spices Products");
await evaluate('document.querySelector("a[aria-label*=Herbs]").click()');
await waitFor('location.pathname === "/herbs-spices/products"', "switch did not navigate to Herbs & Spices Products");
await evaluate('history.back()');
await waitFor('location.pathname === "/products"', "browser back did not return to Produce Products");
await evaluate('history.forward()');
await waitFor('location.pathname === "/herbs-spices/products"', "browser forward did not return to Herbs & Spices Products");

const pageProblems = browserProblems.filter((problem) => !problem.endsWith("/favicon.ico"));
assert.deepEqual(pageProblems, [], `browser console problems: ${pageProblems.join(" | ")}`);
socket.close();
console.log("✓ Phase 6A browser interactions passed");
console.log("✓ Division switch links passed");
console.log("✓ Mobile overflow and reduced-motion checks passed");
