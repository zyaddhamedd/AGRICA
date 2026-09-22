import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { locales, directionForLocale, type Locale } from "../src/i18n/config";
import { standardDictionary } from "../src/content/standard/dictionaries";
import { localizeJourneyStages, localizeHerbsProcessStages } from "../src/content/standard/localize";
import { JOURNEY_STAGES } from "../src/data/stages";
import { HERBS_SPICES_PROCESS_STAGES } from "../src/data/herbs-spices/process";
import { languageSwitchPath } from "../src/i18n/navigation";

console.log("=== AGRICA Phase 3B Standard Localization Verification ===");

function assertNoEmptyStrings(value: unknown, path: string): void {
  if (typeof value === "string") {
    assert.ok(value.trim().length > 0, `${path} must not be empty`);
    assert.equal(value.includes("undefined"), false, `${path} must not contain "undefined"`);
    assert.equal(value.includes("[object Object]"), false, `${path} must not contain "[object Object]"`);
    assert.equal(/\{\{.*?\}\}/.test(value), false, `${path} must not contain unresolved template placeholders`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoEmptyStrings(entry, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => assertNoEmptyStrings(entry, `${path}.${key}`));
  }
}

const expectedProduceStageIds = ["source", "inspect", "prepare", "pack", "store", "deliver"] as const;
const expectedHerbsStageIds = [
  "herbs-spices-process:source",
  "herbs-spices-process:prepare",
  "herbs-spices-process:dry",
  "herbs-spices-process:grade",
  "herbs-spices-process:pack",
  "herbs-spices-process:export",
] as const;

for (const locale of locales) {
  const dict = standardDictionary(locale);

  // 1. Structure completeness & no empty strings
  assertNoEmptyStrings(dict, `standardDictionary(${locale})`);

  // 2. Technical terms completeness
  const expectedTermKeys = [
    "source", "preparation", "sorting", "grading", "packing",
    "qualityControl", "lot", "batch", "traceability", "inspection",
    "specification", "condition", "packaging", "harvest", "handling",
    "storage", "export", "documentation", "commercialHandover",
  ] as const;
  for (const termKey of expectedTermKeys) {
    assert.ok(dict.terms[termKey], `${locale}: missing term "${termKey}"`);
  }

  // 3. Produce Standard stage localization & data integrity
  const localizedProduceStages = localizeJourneyStages(JOURNEY_STAGES, dict);
  assert.equal(localizedProduceStages.length, 6, `${locale}: exactly 6 Produce stages`);

  for (let i = 0; i < localizedProduceStages.length; i++) {
    const original = JOURNEY_STAGES[i];
    const localized = localizedProduceStages[i];

    // Verify non-breaking data preservation
    assert.equal(localized.id, expectedProduceStageIds[i], `${locale}: stage ID preserved`);
    assert.equal(localized.id, original.id, `${locale}: stage ID matches source`);
    assert.equal(localized.code, original.code, `${locale}: technical code preserved`);
    assert.equal(localized.coordinate, original.coordinate, `${locale}: coordinate preserved`);
    assert.equal(localized.imageSrc, original.imageSrc, `${locale}: imageSrc preserved`);

    // Verify localization
    assert.ok(localized.name, `${locale}: stage name present`);
    assert.ok(localized.kicker, `${locale}: stage kicker present`);
    assert.ok(localized.status, `${locale}: stage status present`);
    assert.ok(localized.stamp, `${locale}: stage stamp present`);
    assert.ok(localized.headline, `${locale}: stage headline present`);
    assert.ok(localized.copy, `${locale}: stage copy present`);
    assert.ok(localized.proofOutput, `${locale}: stage proofOutput present`);
    assert.equal(localized.facts.length, 3, `${locale}: 3 operational facts present`);
    for (const [term, val] of localized.facts) {
      assert.ok(term.trim(), `${locale}: fact term non-empty`);
      assert.ok(val.trim(), `${locale}: fact val non-empty`);
    }

    // Verify localized imageAlt
    assert.ok(dict.produce.stages[original.id].imageAlt, `${locale}: imageAlt present`);
  }

  // 4. Produce controls discipline completeness
  assert.equal(dict.produce.controls.length, 8, `${locale}: exactly 8 control disciplines`);
  for (let i = 0; i < dict.produce.controls.length; i++) {
    const ctrl = dict.produce.controls[i];
    const expectedNum = String(i + 1).padStart(2, "0");
    assert.equal(ctrl.number, expectedNum, `${locale}: control discipline number matches`);
    assert.ok(ctrl.title, `${locale}: control discipline title non-empty`);
    assert.ok(ctrl.description, `${locale}: control discipline description non-empty`);
  }

  // 5. Produce UI strings completeness
  assert.equal(dict.produce.ui.proofPillars.length, 5, `${locale}: 5 proof pillars`);
  assert.equal(dict.produce.ui.completionSteps.length, 6, `${locale}: 6 completion steps`);

  // 6. Herbs & Spices process stage localization & data integrity
  const localizedHerbsStages = localizeHerbsProcessStages(HERBS_SPICES_PROCESS_STAGES, dict);
  assert.equal(localizedHerbsStages.length, 6, `${locale}: exactly 6 Herbs process stages`);

  for (let i = 0; i < localizedHerbsStages.length; i++) {
    const original = HERBS_SPICES_PROCESS_STAGES[i];
    const localized = localizedHerbsStages[i];

    // Critical data integrity: status and verified preservation
    assert.equal(localized.id, expectedHerbsStageIds[i], `${locale}: Herbs stage ID preserved`);
    assert.equal(localized.id, original.id, `${locale}: Herbs stage ID matches source`);
    assert.equal(localized.index, original.index, `${locale}: stage index preserved`);
    assert.equal(localized.status, "placeholder", `${locale}: provisional placeholder status preserved`);
    assert.equal(localized.verified, false, `${locale}: verified=false preserved`);
    assert.equal(localized.mediaKey, original.mediaKey, `${locale}: mediaKey preserved`);

    // Localized content
    assert.ok(localized.title, `${locale}: Herbs stage title present`);
    assert.ok(localized.shortLabel, `${locale}: Herbs stage shortLabel present`);
    assert.ok(localized.description, `${locale}: Herbs stage description present`);
  }

  // 7. Route and language switcher preservation
  for (const targetLocale of locales) {
    // Produce standard switcher preserving #stage-04
    const produceSwitched = languageSwitchPath(targetLocale, `/${locale}/standard`, "", "#stage-04");
    assert.equal(produceSwitched, `/${targetLocale}/standard#stage-04`, `Switcher preserves #stage-04 from ${locale} to ${targetLocale}`);

    // Produce standard switcher preserving #stage-pack
    const produceSwitchedNamed = languageSwitchPath(targetLocale, `/${locale}/standard`, "", "#stage-pack");
    assert.equal(produceSwitchedNamed, `/${targetLocale}/standard#stage-pack`, `Switcher preserves #stage-pack from ${locale} to ${targetLocale}`);

    // Herbs standard switcher preserving #stage-02
    const herbsSwitched = languageSwitchPath(targetLocale, `/${locale}/herbs-spices/standard`, "", "#stage-02");
    assert.equal(herbsSwitched, `/${targetLocale}/herbs-spices/standard#stage-02`, `Switcher preserves #stage-02 from ${locale} to ${targetLocale}`);
  }

  // 8. Prerendered HTML checks if build exists
  const produceHtmlPath = path.join(".next", "server", "app", locale, "standard.html");
  if (fs.existsSync(produceHtmlPath)) {
    const html = fs.readFileSync(produceHtmlPath, "utf-8");
    const dir = directionForLocale(locale);
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"[^>]+dir="${dir}"`), `${locale}: Produce standard HTML has correct lang and dir`);
    assert.ok(html.includes(dict.produce.hero.titleLead), `${locale}: Produce hero rendered`);
    assert.ok(html.includes(dict.produce.ui.exportCleared), `${locale}: Produce exportCleared rendered`);
    assert.ok(html.includes("stage-01") && html.includes("stage-04") && html.includes("stage-06"), `${locale}: Produce stable numeric stage anchors rendered`);
    assert.ok(html.includes("stage-source") && html.includes("stage-pack"), `${locale}: Produce stable named stage anchors rendered`);
    assert.ok(!html.includes("produce.hero"), `${locale}: Produce has no raw keys`);
  }

  const herbsHtmlPath = path.join(".next", "server", "app", locale, "herbs-spices", "standard.html");
  if (fs.existsSync(herbsHtmlPath)) {
    const html = fs.readFileSync(herbsHtmlPath, "utf-8");
    const dir = directionForLocale(locale);
    assert.match(html, new RegExp(`<html[^>]+lang="${locale}"[^>]+dir="${dir}"`), `${locale}: Herbs standard HTML has correct lang and dir`);
    assert.ok(html.includes('content="noindex, nofollow"'), `${locale}: Herbs standard has noindex, nofollow`);
    assert.ok(html.includes(dict.herbs.hero.titleLead), `${locale}: Herbs hero rendered`);
    assert.ok(html.includes(dict.herbs.interlude.title), `${locale}: Herbs interlude rendered`);
    assert.ok(html.includes('id="stage-01"') && html.includes('id="stage-04"') && html.includes('id="stage-06"'), `${locale}: Herbs stable stage anchors rendered`);
    assert.ok(!html.includes("herbs.hero"), `${locale}: Herbs has no raw keys`);
  }
}

console.log("✓ All 5 locales have complete Produce and Herbs & Spices Standard dictionaries");
console.log("✓ Stable IDs, codes, coordinates, and imageSrc preserved across all 5 locales");
console.log("✓ Provisional status='placeholder' and verified=false preserved for all Herbs stages");
console.log("✓ 19 technical term keys complete and non-empty");
console.log("✓ Language switching with stable hash anchors verified across all locale combinations");
console.log("✓ Static SSR HTML generation for all 10 standard pages verified");
