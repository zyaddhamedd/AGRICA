import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JourneyStage } from "@/types/agrica";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StandardFinalStageBlockProps {
  readonly stage: JourneyStage;
  readonly index: number;
}

export function StandardFinalStageBlock({
  stage,
  index,
}: StandardFinalStageBlockProps): React.JSX.Element {
  const blockRef = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const numStr = index < 9 ? `0${index + 1}` : `${index + 1}`;

  useEffect(() => {
    if (typeof window === "undefined" || !blockRef.current) return;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: blockRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // 1. Watermark Settle
      if (numRef.current) {
        tl.fromTo(
          numRef.current,
          { opacity: 0, scale: 0.92 },
          { opacity: 0.08, scale: 1, duration: 0.6, ease: "power2.out" },
          0
        );
      }

      // 2. Headline Reveal
      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0.15
        );
      }

      // 3. Visual Unclip
      if (mediaRef.current) {
        tl.fromTo(
          mediaRef.current,
          { clipPath: "inset(12% 0% 12% 0% round 8px)", opacity: 0.4 },
          { clipPath: "inset(0% 0% 0% 0% round 8px)", opacity: 1, duration: 0.7, ease: "power3.out" },
          0.2
        );
      }

      // 4. Completion Indicator Resolve
      if (completionRef.current) {
        tl.fromTo(
          completionRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          0.35
        );
      }

      // 5. Export Clearance Seal Stamp Settle
      if (sealRef.current) {
        tl.fromTo(
          sealRef.current,
          { opacity: 0, scale: 0.88, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" },
          0.45
        );
      }

      // 6. CTA Fade In
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          0.55
        );
      }
    }, blockRef);

    return () => ctx.revert();
  }, []);

  const journeySteps = [
    { label: "SOURCE", isFinal: false },
    { label: "INSPECT", isFinal: false },
    { label: "PREPARE", isFinal: false },
    { label: "PACK", isFinal: false },
    { label: "CONTROL", isFinal: false },
    { label: "CLEARED", isFinal: true },
  ];

  return (
    <section
      ref={blockRef}
      id={`stage-${stage.id}`}
      className="standard-stage-block final-payoff-stage bg-navy"
      data-stage-code={stage.code}
      data-stage-index={index}
    >
      {/* Oversized 06 Watermark */}
      <span ref={numRef} className="stage-watermark-num final-watermark" aria-hidden="true">
        {numStr}
      </span>

      <div className="stage-block-inner final-payoff-inner">
        {/* Stage Content Column */}
        <div className="stage-content-col final-content-col">
          <div className="stage-identity">
            <span className="identity-tag final-tag">06 / EXPORT HANDOVER</span>
          </div>

          <h2 ref={headlineRef} className="stage-headline final-headline">
            Cleared.<br />
            Accounted for.<br />
            Ready to move.
          </h2>

          <p ref={copyRef} className="stage-copy final-copy">
            {stage.copy}
          </p>

          {/* Journey Completion Indicator Line */}
          <div ref={completionRef} className="completion-ticker-wrap">
            <span className="ticker-label">JOURNEY STATUS</span>
            <div className="completion-steps-row">
              {journeySteps.map((step, i) => (
                <React.Fragment key={step.label}>
                  <span
                    className={`completion-step-item${
                      step.isFinal ? " is-cleared" : " is-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < journeySteps.length - 1 && (
                    <span className="step-sep" aria-hidden="true">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* AGRICA Export Clearance Seal */}
          <div ref={sealRef} className="export-clearance-seal">
            <div className="seal-border-box">
              <span className="seal-brand">AGRICA</span>
              <span className="seal-divider" aria-hidden="true" />
              <div className="seal-status-group">
                <span className="seal-title">EXPORT CLEARED</span>
                <span className="seal-sub">FULL SPECIFICATION CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Commercial CTA */}
          <div ref={ctaRef} className="final-cta-wrap">
            <Link href="/products" className="culmination-cta-btn final-cta-btn">
              <span>BUILD AN EXPORT ENQUIRY</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* Stage Dominant Visual Column */}
        <div className="stage-visual-col final-visual-col">
          <div ref={mediaRef} className="stage-visual-wrap final-visual-wrap">
            <img
              src={stage.imageSrc ?? "/assets/season_crop_4.png"}
              alt="Export Clearance Handover"
              className="stage-visual-img"
              loading="lazy"
            />
            <span className="stage-status-tag final-status-tag">EXPORT CLEARED</span>
          </div>
        </div>
      </div>
    </section>
  );
}
