import assert from "node:assert/strict";

const baseUrl = process.env.PHASE2_BASE_URL ?? "http://localhost:3112";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://localhost:9336";
const localizedHomeLabels = {
  en: "Home",
  ar: "الرئيسية",
  ru: "Главная",
  de: "Startseite",
  fr: "Accueil",
};

for (const [locale, homeLabel] of Object.entries(localizedHomeLabels)) {
  const response = await fetch(`${baseUrl}/${locale}/`);
  const html = await response.text();
  assert.equal(response.status, 200, `/${locale}/ renders`);
  assert.match(html, new RegExp(`<html[^>]+lang="${locale}"`));
  assert.ok(html.includes(homeLabel), `/${locale}/ server-renders localized shared navigation`);
  assert.ok(!html.includes("common.navigation"), `/${locale}/ does not expose raw translation keys`);
}

for (const route of [
  "/en/products?world=frozen",
  "/ar/products?world=dried",
  "/de/herbs-spices/products?family=spices",
  "/fr/standard",
]) {
  assert.equal((await fetch(`${baseUrl}${route}`)).status, 200, `${route} renders`);
}

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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, message, attempts = 150) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(message);
}

async function navigate(route) {
  await send("Page.navigate", { url: `${baseUrl}${route}` });
  const pathname = JSON.stringify(route.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/");
  await waitFor(`location.pathname.replace(/\\/$/, "") === ${pathname} && document.readyState === "complete"`, `${route} did not load`);
  await new Promise((resolve) => setTimeout(resolve, 120));
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 680 });
}

const visibleTrigger = `[...document.querySelectorAll("[data-language-trigger]")].find((element) => element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== "hidden")`;

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await setViewport(1440, 1000);

await navigate("/en/products");
await evaluate(`${visibleTrigger}.click()`);
await waitFor('document.querySelector("[data-language-menu]") !== null', "language menu did not open");
assert.equal(await evaluate('document.querySelector("[data-language-option][aria-current=page]")?.dataset.locale'), "en", "English is marked active");
assert.equal(await evaluate('document.querySelector("[data-language-option][data-locale=ar]")?.getAttribute("href")'), "/ar/products");
assert.deepEqual(
  await evaluate('[...document.querySelectorAll("[data-language-option]")].map((link) => [link.dataset.locale, link.textContent.trim(), link.getAttribute("hreflang")])'),
  [
    ["en", "English✓", "en"],
    ["ar", "العربية", "ar"],
    ["ru", "Русский", "ru"],
    ["de", "Deutsch", "de"],
    ["fr", "Français", "fr"],
  ],
);

await evaluate('document.querySelector("[data-language-option][data-locale=ar]").click()');
await waitFor('location.pathname === "/ar/products"', "English to Arabic switch failed");
assert.equal(await evaluate('document.cookie.includes("agrica_locale=ar")'), true, "Arabic preference cookie was stored");
await evaluate(`${visibleTrigger}.click()`);
await evaluate('document.querySelector("[data-language-option][data-locale=ru]").click()');
await waitFor('location.pathname === "/ru/products"', "Arabic to Russian switch failed");
assert.equal(await evaluate('document.cookie.includes("agrica_locale=ru")'), true, "preference cookie was updated");

await navigate("/en/products?world=frozen");
await evaluate(`${visibleTrigger}.click()`);
assert.equal(await evaluate('document.querySelector("[data-language-option][data-locale=de]").getAttribute("href")'), "/de/products?world=frozen");
await evaluate('document.querySelector("[data-language-option][data-locale=de]").click()');
await waitFor('location.pathname === "/de/products" && location.search === "?world=frozen"', "Produce query was not preserved");
assert.equal(await evaluate('document.querySelector("[data-world=frozen]") !== null'), true, "Frozen state remains active");

await navigate("/fr/herbs-spices/products?family=spices");
await evaluate(`${visibleTrigger}.click()`);
assert.equal(await evaluate('document.querySelector("[data-language-option][data-locale=ar]").getAttribute("href")'), "/ar/herbs-spices/products?family=spices");

await navigate("/ru/standard#stage-04");
await evaluate(`${visibleTrigger}.click()`);
assert.equal(await evaluate('document.querySelector("[data-language-option][data-locale=fr]").getAttribute("href")'), "/fr/standard#stage-04", "stable hash is preserved");

await navigate("/en/");
await evaluate(`${visibleTrigger}.focus()`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
await waitFor('document.querySelector("[data-language-menu]") !== null', "ArrowDown did not open the language menu");
await waitFor('document.activeElement?.dataset.locale === "en"', "keyboard opening did not focus the current language");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40 });
assert.equal(await evaluate('document.activeElement?.dataset.locale'), "ar", "ArrowDown moves through language links");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await waitFor('document.querySelector("[data-language-menu]") === null', "Escape did not close the language menu");
await waitFor('document.activeElement?.hasAttribute("data-language-trigger") === true', "Escape did not return focus to the trigger");

await navigate("/ar/");
await evaluate(`${visibleTrigger}.click()`);
assert.equal(await evaluate('document.documentElement.dir'), "rtl");
assert.equal(await evaluate('getComputedStyle(document.querySelector("[data-language-menu]")).direction'), "rtl", "dropdown inherits RTL direction");
assert.equal(await evaluate('(() => { const r = document.querySelector("[data-language-menu]").getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()'), true, "RTL dropdown remains in the viewport");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
assert.ok(Number.parseFloat(await evaluate('getComputedStyle(document.querySelector("[data-language-trigger] span:last-child")).transitionDuration')) <= 0.01, "switcher respects reduced motion");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

await setViewport(320, 720);
await navigate("/fr/");
await evaluate('document.querySelector(".mobile-navbar-menu-btn").click()');
await waitFor('document.querySelector(".global-menu-root.is-open") !== null', "mobile Produce menu did not open");
await new Promise((resolve) => setTimeout(resolve, 650));
await evaluate('document.querySelector(".global-menu-root.is-open .global-menu-language [data-language-trigger]").click()');
await waitFor('document.querySelector(".global-menu-root.is-open .global-menu-language [data-language-menu]") !== null', "mobile language menu did not open");
assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, "mobile Produce switcher has no horizontal overflow");
const mobileProduceMenu = await evaluate('(() => { const r = document.querySelector(".global-menu-root.is-open .global-menu-language [data-language-menu]").getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: innerWidth, height: innerHeight }; })()');
assert.equal(
  mobileProduceMenu.left >= 0 && mobileProduceMenu.right <= mobileProduceMenu.width && mobileProduceMenu.top >= 0 && mobileProduceMenu.bottom <= mobileProduceMenu.height,
  true,
  `mobile Produce dropdown stays within the viewport: ${JSON.stringify(mobileProduceMenu)}`,
);

await setViewport(390, 844);
await navigate("/de/herbs-spices/products?family=spices");
await evaluate('document.querySelector("button[aria-controls=herbs-spices-menu]").click()');
await waitFor('document.querySelector("#herbs-spices-menu") !== null', "Herbs mobile menu did not open");
await new Promise((resolve) => setTimeout(resolve, 450));
await evaluate('document.querySelector("#herbs-spices-menu [data-language-trigger]").click()');
await waitFor('document.querySelector("#herbs-spices-menu [data-language-menu]") !== null', "Herbs mobile language menu did not open");
assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, "mobile Herbs switcher has no horizontal overflow");

const actionableProblems = browserProblems.filter(
  (problem) => !problem.includes("favicon.ico") && !problem.includes("preloaded using link preload"),
);
assert.deepEqual(actionableProblems, [], `browser console problems: ${actionableProblems.join(" | ")}`);

socket.close();
console.log("✓ Five localized shared UIs and active language states verified");
console.log("✓ Context-preserving links, explicit preference cookie, keyboard, and Escape behavior verified");
console.log("✓ RTL, mobile Produce/Herbs integration, reduced motion, and console checks passed");
