"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlobalMenu } from "@/components/common/GlobalMenu";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection(): React.JSX.Element {
  const heroRef = useRef<HTMLElement>(null);
  const heroMobileStageRef = useRef<HTMLDivElement>(null);
  const marqueeTrack1Ref = useRef<HTMLDivElement>(null);
  const marqueeTrack2Ref = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const mobileStatementRef = useRef<HTMLDivElement>(null);
  const desktopVideo1Ref = useRef<HTMLVideoElement>(null);
  const desktopVideo2Ref = useRef<HTMLVideoElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Ensure all videos play reliably with muted configuration
    const vids = heroRef.current?.querySelectorAll<HTMLVideoElement>("video");
    if (vids) {
      vids.forEach((vid) => {
        vid.defaultMuted = true;
        vid.muted = true;
        vid.play().catch(() => {});
      });
    }

    if (typeof window === "undefined") return;

    // 2. GSAP Continuous Dual Opposite Video Ribbons & Masked Text Reveal for Mobile
    const mm = gsap.matchMedia();

    mm.add("(max-width: 960px)", () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      const track1 = marqueeTrack1Ref.current;
      const track2 = marqueeTrack2Ref.current;
      const statement = mobileStatementRef.current;

      const tweens: gsap.core.Animation[] = [];

      // Row 1: Preserved Direction (xPercent: -50 -> 0, duration 26s)
      if (track1) {
        tweens.push(
          gsap.fromTo(
            track1,
            { xPercent: -50 },
            { xPercent: 0, duration: 26, ease: "none", repeat: -1 }
          )
        );
      }

      // Row 2: Opposite Direction (xPercent: 0 -> -50, duration 26s)
      if (track2) {
        tweens.push(
          gsap.fromTo(
            track2,
            { xPercent: 0 },
            { xPercent: -50, duration: 26, ease: "none", repeat: -1 }
          )
        );
      }

      // Masked Line Reveal for Single Editorial Brand Sentence
      if (statement) {
        const line1 = statement.querySelector<HTMLElement>(".mobile-sentence-line--1");
        const line2 = statement.querySelector<HTMLElement>(".mobile-sentence-line--2");
        const line3 = statement.querySelector<HTMLElement>(".mobile-sentence-line--3");

        if (line1 && line2 && line3) {
          const tl = gsap.timeline({ delay: 0.2 });

          tl.fromTo(
            line1,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.78, ease: "power4.out" }
          )
            .fromTo(
              line2,
              { yPercent: 110 },
              { yPercent: 0, duration: 0.82, ease: "power4.out" },
              "-=0.64"
            )
            .fromTo(
              line3,
              { yPercent: 110 },
              { yPercent: 0, duration: 0.92, ease: "power4.out" },
              "-=0.64"
            );

          tweens.push(tl);
        }
      }

      // 4. Visible Ambient Floating Motion for Decorative Background Assets
      const decorItems = heroRef.current?.querySelectorAll<HTMLElement>(
        ".mobile-hero-decor .mobile-decor-item"
      );
      if (decorItems && decorItems.length > 0) {
        const configs = [
          { x: -18, y: 22, duration: 11.5, breath: false },
          { x: 16, y: -20, duration: 10, breath: false },
          { x: 24, y: -10, duration: 14, breath: true, opacityRange: [0.16, 0.22] },
          { x: -22, y: 12, duration: 13, breath: true, opacityRange: [0.13, 0.18] },
          { x: 20, y: 16, duration: 12, breath: false },
          { x: -14, y: -22, duration: 10.5, breath: false },
          { x: -22, y: -24, duration: 12.8, breath: true, opacityRange: [0.20, 0.25] },
          { x: 18, y: -16, duration: 13.5, breath: false },
          { x: 20, y: -8, duration: 15.5, breath: true, opacityRange: [0.08, 0.12] },
        ];

        decorItems.forEach((item, i) => {
          const c = configs[i % configs.length];
          tweens.push(
            gsap.to(item, {
              x: c.x,
              y: c.y,
              duration: c.duration,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
          );

          if (c.breath && c.opacityRange) {
            tweens.push(
              gsap.fromTo(
                item,
                { opacity: c.opacityRange[0] },
                {
                  opacity: c.opacityRange[1],
                  duration: c.duration * 0.7,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut",
                }
              )
            );
          }
        });
      }

      return () => {
        tweens.forEach((t) => t.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero"
      id="top"
      aria-labelledby="hero-title"
    >
      {/* Mobile-Only Hero Stage (<= 960px) */}
      <div
        ref={heroMobileStageRef}
        className="hero-mobile-stage"
        aria-label="AGRICA Mobile Hero"
      >
        {/* Decorative Background Assets Layer */}
        <div className="mobile-hero-decor" aria-hidden="true">
          <img
            src="/assets/s1.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s1-top-right"
          />
          <img
            src="/assets/s3.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s3-top-left"
          />
          <img
            src="/assets/s2.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s2-upper-media"
          />
          <img
            src="/assets/s2.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s2-mid-cross"
          />
          <img
            src="/assets/s1.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s1-mid-left"
          />
          <img
            src="/assets/s3.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s3-mid-right"
          />
          <img
            src="/assets/s3.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s3-lower-right"
          />
          <img
            src="/assets/s1.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s1-lower-left"
          />
          <img
            src="/assets/s2.png"
            alt=""
            className="mobile-decor-asset mobile-decor-item mobile-decor--s2-lower-text"
          />
        </div>

        {/* 1. Floating Utilitarian Top Navbar */}
        <header className="mobile-floating-navbar">
          <Link href="/" className="mobile-navbar-brand" aria-label="AGRICA Home">
            <img
              src="/assets/agrica-logo-brand.png"
              alt="AGRICA"
              className="mobile-navbar-logo"
            />
          </Link>
          <button
            type="button"
            className="mobile-navbar-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            Menu
          </button>
        </header>

        {/* 2. Dual Horizontal Moving Video Marquee Ribbons (Opposite Motion System) */}
        <div
          ref={marqueeContainerRef}
          className="mobile-hero-marquee-container"
          aria-label="AGRICA moving visual ribbons"
        >
          {/* Row 1: Video Strip 01 (Preserved direction) */}
          <div className="mobile-marquee-row mobile-marquee-row--1">
            <div ref={marqueeTrack1Ref} className="mobile-marquee-track">
              <div className="mobile-marquee-set">
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--1"
                    src="/assets/video_hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--1"
                    src="/assets/video_hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
              </div>
              <div className="mobile-marquee-set" aria-hidden="true">
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--1"
                    src="/assets/video_hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--1"
                    src="/assets/video_hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Video Strip 02 (Opposite direction motion) */}
          <div className="mobile-marquee-row mobile-marquee-row--2">
            <div ref={marqueeTrack2Ref} className="mobile-marquee-track">
              <div className="mobile-marquee-set">
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--2"
                    src="/assets/video 2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--2"
                    src="/assets/video 2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
              </div>
              <div className="mobile-marquee-set" aria-hidden="true">
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--2"
                    src="/assets/video 2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
                <div className="mobile-video-card">
                  <video
                    className="mobile-video-elem mobile-video-elem--2"
                    src="/assets/video 2.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                  <div className="mobile-video-overlay" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Single Editorial Brand Sentence */}
        <div ref={mobileStatementRef} className="mobile-hero-sentence">
          {/* Line 1: From Egyptian soil, (Intro Line) */}
          <div className="mobile-sentence-mask mobile-sentence-mask--1">
            <span className="mobile-sentence-line mobile-sentence-line--1 mobile-reveal-line">
              From Egyptian soil,
            </span>
          </div>

          {/* Line 2: [AGRICA logo] reaches (Hero Line) */}
          <div className="mobile-sentence-mask mobile-sentence-mask--2">
            <span className="mobile-sentence-line mobile-sentence-line--2 mobile-reveal-line">
              <img
                src="/assets/agrica-logo.png"
                alt="AGRICA"
                className="mobile-sentence-logo"
              />
              <span className="mobile-sentence-sans">reaches</span>
            </span>
          </div>

          {/* Line 3: the world. (Emotional Closing Line) */}
          <div className="mobile-sentence-mask mobile-sentence-mask--3">
            <em className="mobile-sentence-line mobile-sentence-line--3 mobile-sentence-serif mobile-reveal-line">
              the world.
            </em>
          </div>
        </div>
      </div>




      {/* Desktop Stage (min-width: 961px): Simplicity, calmness & visual language of mobile hero */}
      <div className="hero-desktop-stage" aria-label="AGRICA Desktop Hero">
        {/* Subtle Decorative Background Assets Layer */}
        <div className="desktop-hero-decor" aria-hidden="true">
          <img
            src="/assets/s1.png"
            alt=""
            className="desktop-decor-asset desktop-decor-s1"
          />
          <img
            src="/assets/s2.png"
            alt=""
            className="desktop-decor-asset desktop-decor-s2"
          />
          <img
            src="/assets/s3.png"
            alt=""
            className="desktop-decor-asset desktop-decor-s3"
          />
        </div>

        {/* Floating Warm Paper Desktop Navbar */}
        <header className="desktop-floating-navbar">
          <Link href="/" className="desktop-navbar-brand" aria-label="AGRICA Home">
            <img
              src="/assets/agrica-logo-brand.png"
              alt="AGRICA"
              className="desktop-navbar-logo"
            />
          </Link>
          <button
            type="button"
            className="desktop-navbar-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            Menu
          </button>
        </header>

        {/* Desktop Main Stage: Asymmetric Dual-Video Row + Left-Aligned Brand Lockup */}
        <div className="desktop-hero-main-stage">
          {/* Dual-Video Asymmetric Row */}
          <div className="desktop-dual-video-row">
            {/* Video 1: Environmental Visual (57%) */}
            <div className="desktop-video-card desktop-video-card--primary">
              <video
                ref={desktopVideo1Ref}
                className="desktop-video-elem desktop-video-elem--primary"
                src="/assets/video_hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
              <div className="desktop-video-overlay" aria-hidden="true" />
            </div>

            {/* Video 2: Human/Farmer Visual (39%) */}
            <div className="desktop-video-card desktop-video-card--secondary">
              <video
                ref={desktopVideo2Ref}
                className="desktop-video-elem desktop-video-elem--secondary"
                src="/assets/video 2.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
              <div className="desktop-video-overlay" aria-hidden="true" />
            </div>
          </div>

          {/* AGRICA Brand Lockup Below Media Row */}
          <div className="desktop-hero-lockup">
            <img
              src="/assets/agrica-logo.png"
              alt="AGRICA"
              className="desktop-hero-lockup-logo"
            />
            <p className="desktop-hero-lockup-copy">
              <span id="hero-title">From Egyptian fields to</span>
              <em>global supply.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Shared Global Navigation Drawer */}
      <GlobalMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </section>
  );
}
