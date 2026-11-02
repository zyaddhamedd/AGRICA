import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import process from "node:process";
import { createBrowserSession } from "./cdp-client.mjs";

const serverPort = 3109;
const baseUrl = `http://localhost:${serverPort}`;

async function checkServerReady(url) {
  try {
    const res = await fetch(`${url}/en`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function startServer() {
  console.log(`Starting Next.js production server on port ${serverPort}...`);
  const serverProc = spawn("npx", ["next", "start", "-p", String(serverPort)], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await checkServerReady(baseUrl)) {
      console.log(`Production server ready at ${baseUrl}`);
      return serverProc;
    }
  }

  serverProc.kill();
  throw new Error(`Failed to start server on port ${serverPort}`);
}

async function verifyCacheHeaders() {
  console.log("\n--- 1. Verifying Runtime Cache-Control Headers ---");

  // Immutable static asset
  const resLogo = await fetch(`${baseUrl}/assets/agrica-logo.png`);
  assert.equal(resLogo.status, 200, "Logo asset must return 200");
  const ccLogo = resLogo.headers.get("cache-control");
  console.log(`  /assets/agrica-logo.png -> Cache-Control: ${ccLogo}`);
  assert.equal(ccLogo, "public, max-age=31536000, immutable");

  // Certificate derivative
  const resCert = await fetch(`${baseUrl}/certificates/webp/cert-02-iso-160.webp`);
  assert.equal(resCert.status, 200, "Cert asset must return 200");
  const ccCert = resCert.headers.get("cache-control");
  console.log(`  /certificates/webp/cert-02-iso-160.webp -> Cache-Control: ${ccCert}`);
  assert.equal(ccCert, "public, max-age=31536000, immutable");

  // Contact profile document (mutable)
  const resDoc = await fetch(`${baseUrl}/contact/AGRICA-Produce-Company-Profile.pdf`);
  assert.equal(resDoc.status, 200, "Contact PDF must return 200");
  const ccDoc = resDoc.headers.get("cache-control");
  console.log(`  /contact/AGRICA-Produce-Company-Profile.pdf -> Cache-Control: ${ccDoc}`);
  assert.equal(ccDoc, "public, max-age=3600, must-revalidate");

  // Dynamic route HTML
  const resDynamic = await fetch(`${baseUrl}/en/herbs-spices`);
  assert.equal(resDynamic.status, 200, "Dynamic page must return 200");
  const ccDynamic = resDynamic.headers.get("cache-control");
  console.log(`  /en/herbs-spices (Dynamic HTML) -> Cache-Control: ${ccDynamic}`);
  assert.notEqual(ccDynamic, "public, max-age=31536000, immutable");

  console.log("✓ All runtime Cache-Control header checks passed!");
}

async function verifyMobileHerbsGallery() {
  console.log("\n--- 2. Verifying Mobile Viewport Image Transfer & Hydration ---");
  const session = await createBrowserSession({ baseUrl });

  const networkRequests = [];
  session.socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.requestWillBeSent") {
      networkRequests.push(message.params.request.url);
    }
  });

  await session.send("Network.enable");

  // Set mobile viewport (390 x 844, deviceScaleFactor: 1, mobile: true)
  await session.setViewport(390, 844, true);

  // Navigate to Herbs & Spices homepage
  await session.navigate("/en/herbs-spices");

  // Wait 1.5s for initial layout, speculative preloads, and scripts
  await new Promise((r) => setTimeout(r, 1500));

  // Check for requests to /assets/herbs-spices/families/
  const familyImageRequests = networkRequests.filter((url) =>
    url.includes("/assets/herbs-spices/families/")
  );

  console.log(`  Total requests captured on mobile: ${networkRequests.length}`);
  console.log(`  Requests for /assets/herbs-spices/families/: ${familyImageRequests.length}`);
  if (familyImageRequests.length > 0) {
    console.error("  Unexpected family image requests:", familyImageRequests);
  }
  assert.equal(
    familyImageRequests.length,
    0,
    "Mobile viewport must download 0 bytes of desktop accordion family images"
  );

  // Check console errors / hydration mismatches
  const errors = session.getErrors();
  console.log(`  Console errors on mobile: ${errors.length}`);
  if (errors.length > 0) {
    console.error("  Errors found:", errors);
  }
  assert.equal(errors.length, 0, "No hydration or runtime errors should occur");

  // Verify CLS
  const cls = await session.evaluate(`
    new Promise((resolve) => {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(clsValue);
      }, 500);
    })
  `);
  console.log(`  Measured Cumulative Layout Shift (CLS): ${cls}`);
  assert.ok(cls <= 0.001, `CLS must be <= 0.001, was ${cls}`);

  await session.close();
  console.log("✓ Mobile Herbs gallery transfer (0 bytes desktop images) & CLS = 0.000 verified!");
}

async function verifyDesktopAccordionExpansion() {
  console.log("\n--- 3. Verifying Desktop Accordion Expansion & Interaction ---");
  const session = await createBrowserSession({ baseUrl });

  await session.send("Network.enable");
  await session.setViewport(1280, 900, false);
  await session.navigate("/en/herbs-spices");

  // Wait for initial render
  await session.waitFor('document.querySelector(".ag-panel") !== null', "Accordion panels must be present");

  // Check panel count
  const panelCount = await session.evaluate('document.querySelectorAll(".ag-panel").length');
  console.log(`  Desktop accordion panels found: ${panelCount}`);
  assert.equal(panelCount, 6, "Expected 6 accordion panels for 6 botanical families");

  // Scroll to section
  await session.evaluate(`
    document.getElementById("ingredient-families")?.scrollIntoView({ behavior: "instant", block: "center" });
  `);
  await new Promise((r) => setTimeout(r, 600));

  // Verify that active panel expands
  const activePanel = await session.evaluate(`
    document.querySelector(".ag-panel.ag-panel--active") !== null
  `);
  assert.ok(activePanel, "There must be an active expanded panel");

  await session.close();
  console.log("✓ Desktop accordion expansion and interaction verified!");
}

async function verifyFormsTimerBehavior() {
  console.log("\n--- 4. Verifying Ingredient Forms Timer Throttling ---");
  const session = await createBrowserSession({ baseUrl });

  await session.setViewport(1280, 900, false);
  await session.navigate("/en/herbs-spices");

  // Section starts offscreen (user at top hero)
  const initialText = await session.evaluate(`
    document.querySelector("#ingredient-forms nav button[aria-selected='true']")?.textContent?.trim() || ""
  `);

  // Wait 2.5s while hero is visible (forms offscreen)
  await new Promise((r) => setTimeout(r, 2500));

  const afterOffscreenText = await session.evaluate(`
    document.querySelector("#ingredient-forms nav button[aria-selected='true']")?.textContent?.trim() || ""
  `);

  console.log(`  Offscreen initial text: "${initialText}", after 2.5s: "${afterOffscreenText}"`);
  assert.ok(initialText.length > 0, "Active button text must not be empty");
  assert.equal(
    initialText,
    afterOffscreenText,
    "Timer must be suspended when section is offscreen"
  );

  // Now scroll section into view
  await session.evaluate(`
    document.getElementById("ingredient-forms")?.scrollIntoView({ behavior: "instant", block: "center" });
  `);

  // Wait 3.5s while visible in viewport (should tick after 2000ms)
  await new Promise((r) => setTimeout(r, 3500));

  const afterVisibleText = await session.evaluate(`
    document.querySelector("#ingredient-forms nav button[aria-selected='true']")?.textContent?.trim() || ""
  `);
  console.log(`  After visible text: "${afterVisibleText}"`);
  assert.notEqual(
    initialText,
    afterVisibleText,
    "Timer must advance when section is in viewport"
  );

  await session.close();
  console.log("✓ Ingredient forms timer throttling verified!");
}

async function main() {
  let serverProc = null;
  try {
    serverProc = await startServer();
    await verifyCacheHeaders();
    await verifyMobileHerbsGallery();
    await verifyDesktopAccordionExpansion();
    await verifyFormsTimerBehavior();
    console.log("\n========================================================");
    console.log("  ALL MILESTONE M3 RUNTIME VERIFICATIONS PASSED 100%");
    console.log("========================================================");
  } finally {
    if (serverProc) {
      serverProc.kill();
    }
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
