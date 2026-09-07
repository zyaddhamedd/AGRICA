"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { WorldId } from "@/types/agrica";

interface WorldMeta {
  readonly label: string;
  readonly copy: string;
}

const WORLDS_META: Record<WorldId, WorldMeta> = {
  fresh: {
    label: "Fresh world",
    copy: "Bright, precise and close to origin.",
  },
  frozen: {
    label: "Frozen world",
    copy: "Cold-chain discipline, held from process to arrival.",
  },
  dried: {
    label: "Dried world",
    copy: "Time, texture and stability — carefully balanced.",
  },
};

import { ThreeWorldsSection } from "./ThreeWorldsSection";

export function WorldsSection(): React.JSX.Element {
  const [activeWorld, setActiveWorld] = useState<WorldId>("fresh");

  return (
    <>
      {/* Mobile-Only Green Three Worlds Interactive Section (< 960px) */}
      <div className="worlds-mobile-section" id="products-mobile">
        <ThreeWorldsSection />
      </div>

      {/* Desktop-Only Section (>= 961px, completely untouched) */}
      <section
        className="worlds worlds-desktop-stage"
        id="products"
        aria-labelledby="worlds-title"
        data-active-world={activeWorld}
      >
      <div className="section-kicker">
        <span>01 / Products</span>
        <span>Three worlds. One standard.</span>
      </div>

      <div className="worlds-intro">
        <h2 id="worlds-title">
          Choose the condition.
          <br />
          Keep the confidence.
        </h2>
        <p>The category changes. The AGRICA standard does not.</p>
      </div>

      <div className="world-switcher">
        <div className="world-list" role="tablist" aria-label="Product categories">
          <button
            className={`world-tab${activeWorld === "fresh" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeWorld === "fresh"}
            data-world="fresh"
            onClick={() => setActiveWorld("fresh")}
          >
            <span>01</span>
            <strong>Fresh</strong>
            <small>Natural clarity</small>
            <i aria-hidden="true">↗</i>
          </button>

          <button
            className={`world-tab${activeWorld === "frozen" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeWorld === "frozen"}
            data-world="frozen"
            onClick={() => setActiveWorld("frozen")}
          >
            <span>02</span>
            <strong>Frozen</strong>
            <small>Controlled cold</small>
            <i aria-hidden="true">↗</i>
          </button>

          <button
            className={`world-tab${activeWorld === "dried" ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeWorld === "dried"}
            data-world="dried"
            onClick={() => setActiveWorld("dried")}
          >
            <span>03</span>
            <strong>Dried</strong>
            <small>Measured time</small>
            <i aria-hidden="true">↗</i>
          </button>
        </div>

        <div
          className="world-visual"
          role="tabpanel"
          aria-live="polite"
          data-motion="world-visual"
        >
          <div className="world-image" aria-hidden="true"></div>
          <div className="world-caption">
            <span id="world-label">{WORLDS_META[activeWorld].label}</span>
            <p id="world-copy">{WORLDS_META[activeWorld].copy}</p>
            <Link className="arrow-link" href="/products">
              View the full range <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
