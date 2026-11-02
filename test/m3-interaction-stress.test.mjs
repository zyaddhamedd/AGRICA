import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import process from "node:process";
import { createBrowserSession } from "./cdp-client.mjs";

const serverPort = 3110;
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
  const serverProc = spawn("npx", ["next", "start", "-p", String(serverPort)], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await checkServerReady(baseUrl)) {
      return serverProc;
    }
  }

  serverProc.kill();
  throw new Error(`Failed to start server on port ${serverPort}`);
}

async function runAdversarialInteractionTests() {
  let serverProc = null;
  try {
    serverProc = await startServer();
    console.log(`Server started on port ${serverPort}`);

    const session = await createBrowserSession({ baseUrl });

    // Test 1: Boundary Breakpoint Gating (768px vs 769px)
    console.log("\n[Stress 1] Testing Exact Mobile/Desktop Breakpoint (768px vs 769px)...");
    
    // At 768px: Mobile Botanical cards must be visible, Desktop Accordion hidden
    await session.setViewport(768, 900, true);
    await session.navigate("/en/herbs-spices");
    const isMobileVisible768 = await session.evaluate(`
      window.getComputedStyle(document.querySelector("#ingredient-families .ag-panel")?.closest("[class*='desktopGalleryWrapper']")).display === "none"
    `);
    assert.ok(isMobileVisible768, "At 768px, desktop gallery wrapper must be display: none");

    // At 769px: Desktop Accordion visible, Mobile Botanical cards hidden
    await session.setViewport(769, 900, false);
    await session.navigate("/en/herbs-spices");
    const isDesktopVisible769 = await session.evaluate(`
      window.getComputedStyle(document.querySelector("#ingredient-families .ag-panel")?.closest("[class*='desktopGalleryWrapper']")).display !== "none"
    `);
    assert.ok(isDesktopVisible769, "At 769px, desktop gallery wrapper must be visible");
    console.log("  ✓ Breakpoint boundary 768px/769px verified precisely.");

    // Test 2: Rapid Keyboard Navigation in IngredientFormsSection
    console.log("\n[Stress 2] Testing Rapid Keyboard Navigation in IngredientFormsSection...");
    await session.setViewport(1280, 800, false);
    await session.navigate("/en/herbs-spices");
    
    // Focus the first button
    await session.evaluate(`
      const btn = document.querySelector("#ingredient-forms nav button");
      btn.focus();
    `);

    // Rapid ArrowDown presses (5 times)
    for (let i = 0; i < 5; i++) {
      await session.evaluate(`(() => {
        const activeBtn = document.querySelector("#ingredient-forms nav button[aria-selected='true']");
        activeBtn?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      })()`);
    }

    const formsCount = await session.evaluate(`document.querySelectorAll("#ingredient-forms nav button").length`);
    const activeIdx = await session.evaluate(`
      [...document.querySelectorAll("#ingredient-forms nav button")].findIndex(b => b.getAttribute("aria-selected") === "true")
    `);
    console.log(`  Total forms: ${formsCount}, Active index after 5 cycles: ${activeIdx}`);
    assert.equal(activeIdx, 5 % formsCount, "ArrowDown cycling must correctly modulo forms length");

    // Test 3: Flight Overlay across Viewport Range (390px, 768px, 1024px, 1440px)
    console.log("\n[Stress 3] Testing Product Card Flight Overlay across viewports...");
    const testViewports = [
      { w: 390, h: 844, name: "Mobile iPhone 390x844" },
      { w: 768, h: 1024, name: "Tablet iPad 768x1024" },
      { w: 1024, h: 768, name: "Small Desktop 1024x768" },
      { w: 1440, h: 900, name: "Standard Desktop 1440x900" },
    ];

    for (const vp of testViewports) {
      await session.setViewport(vp.w, vp.h, vp.w <= 768);
      await session.navigate("/en/products?world=fresh");

      // Find first product card front button and trigger flip
      await session.waitFor('document.querySelector(".export-card-keyboard-toggle") !== null', "Product trigger button not found");
      await session.evaluate(`document.querySelector(".export-card-keyboard-toggle").click()`);

      // Wait for flight dialog portal to mount and become ready
      await session.waitFor('document.getElementById("product-card-flight-dialog")?.dataset.ready === "true"', "Flight dialog must mount and become ready");

      // Verify body is locked without page scroll jump
      const bodyStyle = await session.evaluate(`(() => ({
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        width: document.body.style.width,
      }))()`);
      assert.equal(bodyStyle.overflow, "hidden", "Body overflow must be hidden when flight overlay is open");
      assert.equal(bodyStyle.position, "fixed", "Body position must be fixed to lock scroll");

      // Verify close button exists and works
      await session.waitFor('document.querySelector(".export-card-flight-close") !== null', "Close button must be present in flight card");
      await session.evaluate(`document.querySelector(".export-card-flight-close").click()`);

      // Wait for flight dialog to unmount
      await session.waitFor('document.getElementById("product-card-flight-dialog") === null', "Flight dialog must unmount after close");

      // Verify body unlock
      const bodyRestored = await session.evaluate(`document.body.style.overflow === "" && document.body.style.position === ""`);
      assert.ok(bodyRestored, `Body scroll must be cleanly restored on ${vp.name}`);

      console.log(`  ✓ Flight overlay on ${vp.name} opened, locked body, closed, and unlocked cleanly.`);
    }

    // Test 4: Rapid Flight Card Open/Close Hammering
    console.log("\n[Stress 4] Testing Rapid Flight Card Trigger Hammering (Stress Test)...");
    await session.setViewport(1280, 800, false);
    await session.navigate("/en/products?world=fresh");

    // Click trigger and immediately trigger Escape key without waiting for animation completion
    await session.waitFor('document.querySelector(".export-card-keyboard-toggle") !== null', "Trigger must be present");
    await session.evaluate(`document.querySelector(".export-card-keyboard-toggle").click()`);
    await session.evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    `);

    // Give 400ms for GSAP cleanup
    await new Promise((r) => setTimeout(r, 400));
    const dialogClosed = await session.evaluate(`document.getElementById("product-card-flight-dialog") === null`);
    assert.ok(dialogClosed, "Dialog must gracefully handle immediate escape interrupt without orphaned DOM");
    console.log("  ✓ Rapid open/close interrupt handled smoothly without UI freeze or orphaned DOM.");

    // Check for any unhandled JS errors
    const errors = session.getErrors();
    assert.equal(errors.length, 0, `No console errors should occur during adversarial tests. Errors: ${JSON.stringify(errors)}`);

    await session.close();
    console.log("\n========================================================");
    console.log("  ALL ADVERSARIAL STRESS TESTS PASSED CLEANLY!");
    console.log("========================================================");
  } finally {
    if (serverProc) {
      serverProc.kill();
    }
  }
}

runAdversarialInteractionTests().catch((err) => {
  console.error("Adversarial stress test failed:", err);
  process.exit(1);
});
