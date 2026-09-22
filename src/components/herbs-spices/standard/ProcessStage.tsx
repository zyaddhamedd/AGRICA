import React from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import { getHerbsSpicesMedia } from "@/data/herbs-spices/media";
import type { HerbsSpicesProcessStage } from "@/types/herbs-spices-process";
import styles from "./ProcessStage.module.css";

export function ProcessStage({ stage }: { readonly stage: HerbsSpicesProcessStage }): React.JSX.Element {
  const anchor = `stage-${stage.index}`;
  const media = getHerbsSpicesMedia(stage.mediaKey);
  return <section className={styles.stage} id={anchor} data-process-stage={stage.index} data-media={stage.mediaKey} aria-labelledby={`${anchor}-title`}>
    <div className={styles.copy}>
      <span className={styles.index}><bdi>{stage.index}</bdi></span>
      <p>{stage.shortLabel}</p>
      <h2 id={`${anchor}-title`}>{stage.title}</h2>
      <div className={styles.rule} aria-hidden="true" />
      <span className={styles.description}>{stage.description}</span>
    </div>
    <HerbsSpicesMedia className={styles.specimen} entry={media} decorative fallback={<><div className={styles.sheet} /><i /><i /><i /><b /></>} />
  </section>;
}
