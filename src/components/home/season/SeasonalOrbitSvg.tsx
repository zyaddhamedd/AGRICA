import React from "react";
import type { MonthNumber } from "@/types/agrica";

export interface SeasonalOrbitSvgProps {
  readonly selectedMonth: MonthNumber;
}

/**
 * Editorial SVG Orbit Geometry (Orbit V2 Polish).
 *
 * Refined for high negative space and minimal noise:
 * - Delicate, quiet outer orbit ring
 * - One restrained incomplete secondary arc
 * - Active month directional trace and clean arc (without heavy glow)
 * - Essential cardinal ticks (Solstices & Equinoxes)
 */
export function SeasonalOrbitSvg({ selectedMonth }: SeasonalOrbitSvgProps): React.JSX.Element {
  const center = 300;
  const outerRadius = 273; // Aligns with 12 month buttons
  const secondaryRadius = 185; // Quiet secondary arc behind the hero crop

  // Month 1 (Jan) is at top center (-90 deg), each month is +30 deg clockwise
  const activeAngleDeg = (selectedMonth - 1) * 30 - 90;
  const activeAngleRad = (activeAngleDeg * Math.PI) / 180;

  // Active month arc segment along outer orbit
  const activeArcStartDeg = activeAngleDeg - 12;
  const activeArcEndDeg = activeAngleDeg + 12;
  const startX = center + outerRadius * Math.cos((activeArcStartDeg * Math.PI) / 180);
  const startY = center + outerRadius * Math.sin((activeArcStartDeg * Math.PI) / 180);
  const endX = center + outerRadius * Math.cos((activeArcEndDeg * Math.PI) / 180);
  const endY = center + outerRadius * Math.sin((activeArcEndDeg * Math.PI) / 180);

  // Active directional trace connecting active month toward the hero
  const traceStartX = center + (outerRadius - 22) * Math.cos(activeAngleRad);
  const traceStartY = center + (outerRadius - 22) * Math.sin(activeAngleRad);
  const traceEndX = center + (secondaryRadius + 10) * Math.cos(activeAngleRad);
  const traceEndY = center + (secondaryRadius + 10) * Math.sin(activeAngleRad);

  return (
    <svg
      viewBox="0 0 600 600"
      className="orbitSvg"
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Subtle linear gradient for active trace line */}
        <linearGradient id="activeTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#50a010" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#50a010" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* 1. Restrained Incomplete Secondary Arc (leaves hero open, no enclosing circle) */}
      <circle
        cx={center}
        cy={center}
        r={secondaryRadius}
        stroke="rgba(0, 32, 80, 0.065)"
        strokeWidth="1"
        strokeDasharray="210 370"
        strokeDashoffset="-40"
      />

      {/* 2. Delicate Outer Orbit Ring */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        stroke="rgba(0, 32, 80, 0.09)"
        strokeWidth="1"
      />

      {/* 3. Essential Cardinal Astronomical Ticks (Equinoxes & Solstices) */}
      {[ -90, 0, 90, 180 ].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = center + (outerRadius - 5) * Math.cos(rad);
        const y1 = center + (outerRadius - 5) * Math.sin(rad);
        const x2 = center + (outerRadius + 5) * Math.cos(rad);
        const y2 = center + (outerRadius + 5) * Math.sin(rad);
        return (
          <line
            key={`cardinal-${angle}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0, 32, 80, 0.16)"
            strokeWidth="1"
          />
        );
      })}

      {/* 4. Active Month Directional Trace */}
      <line
        x1={traceStartX}
        y1={traceStartY}
        x2={traceEndX}
        y2={traceEndY}
        stroke="url(#activeTraceGrad)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        style={{
          transition: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* 5. Active Month Outer Arc Indicator */}
      <path
        d={`M ${startX} ${startY} A ${outerRadius} ${outerRadius} 0 0 1 ${endX} ${endY}`}
        stroke="#50a010"
        strokeWidth="2.2"
        strokeLinecap="round"
        style={{
          transition: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </svg>
  );
}
