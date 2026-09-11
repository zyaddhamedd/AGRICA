import React from "react";
import type { ProductFamily } from "@/types/agrica";

export interface FamilyPanelProps {
  readonly families: readonly ProductFamily[];
  readonly activeFamilyCode: string | null;
  readonly onSelectFamily: (code: string | null) => void;
  readonly totalWorldCount: number;
}

export function FamilyPanel({
  families,
  activeFamilyCode,
  onSelectFamily,
  totalWorldCount,
}: FamilyPanelProps): React.JSX.Element {
  return (
    <div className="taxonomy-ribbon-shell">
      <div className="taxonomy-ribbon-inner" role="tablist" aria-label="Filter by product family">
        <button
          type="button"
          className={`taxonomy-item${activeFamilyCode === null ? " is-active" : ""}`}
          role="tab"
          aria-selected={activeFamilyCode === null}
          onClick={() => onSelectFamily(null)}
        >
          <span className="taxonomy-name">All Families</span>
        </button>

        {families.map((family) => {
          const isActive = activeFamilyCode === family.code;
          return (
            <button
              key={family.code}
              type="button"
              className={`taxonomy-item${isActive ? " is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectFamily(family.code)}
            >
              <span className="taxonomy-code">{family.code}</span>
              <span className="taxonomy-name">{family.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
