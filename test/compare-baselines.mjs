import fs from "node:fs/promises";

async function main() {
  const beforeRaw = JSON.parse(await fs.readFile("/Users/zyad/Projects/AGRICA/.agents/teamwork/worker_m0/baseline_raw.json", "utf8"));
  const afterRaw = JSON.parse(await fs.readFile("/Users/zyad/Projects/AGRICA/.agents/teamwork/baseline_after_m5/baseline_raw.json", "utf8"));

  console.log("\n=======================================================");
  console.log("  AGRICA M0 (BEFORE) vs M5 (AFTER) PERFORMANCE COMPARISON ");
  console.log("=======================================================\n");

  const comparison = [];

  for (const afterEntry of afterRaw) {
    const beforeEntry = beforeRaw.find(
      (b) => b.route === afterEntry.route && b.viewport === afterEntry.viewport
    );

    const afterMetrics = afterEntry.metrics;
    const beforeMetrics = beforeEntry ? beforeEntry.metrics : null;

    const row = {
      route: afterEntry.route,
      viewport: afterEntry.viewport,
      before: beforeMetrics ? {
        requests: beforeMetrics.requestsCount,
        transferMb: (beforeMetrics.totalTransferBytes / 1024 / 1024).toFixed(2),
        imgMediaMb: (beforeMetrics.imageMediaTransferBytes / 1024 / 1024).toFixed(2),
        dclMs: beforeMetrics.domContentLoadedMs,
        lcpMs: beforeMetrics.lcpMs,
        cls: beforeMetrics.cls,
      } : null,
      after: {
        requests: afterMetrics.requestsCount,
        transferMb: (afterMetrics.totalTransferBytes / 1024 / 1024).toFixed(2),
        imgMediaMb: (afterMetrics.imageMediaTransferBytes / 1024 / 1024).toFixed(2),
        dclMs: afterMetrics.domContentLoadedMs,
        lcpMs: afterMetrics.lcpMs,
        cls: afterMetrics.cls,
        tbtMs: afterMetrics.tbtMs,
      },
      delta: null,
    };

    if (beforeMetrics) {
      const bytesDiff = afterMetrics.totalTransferBytes - beforeMetrics.totalTransferBytes;
      const bytesPct = ((bytesDiff / beforeMetrics.totalTransferBytes) * 100).toFixed(1);
      const reqDiff = afterMetrics.requestsCount - beforeMetrics.requestsCount;
      const reqPct = ((reqDiff / beforeMetrics.requestsCount) * 100).toFixed(1);
      const lcpDiff = afterMetrics.lcpMs - beforeMetrics.lcpMs;
      const lcpPct = ((lcpDiff / beforeMetrics.lcpMs) * 100).toFixed(1);

      row.delta = {
        bytesDiffMb: (bytesDiff / 1024 / 1024).toFixed(2),
        bytesPct: `${bytesPct}%`,
        reqDiff,
        reqPct: `${reqPct}%`,
        lcpDiffMs: lcpDiff,
        lcpPct: `${lcpPct}%`,
      };
    }

    comparison.push(row);
  }

  console.log(JSON.stringify(comparison, null, 2));

  // Also write markdown table
  let md = "# AGRICA Before (M0) vs After (M5) Baseline Comparison\n\n";
  md += "| Route | Viewport | Requests (Before → After) | Req % | Transfer (Before → After) | Transfer % | LCP (Before → After) | LCP % | CLS (Before / After) |\n";
  md += "|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n";

  for (const c of comparison) {
    if (c.before) {
      md += `| \`${c.route}\` | ${c.viewport} | ${c.before.requests} → ${c.after.requests} (${c.delta.reqDiff > 0 ? '+' : ''}${c.delta.reqDiff}) | **${c.delta.reqPct}** | ${c.before.transferMb} MB → ${c.after.transferMb} MB | **${c.delta.bytesPct}** | ${c.before.lcpMs}ms → ${c.after.lcpMs}ms | **${c.delta.lcpPct}** | ${c.before.cls} / ${c.after.cls} |\n`;
    } else {
      md += `| \`${c.route}\` | ${c.viewport} | N/A → ${c.after.requests} | NEW | N/A → ${c.after.transferMb} MB | NEW | N/A → ${c.after.lcpMs}ms | NEW | N/A / ${c.after.cls} |\n`;
    }
  }

  await fs.writeFile("/Users/zyad/Projects/AGRICA/.agents/teamwork/baseline_after_m5/comparison_summary.md", md, "utf8");
  await fs.writeFile("/Users/zyad/Projects/AGRICA/.agents/teamwork/baseline_after_m5/comparison.json", JSON.stringify(comparison, null, 2), "utf8");
  console.log("\nSaved comparison to .agents/teamwork/baseline_after_m5/comparison_summary.md and comparison.json");
}

main().catch(console.error);
