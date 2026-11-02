"use client";

import React, { useEffect, useRef, useState } from "react";
import { companyPoster } from "./companyPosters";
import styles from "./CompanyVideo.module.css";

interface CompanyVideoProps {
  readonly src: string;
  readonly poster?: string;
  readonly className: string;
  readonly label?: string;
  readonly sizes: string;
  readonly eager?: boolean;
  /** Matches the existing CSS breakpoint; hidden layouts never attach video sources. */
  readonly displayMedia?: string;
}

export function CompanyVideo({
  src, poster, className, label, sizes, eager = false, displayMedia = "all",
}: CompanyVideoProps): React.JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPoster, setShowPoster] = useState(eager);
  const image = poster ? companyPoster(poster) : undefined;

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    const breakpoint = window.matchMedia(displayMedia);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { readonly saveData?: boolean };
    }).connection;
    let near = eager;
    let visible = false;
    let resumeTime = 0;

    const detach = () => {
      if (!video.hasAttribute("src")) return;
      resumeTime = video.currentTime;
      video.pause();
      video.removeAttribute("src");
      video.load(); // Abort unused range requests, including after a breakpoint change.
      delete video.dataset.playing;
    };
    const sync = () => {
      const enabled = breakpoint.matches && frame.getClientRects().length > 0;
      if (enabled && near) setShowPoster(true);
      if (!enabled || !near || document.hidden || reducedMotion.matches || connection?.saveData) {
        detach();
        return;
      }
      if (!video.hasAttribute("src")) {
        video.src = src;
        video.load();
      }
      if (visible) void video.play().catch(() => { /* The same-frame poster stays visible. */ });
      else video.pause();
    };
    const onMetadata = () => {
      if (resumeTime > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(resumeTime, video.duration);
      }
    };
    const onPlaying = () => { video.dataset.playing = "true"; };
    const onError = () => { delete video.dataset.playing; };
    const nearObserver = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      sync();
    }, { rootMargin: "300px 0px" });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      sync();
    }, { threshold: [0, 0.01] });

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    breakpoint.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    nearObserver.observe(frame);
    playbackObserver.observe(frame);
    sync();

    return () => {
      nearObserver.disconnect();
      playbackObserver.disconnect();
      breakpoint.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      detach();
    };
  }, [src, displayMedia, eager]);

  return (
    <div ref={frameRef} className={`${className} ${styles.frame}`} data-company-video>
      {image && (showPoster ? (
        // Prebuilt srcset avoids a second native video poster download and preserves the original crop.
        // eslint-disable-next-line @next/next/no-img-element
        <img {...image} sizes={sizes} alt="" className={styles.poster}
          loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
      ) : (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt="" className={styles.poster} loading="lazy" />
        </noscript>
      ))}
      <video ref={videoRef} className={styles.video} aria-label={label}
        muted loop playsInline preload="none" />
    </div>
  );
}
