"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import type { ProductAtlasItem } from "@/types/agrica";
import { getPublicProductCardContent } from "@/data/productCardContent";
import { useProductsDictionary } from "@/i18n/locale-context";
import { ProductCardFront } from "./ProductCardFront";
import { ProductCardBack } from "./ProductCardBack";
import styles from "./ProductCardFlightOverlay.module.css";

interface ProductCardFlightOverlayProps {
  readonly item: ProductAtlasItem;
  readonly originElement: HTMLElement;
  readonly triggerElement: HTMLButtonElement;
  readonly originRect: DOMRect;
  readonly isAddedToQuote: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
  readonly onClose: () => void;
}

interface Bounds {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getExpandedBounds(): Bounds {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const mobile = viewportWidth <= 700;
  const gutter = mobile ? 7 : viewportWidth <= 1024 ? 22 : 32;
  const maxWidth = mobile ? viewportWidth - gutter * 2 : Math.min(920, viewportWidth - gutter * 2);
  const maxHeight = mobile ? viewportHeight - gutter * 2 : Math.min(620, viewportHeight - gutter * 2);

  return {
    top: Math.max(gutter, (viewportHeight - maxHeight) / 2),
    left: Math.max(gutter, (viewportWidth - maxWidth) / 2),
    width: maxWidth,
    height: maxHeight,
  };
}

export function ProductCardFlightOverlay({
  item,
  originElement,
  triggerElement,
  originRect,
  isAddedToQuote,
  onToggleQuote,
  onClose,
}: ProductCardFlightOverlayProps): React.JSX.Element | null {
  const dictionary = useProductsDictionary();
  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const frontShellRef = useRef<HTMLDivElement>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backFrameRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const openTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const closingRef = useRef(false);
  const originOpacityRef = useRef(originElement.style.opacity);
  const originPointerEventsRef = useRef(originElement.style.pointerEvents);
  const [ready, setReady] = useState(false);

  const worldPrefix = item.worldId === "fresh" ? "FR" : item.worldId === "frozen" ? "FZ" : "DR";
  const code = `${worldPrefix} / ${item.familyCode}`;
  const content = getPublicProductCardContent(item.id);

  const restoreOrigin = useCallback(() => {
    originElement.style.opacity = originOpacityRef.current;
    originElement.style.pointerEvents = originPointerEventsRef.current;
  }, [originElement]);

  const completeClose = useCallback(() => {
    restoreOrigin();
    onClose();
    window.requestAnimationFrame(() => {
      if (triggerElement.isConnected) triggerElement.focus({ preventScroll: true });
    });
  }, [onClose, restoreOrigin, triggerElement]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setReady(false);
    openTimelineRef.current?.kill();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !originElement.isConnected) {
      closeTimelineRef.current = gsap.timeline({ onComplete: completeClose })
        .to([backFrameRef.current, backdropRef.current], {
          opacity: 0,
          duration: reduceMotion ? 0.08 : 0.18,
          ease: "power1.out",
        });
      return;
    }

    const currentOrigin = originElement.getBoundingClientRect();
    const target = getExpandedBounds();
    const currentOriginCX = currentOrigin.left + currentOrigin.width / 2;
    const currentOriginCY = currentOrigin.top + currentOrigin.height / 2;
    const targetCX = target.left + target.width / 2;
    const targetCY = target.top + target.height / 2;
    const destX = targetCX - currentOriginCX;
    const destY = targetCY - currentOriginCY;
    const scaleYTarget = target.height / currentOrigin.height;

    // Place frontShell at target center for edge-on handoff, matching opening's geometry
    gsap.set(frontShellRef.current, {
      top: currentOrigin.top,
      left: currentOrigin.left,
      width: currentOrigin.width,
      height: currentOrigin.height,
      x: destX,
      y: destY,
      rotationY: 90,
      scaleX: 1,
      scaleY: scaleYTarget,
      opacity: 0,
      transformOrigin: "center center",
      force3D: true,
    });

    closeTimelineRef.current = gsap.timeline({ onComplete: completeClose });
    closeTimelineRef.current
      // 1. Fade backdrop smoothly across the closing duration:
      .to(backdropRef.current, { opacity: 0, duration: 0.34, ease: "power2.out" }, 0)

      // 2. Dossier rotates edge-on (0° -> -90°) at center:
      .to(backCardRef.current, {
        rotationY: -90,
        duration: 0.14,
        ease: "power2.in",
        transformOrigin: "center center",
        force3D: true,
      }, 0)

      // 3. Exactly at 0.14s: SEAMLESS EDGE-ON HANDOFF (0px projected width, identical center & height):
      .set(backFrameRef.current, { opacity: 0 }, 0.14)
      .set(frontShellRef.current, { opacity: 1 }, 0.14)

      // 4. Front card executes ONE continuous, smooth return journey from center to origin:
      .to(frontShellRef.current, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotationY: 0,
        duration: 0.20,
        ease: "power2.out",
        transformOrigin: "center center",
        force3D: true,
      }, 0.14);
  }, [completeClose, originElement]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const frontShell = frontShellRef.current;
    const backFrame = backFrameRef.current;
    const backCard = backCardRef.current;
    if (!overlay || !backdrop || !frontShell || !backFrame || !backCard) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const lockedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const inerted = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlay)
      .map((element) => ({
        element,
        inert: element.inert,
        ariaHidden: element.getAttribute("aria-hidden"),
      }));

    const closeButton = backFrame.querySelector<HTMLButtonElement>(".export-card-flight-close");
    closeButton?.focus({ preventScroll: true });
    inerted.forEach(({ element }) => {
      if (element.tagName === "SCRIPT") return;
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    originElement.style.opacity = "0";
    originElement.style.pointerEvents = "none";

    // Read originElement bounds AFTER locking body to guarantee pixel-perfect alignment:
    const activeOrigin = originElement.getBoundingClientRect();
    const target = getExpandedBounds();
    const originCenterX = activeOrigin.left + activeOrigin.width / 2;
    const originCenterY = activeOrigin.top + activeOrigin.height / 2;
    const targetCenterX = target.left + target.width / 2;
    const targetCenterY = target.top + target.height / 2;
    const deltaX = targetCenterX - originCenterX;
    const deltaY = targetCenterY - originCenterY;
    const scaleYTarget = target.height / activeOrigin.height;

    // Place frontShell exactly over activeOrigin:
    gsap.set(frontShell, {
      top: activeOrigin.top,
      left: activeOrigin.left,
      width: activeOrigin.width,
      height: activeOrigin.height,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotationY: 0,
      opacity: 1,
      transformOrigin: "center center",
      force3D: true,
    });

    // Place backFrame at target, rotated edge-on at -90deg and hidden initially:
    gsap.set(backFrame, {
      ...target,
      x: 0,
      y: 0,
      opacity: 0,
      transformOrigin: "center center",
      force3D: true,
    });
    gsap.set(backCard, {
      rotationY: -90,
      scaleY: 1,
      transformOrigin: "center center",
      force3D: true,
    });
    gsap.set(backdrop, { opacity: 0 });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(frontShell, { opacity: 0 });
      gsap.set(backFrame, { opacity: 1 });
      gsap.set(backCard, { rotationY: 0, scaleY: 1 });
      gsap.to(backdrop, { opacity: 1, duration: 0.08 });
      setReady(true);
    } else {
      openTimelineRef.current = gsap.timeline({ onComplete: () => setReady(true) });
      openTimelineRef.current
        // 1. Fade backdrop in smoothly:
        .to(backdrop, { opacity: 1, duration: 0.44, ease: "power2.out" }, 0)

        // 2. Front card lifts, scales height, translates toward center, and turns edge-on (0° -> 90°):
        .to(frontShell, {
          x: deltaX,
          y: deltaY,
          scaleY: scaleYTarget,
          scaleX: 1.04,
          rotationY: 90,
          duration: 0.22,
          ease: "power2.in",
          transformOrigin: "center center",
          force3D: true,
        }, 0)

        // 3. Exactly at 0.22s: SEAMLESS EDGE-ON HANDOFF (0px projected width, matching height & center):
        .set(frontShell, { opacity: 0 }, 0.22)
        .set(backFrame, { opacity: 1 }, 0.22)

        // 4. Back card emerges from edge-on (-90° -> 0°) and decelerates into center:
        .fromTo(backCard,
          { rotationY: -90, force3D: true },
          {
            rotationY: 0,
            duration: 0.24,
            ease: "power3.out",
            transformOrigin: "center center",
            force3D: true,
          },
          0.22,
        );
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(backFrame.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        backFrame.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !backFrame.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !backFrame.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleResize = () => {
      if (closingRef.current) return;
      const nextTarget = getExpandedBounds();
      gsap.set(backFrame, nextTarget);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleResize);
      openTimelineRef.current?.kill();
      closeTimelineRef.current?.kill();
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, lockedScrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      inerted.forEach(({ element, inert, ariaHidden }) => {
        if (element.tagName === "SCRIPT") return;
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      restoreOrigin();
    };
  }, [handleClose, originElement, originRect, restoreOrigin]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      id="product-card-flight-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-card-flight-title"
      data-ready={ready ? "true" : "false"}
    >
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" onClick={handleClose} />

      <div
        ref={frontShellRef}
        className={`${styles.frontShell} export-card-scene`}
        data-world={item.worldId}
        aria-hidden="true"
      >
        <div ref={frontCardRef} className={`${styles.frontCard} export-card`}>
          <ProductCardFront
            item={item}
            code={code}
            varietyLine=""
            isAddedToQuote={isAddedToQuote}
            isFlipped
            onToggleQuote={onToggleQuote}
          />
        </div>
      </div>

      <div
        ref={backFrameRef}
        className={`${styles.backFrame} export-card-scene`}
        data-world={item.worldId}
        tabIndex={-1}
      >
        <div ref={backCardRef} className={styles.backCard}>
          <ProductCardBack
            item={item}
            code={code}
            fields={content.fields}
            isFlipped
            isAddedToQuote={isAddedToQuote}
            onToggleQuote={onToggleQuote}
            onClose={handleClose}
            expanded
            headingId="product-card-flight-title"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
