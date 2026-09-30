"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import type { ProductAtlasItem } from "@/types/agrica";
import { getPublicProductCardContent } from "@/data/productCardContent";
import { ProductCardFront } from "@/components/products/ProductCardFront";
import { ProductCardBack } from "@/components/products/ProductCardBack";
import styles from "./SeasonalCardCollection.module.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface SeasonalCardFlightOverlayProps {
  readonly item: ProductAtlasItem;
  readonly originElement: HTMLElement;
  readonly originRect: DOMRect;
  readonly isAddedToQuote: boolean;
  readonly onToggleQuote: (item: ProductAtlasItem) => void;
  readonly onClose: () => void;
}

export function SeasonalCardFlightOverlay({
  item,
  originElement,
  originRect,
  isAddedToQuote,
  onToggleQuote,
  onClose,
}: SeasonalCardFlightOverlayProps): React.JSX.Element | null {
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const worldPrefix = item.worldId === "fresh" ? "FR" : item.worldId === "frozen" ? "FZ" : "DR";
  const code = `${worldPrefix} / ${item.familyCode}`;
  const content = getPublicProductCardContent(item.id);

  // Lock body scroll while overlay is open so underlying website remains static
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Target dimensions matching origin aspect ratio
  const getTargetBounds = () => {
    const originAspect = originRect.height / originRect.width;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
    const windowW = typeof window !== "undefined" ? window.innerWidth : 1024;
    const windowH = typeof window !== "undefined" ? window.innerHeight : 768;

    const maxW = isMobile ? Math.min(windowW - 32, 350) : Math.min(windowW - 64, 400);
    const maxH = isMobile ? Math.min(windowH - 60, 530) : Math.min(windowH - 80, 560);

    let targetWidth = maxW;
    let targetHeight = Math.round(targetWidth * originAspect);

    if (targetHeight > maxH) {
      targetHeight = maxH;
      targetWidth = Math.round(targetHeight / originAspect);
    }

    const targetTop = (windowH - targetHeight) / 2;
    const targetLeft = (windowW - targetWidth) / 2;

    return { targetTop, targetLeft, targetWidth, targetHeight };
  };

  // Fluid close animation:
  // Simultaneous BACK -> FRONT flip + shrink + return travel back to exact origin slot coordinates
  const handleClose = () => {
    if (isClosingRef.current || !containerRef.current || !innerRef.current) return;
    isClosingRef.current = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.to([containerRef.current, backdropRef.current], {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
          gsap.set(originElement, { opacity: 1 });
          onClose();
          originElement.focus();
        },
      });
      return;
    }

    const { targetTop, targetLeft, targetWidth, targetHeight } = getTargetBounds();
    const visualCard = originElement.querySelector<HTMLElement>(".export-card") ?? originElement;

    // Temporarily freeze CSS transitions on the destination card so handoff is instantaneous and immune to hover jerks
    visualCard.style.transition = "none";

    const currentOriginRect = visualCard.getBoundingClientRect();
    const targetCenterX = targetLeft + targetWidth / 2;
    const targetCenterY = targetTop + targetHeight / 2;
    const currentOriginCenterX = currentOriginRect.left + currentOriginRect.width / 2;
    const currentOriginCenterY = currentOriginRect.top + currentOriginRect.height / 2;

    const returnDeltaX = currentOriginCenterX - targetCenterX;
    const returnDeltaY = currentOriginCenterY - targetCenterY;
    const returnScaleX = currentOriginRect.width / targetWidth;
    const returnScaleY = currentOriginRect.height / targetHeight;

    const closeTl = gsap.timeline({
      onComplete: () => {
        gsap.set(originElement, { opacity: 1 });
        visualCard.style.transition = "";
        onClose();
        originElement.focus({ preventScroll: true });
      },
    });

    // 1. Solid card travels & shrinks back to exact origin coordinates with smooth deceleration
    closeTl.to(
      containerRef.current,
      {
        x: returnDeltaX,
        y: returnDeltaY,
        scaleX: returnScaleX,
        scaleY: returnScaleY,
        boxShadow: "0 8px 18px rgba(0, 24, 55, 0.14), 0 2px 6px rgba(0, 0, 0, 0.12)",
        duration: 0.85,
        ease: "power2.inOut",
      },
      0
    );

    // 2. Simultaneously 3D flips BACK -> FRONT mid-flight, settling flat into front face at 0.70s
    // so the final ~150ms of flight is a pure, flat landing glide directly into the slot
    closeTl.to(
      innerRef.current,
      {
        rotationY: 0,
        duration: 0.70,
        ease: "power2.inOut",
      },
      0
    );

    // Flip accessibility flag as rotation crosses half-way (at ~0.35s)
    closeTl.add(() => {
      setIsFlipped(false);
    }, 0.35);

    // 3. Backdrop fades naturally alongside returning card (finishing at 0.82s)
    if (backdropRef.current) {
      closeTl.to(
        backdropRef.current,
        {
          opacity: 0,
          duration: 0.78,
          ease: "power2.inOut",
        },
        0.04
      );
    }

    // 4. Seamless, invisible landing handoff:
    // As the flight card glides into the final pixel (t = 0.78s -> 0.84s),
    // cross-dissolve the resting origin card into view directly underneath the flight card.
    // This eliminates any 1-frame snap between the GPU compositor layer and layout rendering.
    closeTl.to(
      originElement,
      {
        opacity: 1,
        duration: 0.06,
        ease: "power1.in",
      },
      0.78
    );
    closeTl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.06,
        ease: "power1.out",
      },
      0.79
    );
  };

  // Synchronous layout initialization before browser paint:
  // Immediate positioning at exact origin geometry with ZERO delay/jump
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current || !innerRef.current) return;

    const { targetTop, targetLeft, targetWidth, targetHeight } = getTargetBounds();
    const targetCenterX = targetLeft + targetWidth / 2;
    const targetCenterY = targetTop + targetHeight / 2;
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    const deltaX = originCenterX - targetCenterX;
    const deltaY = originCenterY - targetCenterY;
    const startScaleX = originRect.width / targetWidth;
    const startScaleY = originRect.height / targetHeight;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Immediately ghost origin miniature card so layout space is preserved
    gsap.set(originElement, { opacity: 0 });

    if (prefersReducedMotion) {
      gsap.set(containerRef.current, {
        top: targetTop,
        left: targetLeft,
        width: targetWidth,
        height: targetHeight,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });
      gsap.set(innerRef.current, { rotationY: 180 });
      setIsFlipped(true);
      gsap.fromTo(
        [containerRef.current, backdropRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.15 }
      );
      return;
    }

    // Set initial position of flight container synchronously over origin card before paint
    gsap.set(containerRef.current, {
      top: targetTop,
      left: targetLeft,
      width: targetWidth,
      height: targetHeight,
      x: deltaX,
      y: deltaY,
      scaleX: startScaleX,
      scaleY: startScaleY,
      transformOrigin: "center center",
      boxShadow: "0 8px 18px rgba(0, 24, 55, 0.14), 0 2px 6px rgba(0, 0, 0, 0.12)",
      force3D: true,
    });
    gsap.set(innerRef.current, { rotationY: 0, force3D: true });

    const openTl = gsap.timeline();

    // 1. Backdrop starts ~0.06s late and fades progressively (no instant harsh blur)
    if (backdropRef.current) {
      openTl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.62, ease: "power2.out" },
        0.06
      );
    }

    // 2. Card expands and travels to center as ONE rigid object
    openTl.to(
      containerRef.current,
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        boxShadow: "0 32px 80px rgba(0, 18, 44, 0.42), 0 10px 28px rgba(0, 0, 0, 0.26)",
        duration: 0.78,
        ease: "power2.out",
      },
      0
    );

    // 3. rotationY has a small ~80ms lead-in, then flips smoothly overlapping with travel
    openTl.to(
      innerRef.current,
      {
        rotationY: 180,
        duration: 0.70,
        ease: "power2.inOut",
      },
      0.08
    );

    // Update accessibility state mid-turn as rotation passes 90 deg (0.08 + 0.35 = 0.43s)
    openTl.add(() => {
      setIsFlipped(true);
    }, 0.43);

    // ESC key listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openTl.kill();
      gsap.set(originElement, { opacity: 1 });
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  // Pre-calculate initial styles so the portal paints at origin coordinates on the very first render tick
  const { targetTop, targetLeft, targetWidth, targetHeight } = getTargetBounds();
  const targetCenterX = targetLeft + targetWidth / 2;
  const targetCenterY = targetTop + targetHeight / 2;
  const originCenterX = originRect.left + originRect.width / 2;
  const originCenterY = originRect.top + originRect.height / 2;
  const initialDeltaX = originCenterX - targetCenterX;
  const initialDeltaY = originCenterY - targetCenterY;
  const initialScaleX = originRect.width / targetWidth;
  const initialScaleY = originRect.height / targetHeight;

  const overlayJSX = (
    <div
      className={styles.flightOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} specifications`}
    >
      <div
        ref={backdropRef}
        className={styles.flightBackdrop}
        onClick={handleClose}
        aria-hidden="true"
        style={{ opacity: 0 }}
      />

      <div
        ref={containerRef}
        className={`${styles.flightContainer} export-card-scene is-flight`}
        data-world={item.worldId}
        style={{
          top: targetTop,
          left: targetLeft,
          width: targetWidth,
          height: targetHeight,
          transform: `translate3d(${initialDeltaX}px, ${initialDeltaY}px, 0px) scale(${initialScaleX}, ${initialScaleY})`,
          transformOrigin: "center center",
          boxShadow: "0 8px 18px rgba(0, 24, 55, 0.14), 0 2px 6px rgba(0, 0, 0, 0.12)",
        }}
      >
        <div
          ref={innerRef}
          className={`${styles.flightInner} export-card is-flight`}
          style={{ transform: "rotateY(0deg)" }}
        >
          {/* FRONT FACE: Intact compact ProductCardFront matching origin card */}
          <ProductCardFront
            item={item}
            code={code}
            varietyLine=""
            isAddedToQuote={isAddedToQuote}
            isFlipped={isFlipped}
            onToggleQuote={onToggleQuote}
            isCompact={true}
          />

          {/* BACK FACE: Normal large responsive ProductCardBack + minimal close button */}
          <ProductCardBack
            item={item}
            code={code}
            fields={content.fields}
            isFlipped={isFlipped}
            isAddedToQuote={isAddedToQuote}
            onToggleQuote={onToggleQuote}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(overlayJSX, document.body);
}
