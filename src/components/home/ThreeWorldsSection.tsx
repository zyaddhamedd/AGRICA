"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThreeWorldsThemeLayer } from "./ThreeWorldsThemeLayer";
import { WORLD_THEMES } from "./ThreeWorldsThemeConfig";
import {
  THREE_WORLDS_DATA,
  useSharedWorld,
  type WorldKey,
} from "@/data/threeWorlds";
import "./ThreeWorldsSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dedicated world-specific visual imagery mapping
const DEDICATED_WORLD_ASSETS: Record<WorldKey, { src: string; textSrc: string; alt: string; objectPosition: string }> = {
  fresh: {
    src: "/assets/fresh_img.png",
    textSrc: "/assets/fresh_text.png",
    alt: "AGRICA Fresh Produce",
    objectPosition: "50% 50%",
  },
  frozen: {
    src: "/assets/frozen_img.png",
    textSrc: "/assets/frozen_text.png",
    alt: "AGRICA IQF Frozen Produce",
    objectPosition: "50% 50%",
  },
  dried: {
    src: "/assets/dried_img.png",
    textSrc: "/assets/dried_text.png",
    alt: "AGRICA Sun-Dried Herbs and Botanicals",
    objectPosition: "50% 50%",
  },
};

export function ThreeWorldsSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ghostTrackRef = useRef<HTMLDivElement>(null);

  const cardFreshRef = useRef<HTMLDivElement>(null);
  const cardFrozenRef = useRef<HTMLDivElement>(null);
  const cardDriedRef = useRef<HTMLDivElement>(null);

  const imgFreshRef = useRef<HTMLImageElement>(null);
  const imgFrozenRef = useRef<HTMLImageElement>(null);
  const imgDriedRef = useRef<HTMLImageElement>(null);

  const [, setSelectedWorld] = useSharedWorld();
  const [activeWorldKey, setActiveWorldKey] = useState<WorldKey>("fresh");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 960px)", () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const ghostTrack = ghostTrackRef.current;

      const cardFresh = cardFreshRef.current;
      const cardFrozen = cardFrozenRef.current;
      const cardDried = cardDriedRef.current;

      const imgFresh = imgFreshRef.current;
      const imgFrozen = imgFrozenRef.current;
      const imgDried = imgDriedRef.current;

      if (!section || !viewport || !track || !cardFresh || !cardFrozen || !cardDried) return;

      // Calculate exact DOM geometries for centering Fresh (0%), Frozen (50%), Dried (100%)
      const calcOffsets = () => {
        const vpCenter = viewport.clientWidth / 2;

        const freshCenter = cardFresh.offsetLeft + cardFresh.offsetWidth / 2;
        const frozenCenter = cardFrozen.offsetLeft + cardFrozen.offsetWidth / 2;
        const driedCenter = cardDried.offsetLeft + cardDried.offsetWidth / 2;

        const startX = vpCenter - freshCenter;
        const midX = vpCenter - frozenCenter;
        const endX = vpCenter - driedCenter;

        return { startX, midX, endX };
      };

      let offsets = calcOffsets();

      // Initial placement & focus states
      gsap.set(track, { x: offsets.startX });
      if (ghostTrack) gsap.set(ghostTrack, { x: 0 });

      gsap.set(cardFresh, { scale: 1.0, opacity: 1.0 });
      gsap.set(cardFrozen, { scale: 0.95, opacity: 0.72 });
      gsap.set(cardDried, { scale: 0.95, opacity: 0.72 });

      // GSAP Master Timeline pinned for tight + intentional 160vh distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=160vh",
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            let currentKey: WorldKey = "fresh";
            if (p < 0.28) {
              currentKey = "fresh";
            } else if (p < 0.72) {
              currentKey = "frozen";
            } else {
              currentKey = "dried";
            }
            setActiveWorldKey(currentKey);
            setSelectedWorld(currentKey, false);
          },
          onRefresh: () => {
            offsets = calcOffsets();
            gsap.set(track, { x: offsets.startX });
          },
        },
      });

      // 1. Horizontal Track Scrubbing
      tl.to(track, {
        x: offsets.endX,
        ease: "none",
        duration: 1,
      }, 0);

      // 2. Active-Card Focus Hierarchy (Scale 0.95 -> 1.0 -> 0.95 & Opacity 0.72 -> 1.0 -> 0.72)
      tl.to(cardFresh, { scale: 0.95, opacity: 0.72, ease: "sine.inOut", duration: 0.5 }, 0)
        .to(cardFresh, { scale: 0.95, opacity: 0.72, ease: "sine.inOut", duration: 0.5 }, 0.5);

      tl.to(cardFrozen, { scale: 1.0, opacity: 1.0, ease: "sine.inOut", duration: 0.5 }, 0)
        .to(cardFrozen, { scale: 0.95, opacity: 0.72, ease: "sine.inOut", duration: 0.5 }, 0.5);

      tl.to(cardDried, { scale: 1.0, opacity: 1.0, ease: "sine.inOut", duration: 0.5 }, 0.5);

      // 3. Ghost Typography Parallax (slower rate behind media)
      if (ghostTrack) {
        tl.to(ghostTrack, {
          x: -180,
          ease: "none",
          duration: 1,
        }, 0);
      }

      // 4. Subtle Image Counter-Parallax (-8% to +8% shift overscale)
      if (imgFresh && imgFrozen && imgDried) {
        tl.fromTo(imgFresh, { xPercent: 0 }, { xPercent: 8, ease: "none", duration: 1 }, 0);
        tl.fromTo(imgFrozen, { xPercent: -8 }, { xPercent: 8, ease: "none", duration: 1 }, 0);
        tl.fromTo(imgDried, { xPercent: -8 }, { xPercent: 0, ease: "none", duration: 1 }, 0);
      }

      // 5. Atmosphere Background Color Interpolation
      tl.to(section, { backgroundColor: "#EEF3F4", duration: 0.45, ease: "sine.inOut" }, 0.15)
        .to(section, { backgroundColor: "#F2EADF", duration: 0.45, ease: "sine.inOut" }, 0.60);

      return () => {
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [setSelectedWorld]);

  const currentWorldConfig = THREE_WORLDS_DATA[activeWorldKey];
  const currentTheme = WORLD_THEMES[activeWorldKey];

  return (
    <section
      ref={sectionRef}
      id="three-worlds-interactive"
      className="three-worlds-section"
      aria-label="AGRICA Three Worlds: Fresh, Frozen, Dried"
      style={
        {
          "--tw-accent": currentWorldConfig.accentColor,
          "--tw-theme-base-bg": currentTheme.baseBg,
        } as React.CSSProperties
      }
    >
      {/* 3-Theme Background & Organic World Sweep Layer */}
      <ThreeWorldsThemeLayer activeWorld={activeWorldKey} />

      <div ref={stageRef} className="triptych-stage">
        {/* Top Header Kicker */}
        <header className="triptych-header">
          <span
            className="triptych-kicker-number"
            style={{ color: currentWorldConfig.accentColor }}
          >
            01 ───────── 03
          </span>
          <span className="triptych-kicker-title">THREE WORLDS</span>
        </header>

        {/* Oversized Ghost Serif Parallax Layer (Positioned behind media cluster) */}
        <div className="triptych-ghost-viewport" aria-hidden="true">
          <div ref={ghostTrackRef} className="triptych-ghost-track">
            <span className="triptych-ghost-word">Fresh</span>
            <span className="triptych-ghost-word">Frozen</span>
            <span className="triptych-ghost-word">Dried</span>
          </div>
        </div>

        {/* Central Viewport & Moving Media Track */}
        <div ref={viewportRef} className="triptych-viewport">
          <div ref={trackRef} className="triptych-track">
            {/* 01 Fresh Card (Main image on top, fresh_text below) */}
            <div ref={cardFreshRef} className="triptych-card triptych-card--fresh">
              <div className="triptych-card-media">
                <div className="triptych-card-inner">
                  <img
                    ref={imgFreshRef}
                    src={DEDICATED_WORLD_ASSETS.fresh.src}
                    alt={DEDICATED_WORLD_ASSETS.fresh.alt}
                    className="triptych-card-img"
                    style={{ objectPosition: DEDICATED_WORLD_ASSETS.fresh.objectPosition }}
                  />
                  <div className="triptych-card-overlay" aria-hidden="true" />
                </div>
              </div>
              <div className="triptych-card-text-zone">
                <img
                  src={DEDICATED_WORLD_ASSETS.fresh.textSrc}
                  alt="Fresh World"
                  className="triptych-card-text-img"
                />
              </div>
            </div>

            {/* 02 Frozen Card (Main image on top, frozen_text below) */}
            <div ref={cardFrozenRef} className="triptych-card triptych-card--frozen">
              <div className="triptych-card-media">
                <div className="triptych-card-inner">
                  <img
                    ref={imgFrozenRef}
                    src={DEDICATED_WORLD_ASSETS.frozen.src}
                    alt={DEDICATED_WORLD_ASSETS.frozen.alt}
                    className="triptych-card-img"
                    style={{ objectPosition: DEDICATED_WORLD_ASSETS.frozen.objectPosition }}
                  />
                  <div className="triptych-card-overlay" aria-hidden="true" />
                </div>
              </div>
              <div className="triptych-card-text-zone">
                <img
                  src={DEDICATED_WORLD_ASSETS.frozen.textSrc}
                  alt="Frozen World"
                  className="triptych-card-text-img"
                />
              </div>
            </div>

            {/* 03 Dried Card (Main image on top, dried_text below) */}
            <div ref={cardDriedRef} className="triptych-card triptych-card--dried">
              <div className="triptych-card-media">
                <div className="triptych-card-inner">
                  <img
                    ref={imgDriedRef}
                    src={DEDICATED_WORLD_ASSETS.dried.src}
                    alt={DEDICATED_WORLD_ASSETS.dried.alt}
                    className="triptych-card-img"
                    style={{ objectPosition: DEDICATED_WORLD_ASSETS.dried.objectPosition }}
                  />
                  <div className="triptych-card-overlay" aria-hidden="true" />
                </div>
              </div>
              <div className="triptych-card-text-zone">
                <img
                  src={DEDICATED_WORLD_ASSETS.dried.textSrc}
                  alt="Dried World"
                  className="triptych-card-text-img"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lower Editorial Action Area (Positioned tightly below text zone) */}
        <footer className="triptych-action-zone">
          <span
            className="triptych-micro-label"
            style={{ color: currentWorldConfig.accentColor }}
          >
            {currentWorldConfig.microLabel}
          </span>

          <Link href={currentWorldConfig.actionHref} className="triptych-action-link">
            <span className="triptych-action-text">
              {currentWorldConfig.actionText}
            </span>
            <span
              className="triptych-action-arrow"
              style={{ color: currentWorldConfig.accentColor }}
              aria-hidden="true"
            >
              ↗
            </span>
            <span
              className="triptych-action-rule"
              style={{ backgroundColor: currentWorldConfig.accentColor }}
              aria-hidden="true"
            />
          </Link>
        </footer>
      </div>
    </section>
  );
}

export default ThreeWorldsSection;


