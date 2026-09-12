import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JourneyStage } from "@/types/agrica";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StandardStageBlockProps {
  readonly stage: JourneyStage;
  readonly index: number;
  readonly isCulmination?: boolean;
}

export function StandardStageBlock({
  stage,
  index,
  isCulmination = false,
}: StandardStageBlockProps): React.JSX.Element {
  const blockRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const numStr = index < 9 ? `0${index + 1}` : `${index + 1}`;
  const isEven = index % 2 === 0;

  useEffect(() => {
    if (typeof window === "undefined" || !blockRef.current) return;

    const ctx = gsap.context(() => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Background watermark settle
      if (numRef.current) {
        gsap.fromTo(
          numRef.current,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 0.12,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: blockRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Headline reveal
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: blockRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Visual mask unclip reveal
      if (mediaRef.current) {
        gsap.fromTo(
          mediaRef.current,
          { clipPath: "inset(12% 0% 12% 0% round 8px)", opacity: 0.4 },
          {
            clipPath: "inset(0% 0% 0% 0% round 8px)",
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: blockRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, blockRef);

    return () => ctx.revert();
  }, []);

  const themeClass = isCulmination ? " bg-navy" : index % 2 === 1 ? " bg-tint" : " bg-paper";
  const stageIdentity = `${numStr} / ${stage.name.toUpperCase() === "HANDOVER" ? "EXPORT HANDOVER" : stage.name.toUpperCase()}`;

  return (
    <section
      ref={blockRef}
      id={`stage-${stage.id}`}
      className={`standard-stage-block${isEven ? " layout-even" : " layout-odd"}${themeClass}${
        isCulmination ? " is-culmination" : ""
      }`}
      data-stage-code={stage.code}
      data-stage-index={index}
    >
      {/* Background Watermark Number */}
      <span ref={numRef} className="stage-watermark-num" aria-hidden="true">
        {numStr}
      </span>

      <div className="stage-block-inner">
        {/* Stage Content Column */}
        <div className="stage-content-col">
          <div className="stage-identity">
            <span className="identity-tag">{stageIdentity}</span>
          </div>

          <h2 ref={headlineRef} className="stage-headline">
            {stage.headline ?? stage.name}
          </h2>

          <p className="stage-copy">{stage.copy}</p>

          {/* Refined Proof Statement (Without "OUTPUT" badge) */}
          {stage.proofOutput && (
            <div className="stage-proof-output">
              <span className="proof-line-accent" aria-hidden="true" />
              <p className="proof-val">{stage.proofOutput}</p>
            </div>
          )}

          {/* Stage 06 Culmination Payoff CTA */}
          {isCulmination && (
            <div className="culmination-payoff-wrap">
              <div className="culmination-seal">
                <span className="seal-tag">ONE SHIPMENT · SIX CONTROLLED STAGES</span>
                <strong>Ready to discuss your next export programme?</strong>
              </div>
              <Link href="/products" className="culmination-cta-btn">
                <span>BUILD AN EXPORT ENQUIRY</span>
                <span className="cta-arrow">→</span>
              </Link>
            </div>
          )}
        </div>

        {/* Stage Visual Column */}
        <div className="stage-visual-col">
          <div ref={mediaRef} className="stage-visual-wrap">
            <img
              src={stage.imageSrc ?? "/assets/product-atlas.png"}
              alt={`${stage.name} - ${stage.headline}`}
              className="stage-visual-img"
              loading="lazy"
            />
            <span className="stage-status-tag">{stage.status}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
