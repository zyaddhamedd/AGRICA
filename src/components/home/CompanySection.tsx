"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useHomeDictionary, useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/navigation";
import "./CompanySection.css";

type NavigatorWithConnection = Navigator & {
  connection?: { readonly saveData?: boolean };
};

const VIDEO_SOURCE_DESKTOP = "/assets/company/agrica-drone-tracking-film.mp4";
const VIDEO_SOURCE_MOBILE = "/assets/company/agrica-drone-tracking-film-mobile.mp4";
const POSTER_SOURCE = "/assets/company/agrica-drone-tracking-poster.avif";

function splitCompanyHeadline(headline: string, locale: string): { lead: string; emphasis: string } {
  if (locale === "ar") {
    const idx = headline.indexOf("إلى");
    if (idx !== -1) return { lead: headline.slice(0, idx).trim(), emphasis: headline.slice(idx).trim() };
  } else if (locale === "fr") {
    const idx = headline.indexOf("aux");
    if (idx !== -1) return { lead: headline.slice(0, idx).trim(), emphasis: headline.slice(idx).trim() };
  } else if (locale === "de") {
    const idx = headline.indexOf("in die");
    if (idx !== -1) return { lead: headline.slice(0, idx).trim(), emphasis: headline.slice(idx).trim() };
  } else if (locale === "ru") {
    const idx = headline.indexOf("—");
    if (idx !== -1) return { lead: headline.slice(0, idx).trim(), emphasis: headline.slice(idx + 1).trim() };
  }
  const idx = headline.indexOf("to global");
  if (idx !== -1) return { lead: headline.slice(0, idx).trim(), emphasis: headline.slice(idx).trim() };
  return { lead: headline, emphasis: "" };
}

export function CompanySection(): React.JSX.Element {
  const dictionary = useHomeDictionary().company;
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { lead, emphasis } = splitCompanyHeadline(dictionary.headline, locale);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
    let mediaAttached = false;
    let sectionVisible = false;

    const shouldUsePoster = () => reducedMotionQuery.matches || saveData;

    const ensureMobileVideoAttributes = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    };

    const attachMedia = () => {
      if (mediaAttached || shouldUsePoster()) return;
      ensureMobileVideoAttributes();
      const targetSrc = mobileQuery.matches
        ? (video.dataset.srcMobile ?? VIDEO_SOURCE_MOBILE)
        : (video.dataset.src ?? VIDEO_SOURCE_DESKTOP);
      video.src = targetSrc;
      video.load();
      mediaAttached = true;
      section.dataset.mediaMode = "video";
    };

    const playIfVisible = () => {
      if (!sectionVisible || shouldUsePoster() || document.hidden) return;
      attachMedia();
      ensureMobileVideoAttributes();
      if (!video.paused) {
        section.dataset.videoReady = "true";
        return;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            section.dataset.mediaMode = "video";
            section.dataset.videoReady = "true";
          })
          .catch(() => {
            // Keep video mode active so canplay / scroll / touch gesture can resume playback
          });
      }
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
      { rootMargin: "1200px 0px" },
    );

    const playbackObserver = new IntersectionObserver(
      ([entry]) => {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) playIfVisible();
        else pause();
      },
      { rootMargin: "160px 0px", threshold: [0, 0.01, 0.15] },
    );

    const onReadyToPlay = () => {
      playIfVisible();
      if (!video.paused) {
        section.dataset.videoReady = "true";
      }
    };

    const onPlaying = () => {
      section.dataset.mediaMode = "video";
      section.dataset.videoReady = "true";
    };

    const onTimeUpdate = () => {
      if (video.currentTime > 0) {
        section.dataset.mediaMode = "video";
        section.dataset.videoReady = "true";
      }
    };

    const onUserGesture = () => {
      if (sectionVisible && video.paused && !shouldUsePoster()) {
        playIfVisible();
      }
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
    video.addEventListener("loadeddata", onReadyToPlay);
    video.addEventListener("canplay", onReadyToPlay);
    video.addEventListener("canplaythrough", onReadyToPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("touchstart", onUserGesture, { passive: true });
    window.addEventListener("scroll", onUserGesture, { passive: true });
    reducedMotionQuery.addEventListener("change", onMotionPreferenceChange);

    // Immediate viewport check if page loads already scrolled near or inside #company
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh + 1200 && rect.bottom > -1200) {
      attachMedia();
    }
    if (rect.top < vh + 160 && rect.bottom > -160) {
      sectionVisible = true;
      playIfVisible();
    }

    return () => {
      mediaObserver.disconnect();
      playbackObserver.disconnect();
      pause();
      video.removeEventListener("loadeddata", onReadyToPlay);
      video.removeEventListener("canplay", onReadyToPlay);
      video.removeEventListener("canplaythrough", onReadyToPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("touchstart", onUserGesture);
      window.removeEventListener("scroll", onUserGesture);
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
          data-src={VIDEO_SOURCE_DESKTOP}
          data-src-mobile={VIDEO_SOURCE_MOBILE}
          poster={POSTER_SOURCE}
          preload="auto"
          muted
          autoPlay
          playsInline
          loop
          disablePictureInPicture
          aria-hidden="true"
        />
        <div className="company-film-grade" aria-hidden="true" />
      </div>

      <div className="company-copy">
        <div className="company-hud" aria-hidden="true">
          <span className="hud-corner hud-tl" />
          <span className="hud-corner hud-tr" />
          <span className="hud-corner hud-bl" />
          <span className="hud-corner hud-br" />
        </div>

        <div className="company-meta-strip">
          <span className="company-coord-stamp">
            <span className="company-coord-beacon" aria-hidden="true" />
            30°28&apos;N 31°06&apos;E · DELTA ORIGIN
          </span>
          <span className="company-meta-divider" aria-hidden="true">/</span>
          <p className="company-eyebrow">{dictionary.eyebrow}</p>
        </div>

        <h2 id="company-title" className="company-heading">
          <span className="company-heading-lead">{lead}</span>
          {emphasis ? (
            <>
              {" "}
              <span className="company-heading-emphasis">{emphasis}</span>
            </>
          ) : null}
        </h2>

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
