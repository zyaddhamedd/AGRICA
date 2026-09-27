import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.COMPANY_BASE_URL ?? "http://localhost:3128";
const debugUrl = process.env.COMPANY_DEBUG_URL ?? "http://127.0.0.1:9446";
const outputDirectory = path.join(process.cwd(), "artifacts", "company-cinematic");
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
let navigationSequence = 0;
const pending = new Map();
const problems = [];

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

async function waitFor(expression, label, attempts = 300) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail(label);
}

async function setViewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width <= 768 });
}

async function navigate(locale = "en") {
  navigationSequence += 1;
  const url = `${baseUrl}/${locale}?company-review=${navigationSequence}`;
  await send("Page.navigate", { url });
  await waitFor(`location.href === ${JSON.stringify(url)} && document.readyState !== 'loading' && document.querySelector('#company .company-film')`, `${locale} Company section did not load`);
  await waitFor(`document.querySelector('#company')?.dataset.motion`, `${locale} Company section did not hydrate`);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function scrollCompany(progress) {
  await evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const section = document.querySelector('#company');
    const top = section.getBoundingClientRect().top + scrollY;
    const travel = Math.max(section.offsetHeight - innerHeight, 1);
    scrollTo(0, top + travel * ${progress});
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 600));
  return evaluate(`(() => { const section=document.querySelector('#company'); const rect=section.getBoundingClientRect(); const travel=Math.max(section.offsetHeight-innerHeight,1); return {scrollY,top:rect.top,height:section.offsetHeight,travel,progress:-rect.top/travel,active:section.dataset.activeChapter,bar:document.querySelector('.company-progress-track > span').style.width,motion:section.dataset.motion}; })()`);
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(path.join(outputDirectory, name), Buffer.from(result.data, "base64"));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const viewports = [[1920, 1200], [1440, 1000], [1024, 900], [768, 1024], [390, 844], [320, 720]];
const results = [];

for (const [width, height] of viewports) {
  await setViewport(width, height);
  await navigate("en");
  const metrics = await evaluate(`(() => {
    const section = document.querySelector('#company');
    const stage = section.querySelector('.company-sticky-stage');
    const media = section.querySelector('.company-film');
    const copy = section.querySelector('.company-copy');
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      sectionHeight: section.offsetHeight,
      stagePosition: getComputedStyle(stage).position,
      chapterCount: section.querySelectorAll('.company-chapter').length,
      media: media.getBoundingClientRect().toJSON(),
      copy: copy.getBoundingClientRect().toJSON(),
    };
  })()`);
  assert.ok(metrics.scrollWidth <= width, `${width}px has horizontal overflow`);
  assert.equal(metrics.chapterCount, 3, `${width}px renders all chapters`);
  assert.equal(metrics.stagePosition, "sticky", `${width}px stage is sticky`);
  assert.ok(metrics.sectionHeight >= height * (width <= 900 ? 1.3 : 1.85), `${width}px section meets its scroll length`);
  if (width > 900) assert.ok(metrics.copy.x > metrics.media.x, `${width}px keeps copy beside media`);
  else assert.ok(metrics.copy.y >= metrics.media.y + metrics.media.height, `${width}px stacks copy below media`);

  for (const [progress, chapter] of [[0.02, "1"], [0.5, "2"], [0.9, "3"]]) {
    await scrollCompany(progress);
    await waitFor(`document.querySelector('#company').dataset.activeChapter === ${JSON.stringify(chapter)}`, `${width}px chapter ${chapter} threshold`);
  }

  if (width === 1440) {
    for (const [progress, name] of [[0.08, "origin"], [0.5, "clarity"], [0.88, "connection"]]) {
      await scrollCompany(progress);
      await screenshot(`company-1440-${name}.png`);
    }
  }
  if (width === 390) {
    for (const [progress, name] of [[0.08, "origin"], [0.88, "connection"]]) {
      await scrollCompany(progress);
      await screenshot(`company-390-${name}.png`);
    }
  }
  results.push(metrics);
}

await setViewport(390, 844);
for (const locale of ["en", "ar", "ru", "de", "fr"]) {
  await navigate(locale);
  assert.equal(await evaluate(`document.querySelectorAll('#company .company-chapter').length`), 3, `${locale} has three chapters`);
  assert.equal(await evaluate(`[...document.querySelectorAll('#company .company-chapter h2')].every((node) => node.textContent.trim().length > 0)`), true, `${locale} chapter copy is populated`);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), `${locale} has no mobile overflow`);
}
assert.equal(await evaluate(`document.documentElement.dir`), "ltr", "final locale is LTR");
await navigate("ar");
assert.equal(await evaluate(`document.documentElement.dir`), "rtl", "Arabic is RTL");

await setViewport(1440, 1000);
await navigate("en");
await scrollCompany(0.5);
await waitFor(`document.querySelector('#company video').readyState >= 2`, "motion proof did not decode", 500);
const video = await evaluate(`(() => { const v=document.querySelector('#company video'); return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,playsInline:v.playsInline,src:v.currentSrc}; })()`);
assert.ok(video.duration >= 9.8 && video.duration <= 10, "master film duration is within the approved range");
assert.equal(video.width, 960, "desktop master width is loaded");
assert.equal(video.height, 540, "desktop master height is loaded");
assert.equal(video.muted, true, "motion proof is muted");
assert.equal(video.playsInline, true, "motion proof plays inline");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await new Promise((resolve) => setTimeout(resolve, 100));
const reduced = await evaluate(`(() => ({track:getComputedStyle(document.querySelector('.company-scroll-track')).height, video:getComputedStyle(document.querySelector('.company-film-video')).display, chapters:[...document.querySelectorAll('.company-chapter')].map((node)=>getComputedStyle(node).position)}))()`);
assert.equal(reduced.video, "none", "reduced motion hides video");
assert.ok(reduced.chapters.every((value) => value === "static"), "reduced motion restores static chapter flow");
await send("Emulation.setEmulatedMedia", { features: [] });

const frameTimes = [0.2, 3.08, 3.38, 3.68, 6.12, 6.42, 9.5];
for (const time of frameTimes) {
  await evaluate(`(async () => {
    let review = document.querySelector('#company-review-video');
    if (!review) {
      review = document.createElement('video');
      review.id = 'company-review-video';
      review.src = '/assets/company/company-master-desktop.mp4?v=2';
      review.muted = true;
      Object.assign(review.style,{position:'fixed',inset:'0',width:'100vw',height:'100vh',objectFit:'contain',background:'#faf8f5',zIndex:'999999'});
      document.body.append(review);
      await new Promise((resolve) => review.addEventListener('loadedmetadata', resolve, {once:true}));
    }
    review.currentTime = ${time};
    await new Promise((resolve) => review.addEventListener('seeked', resolve, {once:true}));
  })()`);
  await screenshot(`motion-${String(time).replace('.', '-')}.png`);
}
await evaluate(`document.querySelector('#company-review-video')?.remove()`);

const actionable = problems.filter((item) => !item.includes("favicon.ico") && !item.includes("preloaded using link preload"));
assert.deepEqual(actionable, [], `browser console problems: ${actionable.join(" | ")}`);

fs.writeFileSync(path.join(outputDirectory, "validation.json"), JSON.stringify({ video, viewports: results, reducedMotion: reduced, consoleProblems: actionable }, null, 2));
socket.close();
console.log("Company section responsive, chapter, video, locale, RTL, reduced-motion and console validation passed.");
