import Image from "next/image";
import React from "react";
import type { HerbsSpicesMediaManifestEntry } from "@/types/herbs-spices";
import styles from "./HerbsSpicesMedia.module.css";

export interface HerbsSpicesMediaProps {
  readonly entry?: HerbsSpicesMediaManifestEntry;
  readonly className: string;
  readonly fallback: React.ReactNode;
  readonly decorative?: boolean;
  readonly sizes?: string;
}

/** Division-owned image slot: approved assets use next/image; pending assets keep the supplied CSS fallback. */
export function HerbsSpicesMedia({ entry, className, fallback, decorative = false, sizes }: HerbsSpicesMediaProps): React.JSX.Element {
  const approved = entry?.status === "approved";

  return (
    <div
      className={className}
      data-media-key={entry?.key}
      data-media-status={approved ? "approved" : "fallback"}
      aria-hidden={!approved || decorative ? true : undefined}
    >
      {approved ? (
        <Image
          className={styles.image}
          src={entry.src}
          alt={decorative ? "" : entry.alt}
          fill
          sizes={sizes ?? entry.sizes}
          preload={entry.preload}
          style={{ objectPosition: entry.cropFocus }}
        />
      ) : fallback}
    </div>
  );
}
