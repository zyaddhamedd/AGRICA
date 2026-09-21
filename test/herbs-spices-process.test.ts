import assert from "node:assert/strict";
import { HERBS_SPICES_PROCESS_STAGES } from "../src/data/herbs-spices/process";
import { HERBS_SPICES_MEDIA } from "../src/data/herbs-spices/media";

console.log("--- AGRICA Herbs & Spices Process Story Verification ---");

assert.deepEqual(HERBS_SPICES_PROCESS_STAGES.map((stage) => stage.title), ["Source", "Prepare", "Dry", "Grade", "Pack", "Export"]);
assert.deepEqual(HERBS_SPICES_PROCESS_STAGES.map((stage) => stage.index), ["01", "02", "03", "04", "05", "06"]);
assert.equal(new Set(HERBS_SPICES_PROCESS_STAGES.map((stage) => stage.id)).size, 6);
assert.deepEqual(HERBS_SPICES_PROCESS_STAGES.map((stage) => stage.mediaKey), ["process-source", "process-prepare", "process-dry", "process-grade", "process-pack", "process-export"]);
assert.equal(Object.keys(HERBS_SPICES_MEDIA.process).length, 6);

const prohibitedFields = ["temperature", "duration", "machinery", "humidity", "moisture", "certifications", "testing", "frequency", "grades", "packagingStandard", "destinations", "shelfLife"] as const;
for (const stage of HERBS_SPICES_PROCESS_STAGES) {
  assert.ok(stage.id.startsWith("herbs-spices-process:"));
  assert.equal(stage.status, "placeholder");
  assert.equal(stage.verified, false);
  assert.ok(Object.values(HERBS_SPICES_MEDIA.process).some((media) => media.key === stage.mediaKey));
  for (const field of prohibitedFields) assert.equal(field in stage, false, `${stage.id} must not contain ${field}`);
}

console.log("✓ Six ordered placeholder-safe process stages");
console.log("✓ Stable IDs and no unverified technical fields");
