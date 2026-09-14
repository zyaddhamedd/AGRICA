"use client";

import React, { useState } from "react";
import {
  THREE_WORLDS_DATA,
  THREE_WORLDS_LIST,
  type WorldKey,
} from "@/data/threeWorlds";
import { WorldCard } from "./WorldCard";
import "./ThreeWorldsSection.css";

export function ThreeWorldsSection(): React.JSX.Element {
  const [flippedWorld, setFlippedWorld] = useState<WorldKey | null>(null);

  return (
    <section className="tw-section" id="products" aria-labelledby="tw-title">
      <div className="tw-container">
        <header className="tw-header">
          <div className="tw-header-meta">
            <div className="tw-kicker">
              <span className="tw-kicker-dot" aria-hidden="true" />
              <span className="tw-eyebrow">THREE WORLDS</span>
            </div>
            <span className="tw-section-index" aria-label="Worlds one through three">01 — 03</span>
          </div>

          <h2 id="tw-title" className="tw-title">
            Three worlds.
            <br />
            <em>One export standard.</em>
          </h2>

          <p className="tw-world-list">
            Fresh <span aria-hidden="true">·</span> Frozen <span aria-hidden="true">·</span> Dried
          </p>
        </header>

        <div className="tw-card-grid">
          {THREE_WORLDS_LIST.map((key) => (
            <WorldCard
              key={key}
              world={THREE_WORLDS_DATA[key]}
              isFlipped={flippedWorld === key}
              onFlip={(selectedKey) => {
                setFlippedWorld((current) => current === selectedKey ? null : selectedKey);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ThreeWorldsSection;
