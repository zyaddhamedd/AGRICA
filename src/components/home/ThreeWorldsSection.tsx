"use client";

import React, { useState } from "react";
import {
  THREE_WORLDS_DATA,
  THREE_WORLDS_LIST,
  type WorldKey,
} from "@/data/threeWorlds";
import { WorldCard } from "./WorldCard";
import "./ThreeWorldsSection.css";
import { useHomeDictionary } from "@/i18n/locale-context";

export function ThreeWorldsSection(): React.JSX.Element {
  const dictionary = useHomeDictionary().worlds;
  const [flippedWorld, setFlippedWorld] = useState<WorldKey | null>(null);

  return (
    <section className="tw-section" id="products" aria-labelledby="tw-title">
      <div className="tw-container">
        <header className="tw-header">
          <div className="tw-header-meta">
            <div className="tw-kicker">
              <span className="tw-kicker-dot" aria-hidden="true" />
              <span className="tw-eyebrow">{dictionary.eyebrow}</span>
            </div>
            <span className="tw-section-index" aria-label={dictionary.rangeLabel}>01 — 03</span>
          </div>

          <h2 id="tw-title" className="tw-title">
            {dictionary.heading}
            <br />
            <em>{dictionary.emphasis}</em>
          </h2>

          <p className="tw-world-list">
            {dictionary.items.fresh.label} <span aria-hidden="true">·</span> {dictionary.items.frozen.label} <span aria-hidden="true">·</span> {dictionary.items.dried.label}
          </p>
        </header>

        <div className="tw-card-grid">
          {THREE_WORLDS_LIST.map((key) => (
            <WorldCard
              key={key}
              world={{ ...THREE_WORLDS_DATA[key], ...dictionary.items[key], actionText: dictionary.items[key].action, imgAlt: dictionary.items[key].imageAlt, editorialLines: dictionary.items[key].lines }}
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
