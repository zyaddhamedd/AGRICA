export type HerbsSpicesProcessStageStatus = "placeholder" | "verified";

import type { HerbsSpicesMediaKey } from "./herbs-spices";

export interface HerbsSpicesProcessStage {
  readonly id: `herbs-spices-process:${string}`;
  readonly index: string;
  readonly title: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly status: HerbsSpicesProcessStageStatus;
  readonly verified: boolean;
  readonly mediaKey?: HerbsSpicesMediaKey;
  readonly notes?: readonly string[];
}
