import type { StandardDictionary } from "@/i18n/types";
import type { JourneyStage } from "@/types/agrica";
import type { HerbsSpicesProcessStage } from "@/types/herbs-spices-process";

export function localizeJourneyStages(stages: readonly JourneyStage[], dictionary: StandardDictionary): JourneyStage[] {
  return stages.map((stage) => {
    const text = dictionary.produce.stages[stage.id];
    if (!text) throw new Error(`Missing Standard stage translation: ${stage.id}`);
    return { ...stage, name:text.name,kicker:text.kicker,status:text.status,stamp:text.stamp,headline:text.headline,copy:text.copy,proofOutput:text.proofOutput,facts:text.facts };
  });
}

export function localizeHerbsProcessStages(stages: readonly HerbsSpicesProcessStage[], dictionary: StandardDictionary): HerbsSpicesProcessStage[] {
  return stages.map((stage) => {
    const text = dictionary.herbs.stages[stage.id];
    if (!text) throw new Error(`Missing Herbs process translation: ${stage.id}`);
    return { ...stage, title:text.title, shortLabel:text.shortLabel, description:text.description };
  });
}
