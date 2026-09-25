"use client";

import { gsap } from "gsap";
import React, { useLayoutEffect, useRef, useState } from "react";
import { HerbsSpicesMedia } from "@/components/herbs-spices/media/HerbsSpicesMedia";
import type { HerbsSpicesMediaManifestEntry } from "@/types/herbs-spices";
import styles from "./MaterialStage.module.css";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface MaterialStageItem {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly descriptor: string;
  readonly media: HerbsSpicesMediaManifestEntry;
}

interface MaterialStageProps {
  readonly items: readonly MaterialStageItem[];
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  trackX: number;
  axis: "pending" | "horizontal" | "vertical";
}

const emptyFallback = <span className={styles.fallback} />;

export function MaterialStage({ items }: MaterialStageProps): React.JSX.Element {
  const dictionary = useHerbsSpicesDictionary().catalogue;
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<Array<HTMLLIElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentMetaRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeIndexRef = useRef(0);
  const directionRef = useRef(1);
  const mountedRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const activeItem = items[activeIndex] ?? items[0];

  const positionFor = (index: number): number => {
    const viewport = viewportRef.current;
    const card = cardRefs.current[index];
    if (!viewport || !card) return 0;
    const compactBias = viewport.clientWidth <= 620 ? (index === items.length - 1 ? 16 : -16) : 0;
    return (viewport.clientWidth / 2) - (card.offsetLeft + card.offsetWidth / 2) + compactBias;
  };

  const animateTo = (index: number, immediate = false): void => {
    const root = rootRef.current;
    const track = trackRef.current;
    const cards = cardRefs.current.filter((card): card is HTMLLIElement => card !== null);
    if (!root || !track || cards.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = immediate || reduceMotion ? 0 : 0.68;
    const ease = "power3.inOut";

    gsap.killTweensOf([track, root, currentMetaRef.current, progressRef.current, ...cards]);
    gsap.to(track, { x: positionFor(index), duration, ease, overwrite: true });
    gsap.to(cards, {
      scale: (cardIndex) => (cardIndex === index ? 1 : Math.abs(cardIndex - index) === 1 ? 0.95 : 0.9),
      opacity: (cardIndex) => (cardIndex === index ? 1 : Math.abs(cardIndex - index) === 1 ? 0.45 : 0.15),
      duration,
      ease,
      overwrite: true,
    });
    gsap.to(progressRef.current, {
      scaleX: (index + 1) / items.length,
      duration,
      ease,
      overwrite: true,
    });
    if (currentMetaRef.current) {
      gsap.fromTo(
        currentMetaRef.current,
        { y: reduceMotion ? 0 : directionRef.current * 10, opacity: reduceMotion ? 1 : 0.3 },
        { y: 0, opacity: 1, duration: reduceMotion ? 0 : 0.45, ease: "power2.out", overwrite: true },
      );
    }
  };

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
    animateTo(activeIndex, !mountedRef.current);
    mountedRef.current = true;
  }, [activeIndex]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;
    const resizeObserver = new ResizeObserver(() => animateTo(activeIndexRef.current, true));
    resizeObserver.observe(viewport);
    return () => {
      resizeObserver.disconnect();
      gsap.killTweensOf([root, trackRef.current, currentMetaRef.current, progressRef.current, ...cardRefs.current.filter(Boolean)]);
    };
  }, []);

  const goTo = (index: number, focusSelector = false): void => {
    const nextIndex = Math.max(0, Math.min(items.length - 1, index));
    directionRef.current = nextIndex >= activeIndexRef.current ? 1 : -1;
    if (nextIndex === activeIndexRef.current) animateTo(nextIndex);
    else setActiveIndex(nextIndex);
    if (focusSelector) buttonRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = index + 1;
    if (event.key === "ArrowLeft") nextIndex = index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex !== undefined) {
      event.preventDefault();
      goTo(nextIndex, true);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    gsap.killTweensOf([track, ...cardRefs.current.filter(Boolean)]);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      trackX: Number(gsap.getProperty(track, "x")) || 0,
      axis: "pending",
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !track) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (drag.axis === "pending" && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) {
      drag.axis = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 ? "horizontal" : "vertical";
    }
    if (drag.axis !== "horizontal") return;

    event.preventDefault();
    rootRef.current?.setAttribute("data-dragging", "true");
    const atBoundary = (activeIndexRef.current === 0 && deltaX > 0)
      || (activeIndexRef.current === items.length - 1 && deltaX < 0);
    const resistedDelta = atBoundary ? deltaX * 0.28 : deltaX;
    const dragProgress = Math.min(Math.abs(resistedDelta) / Math.max(1, event.currentTarget.clientWidth), 0.3);
    gsap.set(track, { x: drag.trackX + resistedDelta });
    gsap.set(cardRefs.current[activeIndexRef.current], { scale: 1 - dragProgress * 0.12 });
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const elapsed = Math.max(performance.now() - drag.startTime, 1);
    const velocity = deltaX / elapsed;
    const threshold = Math.min(72, event.currentTarget.clientWidth * 0.15);
    const shouldAdvance = drag.axis === "horizontal"
      && (Math.abs(deltaX) >= threshold || Math.abs(velocity) > 0.5);

    rootRef.current?.removeAttribute("data-dragging");
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (shouldAdvance) goTo(activeIndexRef.current + (deltaX < 0 ? 1 : -1));
    else animateTo(activeIndexRef.current);
  };

  return (
    <div className={styles.stage} ref={rootRef} data-material-reel>
      <div
        className={styles.reelViewport}
        ref={viewportRef}
        id="material-expression-stage"
        role="group"
        aria-roledescription="material reel"
        aria-label={formatMessage(dictionary.currentForm, { name: activeItem.name })}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <ol className={styles.reelTrack} ref={trackRef}>
          {items.map((item, index) => (
            <li
              className={styles.reelItem}
              data-reel-item
              data-active={index === activeIndex ? "true" : "false"}
              ref={(element) => { cardRefs.current[index] = element; }}
              aria-hidden="true"
              key={item.id}
            >
              <HerbsSpicesMedia entry={item.media} className={styles.media} fallback={emptyFallback} decorative />
              <div className={styles.specimenBadge}>
                <span>FORM {item.index}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.reelFooter}>
        <div className={styles.currentMeta} ref={currentMetaRef} aria-atomic="true">
          <span className={styles.currentFormNumber}>{activeItem.index}</span>
          <div className={styles.currentFormText}>
            <strong className={styles.currentFormName}>{activeItem.name}</strong>
            <small className={styles.currentFormDesc}>{activeItem.descriptor}</small>
          </div>
        </div>
        <div className={styles.transport} role="group" aria-label={dictionary.reelControls}>
          <button type="button" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0} aria-label={dictionary.previousForm}>←</button>
          <span aria-hidden="true">{activeItem.index} / {String(items.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === items.length - 1} aria-label={dictionary.nextForm}>→</button>
        </div>
      </div>

      <div className={styles.progress} aria-hidden="true"><span ref={progressRef} /></div>
      <nav className={styles.selector} aria-label={dictionary.formsLabel}>
        <ol>
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                ref={(element) => { buttonRefs.current[index] = element; }}
                type="button"
                aria-label={`${item.index} ${item.name}`}
                aria-controls="material-expression-stage"
                aria-pressed={index === activeIndex}
                onClick={() => goTo(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span>{item.index}</span>
                <span className={styles.selectorLabel}>{item.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
