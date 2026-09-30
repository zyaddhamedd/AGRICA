"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHomeDictionary } from "@/i18n/locale-context";
import "./CompanySection.css";

const FILM_DURATION = 9.9;
const CHAPTER_STARTS = [0.0, 3.35, 6.4] as const;
const CHAPTER_DURATIONS = [3.35, 3.05, 3.5] as const; // per chapter duration in seconds

type NavigatorWithConnection = Navigator & { connection?: { readonly saveData?: boolean } };

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function CompanySection(): React.JSX.Element {
  const dictionary = useHomeDictionary().company;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeChapterRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);

  // Jump to specific chapter
  const seekToChapter = useCallback((index: number) => {
    const video = videoRef.current;
    activeChapterRef.current = index;
    setActiveChapter(index);

    if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      video.currentTime = CHAPTER_STARTS[index] ?? 0;
      void video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!section || !video || !progressBar) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
    let reducedMotion = reducedMotionQuery.matches;
    let isDesktop = desktopQuery.matches;
    let sectionVisible = false;
    let mediaAttached = false;
    let animFrameId = 0;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    section.dataset.mediaMode = saveData ? "poster" : "video";
    section.dataset.motion = reducedMotion ? "reduced" : "full";

    const attachMedia = () => {
      if (mediaAttached || saveData || reducedMotion) return;
      const source = isDesktop ? video.dataset.desktopSrc : video.dataset.mobileSrc;
      if (!source) return;
      video.src = source;
      video.load();
      mediaAttached = true;
    };

    const updateFromTime = (currentTime: number, duration: number) => {
      const validDuration = duration > 0 ? duration : FILM_DURATION;
      const progress = clamp(currentTime / validDuration);

      progressBar.style.width = `${Math.max(progress * 100, 2)}%`;

      let nextChapter = 0;
      if (currentTime >= CHAPTER_STARTS[2]) {
        nextChapter = 2;
      } else if (currentTime >= CHAPTER_STARTS[1]) {
        nextChapter = 1;
      } else {
        nextChapter = 0;
      }

      if (nextChapter !== activeChapterRef.current) {
        activeChapterRef.current = nextChapter;
        setActiveChapter(nextChapter);
      }
    };

    const tick = () => {
      if (sectionVisible && !video.paused && !video.ended) {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : FILM_DURATION;
        updateFromTime(video.currentTime, duration);
      }
      if (sectionVisible) {
        animFrameId = window.requestAnimationFrame(tick);
      }
    };

    const startPlayback = () => {
      if (reducedMotion || saveData) {
        startFallbackCarousel();
        return;
      }

      attachMedia();

      if (video) {
        video.muted = true;
        video.loop = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              section.dataset.videoReady = "true";
              if (!animFrameId) {
                animFrameId = window.requestAnimationFrame(tick);
              }
            })
            .catch(() => {
              // Autoplay blocked or failed -> run timer-based chapter switcher
              section.dataset.mediaMode = "poster";
              startFallbackCarousel();
            });
        }
      }
    };

    const stopPlayback = () => {
      if (animFrameId) {
        window.cancelAnimationFrame(animFrameId);
        animFrameId = 0;
      }
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
      if (video && !video.paused) {
        video.pause();
      }
    };

    const startFallbackCarousel = () => {
      if (fallbackTimer) return;
      fallbackTimer = setInterval(() => {
        const next = (activeChapterRef.current + 1) % 3;
        activeChapterRef.current = next;
        setActiveChapter(next);
        progressBar.style.width = `${((next + 1) / 3) * 100}%`;
      }, 3500);
    };

    const onLoadedData = () => {
      section.dataset.videoReady = "true";
      if (sectionVisible) {
        void video.play().catch(() => {});
      }
    };

    const onVideoError = () => {
      section.dataset.mediaMode = "poster";
      section.dataset.videoReady = "false";
      startFallbackCarousel();
    };

    // IntersectionObserver triggers autoplay when section comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) {
          startPlayback();
        } else {
          stopPlayback();
        }
      },
      { threshold: 0.15 },
    );

    const onMediaPreferenceChange = () => {
      reducedMotion = reducedMotionQuery.matches;
      const wasDesktop = isDesktop;
      isDesktop = desktopQuery.matches;
      section.dataset.motion = reducedMotion ? "reduced" : "full";

      if (reducedMotion) {
        stopPlayback();
        startFallbackCarousel();
      } else {
        if (mediaAttached && wasDesktop !== isDesktop) {
          const source = isDesktop ? video.dataset.desktopSrc : video.dataset.mobileSrc;
          if (source && !video.currentSrc.endsWith(source)) {
            video.src = source;
            video.load();
          }
        }
        if (sectionVisible) {
          startPlayback();
        }
      }
    };

    observer.observe(section);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onVideoError);
    reducedMotionQuery.addEventListener("change", onMediaPreferenceChange);
    desktopQuery.addEventListener("change", onMediaPreferenceChange);

    return () => {
      observer.disconnect();
      stopPlayback();
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onVideoError);
      reducedMotionQuery.removeEventListener("change", onMediaPreferenceChange);
      desktopQuery.removeEventListener("change", onMediaPreferenceChange);
    };
  }, []);

  return (
    <section
      className="company-section"
      id="company"
      ref={sectionRef}
      aria-labelledby="company-title"
      data-active-chapter={activeChapter + 1}
    >
      <div className="company-scroll-track">
        <div className="company-sticky-stage">
          <div className="company-cinematic-grid">
            {/* Cinematic Film Media Container */}
            <div className="company-film" aria-label={dictionary.videoLabel}>
              <img
                className="company-film-poster"
                src="/assets/company/origin-poster.webp"
                alt=""
                width="960"
                height="538"
                loading="lazy"
                decoding="async"
              />
              <video
                ref={videoRef}
                className="company-film-video"
                data-desktop-src="/assets/company/company-master-desktop.mp4?v=2"
                data-mobile-src="/assets/company/company-master-mobile.mp4?v=2"
                poster="/assets/company/origin-poster.webp"
                preload="none"
                muted
                playsInline
                loop
                disablePictureInPicture
                aria-hidden="true"
              />
              <div className="company-film-wash" aria-hidden="true" />
            </div>

            {/* Editorial Content Stage with Automatic Transitions */}
            <div className="company-copy">
              <p className="company-eyebrow" id="company-title">
                {dictionary.eyebrow}
              </p>
              <div className="company-chapters">
                {dictionary.chapters.map((chapter, index) => (
                  <article
                    className={`company-chapter${activeChapter === index ? " is-active" : ""}`}
                    key={chapter.number}
                    data-chapter={chapter.number}
                  >
                    <p className="company-chapter-meta">
                      <span>{dictionary.chapterLabel}</span>
                      <span>{chapter.number}</span>
                    </p>
                    <p className="company-chapter-title">{chapter.title}</p>
                    <h2>{chapter.headline}</h2>
                    <p className="company-chapter-supporting">{chapter.supporting}</p>
                  </article>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="company-progress" aria-label={dictionary.progressLabel}>
                <span className="company-progress-count" aria-hidden="true">
                  {String(activeChapter + 1).padStart(2, "0")} / 03
                </span>
                <span
                  className="company-progress-track"
                  aria-hidden="true"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = clamp((e.clientX - rect.left) / rect.width);
                    const clickedIndex = ratio < 0.33 ? 0 : ratio < 0.66 ? 1 : 2;
                    seekToChapter(clickedIndex);
                  }}
                  style={{ cursor: "pointer" }}
                  title="Jump to chapter"
                >
                  <span ref={progressRef} />
                </span>
                <span className="company-progress-label">
                  {dictionary.chapters[activeChapter]?.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanySection;
