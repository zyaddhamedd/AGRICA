import React from "react";
import type { WorldId } from "@/types/agrica";

export interface WorldSwitchProps {
  readonly activeWorld: WorldId;
  readonly onSelectWorld: (world: WorldId) => void;
}

export function WorldSwitch({
  activeWorld,
  onSelectWorld,
}: WorldSwitchProps): React.JSX.Element {
  const worlds: readonly { id: WorldId; label: string }[] = [
    { id: "fresh", label: "Fresh" },
    { id: "frozen", label: "Frozen" },
    { id: "dried", label: "Dried" },
  ];

  return (
    <nav className="editorial-world-nav" aria-label="Produce condition navigation">
      <div className="editorial-world-list" role="tablist">
        {worlds.map(({ id, label }) => {
          const isActive = activeWorld === id;
          return (
            <button
              key={id}
              className={`editorial-world-item${isActive ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-world={id}
              onClick={() => onSelectWorld(id)}
            >
              <span className="editorial-world-text-wrap">
                <span className="editorial-world-label">{label}</span>
                <span className="editorial-world-rule" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}



