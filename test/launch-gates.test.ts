import assert from "node:assert/strict";
import fs from "node:fs";
import { divisionPageMetadata } from "../src/divisions/metadata";
import { locales } from "../src/i18n/config";
import { HERBS_SPICES_PROCESS_STAGES } from "../src/data/herbs-spices/process";

const source = fs.readFileSync("src/components/common/BusinessDivisionSwitcher.tsx", "utf8");
assert.ok(source.includes("SHOW_BUSINESS_DIVISION_SWITCHER = false"), "division switcher is disabled in navbar");
for (const locale of locales) {
  for (const page of ["home", "products", "standard"] as const) {
    const meta = divisionPageMetadata(locale, "herbs-spices", page);
    const suffix = page === "home" ? "" : `/${page}`;
    assert.equal(meta.alternates?.canonical, `https://www.agriculturecairo.com/${locale}/herbs-spices${suffix}`);
    assert.deepEqual(meta.robots, page === "standard" ? { index: false, follow: false } : { index: true, follow: true });
  }
}
assert.ok(HERBS_SPICES_PROCESS_STAGES.every((stage) => !stage.verified && stage.status === "placeholder"), "process indexing remains blocked until business verification");
console.log("✓ Public division navigation, localized canonicals and selective indexing policy verified");
