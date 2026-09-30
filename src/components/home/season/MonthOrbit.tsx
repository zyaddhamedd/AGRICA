import React, { useRef, type CSSProperties, type KeyboardEvent } from "react";
import type { MonthNumber, ProduceProductId } from "@/types/agrica";
import { MONTHS } from "@/data/seasons";
import { SeasonalOrbitSvg } from "./SeasonalOrbitSvg";
import { SeasonalHeroCrop } from "./SeasonalHeroCrop";
import styles from "../SeasonSection.module.css";

const ORBIT_POSITIONS = [
  ["50%", "4.5%"],
  ["72.75%", "10.5958%"],
  ["89.4042%", "27.25%"],
  ["95.5%", "50%"],
  ["89.4042%", "72.75%"],
  ["72.75%", "89.4042%"],
  ["50%", "95.5%"],
  ["27.25%", "89.4042%"],
  ["10.5958%", "72.75%"],
  ["4.5%", "50%"],
  ["10.5958%", "27.25%"],
  ["27.25%", "10.5958%"],
] as const;

export interface MonthOrbitProps {
  readonly monthNames: readonly string[];
  readonly selectedMonth: MonthNumber;
  readonly heroProductId: ProduceProductId;
  readonly heroName: string;
  readonly statusLabel: string;
  readonly selectMonthLabel: string;
  readonly mediaPendingLabel: string;
  readonly onSelectMonth: (month: MonthNumber) => void;
}

function abbreviatedMonth(name: string): string {
  return Array.from(name).slice(0, 3).join("");
}

export function MonthOrbit({
  monthNames,
  selectedMonth,
  heroProductId,
  heroName,
  statusLabel,
  selectMonthLabel,
  onSelectMonth,
}: MonthOrbitProps): React.JSX.Element {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let targetIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") targetIndex = (index + 1) % MONTHS.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") targetIndex = (index - 1 + MONTHS.length) % MONTHS.length;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = MONTHS.length - 1;
    if (targetIndex === null) return;

    event.preventDefault();
    const nextMonth = MONTHS[targetIndex].number;
    onSelectMonth(nextMonth);
    buttonRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={styles.orbitShell} data-season-orbit data-selected={selectedMonth}>
      {/* Layer 1: Editorial Astronomical Orbit Geometry (behind crop) */}
      <SeasonalOrbitSvg selectedMonth={selectedMonth} />

      {/* Layer 2 & 3: Floating Botanical Hero Subject + Minimal Metadata */}
      <SeasonalHeroCrop
        heroProductId={heroProductId}
        heroName={heroName}
        statusLabel={statusLabel}
        selectedMonth={selectedMonth}
      />

      {/* Layer 4: Interactive Month Dial Controls */}
      <div className={styles.monthButtons} role="group" aria-label={selectMonthLabel}>
        {MONTHS.map((month, index) => {
          const [x, y] = ORBIT_POSITIONS[index];
          const position = {
            "--month-x": x,
            "--month-y": y,
          } as CSSProperties;
          const active = month.number === selectedMonth;
          const localizedName = monthNames[index] ?? month.name;

          return (
            <button
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              key={month.number}
              type="button"
              className={`${styles.monthButton}${active ? ` ${styles.monthButtonActive}` : ""}`}
              style={position}
              aria-label={localizedName}
              aria-pressed={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelectMonth(month.number)}
              onKeyDown={(event) => moveSelection(event, index)}
            >
              <span className={styles.monthIndex}>{String(month.number).padStart(2, "0")}</span>
              <span className={styles.monthCode}>{abbreviatedMonth(localizedName)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
