"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { type WorldKey } from "@/data/threeWorlds";
import {
  WORLD_THEMES,
  renderWorldDecorativeArt,
} from "./ThreeWorldsThemeConfig";

export interface ThreeWorldsThemeLayerProps {
  activeWorld: WorldKey;
  onTransitionProgress?: (progress: number) => void;
  onStackStep?: () => void;
}

export function ThreeWorldsThemeLayer({
  activeWorld,
  onStackStep,
}: ThreeWorldsThemeLayerProps): React.JSX.Element {
  const [baseWorld, setBaseWorld] = useState<WorldKey>(activeWorld);
  const [incomingWorld, setIncomingWorld] = useState<WorldKey | null>(null);

  const prevWorldRef = useRef<WorldKey>(activeWorld);
  const sweepGroupRef = useRef<SVGGElement | null>(null);
  const sweepSvgRef = useRef<SVGSVGElement | null>(null);
  const decorRef = useRef<HTMLDivElement | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Active theme configs
  const baseTheme = WORLD_THEMES[baseWorld];
  const incomingTheme = incomingWorld ? WORLD_THEMES[incomingWorld] : null;

  useEffect(() => {
    // If world hasn't changed, ignore
    if (activeWorld === prevWorldRef.current) return;

    const fromWorld = prevWorldRef.current;
    const toWorld = activeWorld;
    prevWorldRef.current = activeWorld;

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
        activeTimelineRef.current = null;
      }
      setBaseWorld(toWorld);
      setIncomingWorld(null);
      if (onStackStep) onStackStep();
      return;
    }

    // Kill any in-flight transition
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }

    // Begin incoming world sweep
    setIncomingWorld(toWorld);

    // Give React a paint tick to render the incoming SVG sweep elements
    const raf = requestAnimationFrame(() => {
      const sweepGroup = sweepGroupRef.current;
      const sweepSvg = sweepSvgRef.current;
      const decorEl = decorRef.current;

      if (!sweepGroup || !sweepSvg) {
        setBaseWorld(toWorld);
        setIncomingWorld(null);
        return;
      }

      // Initial state: origin at active selector (approx x: 200, y: 170)
      gsap.set(sweepSvg, { opacity: 1, visibility: "visible" });
      gsap.set(sweepGroup, {
        scale: 0.02,
        rotation: -14,
        transformOrigin: "200px 170px",
        opacity: 0.85,
      });

      if (decorEl) {
        gsap.set(decorEl, { opacity: 0.2, y: 6 });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setBaseWorld(toWorld);
          setIncomingWorld(null);
          if (sweepSvg) {
            gsap.set(sweepSvg, { opacity: 0, visibility: "hidden" });
          }
          activeTimelineRef.current = null;
        },
      });

      activeTimelineRef.current = tl;

      // 0% -> 20% (0s - 0.20s): Settle delay matching selector tick sound
      // 15% -> 55% (0.16s - 0.58s): Organic sweep expands from active selector
      tl.to(
        sweepGroup,
        {
          scale: 4.8,
          rotation: 4,
          opacity: 1,
          duration: 0.62,
          ease: "power2.inOut",
        },
        0.16
      );

      // 40% -> 70% (0.42s - 0.72s): Old theme recedes, stack shifts
      tl.call(
        () => {
          if (onStackStep) onStackStep();
        },
        [],
        0.42
      );

      // 60% -> 85% (0.60s - 0.88s): New decorative theme lines reveal with subtle stagger
      if (decorEl) {
        tl.to(
          decorEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            ease: "power1.out",
          },
          0.60
        );
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
        activeTimelineRef.current = null;
      }
    };
  }, [activeWorld, onStackStep]);

  return (
    <div
      className="three-worlds-theme-container"
      style={
        {
          "--tw-theme-base-bg": baseTheme.baseBg,
          "--tw-theme-accent": baseTheme.accentColor,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {/* 1. Base Active Theme Layer */}
      <div
        className={`three-worlds-theme-layer three-worlds-theme-layer--${baseWorld}`}
        style={{
          backgroundColor: baseTheme.baseBg,
          backgroundImage: baseTheme.atmosphereGlow,
        }}
      >
        <div ref={decorRef} className="three-worlds-decor-wrap">
          {renderWorldDecorativeArt(baseWorld)}
        </div>
      </div>

      {/* 2. Fluid Organic World Sweep Layer (visible only during transitions) */}
      <svg
        ref={sweepSvgRef}
        className="three-worlds-sweep-svg"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0, visibility: "hidden" }}
      >
        <defs>
          <filter id="tw-sweep-softness" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {incomingTheme && (
          <g ref={sweepGroupRef} style={{ transformOrigin: "200px 170px" }}>
            {/* Outer soft atmospheric wave */}
            <path
              d="M 200 30 C 290 10, 380 70, 390 170 C 400 270, 320 340, 220 350 C 120 360, 20 290, 15 190 C 10 90, 110 50, 200 30 Z"
              fill={incomingTheme.sweepWaveColor}
              filter="url(#tw-sweep-softness)"
            />
            {/* Main organic fluid world body */}
            <path
              d="M 200 45 C 280 30, 365 85, 375 170 C 385 255, 310 325, 215 335 C 125 345, 35 280, 30 185 C 25 95, 120 60, 200 45 Z"
              fill={incomingTheme.sweepColor}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
