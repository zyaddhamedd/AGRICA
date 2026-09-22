"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import React, { useRef } from "react";
import type { WorldConfig } from "@/data/threeWorlds";

interface WorldCardProps {
  readonly world: WorldConfig;
  readonly isFlipped: boolean;
  readonly onFlip: (key: WorldConfig["key"]) => void;
}

function TurnMark(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path className="world-card-register-corners" d="M4 8V4h4M16 20h4v-4" />
      <path className="world-card-turn-arc" d="M6.6 15.8A6.8 6.8 0 0 1 16.8 7" />
      <path className="world-card-turn-arrow" d="M13.8 6.2h3.8V10" />
    </svg>
  );
}

function EnterArrow(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M5 15 15 5M8 5h7v7" />
    </svg>
  );
}

export function WorldCard({ world, isFlipped, onFlip }: WorldCardProps): React.JSX.Element {
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerOrigin.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = pointerOrigin.current;
    pointerOrigin.current = null;
    if (!origin) return;

    const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    if (distance <= 8) onFlip(world.key);
  };

  const bodyButtonProps = {
    type: "button" as const,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: () => {
      pointerOrigin.current = null;
    },
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) onFlip(world.key);
    },
  };

  const stopCardInteraction = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    pointerOrigin.current = null;
  };

  return (
    <article className="world-card-scene" data-world={world.key}>
      <div className={`world-card${isFlipped ? " is-flipped" : ""}`}>
        <section className="world-card-face world-card-front" aria-hidden={isFlipped}>
          <div className="world-card-body">
            <div className="world-card-topline">
              <span>{world.number} / {world.label.toUpperCase()}</span>
              <span className="world-card-turn-mark"><TurnMark /></span>
            </div>

            <div className="world-card-media">
              <Image
                src={world.imgSrc}
                alt={world.imgAlt}
                fill
                sizes="(max-width: 699px) calc(100vw - 40px), (max-width: 1023px) 46vw, 31vw"
              />
              <span className="world-card-image-wash" aria-hidden="true" />
            </div>

            <h3 className="world-card-title">{world.title}</h3>
            <button
              {...bodyButtonProps}
              className="world-card-body-action"
              aria-label={`${world.title}: show editorial introduction`}
              tabIndex={isFlipped ? -1 : 0}
            />
          </div>

          <Link
            href={world.actionHref}
            className="world-card-footer"
            tabIndex={isFlipped ? -1 : 0}
            onPointerDown={stopCardInteraction}
            onPointerUp={stopCardInteraction}
            onClick={stopCardInteraction}
          >
            <span>{world.actionText}</span>
            <EnterArrow />
          </Link>
        </section>

        <section className="world-card-face world-card-back" aria-hidden={!isFlipped}>
          <div className="world-card-body world-card-back-body">
            <div className="world-card-atmosphere" aria-hidden="true" />
            <div className="world-card-topline">
              <span>{world.number} / {world.label.toUpperCase()}</span>
              <span className="world-card-turn-mark"><TurnMark /></span>
            </div>

            <div className="world-card-back-copy">
              <h3 className="world-card-title">{world.title}</h3>
              <p>
                <span>{world.editorialLines[0]}</span>
                <span>{world.editorialLines[1]}</span>
              </p>
            </div>

            <button
              {...bodyButtonProps}
              className="world-card-body-action"
              aria-label={`${world.title}: show card front`}
              tabIndex={isFlipped ? 0 : -1}
            />
          </div>

          <Link
            href={world.actionHref}
            className="world-card-footer"
            tabIndex={isFlipped ? 0 : -1}
            onPointerDown={stopCardInteraction}
            onPointerUp={stopCardInteraction}
            onClick={stopCardInteraction}
          >
            <span>{world.actionText}</span>
            <EnterArrow />
          </Link>
        </section>
      </div>
    </article>
  );
}
