"use client";

import React, { useEffect, useRef, useState } from "react";
import { useHomeDictionary } from "@/i18n/locale-context";
import "./CompanySection.css";

const FILM_DURATION = 9.9;
const CHAPTER_STARTS = [0.08, 3.35, 6.4] as const;
const CHAPTER_ENDS = [3.02, 6.08, 9.72] as const;

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
    let targetProgress = 0;
    let renderedProgress = 0;
    let measureFrame = 0;
    let playbackFrame = 0;
    let mobileSegmentEnd: number | null = null;

    section.dataset.mediaMode = saveData ? "poster" : "video";

    const attachMedia = () => {
      if (mediaAttached || saveData || reducedMotion) return;
      const source = isDesktop ? video.dataset.desktopSrc : video.dataset.mobileSrc;
      if (!source) return;
      video.src = source;
      video.load();
      mediaAttached = true;
    };

    const updateChapter = (progress: number) => {
      const nextChapter = progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2;
      if (nextChapter === activeChapterRef.current) return;
      activeChapterRef.current = nextChapter;
      setActiveChapter(nextChapter);

      if (!isDesktop && !reducedMotion && !saveData && mediaAttached) {
        mobileSegmentEnd = CHAPTER_ENDS[nextChapter];
        const playSegment = () => {
          video.currentTime = CHAPTER_STARTS[nextChapter];
          void video.play().catch(() => {
            section.dataset.mediaMode = "poster";
          });
        };
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) playSegment();
        else video.addEventListener("loadedmetadata", playSegment, { once: true });
      }
    };

    const measure = () => {
      measureFrame = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      targetProgress = clamp(-rect.top / travel);
      updateChapter(targetProgress);
      progressBar.style.width = `${Math.max(targetProgress * 100, 2)}%`;
    };

    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = window.requestAnimationFrame(measure);
    };

    const scrubFilm = () => {
      playbackFrame = 0;
      if (!sectionVisible || !isDesktop || reducedMotion || saveData || !mediaAttached) return;
      renderedProgress += (targetProgress - renderedProgress) * 0.12;
      if (Math.abs(targetProgress - renderedProgress) < 0.0005) renderedProgress = targetProgress;

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        const duration = Number.isFinite(video.duration) ? video.duration : FILM_DURATION;
        const nextTime = clamp(renderedProgress) * Math.min(duration, FILM_DURATION);
        if (Math.abs(video.currentTime - nextTime) > 0.018) video.currentTime = nextTime;
      }
      playbackFrame = window.requestAnimationFrame(scrubFilm);
    };

    const startScrubbing = () => {
      if (!playbackFrame && sectionVisible && isDesktop && !reducedMotion && !saveData) {
        playbackFrame = window.requestAnimationFrame(scrubFilm);
      }
    };

    const stopScrubbing = () => {
      if (playbackFrame) window.cancelAnimationFrame(playbackFrame);
      playbackFrame = 0;
      video.pause();
    };

    const onTimeUpdate = () => {
      if (!isDesktop && mobileSegmentEnd !== null && video.currentTime >= mobileSegmentEnd) {
        video.pause();
        mobileSegmentEnd = null;
      }
    };

    const onLoadedData = () => {
      section.dataset.videoReady = "true";
      startScrubbing();
    };

    const onVideoError = () => {
      section.dataset.mediaMode = "poster";
      section.dataset.videoReady = "false";
    };

    const onMediaPreferenceChange = () => {
      reducedMotion = reducedMotionQuery.matches;
      const wasDesktop = isDesktop;
      isDesktop = desktopQuery.matches;
      section.dataset.motion = reducedMotion ? "reduced" : "full";
      if (reducedMotion) stopScrubbing();
      else {
        if (mediaAttached && wasDesktop !== isDesktop) {
          const source = isDesktop ? video.dataset.desktopSrc : video.dataset.mobileSrc;
          if (source && !video.currentSrc.endsWith(source)) {
            video.src = source;
            video.load();
          }
        }
        attachMedia();
        startScrubbing();
      }
      scheduleMeasure();
    };

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          attachMedia();
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) {
          scheduleMeasure();
          startScrubbing();
        } else stopScrubbing();
      },
      { threshold: 0.01 },
    );

    section.dataset.motion = reducedMotion ? "reduced" : "full";
    preloadObserver.observe(section);
    visibilityObserver.observe(section);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("error", onVideoError);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reducedMotionQuery.addEventListener("change", onMediaPreferenceChange);
    desktopQuery.addEventListener("change", onMediaPreferenceChange);
    scheduleMeasure();

    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onVideoError);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      reducedMotionQuery.removeEventListener("change", onMediaPreferenceChange);
      desktopQuery.removeEventListener("change", onMediaPreferenceChange);
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      stopScrubbing();
    };
  }, []);

  return (
    <section className="company-section" id="company" ref={sectionRef} aria-labelledby="company-title" data-active-chapter={activeChapter + 1}>
      <div className="company-scroll-track">
        <div className="company-sticky-stage">
          <div className="company-cinematic-grid">
            <div className="company-film" aria-label={dictionary.videoLabel}>
              <img className="company-film-poster" src="/assets/company/origin-poster.webp" alt="" width="960" height="538" loading="lazy" decoding="async" />
              <video
                ref={videoRef}
                className="company-film-video"
                data-desktop-src="/assets/company/company-master-desktop.mp4?v=2"
                data-mobile-src="/assets/company/company-master-mobile.mp4?v=2"
                poster="/assets/company/origin-poster.webp"
                preload="none"
                muted
                playsInline
                disablePictureInPicture
                aria-hidden="true"
              />
              <div className="company-film-wash" aria-hidden="true" />
            </div>

            <div className="company-copy">
              <p className="company-eyebrow" id="company-title">{dictionary.eyebrow}</p>
              <div className="company-chapters">
                {dictionary.chapters.map((chapter, index) => (
                  <article className={`company-chapter${activeChapter === index ? " is-active" : ""}`} key={chapter.number} data-chapter={chapter.number}>
                    <p className="company-chapter-meta"><span>{dictionary.chapterLabel}</span><span>{chapter.number}</span></p>
                    <p className="company-chapter-title">{chapter.title}</p>
                    <h2>{chapter.headline}</h2>
                    <p className="company-chapter-supporting">{chapter.supporting}</p>
                  </article>
                ))}
              </div>

              <div className="company-progress" aria-label={dictionary.progressLabel}>
                <span className="company-progress-count" aria-hidden="true">{String(activeChapter + 1).padStart(2, "0")} / 03</span>
                <span className="company-progress-track" aria-hidden="true"><span ref={progressRef} /></span>
                <span className="company-progress-label">{dictionary.chapters[activeChapter]?.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanySection;
