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
          <div className="world-card-body world-card-front-body">
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
          </Link>
        </section>

        <section className="world-card-face world-card-back" aria-hidden={!isFlipped}>
          <div className="world-card-body world-card-back-body">
            <div className="world-card-atmosphere" aria-hidden="true" />
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
          </Link>
        </section>
      </div>
    </article>
  );
}
