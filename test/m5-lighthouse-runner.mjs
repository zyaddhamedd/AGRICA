import { spawn, execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3189";
const LIGHTHOUSE_BIN = "/tmp/lighthouse-run/node_modules/.bin/lighthouse";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer() {
  try {
    const res = await fetch(`${BASE_URL}/en`);
    if (res.ok) {
      console.log(`Server already running at ${BASE_URL}`);
      return null;
    }
  } catch {}

  console.log(`Starting Next.js production server on ${BASE_URL}...`);
  const server = spawn("npx", ["next", "start", "-p", "3189"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  for (let i = 0; i < 30; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${BASE_URL}/en`);
      if (res.ok) {
        console.log(`Next.js server ready at ${BASE_URL}`);
        return server;
      }
    } catch {}
  }
  throw new Error("Failed to start Next.js production server");
}

async function runLighthouse(route) {
  const targetUrl = `${BASE_URL}${route}`;
  const outJsonPath = `/tmp/lh_${Date.now()}_${Math.random().toString(36).slice(2)}.json`;

  const args = [
    targetUrl,
    "--output=json",
    `--output-path=${outJsonPath}`,
    "--only-categories=performance",
    "--form-factor=mobile",
    '--chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage --mute-audio"',
    "--throttling-method=simulate",
    "--quiet",
  ];

  try {
    execSync(`${LIGHTHOUSE_BIN} ${args.join(" ")}`, {
      stdio: "pipe",
      timeout: 60000,
    });

    const reportContent = await fs.readFile(outJsonPath, "utf8");
    await fs.unlink(outJsonPath).catch(() => {});
    const data = JSON.parse(reportContent);

    const perfScore = Math.round((data.categories?.performance?.score ?? 0) * 100);
    const audits = data.audits || {};

    return {
      route,
      performanceScore: perfScore,
      fcpMs: audits["first-contentful-paint"]?.numericValue ? Math.round(audits["first-contentful-paint"].numericValue) : null,
      lcpMs: audits["largest-contentful-paint"]?.numericValue ? Math.round(audits["largest-contentful-paint"].numericValue) : null,
      cls: audits["cumulative-layout-shift"]?.numericValue !== undefined ? Number(audits["cumulative-layout-shift"].numericValue.toFixed(4)) : null,
      tbtMs: audits["total-blocking-time"]?.numericValue ? Math.round(audits["total-blocking-time"].numericValue) : null,
      speedIndexMs: audits["speed-index"]?.numericValue ? Math.round(audits["speed-index"].numericValue) : null,
    };
  } catch (err) {
    console.error(`Lighthouse failed for ${route}:`, err.message);
    return {
      route,
      error: err.message,
      performanceScore: null,
    };
  }
}

async function main() {
  const server = await ensureServer();
  try {
    const routes = [
      "/en",
      "/en/products?world=fresh",
      "/en/products?world=frozen",
      "/en/standard",
      "/en/company",
      "/contact",
      "/en/herbs-spices",
    ];

    console.log("\n=======================================================");
    console.log("  AGRICA M5 MOBILE LIGHTHOUSE AUDIT RUNNER            ");
    console.log("=======================================================\n");

    const results = [];
    for (const route of routes) {
      process.stdout.write(`Auditing ${route.padEnd(28)} ... `);
      const startTime = Date.now();
      const res = await runLighthouse(route);
      const dur = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Score: ${res.performanceScore ?? 'ERR'}/100 | LCP: ${res.lcpMs}ms | CLS: ${res.cls} | TBT: ${res.tbtMs}ms (${dur}s)`);
      results.push(res);
    }

    const outPath = "/Users/zyad/Projects/AGRICA/.agents/teamwork/baseline_after_m5/lighthouse_results.json";
    await fs.writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
    console.log(`\n✓ Lighthouse results written to ${outPath}`);
    return results;
  } finally {
    if (server) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((e) => {
  console.error("Lighthouse runner failed:", e);
  process.exit(1);
});
