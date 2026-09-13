"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ThreeWorldsSection.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface WorldPanel {
  readonly id: "fresh" | "frozen" | "dried";
  readonly index: string;
  readonly title: string;
  readonly subline: string;
  readonly ctaText: string;
  readonly href: string;
  readonly imgSrc: string;
  readonly imgAlt: string;
  readonly isHero?: boolean;
}

const WORLDS_DATA: readonly WorldPanel[] = [
  {
    id: "fresh",
    index: "01 / FRESH",
    title: "Fresh Produce",
    subline: "Season-led. Field-fresh. Export-ready.",
    ctaText: "Explore Fresh",
    href: "/products?category=fresh",
    imgSrc: "/assets/three_worlds_fresh.jpg",
    imgAlt: "AGRICA Fresh Produce harvest in Egyptian sunlit orchard",
    isHero: true,
  },
  {
    id: "frozen",
    index: "02 / FROZEN",
    title: "Frozen Produce",
    subline: "IQF precision for year-round global supply.",
    ctaText: "Explore Frozen",
    href: "/products?category=frozen",
    imgSrc: "/assets/three_worlds_frozen.jpg",
    imgAlt: "AGRICA IQF Frozen berries and green produce",
  },
  {
    id: "dried",
    index: "03 / DRIED",
    title: "Dried Produce",
    subline: "Naturally concentrated. Carefully prepared.",
    ctaText: "Explore Dried",
    href: "/products?category=dried",
    imgSrc: "/assets/three_worlds_dried.jpg",
    imgAlt: "AGRICA Sun-dried Medjool dates and natural botanicals",
  },
];

export function ThreeWorldsSection(): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      const headingEls = heading.querySelectorAll(".tw-reveal");
      gsap.fromTo(
        headingEls,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Panel reveals & Image mask effect
      const panels = grid.querySelectorAll(".tw-panel");
      panels.forEach((panel, i) => {
        const mask = panel.querySelector(".tw-panel-media-mask");
        const img = panel.querySelector(".tw-panel-img");
        const meta = panel.querySelectorAll(".tw-panel-reveal");

        if (mask) {
          gsap.fromTo(
            mask,
            { clipPath: "inset(10% 5% 10% 5% round 12px)", opacity: 0.8 },
            {
              clipPath: "inset(0% 0% 0% 0% round 8px)",
              opacity: 1,
              duration: 1.0,
              delay: i * 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (meta && meta.length > 0) {
          gsap.fromTo(
            meta,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              delay: i * 0.12 + 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (img) {
          gsap.to(img, {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="tw-section" id="products" ref={sectionRef} aria-labelledby="tw-title">
      <div className="tw-container">
        {/* Section Heading */}
        <header className="tw-header" ref={headingRef}>
          <div className="tw-kicker tw-reveal">
            <span className="tw-kicker-dot" aria-hidden="true" />
            <span className="tw-eyebrow">THREE WORLDS</span>
          </div>

          <h2 id="tw-title" className="tw-title tw-reveal">
            Three worlds of Egyptian produce.
            <br />
            <em className="tw-title-italic">One global export standard.</em>
          </h2>
        </header>

        {/* Asymmetric Editorial Triptych Showcase */}
        <div className="tw-grid" ref={gridRef}>
          {WORLDS_DATA.map((world) => (
            <div
              key={world.id}
              className={`tw-panel ${world.isHero ? "tw-panel--hero" : ""}`}
            >
              {/* Media Container (Open Editorial Panel) */}
              <Link href={world.href} className="tw-panel-media-link" tabIndex={-1}>
                <div className="tw-panel-media-mask">
                  <img
                    src={world.imgSrc}
                    alt={world.imgAlt}
                    className="tw-panel-img"
                    loading="lazy"
                  />
                  <div className="tw-panel-overlay" />
                </div>
              </Link>

              {/* Editorial Meta Content */}
              <div className="tw-panel-content">
                <span className="tw-panel-index tw-panel-reveal">{world.index}</span>

                <h3 className="tw-panel-title tw-panel-reveal">
                  <Link href={world.href} className="tw-panel-title-link">
                    {world.title}
                  </Link>
                </h3>


                <div className="tw-panel-action tw-panel-reveal">
                  <Link href={world.href} className="tw-panel-cta">
                    <span>{world.ctaText}</span>
                    <svg className="tw-panel-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ThreeWorldsSection;
