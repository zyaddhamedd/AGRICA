"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./CompanySection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CompanySection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const img = imgRef.current;
    const content = contentRef.current;

    if (!section || !content || !media || !img) return;

    const ctx = gsap.context(() => {
      // Content Entrance Stagger Reveal
      const elements = content.querySelectorAll(".company-reveal");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Image Mask Reveal & Restrained Parallax
      gsap.fromTo(
        media,
        { clipPath: "inset(12% 8% 12% 8% round 12px)", opacity: 0.8 },
        {
          clipPath: "inset(0% 0% 0% 0% round 8px)",
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: media,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.to(img, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="company-section" id="company" ref={sectionRef} aria-labelledby="company-title">
      <div className="company-container">
        {/* Editorial Story Content */}
        <div className="company-story-content" ref={contentRef}>
          <div className="company-kicker company-reveal">
            <span className="company-kicker-dot" aria-hidden="true" />
            <span className="company-eyebrow">THE COMPANY</span>
          </div>

          <h2 id="company-title" className="company-headline company-reveal">
            Egyptian by origin.
            <br />
            <em>International by discipline.</em>
          </h2>

          <p className="company-statement company-reveal">
            AGRICA connects agricultural origin with the standards, coordination, and clarity global trade demands.
          </p>

          {/* Verified Trust Pillars */}
          <div className="company-trust-pillars company-reveal">
            <div className="company-trust-pillar">
              <span className="company-trust-label">ORIGIN</span>
              <strong className="company-trust-value">Egypt</strong>
            </div>
            <div className="company-trust-divider" aria-hidden="true" />
            <div className="company-trust-pillar">
              <span className="company-trust-label">OPERATING MODEL</span>
              <strong className="company-trust-value">Farm-to-export coordination</strong>
            </div>
          </div>

          {/* Commercial CTA */}
          <div className="company-action company-reveal">
            <a className="company-cta-button" href="#trade">
              <span>TALK TO AGRICA</span>
              <svg className="company-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Premium Visual Framing */}
        <div className="company-media-wrapper">
          <div className="company-media-card" ref={mediaRef}>
            <img
              ref={imgRef}
              src="/assets/company_editorial_hero.jpg"
              alt="AGRICA Egyptian agricultural export facility and logistics operations"
              className="company-media-img"
              loading="lazy"
            />
            <div className="company-media-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanySection;
