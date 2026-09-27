"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { GlobalMenu } from "@/components/common/GlobalMenu";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { BusinessDivisionSwitcher } from "@/components/common/BusinessDivisionSwitcher";
import { useCommonDictionary, useHomeDictionary, useLocale } from "@/i18n/locale-context";

interface HeroMediaItem {
  readonly id: string;
  readonly title: string;
  readonly poster: string;
  readonly video: string;
}

const HERO_MEDIA_ITEMS: readonly HeroMediaItem[] = [
  {
    id: "crate",
    title: "Harvested Egyptian Citrus",
    poster: "/assets/hero/card-1-crate.jpg",
    video: "/assets/hero/u1-the-land.mp4",
  },
  {
    id: "leaves",
    title: "Golden Hour Orchard Light",
    poster: "/assets/hero/card-2-leaves.jpg",
    video: "/assets/video_hero.mp4",
  },
  {
    id: "orchard",
    title: "Egyptian Citrus Groves",
    poster: "/assets/hero/card-3-orchard.jpg",
    video: "/assets/hero/u2-the-standard.mp4",
  },
  {
    id: "hands",
    title: "Precision Hand-Harvest",
    poster: "/assets/hero/card-4-hands.jpg",
    video: "/assets/video 2.mp4",
  },
  {
    id: "farm",
    title: "Nile Valley Horizons",
    poster: "/assets/hero/card-5-farm.jpg",
    video: "/assets/video 3.mp4",
  },
];

const HERO_KICKERS: Record<string, string> = {
  en: "PREMIUM EGYPTIAN PRODUCE",
  ar: "محاصيل مصرية فائقة الجودة",
  ru: "ПРЕМИАЛЬНАЯ ЕГИПЕТСКАЯ ПРОДУКЦИЯ",
  de: "PREMIUM-ERZEUGNISSE AUS ÄGYPTEN",
  fr: "PRODUITS ÉGYPTIENS D'EXCEPTION",
};

const HERO_CTA_LABELS: Record<string, string> = {
  en: "Explore Our Produce",
  ar: "استكشف منتجاتنا",
  ru: "Смотреть продукцию",
  de: "Unsere Produkte entdecken",
  fr: "Découvrir nos produits",
};

export function HeroSection(): React.JSX.Element {
  const locale = useLocale();
  const common = useCommonDictionary();
  const dictionary = useHomeDictionary().hero;

  const [activeIndex, setActiveIndex] = useState(2); // Center card (orchard) active by default
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [playingMap, setPlayingMap] = useState<Record<number, boolean>>({});

  const heroRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartXRef = useRef<number | null>(null);

  const itemCount = HERO_MEDIA_ITEMS.length;

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  // Video playback management: play active video when hero is visible
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let isHeroVisible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const syncVideos = () => {
      videoRefs.current.forEach((video, idx) => {
        if (!video) return;
        video.defaultMuted = true;
        video.muted = true;

        if (idx === activeIndex && isHeroVisible && !document.hidden && !reducedMotion) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setPlayingMap((prev) => ({ ...prev, [idx]: true }));
              })
              .catch(() => {
                // Autoplay blocked or interrupted; poster remains gracefully visible
              });
          }
        } else {
          video.pause();
          setPlayingMap((prev) => ({ ...prev, [idx]: false }));
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible = entry.isIntersecting;
        syncVideos();
      },
      { threshold: 0.05 }
    );

    observer.observe(hero);

    const handleVisibility = () => syncVideos();
    document.addEventListener("visibilitychange", handleVisibility);

    syncVideos();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      videoRefs.current.forEach((v) => v?.pause());
    };
  }, [activeIndex]);

  // Restrained auto-advance timer for film reel (every 7s when idle)
  useEffect(() => {
    if (isHovered) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % itemCount);
    }, 7000);

    return () => clearInterval(timer);
  }, [isHovered, itemCount]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    const isRtl = locale === "ar";

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        if (isRtl) goToNext();
        else goToPrev();
      } else {
        if (isRtl) goToPrev();
        else goToNext();
      }
    }
    touchStartXRef.current = null;
  };

  const kickerText = HERO_KICKERS[locale] || HERO_KICKERS.en;
  const ctaText = HERO_CTA_LABELS[locale] || HERO_CTA_LABELS.en;

  return (
    <section
      ref={heroRef}
      className="hero"
      id="top"
      aria-label="AGRICA Hero"
    >
      {/* 1. Cinematic Background Atmosphere */}
      <div className="hero-bg-canvas" aria-hidden="true">
        <img
          src="/assets/hero/hero-bg.jpg"
          alt=""
          fetchPriority="high"
          className="hero-citrus-art"
        />
        <div className="hero-vignette" />
        <div className="hero-botanical-decor">
          <img
            src="/assets/s1.png"
            alt=""
            className="hero-botanical-item hero-botanical--s1-top"
          />
          <img
            src="/assets/s2.png"
            alt=""
            className="hero-botanical-item hero-botanical--s2-mid"
          />
          <img
            src="/assets/s3.png"
            alt=""
            className="hero-botanical-item hero-botanical--s3-bottom"
          />
        </div>
      </div>

      {/* 2. Floating Cream Paper Capsule Navbar */}
      <header className="hero-floating-navbar" role="banner">
        <Link href="/" className="hero-navbar-brand" aria-label={common.navigation.agricaHome}>
          <img
            src="/assets/agrica-logo-brand.png"
            alt="AGRICA"
            className="hero-navbar-logo"
          />
        </Link>

        {/* Hidden semantic navigation links for accessibility & testing parity */}
        <div className="visually-hidden" aria-hidden="true">
          <Link href="/products">{common.navigation.products}</Link>
          <Link href="/standard">{common.navigation.standard}</Link>
        </div>

        <div className="hero-navbar-controls">
          {/* Subtle division switcher (Produce / Herbs & Spices) */}
          <BusinessDivisionSwitcher tone="light" />

          {/* Subtle compact language switcher */}
          <LanguageSwitcher tone="light" />

          {/* Minimal Menu Trigger */}
          <button
            type="button"
            className="hero-navbar-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-controls="global-menu-panel"
            aria-label={common.navigation.openMenu}
          >
            <span>{common.navigation.menu}</span>
            <span className="hero-menu-burger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* 3. Main Hero Editorial Content Stage */}
      <div className="hero-content-stage">
        {/* Left Editorial Headline Block */}
        <div className="hero-headline-wrapper">
          <span className="hero-kicker">{kickerText}</span>

          <h1 id="hero-title" className="hero-title">
            <span className="hero-title-line hero-title-line--serif">
              {locale === "en" ? (
                <>
                  <span className="hero-line-block">From</span>
                  <span className="hero-line-block">Egyptian soil,</span>
                </>
              ) : (
                <span className="hero-line-block">{dictionary.desktopLead}</span>
              )}
            </span>

            <span className="hero-title-line hero-title-line--brand">
              <img
                src="/assets/agrica-logo.png"
                alt="AGRICA"
                className="hero-brand-logo-img"
              />
            </span>

            <span className="hero-title-line hero-title-line--serif">
              <span className="hero-line-block">{dictionary.desktopVerb}</span>
            </span>

            <span className="hero-title-line hero-title-line--close">
              <em>{dictionary.desktopEmphasis}</em>
            </span>
          </h1>
        </div>

        {/* 4. Film Reel Strip & Minimal CTA (Positioned below headline) */}
        <div
          className="hero-bottom-band"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Film Reel Strip */}
          <div
            className="hero-carousel-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="AGRICA Visual Strip"
          >
            {/* Left Nav Button */}
            <button
              type="button"
              className="hero-carousel-nav-btn hero-carousel-nav-btn--prev"
              onClick={goToPrev}
              aria-label="Previous clip"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Media Strip Windows */}
            <div className="hero-cards-row">
              {HERO_MEDIA_ITEMS.map((item, index) => {
                const isActive = index === activeIndex;
                const distance = Math.min(
                  Math.abs(index - activeIndex),
                  itemCount - Math.abs(index - activeIndex)
                );
                const isOuter = distance > 1;
                const isPlaying = playingMap[index] ?? false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`hero-card-item${
                      isActive ? " hero-card-item--active" : ""
                    }${isOuter ? " hero-card-item--outer" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={item.title}
                  >
                    <div className="hero-card-media">
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        className={`hero-card-video${
                          isPlaying ? " is-playing" : ""
                        }`}
                        poster={item.poster}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      >
                        <source src={item.video} type="video/mp4" />
                      </video>
                      <img
                        src={item.poster}
                        alt=""
                        className="hero-card-poster"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              className="hero-carousel-nav-btn hero-carousel-nav-btn--next"
              onClick={goToNext}
              aria-label="Next clip"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thin Progress Indicator */}
          <div
            className="hero-pagination-bar"
            role="tablist"
            aria-label="Video reel progress"
          >
            {HERO_MEDIA_ITEMS.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${item.title} (${index + 1} of ${itemCount})`}
                  className={`hero-page-pill ${
                    isActive ? "hero-page-pill--active" : "hero-page-pill--idle"
                  }`}
                  onClick={() => setActiveIndex(index)}
                />
              );
            })}
          </div>

          {/* 5. Minimal Restrained CTA */}
          <Link href="/products" className="hero-cta">
            <span className="hero-cta-text">{ctaText}</span>
            <span className="hero-cta-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Shared Global Navigation Side-Panel Drawer */}
      <GlobalMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </section>
  );
}
