"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { OptionWheel } from "./OptionWheel";
import { Stack } from "./Stack";
import { ThreeWorldsThemeLayer } from "./ThreeWorldsThemeLayer";
import { WORLD_THEMES } from "./ThreeWorldsThemeConfig";
import {
  THREE_WORLDS_DATA,
  THREE_WORLDS_LIST,
  useSharedWorld,
  getSharedWorld,
  hasUserInteracted,
  setUserInteracted,
  type WorldKey,
} from "@/data/threeWorlds";
import "./ThreeWorldsSection.css";

const WHEEL_ITEMS = ["Fresh", "Frozen", "Dried"];

export interface ThreeWorldsSectionProps {
  className?: string;
  id?: string;
  isPreview?: boolean;
  interactive?: boolean;
  autoDemoWorld?: boolean;
  isDemoFrozen?: boolean;
  stackAutoplayDelay?: number;
  orientation?: "vertical" | "horizontal";
}

export function ThreeWorldsSection({
  className = "",
  id = "three-worlds-interactive",
  isPreview = false,
  interactive = true,
  autoDemoWorld = false,
  isDemoFrozen = false,
  stackAutoplayDelay,
  orientation,
}: ThreeWorldsSectionProps): React.JSX.Element {
  const [selectedWorld, setSelectedWorld] = useSharedWorld();
  const [isMobile, setIsMobile] = useState(true);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 960px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const effectiveOrientation = orientation ?? (isMobile ? "horizontal" : "vertical");

  // Auto-demo world cycling for preview mode (~5.5 seconds per world).
  // User interaction always has priority over automatic behavior.
  React.useEffect(() => {
    if (!isPreview || !autoDemoWorld || isDemoFrozen || hasUserInteracted()) return;

    const interval = setInterval(() => {
      if (hasUserInteracted()) {
        clearInterval(interval);
        return;
      }
      const current = getSharedWorld();
      const idx = THREE_WORLDS_LIST.indexOf(current);
      const nextIdx = (idx + 1) % THREE_WORLDS_LIST.length;
      const nextWorld = THREE_WORLDS_LIST[nextIdx];
      setSelectedWorld(nextWorld, false);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPreview, autoDemoWorld, isDemoFrozen, setSelectedWorld]);

  const currentWorldConfig = useMemo(() => {
    return THREE_WORLDS_DATA[selectedWorld];
  }, [selectedWorld]);

  const selectedIndex = useMemo(() => {
    const idx = THREE_WORLDS_LIST.indexOf(selectedWorld);
    return idx >= 0 ? idx : 0;
  }, [selectedWorld]);

  const handleWheelChange = useCallback(
    (index: number) => {
      const key = THREE_WORLDS_LIST[index];
      if (key) {
        setUserInteracted(true);
        setSelectedWorld(key, true);
      }
    },
    [setSelectedWorld]
  );

  const effectiveStackDelay = stackAutoplayDelay ?? (isPreview ? 2100 : 4000);

  // Prepare visual card nodes for the currently selected world
  const currentCards = useMemo(() => {
    return currentWorldConfig.cards.map((card) => (
      <div key={card.id} className="three-worlds-card-content">
        <img
          src={card.src}
          alt={card.alt}
          className="three-worlds-card-img"
          style={{ objectPosition: card.objectPosition || "center center" }}
        />
        <div className="three-worlds-card-overlay" aria-hidden="true" />
      </div>
    ));
  }, [currentWorldConfig]);

  const currentTheme = WORLD_THEMES[selectedWorld];

  return (
    <section
      id={id}
      className={`three-worlds-section ${isPreview ? "three-worlds-section--preview" : ""} ${className}`}
      aria-label="AGRICA Three Worlds: Fresh, Frozen, Dried"
      style={
        {
          "--tw-accent": currentWorldConfig.accentColor,
          "--tw-theme-base-bg": currentTheme.baseBg,
          pointerEvents: "auto",
        } as React.CSSProperties
      }
    >
      {/* 3-Theme Background & Organic World Sweep System */}
      <ThreeWorldsThemeLayer activeWorld={selectedWorld} />

      <div className="three-worlds-inner">
        {/* Minimal Kicker with world-specific accent */}
        <header className="three-worlds-header">
          <span
            className="three-worlds-kicker"
            style={{ color: currentWorldConfig.accentColor }}
          >
            01 — 03
          </span>
        </header>

        {/* OptionWheel Category Selector */}
        <div className="three-worlds-wheel-wrap">
          <OptionWheel
            items={WHEEL_ITEMS}
            defaultSelected={0}
            selectedIndex={selectedIndex}
            onChange={handleWheelChange}
            orientation={effectiveOrientation}
            draggable={true}
            textColor={effectiveOrientation === "horizontal" ? "rgba(0, 32, 80, 0.44)" : "rgba(0, 32, 80, 0.38)"}
            activeColor="#002050"
            fontSize={
              effectiveOrientation === "horizontal"
                ? isPreview
                  ? "clamp(44px, 13vw, 54px)"
                  : "clamp(60px, 16vw, 74px)"
                : isPreview
                ? 2.3
                : 3.5
            }
            spacing={isPreview ? 1.15 : 1.25}
            curve={isPreview ? 0.75 : 0.85}
            tilt={isPreview ? 5.5 : 7.5}
            blur={0.6}
            fade={0.42}
            minOpacity={0.28}
            smoothing={effectiveOrientation === "horizontal" ? 240 : 180}
            loop={false}
          />
        </div>

        {/* Visual Stack driven by OptionWheel selection */}
        <div className="three-worlds-stack-wrap">
          <motion.div
            key={selectedWorld}
            className="three-worlds-stack-motion-stage"
            initial={{ opacity: 0.35, y: 6, scale: 0.96, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.44,
              delay: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Stack
              key={selectedWorld}
              cards={currentCards}
              autoplay={true}
              autoplayDelay={effectiveStackDelay}
              pauseOnHover={true}
              randomRotation={false}
              mobileClickOnly={true}
              sendToBackOnClick={true}
              sensitivity={140}
              animationConfig={{ stiffness: 220, damping: 26 }}
            />
          </motion.div>
        </div>

        {/* Active World Micro-label & Editorial Category Action */}
        <div className="three-worlds-action-zone">
          <motion.div
            key={selectedWorld}
            className="three-worlds-action-content"
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.48, ease: "easeOut" }}
          >
            <span
              className="three-worlds-micro-label"
              style={{ color: currentWorldConfig.accentColor }}
            >
              {currentWorldConfig.microLabel}
            </span>

            <Link
              href={currentWorldConfig.actionHref}
              className="three-worlds-action-link"
            >
              <span className="three-worlds-action-text">
                {currentWorldConfig.actionText}
              </span>
              <span
                className="three-worlds-action-arrow"
                style={{ color: currentWorldConfig.accentColor }}
                aria-hidden="true"
              >
                ↗
              </span>
              <span
                className="three-worlds-action-rule"
                style={{ backgroundColor: currentWorldConfig.accentColor }}
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ThreeWorldsSection;
