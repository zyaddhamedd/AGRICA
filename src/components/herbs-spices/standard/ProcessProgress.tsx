"use client";

import React, { useEffect, useState } from "react";
import type { HerbsSpicesProcessStage } from "@/types/herbs-spices-process";
import styles from "./ProcessProgress.module.css";

export function ProcessProgress({ stages }: { readonly stages: readonly HerbsSpicesProcessStage[] }): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(stages[0]?.index ?? "01");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-process-stage]"));
    if (!("IntersectionObserver" in window) || sections.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const index = visible?.target.getAttribute("data-process-stage");
      if (index) setActiveIndex(index);
    }, { rootMargin: "-28% 0px -52%", threshold: [0, .15, .4] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <nav className={styles.progress} aria-label="Process stages">
    <p><span>Stage</span><strong>{activeIndex} / {String(stages.length).padStart(2, "0")}</strong></p>
    <ol>{stages.map((stage) => {
      const current = activeIndex === stage.index;
      return <li key={stage.id}><a href={`#stage-${stage.index}`} aria-current={current ? "step" : undefined}><span>{stage.index}</span><strong>{stage.title}</strong>{current && <em>Current</em>}</a></li>;
    })}</ol>
  </nav>;
}
