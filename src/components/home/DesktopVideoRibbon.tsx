"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export interface DesktopRibbonItem {
  readonly src: string;
  readonly poster?: string;
}

export interface DesktopVideoRibbonProps {
  readonly items: readonly DesktopRibbonItem[];
  readonly direction: "left" | "right";
  readonly speed: number;
  readonly profile: "upper" | "lower";
  readonly phase?: number;
  readonly ariaLabel?: string;
  readonly decorative?: boolean;
}

const DESKTOP_MEDIA = "(min-width: 961px)";

export function DesktopVideoRibbon({
  items,
  direction,
  speed,
  profile,
  phase = 0.2,
  ariaLabel,
  decorative = false,
}: DesktopVideoRibbonProps): React.JSX.Element {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [sequenceCount, setSequenceCount] = useState(2);

  useEffect(() => {
    const ribbon = ribbonRef.current;
    const track = trackRef.current;
    const sequence = sequenceRef.current;
    if (!ribbon || !track || !sequence) return;

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const videos = Array.from(ribbon.querySelectorAll<HTMLVideoElement>("video"));
    const nearCards = new Set<Element>();
    let tween: gsap.core.Tween | undefined;
    let isVisible = true;

    const syncVideoPlayback = () => {
      const canPlay = isVisible && !document.hidden && desktopQuery.matches && !reducedMotionQuery.matches;
      videos.forEach((video) => {
        video.defaultMuted = true;
        video.muted = true;
        if (canPlay && video.parentElement && nearCards.has(video.parentElement)) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    const setPlaybackState = () => {
      if (!tween) return;
      if (isVisible && !document.hidden && desktopQuery.matches) tween.play();
      else tween.pause();
    };

    const buildTween = () => {
      tween?.kill();
      tween = undefined;

      const sequenceWidth = sequence.getBoundingClientRect().width;
      if (!sequenceWidth) return;

      const requiredSequenceCount = Math.max(2, Math.ceil(ribbon.clientWidth / sequenceWidth) + 1);
      if (requiredSequenceCount !== sequenceCount) {
        setSequenceCount(requiredSequenceCount);
        return;
      }

      const staticX = -sequenceWidth * phase;
      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        gsap.set(track, { x: staticX, force3D: true });
        return;
      }

      const fromX = direction === "right" ? -sequenceWidth : 0;
      const toX = direction === "right" ? 0 : -sequenceWidth;

      tween = gsap.fromTo(
        track,
        { x: fromX },
        {
          x: toX,
          duration: sequenceWidth / speed,
          ease: "none",
          repeat: -1,
          force3D: true,
          paused: true,
        },
      );
      tween.progress(phase);
      setPlaybackState();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        setPlaybackState();
        syncVideoPlayback();
      },
      { threshold: 0.02 },
    );
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) nearCards.add(entry.target);
          else nearCards.delete(entry.target);
        });
        syncVideoPlayback();
      },
      { root: ribbon, rootMargin: "0px 35%", threshold: 0.01 },
    );
    const resizeObserver = new ResizeObserver(buildTween);
    const handleVisibility = () => {
      setPlaybackState();
      syncVideoPlayback();
    };
    const handleMediaChange = () => {
      buildTween();
      syncVideoPlayback();
    };

    intersectionObserver.observe(ribbon);
    ribbon.querySelectorAll(".desktop-ribbon-card").forEach((card) => cardObserver.observe(card));
    resizeObserver.observe(sequence);
    desktopQuery.addEventListener("change", handleMediaChange);
    reducedMotionQuery.addEventListener("change", handleMediaChange);
    document.addEventListener("visibilitychange", handleVisibility);
    buildTween();

    return () => {
      tween?.kill();
      intersectionObserver.disconnect();
      cardObserver.disconnect();
      resizeObserver.disconnect();
      desktopQuery.removeEventListener("change", handleMediaChange);
      reducedMotionQuery.removeEventListener("change", handleMediaChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      videos.forEach((video) => video.pause());
    };
  }, [direction, phase, sequenceCount, speed]);

  const renderSequence = (duplicate: boolean) => (
    <div
      ref={duplicate ? undefined : sequenceRef}
      className="desktop-ribbon-sequence"
      aria-hidden={duplicate ? "true" : undefined}
    >
      {items.map((item, index) => (
        <div className="desktop-ribbon-card" key={`${duplicate ? "duplicate" : "source"}-${item.src}-${index}`}>
          <video
            className="desktop-ribbon-video"
            poster={item.poster}
            loop
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            data-desktop-ribbon-video
          >
            <source src={item.src} type="video/mp4" media={DESKTOP_MEDIA} />
          </video>
          <span className="desktop-ribbon-overlay" aria-hidden="true" />
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={ribbonRef}
      className={`desktop-video-ribbon desktop-video-ribbon--${profile}`}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : ariaLabel}
    >
      <div ref={trackRef} className="desktop-ribbon-track">
        {Array.from({ length: sequenceCount }, (_, index) => (
          <React.Fragment key={index}>{renderSequence(index > 0)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
