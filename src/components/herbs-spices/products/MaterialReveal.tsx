"use client";

import { gsap } from "gsap";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import type { HerbsSpicesCatalogueItem } from "@/types/herbs-spices";
import styles from "./MaterialReveal.module.css";

export interface MaterialRevealProps {
  readonly item: HerbsSpicesCatalogueItem;
  readonly closing: boolean;
  readonly onRequestClose: (restoreFocus?: boolean) => void;
  readonly onClosed: () => void;
}

export function MaterialReveal({ item, closing, onRequestClose, onClosed }: MaterialRevealProps): React.JSX.Element {
  const rootRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const animated = [root, ruleRef.current, contentRef.current].filter(Boolean);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(animated, { clearProps: "all" });
      return;
    }

    const context = gsap.context(() => {
      gsap.killTweensOf(animated);
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo(root, { height: 0 }, { height: "auto", duration: .46, ease: "power3.inOut" }, 0)
        .fromTo(ruleRef.current, { scaleX: 0 }, { scaleX: 1, duration: .36 }, 0)
        .fromTo(contentRef.current, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }, .16);
    }, root);

    return () => context.revert();
  }, [item.id]);

  useEffect(() => {
    if (!closing) return;
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClosed();
      return;
    }

    const animated = [root, ruleRef.current, contentRef.current].filter(Boolean);
    gsap.killTweensOf(animated);
    const timeline = gsap.timeline({ onComplete: onClosed });
    timeline
      .to(contentRef.current, { y: -6, opacity: 0, duration: .16, ease: "power2.in" })
      .to(ruleRef.current, { scaleX: 0, duration: .22, ease: "power2.in" }, 0)
      .to(root, { height: 0, duration: .28, ease: "power3.inOut" }, .06);
    return () => { timeline.kill(); };
  }, [closing, onClosed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || closing) return;
      event.preventDefault();
      onRequestClose(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closing, onRequestClose]);

  return (
    <section className={styles.reveal} id={`material-details-${item.slug}`} ref={rootRef} aria-label={`${item.name} material details`} data-material-reveal={item.slug}>
      <div className={styles.rule} ref={ruleRef} />
      <div className={styles.content} ref={contentRef}>
        {item.forms.length > 0 && <div className={styles.forms}><p>Available forms</p><span>{item.forms.join(" · ")}</span></div>}
        <p className={styles.note}>Technical specifications and samples are available upon request.</p>
      </div>
    </section>
  );
}
