"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { GlobalMenu } from "@/components/common/GlobalMenu";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { BusinessDivisionSwitcher } from "@/components/common/BusinessDivisionSwitcher";
import { useNavbarScrollVisibility } from "@/components/common/useNavbarScrollVisibility";
import { useCommonDictionary, useHomeDictionary, useLocale } from "@/i18n/locale-context";

interface HeroMediaItem {
  readonly id: string;
  readonly title: string;
  readonly poster: string;
  readonly posterWebp?: string;
  readonly posterFallback: string;
  readonly video: string;
}

interface HeroHeadlineContent {
  readonly line1: string;
  readonly line2: string;
  readonly line3Lead: string;
  readonly line3Accent: string;
}

const HERO_HEADLINES: Record<string, HeroHeadlineContent> = {
  en: {
    line1: "Egyptian produce.",
    line2: "Handled with discipline.",
    line3Lead: "Ready for ",
    line3Accent: "global trade.",
  },
  ar: {
    line1: "محاصيل مصرية.",
    line2: "تدار بانضباط.",
    line3Lead: "جاهزة للتجارة ",
    line3Accent: "العالمية.",
  },
  ru: {
    line1: "Египетская продукция.",
    line2: "Строгий контроль качества.",
    line3Lead: "Готова к ",
    line3Accent: "мировым поставкам.",
  },
  de: {
    line1: "Ägyptische Erzeugnisse.",
    line2: "Mit Disziplin verarbeitet.",
    line3Lead: "Bereit für den ",
    line3Accent: "Welthandel.",
  },
  fr: {
    line1: "Produits égyptiens.",
    line2: "Traités avec rigueur.",
    line3Lead: "Prêts pour le ",
    line3Accent: "commerce mondial.",
  },
};

const HERO_MEDIA_ITEMS: readonly HeroMediaItem[] = [
  {
    id: "harvest",
    title: "Harvest",
    poster: "/assets/hero/hero-01-origin-poster.avif",
    posterWebp: "/assets/hero/hero-01-origin-poster.webp",
    posterFallback: "/assets/hero/hero_keyframe_01_origin.png",
    video: "/assets/hero/hero-01-origin.mp4",
  },
  {
    id: "processing",
    title: "Processing",
    poster: "/assets/hero/hero_02_processing_poster.avif",
    posterWebp: "/assets/hero/hero_02_processing_poster.webp",
    posterFallback: "/assets/hero/hero_02_processing_poster.png",
    video: "/assets/hero/hero_02_processing_final.mp4",
  },
  {
    id: "packing",
    title: "Packing",
    poster: "/assets/hero/hero_03_packing_poster.avif",
    posterWebp: "/assets/hero/hero_03_packing_poster.webp",
    posterFallback: "/assets/hero/hero_03_packing_poster.png",
    video: "/assets/hero/hero_03_packing_final.mp4",
  },
  {
    id: "shipping",
    title: "Shipping",
    poster: "/assets/hero/hero_04_shipping_poster.avif",
    posterWebp: "/assets/hero/hero_04_shipping_poster.webp",
    posterFallback: "/assets/REF_HERO/Agrica Loading Dock Operations (1).png",
    video: "/assets/hero/hero_04_shipping_final.mp4",
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

  const [activeIndex, setActiveIndex] = useState(0); // Begin the four-film journey with Harvest
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const isNavbarVisible = useNavbarScrollVisibility({
    isMenuOpen,
    isDropdownOpen: isLanguageOpen,
    threshold: 8,
    topOffset: 20,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [playingMap, setPlayingMap] = useState<Record<number, boolean>>({});

  const heroRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartXRef = useRef<number | null>(null);

  const kickerRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  // Refined GSAP entrance animation for hero eyebrow & line-by-line headline
  useEffect(() => {
    const kicker = kickerRef.current;
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current].filter(
      (el): el is HTMLSpanElement => Boolean(el)
    );
    if (!kicker || lines.length === 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // Respect prefers-reduced-motion
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      // Eyebrow fades/slides in first
      tl.from(kicker, {
        opacity: 0,
        y: 18,
        duration: 0.8,
        delay: 0.12,
      });

      // Headline reveals line-by-line with masked vertical motion
      tl.from(
        lines,
        {
          opacity: 0,
          y: 35,
          duration: 0.9,
          stagger: 0.14,
        },
        "-=0.5"
      );
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

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
          video.currentTime = 0;
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
  const headline = HERO_HEADLINES[locale] || HERO_HEADLINES.en;
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
        <picture>
          <source srcSet="/assets/hero/hero-bg.avif" type="image/avif" />
          <source srcSet="/assets/hero/hero-bg.webp" type="image/webp" />
          <img
            src="/assets/hero/hero-bg.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="hero-citrus-art"
          />
        </picture>
        <div className="hero-vignette" />
        <div className="hero-botanical-decor">
          <picture>
            <source srcSet="/assets/s1.avif" type="image/avif" />
            <source srcSet="/assets/s1.webp" type="image/webp" />
            <img
              src="/assets/s1.png"
              alt=""
              decoding="async"
              className="hero-botanical-item hero-botanical--s1-top"
            />
          </picture>
          <picture>
            <source srcSet="/assets/s2.avif" type="image/avif" />
            <source srcSet="/assets/s2.webp" type="image/webp" />
            <img
              src="/assets/s2.png"
              alt=""
              decoding="async"
              className="hero-botanical-item hero-botanical--s2-mid"
            />
          </picture>
          <picture>
            <source srcSet="/assets/s3.avif" type="image/avif" />
            <source srcSet="/assets/s3.webp" type="image/webp" />
            <img
              src="/assets/s3.png"
              alt=""
              decoding="async"
              className="hero-botanical-item hero-botanical--s3-bottom"
            />
          </picture>
        </div>
      </div>

      {/* 2. Floating Cream Paper Capsule Navbar */}
      <header
        className="hero-floating-navbar"
        role="banner"
        data-hidden={!isNavbarVisible ? "true" : "false"}
      >
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
          <LanguageSwitcher tone="light" onOpenChange={setIsLanguageOpen} />

          {/* Minimal Menu Trigger */}
          <button
            type="button"
            className="hero-navbar-menu-btn"
            onClick={() => setIsMenuOpen(true)}
            aria-expanded={isMenuOpen}
            aria-controls="global-menu-panel"
            aria-label={common.navigation.openMenu}
          >
            <span className="visually-hidden">{common.navigation.menu}</span>
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
          <span ref={kickerRef} className="hero-kicker">
            <span className="hero-kicker-dot" aria-hidden="true" />
            {kickerText}
          </span>

          <h1
            id="hero-title"
            className="hero-title"
            aria-label={`${headline.line1} ${headline.line2} ${headline.line3Lead}${headline.line3Accent}`}
          >
            <span className="hero-line-mask">
              <span ref={line1Ref} className="hero-line-inner">
                {headline.line1}
              </span>
            </span>

            <span className="hero-line-mask">
              <span ref={line2Ref} className="hero-line-inner">
                {headline.line2}
              </span>
            </span>

            <span className="hero-line-mask">
              <span ref={line3Ref} className="hero-line-inner">
                {headline.line3Lead}
                <em className="hero-accent-word">{headline.line3Accent}</em>
              </span>
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
                const relativeOffset = (index - activeIndex + itemCount) % itemCount;
                const positionClass = isActive
                  ? " hero-card-item--current"
                  : relativeOffset === 1
                    ? " hero-card-item--next"
                    : relativeOffset === itemCount - 1
                      ? " hero-card-item--previous"
                      : "";
                const isPlaying = playingMap[index] ?? false;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`hero-card-item${
                      isActive ? " hero-card-item--active" : ""
                    }${isOuter ? " hero-card-item--outer" : ""}${positionClass}`}
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
                      <picture className="hero-card-poster" aria-hidden="true">
                        <source srcSet={item.poster} type="image/avif" />
                        {item.posterWebp && (
                          <source srcSet={item.posterWebp} type="image/webp" />
                        )}
                        <img
                          src={item.posterFallback}
                          alt=""
                          className="hero-card-poster"
                          aria-hidden="true"
                          decoding="async"
                          fetchPriority={index === 0 ? "high" : "auto"}
                        />
                      </picture>
                      <span className="hero-card-label" aria-hidden="true">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item.title}
                      </span>
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
