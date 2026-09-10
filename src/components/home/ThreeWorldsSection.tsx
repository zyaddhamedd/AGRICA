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

// Dedicated world-specific visual imagery and transparent wordmark mapping
const DEDICATED_WORLD_ASSETS: Record<
  WorldKey,
  { src: string; textSrc: string; alt: string; textAlt: string; objectPosition: string }
> = {
  fresh: {
    src: "/assets/fresh_img.png",
    textSrc: "/assets/fresh_text.png",
    alt: "AGRICA Fresh Produce",
    textAlt: "Fresh Produce Wordmark",
    objectPosition: "50% 50%",
  },
  frozen: {
    src: "/assets/frozen_img.png",
    textSrc: "/assets/frozen_text.png",
    alt: "AGRICA IQF Frozen Produce",
    textAlt: "IQF Frozen Wordmark",
    objectPosition: "50% 50%",
  },
  dried: {
    src: "/assets/dried_img.png",
    textSrc: "/assets/dried_text.png",
    alt: "AGRICA Sun-Dried Herbs and Botanicals",
    textAlt: "Dried Range Wordmark",
    objectPosition: "50% 50%",
  },
};

// Refined vector arrow component for premium CTA rendering
function RefinedArrowIcon({ color }: { color: string }): React.JSX.Element {
  return (
    <svg
      className="vertical-chapter-action-svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ color }}
    >
      <path
        d="M3.5 10.5L10.5 3.5M10.5 3.5H4.66667M10.5 3.5V9.33333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThreeWorldsSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Chapter Card Refs (attached to full Link elements)
  const cardFreshRef = useRef<HTMLAnchorElement>(null);
  const cardFrozenRef = useRef<HTMLAnchorElement>(null);
  const cardDriedRef = useRef<HTMLAnchorElement>(null);

  // Image Mask Refs
  const maskFreshRef = useRef<HTMLDivElement>(null);
  const maskFrozenRef = useRef<HTMLDivElement>(null);
  const maskDriedRef = useRef<HTMLDivElement>(null);

  // Image Element Refs
  const imgFreshRef = useRef<HTMLImageElement>(null);
  const imgFrozenRef = useRef<HTMLImageElement>(null);
  const imgDriedRef = useRef<HTMLImageElement>(null);

  // Wordmark Zone Refs
  const wmFreshRef = useRef<HTMLDivElement>(null);
  const wmFrozenRef = useRef<HTMLDivElement>(null);
  const wmDriedRef = useRef<HTMLDivElement>(null);

  const [, setSelectedWorld] = useSharedWorld();
  const [activeWorldKey, setActiveWorldKey] = useState<WorldKey>("fresh");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 960px)", () => {
      const section = sectionRef.current;
      const cardFresh = cardFreshRef.current;
      const cardFrozen = cardFrozenRef.current;
      const cardDried = cardDriedRef.current;

      const maskFresh = maskFreshRef.current;
      const maskFrozen = maskFrozenRef.current;
      const maskDried = maskDriedRef.current;

      const imgFresh = imgFreshRef.current;
      const imgFrozen = imgFrozenRef.current;
      const imgDried = imgDriedRef.current;

      const wmFresh = wmFreshRef.current;
      const wmFrozen = wmFrozenRef.current;
      const wmDried = wmDriedRef.current;

      if (!section || !cardFresh || !cardFrozen || !cardDried) return;

      const chapterList = [
        {
          key: "fresh" as WorldKey,
          card: cardFresh,
          mask: maskFresh,
          img: imgFresh,
          wm: wmFresh,
          bg: "#F4F2E9",
        },
        {
          key: "frozen" as WorldKey,
          card: cardFrozen,
          mask: maskFrozen,
          img: imgFrozen,
          wm: wmFrozen,
          bg: "#EEF3F4",
        },
        {
          key: "dried" as WorldKey,
          card: cardDried,
          mask: maskDried,
          img: imgDried,
          wm: wmDried,
          bg: "#F2EADF",
        },
      ];

      // 1. Initial GSAP set for controlled starting states
      chapterList.forEach(({ card, mask, img, wm }) => {
        if (card) gsap.set(card, { scale: 1.0, opacity: 1.0, y: 0 });
        if (mask) gsap.set(mask, { clipPath: "inset(7% 0% 7% 0%)" });
        if (img) gsap.set(img, { scale: 1.04, yPercent: -4 });
        if (wm) gsap.set(wm, { y: 30, opacity: 0 });
      });

      // 2. Independent Active-World Focus & Background Atmosphere Switches
      chapterList.forEach(({ key, card, bg }) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveWorldKey(key);
              setSelectedWorld(key, false);
              gsap.to(section, {
                backgroundColor: bg,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
          },
        });
      });

      // 3. Entry Reveals per Chapter (Masked Image Open + Wordmark Rise + Image Parallax)
      chapterList.forEach(({ card, mask, img, wm }) => {
        const entryTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 42%",
            scrub: 0.6,
          },
        });

        if (mask) {
          entryTl.to(mask, { clipPath: "inset(0% 0% 0% 0%)", ease: "sine.out" }, 0);
        }
        if (img) {
          entryTl.to(img, { scale: 1.0, ease: "sine.out" }, 0);
        }
        if (wm) {
          entryTl.to(wm, { y: 0, opacity: 1, ease: "power2.out" }, 0.08);
        }

        // Subtle image counter-parallax on vertical scroll
        if (img) {
          gsap.to(img, {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      // 4. Cinematic Handoff (Subtle Retreat of Outgoing Chapter when Next Chapter Enters)
      // Fresh retreats when Frozen approaches
      gsap.timeline({
        scrollTrigger: {
          trigger: cardFrozen,
          start: "top 80%",
          end: "top 35%",
          scrub: 0.6,
        },
      }).to(cardFresh, {
        scale: 0.96,
        opacity: 0.55,
        y: -15,
        ease: "sine.out",
      });

      // Frozen retreats when Dried approaches
      gsap.timeline({
        scrollTrigger: {
          trigger: cardDried,
          start: "top 80%",
          end: "top 35%",
          scrub: 0.6,
        },
      }).to(cardFrozen, {
        scale: 0.96,
        opacity: 0.55,
        y: -15,
        ease: "sine.out",
      });
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

      <div ref={stageRef} className="vertical-triptych-stage">
        {/* Top Header Kicker (Rendered ONCE at the beginning of Section 2) */}
        <header className="vertical-triptych-header">
          <span
            className="vertical-triptych-kicker-number"
            style={{ color: currentWorldConfig.accentColor }}
          >
            01 ───────── 03
          </span>
          <span className="vertical-triptych-kicker-title">THREE WORLDS</span>
        </header>

        {/* Vertical Chapter List */}
        <div className="vertical-chapters-list">
          {/* 01 Fresh Chapter - Entire Card is Clickable */}
          <Link
            ref={cardFreshRef}
            href={THREE_WORLDS_DATA.fresh.actionHref}
            className="vertical-chapter vertical-chapter--fresh"
            aria-label={`Explore Fresh Produce - ${THREE_WORLDS_DATA.fresh.microLabel}`}
          >
            <div className="vertical-chapter-media">
              <div ref={maskFreshRef} className="vertical-chapter-img-mask">
                <img
                  ref={imgFreshRef}
                  src={DEDICATED_WORLD_ASSETS.fresh.src}
                  alt={DEDICATED_WORLD_ASSETS.fresh.alt}
                  className="vertical-chapter-img"
                  style={{ objectPosition: DEDICATED_WORLD_ASSETS.fresh.objectPosition }}
                />
              </div>
            </div>
            <div ref={wmFreshRef} className="vertical-chapter-wordmark-zone">
              <img
                src={DEDICATED_WORLD_ASSETS.fresh.textSrc}
                alt={DEDICATED_WORLD_ASSETS.fresh.textAlt}
                className="vertical-chapter-wordmark-img"
              />
            </div>
            <div className="vertical-chapter-action-zone">
              <span
                className="vertical-chapter-micro-label"
                style={{ color: THREE_WORLDS_DATA.fresh.accentColor }}
              >
                {THREE_WORLDS_DATA.fresh.microLabel}
              </span>
              <div className="vertical-chapter-action-cta">
                <span className="vertical-chapter-action-text">
                  {THREE_WORLDS_DATA.fresh.actionText}
                </span>
                <RefinedArrowIcon color={THREE_WORLDS_DATA.fresh.accentColor} />
                <span
                  className="vertical-chapter-action-rule"
                  style={{ backgroundColor: THREE_WORLDS_DATA.fresh.accentColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </Link>

          {/* 02 Frozen Chapter - Entire Card is Clickable */}
          <Link
            ref={cardFrozenRef}
            href={THREE_WORLDS_DATA.frozen.actionHref}
            className="vertical-chapter vertical-chapter--frozen"
            aria-label={`Explore IQF Frozen - ${THREE_WORLDS_DATA.frozen.microLabel}`}
          >
            <div className="vertical-chapter-media">
              <div ref={maskFrozenRef} className="vertical-chapter-img-mask">
                <img
                  ref={imgFrozenRef}
                  src={DEDICATED_WORLD_ASSETS.frozen.src}
                  alt={DEDICATED_WORLD_ASSETS.frozen.alt}
                  className="vertical-chapter-img"
                  style={{ objectPosition: DEDICATED_WORLD_ASSETS.frozen.objectPosition }}
                />
              </div>
            </div>
            <div ref={wmFrozenRef} className="vertical-chapter-wordmark-zone">
              <img
                src={DEDICATED_WORLD_ASSETS.frozen.textSrc}
                alt={DEDICATED_WORLD_ASSETS.frozen.textAlt}
                className="vertical-chapter-wordmark-img"
              />
            </div>
            <div className="vertical-chapter-action-zone">
              <span
                className="vertical-chapter-micro-label"
                style={{ color: THREE_WORLDS_DATA.frozen.accentColor }}
              >
                {THREE_WORLDS_DATA.frozen.microLabel}
              </span>
              <div className="vertical-chapter-action-cta">
                <span className="vertical-chapter-action-text">
                  {THREE_WORLDS_DATA.frozen.actionText}
                </span>
                <RefinedArrowIcon color={THREE_WORLDS_DATA.frozen.accentColor} />
                <span
                  className="vertical-chapter-action-rule"
                  style={{ backgroundColor: THREE_WORLDS_DATA.frozen.accentColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </Link>

          {/* 03 Dried Chapter - Entire Card is Clickable */}
          <Link
            ref={cardDriedRef}
            href={THREE_WORLDS_DATA.dried.actionHref}
            className="vertical-chapter vertical-chapter--dried"
            aria-label={`Explore Dried Range - ${THREE_WORLDS_DATA.dried.microLabel}`}
          >
            <div className="vertical-chapter-media">
              <div ref={maskDriedRef} className="vertical-chapter-img-mask">
                <img
                  ref={imgDriedRef}
                  src={DEDICATED_WORLD_ASSETS.dried.src}
                  alt={DEDICATED_WORLD_ASSETS.dried.alt}
                  className="vertical-chapter-img"
                  style={{ objectPosition: DEDICATED_WORLD_ASSETS.dried.objectPosition }}
                />
              </div>
            </div>
            <div ref={wmDriedRef} className="vertical-chapter-wordmark-zone">
              <img
                src={DEDICATED_WORLD_ASSETS.dried.textSrc}
                alt={DEDICATED_WORLD_ASSETS.dried.textAlt}
                className="vertical-chapter-wordmark-img"
              />
            </div>
            <div className="vertical-chapter-action-zone">
              <span
                className="vertical-chapter-micro-label"
                style={{ color: THREE_WORLDS_DATA.dried.accentColor }}
              >
                {THREE_WORLDS_DATA.dried.microLabel}
              </span>
              <div className="vertical-chapter-action-cta">
                <span className="vertical-chapter-action-text">
                  {THREE_WORLDS_DATA.dried.actionText}
                </span>
                <RefinedArrowIcon color={THREE_WORLDS_DATA.dried.accentColor} />
                <span
                  className="vertical-chapter-action-rule"
                  style={{ backgroundColor: THREE_WORLDS_DATA.dried.accentColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ThreeWorldsSection;




