import React from "react";
import type { WorldId } from "@/types/agrica";
import { countProductsInWorld } from "@/data/products";

export interface WorldSwitchProps {
  readonly activeWorld: WorldId;
  readonly onSelectWorld: (world: WorldId) => void;
}

export function WorldSwitch({
  activeWorld,
  onSelectWorld,
}: WorldSwitchProps): React.JSX.Element {
  const worlds: readonly { id: WorldId; num: string; label: string }[] = [
    { id: "fresh", num: "01", label: "Fresh" },
    { id: "frozen", num: "02", label: "Frozen" },
    { id: "dried", num: "03", label: "Dried" },
  ];

  return (
    <div className="world-switch" role="tablist" aria-label="Choose produce condition">
      {worlds.map(({ id, num, label }) => {
        const isActive = activeWorld === id;
        const count = countProductsInWorld(id);
        return (
          <button
            key={id}
            className={`world-button${isActive ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-world={id}
            onClick={() => onSelectWorld(id)}
          >
            <span>{num}</span>
            <strong>{label}</strong>
            <small>{count} products</small>
          </button>
        );
      })}
    </div>
  );
}
