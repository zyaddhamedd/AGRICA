import React from "react";
import type { ProductFamily, ProduceFamilyId } from "@/types/agrica";
import { useCommonDictionary } from "@/i18n/locale-context";

export interface FamilyPanelProps {
  readonly families: readonly ProductFamily[];
  readonly activeFamilyId: ProduceFamilyId | null;
  readonly onSelectFamily: (familyId: ProduceFamilyId | null) => void;
  readonly totalWorldCount: number;
}

export function FamilyPanel({
  families,
  activeFamilyId,
  onSelectFamily,
  totalWorldCount,
}: FamilyPanelProps): React.JSX.Element {
  const common = useCommonDictionary();
  return (
    <div className="taxonomy-ribbon-shell">
      <div className="taxonomy-ribbon-inner" role="tablist" aria-label={common.accessibility.filterFamilies}>
        <button
          type="button"
          className={`taxonomy-item${activeFamilyId === null ? " is-active" : ""}`}
          role="tab"
          aria-selected={activeFamilyId === null}
          onClick={() => onSelectFamily(null)}
        >
          <span className="taxonomy-name">{common.catalogue.allFamilies}</span>
        </button>

        {families.map((family) => {
          const isActive = activeFamilyId === family.id;
          return (
            <button
              key={family.id}
              type="button"
              className={`taxonomy-item${isActive ? " is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectFamily(family.id)}
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
