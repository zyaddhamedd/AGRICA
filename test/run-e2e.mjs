#!/usr/bin/env node

/**
 * AGRICA 4-Tier E2E Test Suite Runner
 *
 * Runs browser regression tests across 4 tiers:
 *   Tier 1: Feature Coverage
 *   Tier 2: Boundary & Corner Cases
 *   Tier 3: Cross-Feature Combinations
 *   Tier 4: Real-World Scenarios (Customer Journey)
 *
 * Usage:
 *   node test/run-e2e.mjs [--all] [--tier 1] [--tier 2] [--tier 3] [--tier 4] [--port 3108]
 */

import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const serverPort = portIndex !== -1 ? args[portIndex + 1] : process.env.PORT || "3108";
const baseUrl = process.env.BASE_URL || `http://localhost:${serverPort}`;

let targetTiers = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tier" && args[i + 1]) {
    targetTiers.push(parseInt(args[i + 1], 10));
  }
}

if (targetTiers.length === 0 || args.includes("--all")) {
  targetTiers = [1, 2, 3, 4];
}

const tierFiles = {
  1: { name: "Tier 1: Feature Coverage", file: "tier1-feature-coverage.test.mjs" },
  2: { name: "Tier 2: Boundary & Corner Cases", file: "tier2-boundary-corner.test.mjs" },
  3: { name: "Tier 3: Cross-Feature Combinations", file: "tier3-cross-feature.test.mjs" },
  4: { name: "Tier 4: Real-World Customer Journey", file: "tier4-customer-journey.test.mjs" },
};

async function checkServerReady(url) {
  try {
    const res = await fetch(`${url}/en`);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function ensureServerRunning() {
  const isRunning = await checkServerReady(baseUrl);
  if (isRunning) {
    console.log(`[E2E Runner] Production server already running at ${baseUrl}`);
    return null;
  }

  console.log(`[E2E Runner] Starting Next.js production server on port ${serverPort}...`);
  const serverProc = spawn("npx", ["next", "start", "-p", serverPort], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  let ready = false;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await checkServerReady(baseUrl)) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    serverProc.kill();
    throw new Error(`[E2E Runner] Production server failed to start at ${baseUrl}`);
  }

  console.log(`[E2E Runner] Production server is ready at ${baseUrl}`);
  return serverProc;
}

function runTier(tierNumber, tierInfo) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const filePath = path.join(__dirname, tierInfo.file);
    const proc = spawn(process.execPath, [filePath], {
      stdio: "inherit",
      env: {
        ...process.env,
        BASE_URL: baseUrl,
      },
    });

    proc.on("close", (code) => {
      const durationMs = Date.now() - startTime;
      resolve({
        tier: tierNumber,
        name: tierInfo.name,
        passed: code === 0,
        code,
        durationMs,
      });
    });
  });
}

async function main() {
  console.log("==================================================================");
  console.log("  AGRICA Full-Site Performance & Regression E2E Test Runner");
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Tiers to run: ${targetTiers.join(", ")}`);
  console.log("==================================================================");

  let serverProc = null;
  const results = [];
  try {
    serverProc = await ensureServerRunning();

    for (const tierNum of targetTiers) {
      const tierInfo = tierFiles[tierNum];
      if (!tierInfo) continue;
      const result = await runTier(tierNum, tierInfo);
      results.push(result);
      if (!result.passed) {
        console.error(`\n❌ [FAILURE] ${tierInfo.name} failed with exit code ${result.code}`);
      }
    }
  } finally {
    if (serverProc) {
      console.log("[E2E Runner] Shutting down spawned Next.js production server...");
      serverProc.kill();
    }
  }

  console.log("\n==================================================================");
  console.log("  E2E TEST SUITE EXECUTION SUMMARY");
  console.log("==================================================================");
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? "✓ PASS" : "✗ FAIL";
    const duration = (r.durationMs / 1000).toFixed(2);
    console.log(`  ${status} | ${r.name.padEnd(42)} | ${duration}s`);
    if (!r.passed) allPassed = false;
  }
  console.log("==================================================================");

  if (allPassed) {
    console.log("🎉 ALL E2E TEST TIERS PASSED SUCCESSFULLY!");
    process.exit(0);
  } else {
    console.error("❌ ONE OR MORE TEST TIERS FAILED.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
