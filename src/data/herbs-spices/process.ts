import type { HerbsSpicesProcessStage } from "@/types/herbs-spices-process";

/**
 * Phase 7 storytelling seed only. These stages describe a generic narrative,
 * not AGRICA's verified operating process. Replace after client approval.
 */
export const HERBS_SPICES_PROCESS_STAGES = [
  {
    id: "herbs-spices-process:source",
    index: "01",
    title: "Source",
    shortLabel: "Raw material",
    description: "The journey begins with the agricultural material and the ingredient form it is intended to become.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-source",
  },
  {
    id: "herbs-spices-process:prepare",
    index: "02",
    title: "Prepare",
    shortLabel: "Shape the material",
    description: "The material is prepared for its next stage through considered handling and form-specific preparation.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-prepare",
  },
  {
    id: "herbs-spices-process:dry",
    index: "03",
    title: "Dry",
    shortLabel: "Reduce moisture",
    description: "Moisture is reduced through the selected approach for the intended ingredient expression.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-dry",
  },
  {
    id: "herbs-spices-process:grade",
    index: "04",
    title: "Grade",
    shortLabel: "Define the form",
    description: "The material is organized according to its intended commercial format and presentation.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-grade",
  },
  {
    id: "herbs-spices-process:pack",
    index: "05",
    title: "Pack",
    shortLabel: "Prepare the format",
    description: "The prepared ingredient moves into the packing format specified for the commercial brief.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-pack",
  },
  {
    id: "herbs-spices-process:export",
    index: "06",
    title: "Export",
    shortLabel: "Commercial handover",
    description: "The ingredient is prepared for commercial handover and the next step in its onward supply journey.",
    status: "placeholder",
    verified: false,
    mediaKey: "process-export",
  },
] as const satisfies readonly HerbsSpicesProcessStage[];
