"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useHomeDictionary, useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/navigation";
import "./CompanySection.css";

type NavigatorWithConnection = Navigator & {
  connection?: { readonly saveData?: boolean };
};

const VIDEO_SOURCE = "/assets/company/agrica-company-strawberry-film.mp4";
const POSTER_SOURCE = "/assets/company/agrica-company-strawberry-poster.webp";

export function CompanySection(): React.JSX.Element {
  const dictionary = useHomeDictionary().company;
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
    let mediaAttached = false;
    let sectionVisible = false;

    const shouldUsePoster = () => reducedMotionQuery.matches || saveData;

    const attachMedia = () => {
      if (mediaAttached || shouldUsePoster()) return;
      video.src = video.dataset.src ?? "";
      video.load();
      mediaAttached = true;
      section.dataset.mediaMode = "video";
    };

    const playIfVisible = () => {
      if (!sectionVisible || shouldUsePoster() || document.hidden) return;
      attachMedia();
      video.muted = true;
      void video.play().catch(() => {
        section.dataset.mediaMode = "poster";
      });
    };

    const pause = () => {
      if (!video.paused) video.pause();
    };

    const mediaObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attachMedia();
          mediaObserver.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting && entry.intersectionRatio >= 0.16;
        if (sectionVisible) playIfVisible();
        else pause();
      },
      { threshold: [0, 0.16, 0.5] },
    );

    const onLoadedData = () => {
      section.dataset.videoReady = "true";
      playIfVisible();
    };

    const onError = () => {
      section.dataset.mediaMode = "poster";
      section.dataset.videoReady = "false";
      pause();
    };

    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else playIfVisible();
    };

    const onMotionPreferenceChange = () => {
      section.dataset.motion = reducedMotionQuery.matches ? "reduced" : "full";
      if (shouldUsePoster()) {
        pause();
        section.dataset.mediaMode = "poster";
      } else {
        playIfVisible();
      }
    };

    section.dataset.mediaMode = shouldUsePoster() ? "poster" : "pending";
    section.dataset.motion = reducedMotionQuery.matches ? "reduced" : "full";

    mediaObserver.observe(section);
    playbackObserver.observe(section);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotionQuery.addEventListener("change", onMotionPreferenceChange);

    return () => {
      mediaObserver.disconnect();
      playbackObserver.disconnect();
      pause();
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <section
      className="company-section"
      id="company"
      ref={sectionRef}
      aria-labelledby="company-title"
    >
      <div className="company-film" aria-label={dictionary.videoLabel}>
        <img
          className="company-film-poster"
          src={POSTER_SOURCE}
          alt=""
          width="1280"
          height="720"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
        <video
          ref={videoRef}
          className="company-film-video"
          data-src={VIDEO_SOURCE}
          poster={POSTER_SOURCE}
          preload="metadata"
          muted
          playsInline
          loop
          disablePictureInPicture
          aria-hidden="true"
        />
        <div className="company-film-grade" aria-hidden="true" />
      </div>

      <div className="company-copy">
        <p className="company-eyebrow">{dictionary.eyebrow}</p>
        <h2 id="company-title">{dictionary.headline}</h2>
        <p className="company-supporting">{dictionary.supporting}</p>
        <Link
          className="company-action"
          href={localePath(locale, "/company")}
          prefetch={false}
        >
          <span>{dictionary.action}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

export default CompanySection;
