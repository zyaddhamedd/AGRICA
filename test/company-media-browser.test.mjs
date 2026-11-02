// Requires a running production server and an isolated Chrome with remote debugging.
// COMPANY_BASE_URL=http://127.0.0.1:3189 CHROME_DEBUG_URL=http://127.0.0.1:9349 node test/company-media-browser.test.mjs
import assert from "node:assert/strict";

const baseUrl = process.env.COMPANY_BASE_URL ?? "http://127.0.0.1:3189";
const debugUrl = process.env.CHROME_DEBUG_URL ?? "http://127.0.0.1:9349";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) { events.push(message); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!response.exceptionDetails, JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  return { ws, send, evaluate, events };
}

async function waitFor(page, expression, label) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await page.evaluate(expression)) return;
    await sleep(100);
  }
  assert.fail(label);
}

const version = await (await fetch(`${debugUrl}/json/version`)).json();
const browser = await connect(version.webSocketDebuggerUrl);
const sourceNames = ["hero-01-origin.mp4", "hero_02_processing_final.mp4", "hero_03_packing_final.mp4", "hero_04_shipping_final.mp4"];
const desktop = '[class*="workflowStageViewport"]';
const mobile = '[class*="workflowMobileMediaFrame"]';
const videoReady = (selector) => `(()=>{const v=document.querySelector(${JSON.stringify(selector)})?.querySelector('video');return v?.currentTime>0&&!v.paused&&v.dataset.playing==='true'})()`;
const posterReady = (selector) => `(()=>{const i=document.querySelector(${JSON.stringify(selector)})?.querySelector('img');return i?.complete&&i.naturalWidth>0})()`;
async function scrollTo(page, selector, index = 0) {
  await page.evaluate(`(()=>{const e=document.querySelectorAll(${JSON.stringify(selector)})[${index}];window.scrollTo({top:scrollY+e.getBoundingClientRect().top-80,behavior:'instant'})})()`);
}
async function viewport(page, width) {
  await page.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width <= 860 });
}

try {
  for (const locale of ["en", "ar", "ru", "de", "fr"]) {
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const targets = await (await fetch(`${debugUrl}/json`)).json();
    const page = await connect(targets.find((target) => target.id === targetId).webSocketDebuggerUrl);
    try {
      await page.send("Page.enable");
      await page.send("Runtime.enable");
      await page.send("Network.enable");
      await page.send("Network.setCacheDisabled", { cacheDisabled: true });
      await viewport(page, locale === "ar" ? 390 : 1440);
      await page.send("Page.navigate", { url: `${baseUrl}/${locale}/company` });
      await waitFor(page, videoReady('[class*="heroMediaBackdrop"]'), `${locale}: hero must play`);
      assert.equal(await page.evaluate("document.documentElement.lang"), locale);
      assert.equal(await page.evaluate("document.documentElement.dir"), locale === "ar" ? "rtl" : "ltr");
      assert.equal(await page.evaluate("[...document.querySelectorAll('video')].filter(v=>v.hasAttribute('src')).length"), 1, "only hero attaches initially");
      assert.ok(await page.evaluate("[...document.querySelectorAll('video')].every(v=>!v.hasAttribute('autoplay')&&v.preload==='none')"));
      const initialMedia = page.events.filter((event) => event.method === "Network.requestWillBeSent" && event.params.type === "Media");
      assert.ok(initialMedia.every((event) => event.params.request.url.endsWith(sourceNames[0])), "initial range requests must belong only to hero");
      assert.ok(!page.events.some((event) => event.method === "Network.requestWillBeSent" && /\/(hero_01_origin_start_keyframe|facility_reveal|human_qc)\.png$/.test(event.params.request.url)), "oversized original posters must not be fetched");

      if (locale === "en") {
        await scrollTo(page, desktop);
        for (let index = 0; index < 4; index++) {
          await page.evaluate(`document.querySelectorAll('[role="tab"]')[${index}].click()`);
          await waitFor(page, videoReady(desktop), `workflow ${index + 1} must play`);
          await waitFor(page, posterReady(desktop), "workflow poster must decode");
          assert.ok((await page.evaluate(`document.querySelector(${JSON.stringify(desktop)}).querySelector('video').currentSrc`)).endsWith(sourceNames[index]));
          assert.ok(await page.evaluate(`[...document.querySelectorAll(${JSON.stringify(mobile + " video")})].every(v=>!v.hasAttribute('src'))`), "hidden mobile sources must stay detached");
        }
        for (const width of [860, 861, 390, 1440]) {
          await viewport(page, width);
          await scrollTo(page, width <= 860 ? mobile : desktop);
          await waitFor(page, videoReady(width <= 860 ? mobile : desktop), `playback after resize to ${width}`);
          await waitFor(page, `([...document.querySelectorAll(${JSON.stringify((width <= 860 ? desktop : mobile) + " video")})].every(v=>!v.hasAttribute('src')))`, "hidden breakpoint must unload");
        }
        await page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))");
        await waitFor(page, "[...document.querySelectorAll('video')].every(v=>!v.hasAttribute('src'))", "background tab must unload sources");
        await page.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))");
        await waitFor(page, videoReady(desktop), "visible tab must resume");
        await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        await waitFor(page, "[...document.querySelectorAll('video')].every(v=>!v.hasAttribute('src'))", "reduced motion must unload sources");
        await waitFor(page, posterReady(desktop), "reduced motion retains poster");
        await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
        await waitFor(page, videoReady(desktop), "playback resumes after reduced motion changes");
        for (const selector of ['[class*="qualityMediaWrapper"]', '[class*="logisticsMediaWrapper"]']) {
          await scrollTo(page, selector);
          await waitFor(page, videoReady(selector), "below-fold video must play when visible");
          await waitFor(page, posterReady(selector), "below-fold poster must decode");
        }
        await scrollTo(page, '[class*="heroMediaBackdrop"]');
        await waitFor(page, videoReady('[class*="heroMediaBackdrop"]'), "hero resumes on return");
        // A genuine media failure and blocked play() must both leave the poster visible.
        await page.send("Network.setBlockedURLs", { urls: ["*.mp4"] });
        await page.send("Page.navigate", { url: `${baseUrl}/en/company` });
        await waitFor(page, posterReady('[class*="heroMediaBackdrop"]'), "failed media retains loaded poster");
        await sleep(300);
        assert.ok(await page.evaluate("getComputedStyle(document.querySelector('video')).opacity==='0'"));
        await page.send("Network.setBlockedURLs", { urls: [] });
        await page.send("Page.addScriptToEvaluateOnNewDocument", { source: "HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))}" });
        await page.send("Page.navigate", { url: `${baseUrl}/en/company` });
        await waitFor(page, posterReady('[class*="heroMediaBackdrop"]'), "blocked autoplay retains loaded poster");
        assert.ok(await page.evaluate("getComputedStyle(document.querySelector('video')).opacity==='0'"));
        await page.send("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(navigator,'connection',{value:Object.assign(new EventTarget(),{saveData:true})})" });
        await page.send("Page.navigate", { url: `${baseUrl}/en/company` });
        await waitFor(page, posterReady('[class*="heroMediaBackdrop"]'), "save-data retains loaded poster");
        await sleep(300);
        assert.equal(await page.evaluate("document.querySelectorAll('video[src]').length"), 0, "save-data must not attach media");
      } else if (locale === "ar") {
        for (let index = 0; index < 4; index++) {
          await scrollTo(page, mobile, index);
          await waitFor(page, `(()=>{const v=document.querySelectorAll(${JSON.stringify(mobile)})[${index}].querySelector('video');return v.currentTime>0&&!v.paused})()`, "Arabic mobile workflow plays in sequence");
          assert.ok(await page.evaluate(`[...document.querySelectorAll(${JSON.stringify(desktop + " video")})].every(v=>!v.hasAttribute('src'))`));
        }
      }
      assert.ok(!page.events.some((event) => event.method === "Runtime.exceptionThrown"), "no uncaught runtime exceptions");
      console.log(`PASS ${locale}: Company media lifecycle`);
    } finally {
      await browser.send("Target.closeTarget", { targetId });
      page.ws.close();
    }
  }
} finally { browser.ws.close(); }
