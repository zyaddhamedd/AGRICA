import React from "react";
import type { ProductFamily } from "@/types/agrica";

export interface FamilyPanelProps {
  readonly families: readonly ProductFamily[];
  readonly activeFamilyIndex: number;
  readonly activeConditionLabel: string;
  readonly onSelectFamily: (index: number) => void;
}

export function FamilyPanel({
  families,
  activeFamilyIndex,
  activeConditionLabel,
  onSelectFamily,
}: FamilyPanelProps): React.JSX.Element {
  const countStr = String(families.length).padStart(2, "0");

  return (
    <aside className="family-panel" aria-label="Product families">
      <div className="panel-label">
        <span>Families</span>
        <span id="family-count">{countStr}</span>
      </div>
      <div className="family-list" id="family-list" role="tablist">
        {families.map((family, index) => {
          const isActive = index === activeFamilyIndex;
          const numStr = `0${index + 1}`;
          return (
            <button
              key={family.code}
              type="button"
              className={`family-button${isActive ? " is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectFamily(index)}
            >
              <span>{numStr}</span>
              <strong>{family.name}</strong>
            </button>
          );
        })}
      </div>
      <div className="panel-note">
        <span>Active condition</span>
        <strong id="active-condition">{activeConditionLabel}</strong>
      </div>
    </aside>
  );
}
