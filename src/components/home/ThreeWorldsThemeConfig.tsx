import React from "react";
import type { WorldKey } from "@/data/threeWorlds";

export interface WorldThemeConfig {
  key: WorldKey;
  label: string;
  baseBg: string;
  accentColor: string;
  accentMuted: string;
  atmosphereGlow: string;
  sweepColor: string;
  sweepWaveColor: string;
  description: string;
}

export const WORLD_THEMES: Record<WorldKey, WorldThemeConfig> = {
  fresh: {
    key: "fresh",
    label: "Fresh",
    baseBg: "#F4F2E9",
    accentColor: "#50A010",
    accentMuted: "rgba(80, 160, 16, 0.16)",
    atmosphereGlow:
      "radial-gradient(ellipse 90% 55% at 75% 15%, rgba(80, 160, 16, 0.08) 0%, rgba(244, 242, 233, 0) 70%)",
    sweepColor: "#F4F2E9",
    sweepWaveColor: "rgba(80, 160, 16, 0.20)",
    description: "Alive, sunlit, natural, premium, clean",
  },
  frozen: {
    key: "frozen",
    label: "Frozen",
    baseBg: "#EEF3F4",
    accentColor: "#68AFC7",
    accentMuted: "rgba(104, 175, 199, 0.18)",
    atmosphereGlow:
      "radial-gradient(ellipse 90% 55% at 50% 12%, rgba(104, 175, 199, 0.12) 0%, rgba(238, 243, 244, 0) 70%)",
    sweepColor: "#EEF3F4",
    sweepWaveColor: "rgba(104, 175, 199, 0.24)",
    description: "Precise, cold, clean, controlled, modern",
  },
  dried: {
    key: "dried",
    label: "Dried",
    baseBg: "#F2EADF",
    accentColor: "#B76A2B",
    accentMuted: "rgba(183, 106, 43, 0.16)",
    atmosphereGlow:
      "radial-gradient(ellipse 90% 55% at 35% 14%, rgba(183, 106, 43, 0.10) 0%, rgba(242, 234, 223, 0) 70%)",
    sweepColor: "#F2EADF",
    sweepWaveColor: "rgba(183, 106, 43, 0.22)",
    description: "Warm, textural, calm, crafted, mature",
  },
};

/**
 * Fresh World Decorative Line Art:
 * Thin botanical lines, restrained leaf curves, and subtle sunlight field arcs.
 */
export function FreshDecorativeArt(): React.JSX.Element {
  return (
    <svg
      className="three-worlds-decor-svg tw-fresh-art"
      viewBox="0 0 400 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="tw-fresh-ambient">
        {/* Subtle sunlit atmospheric warmth circle */}
        <circle cx="340" cy="120" r="140" stroke="#50A010" strokeWidth="0.6" strokeDasharray="3 7" opacity="0.16" />
        
        {/* Left botanical curve & slender leaf silhouettes */}
        <path
          d="M-20 380 C 40 330, 60 260, 45 190 C 35 140, 70 80, 110 50"
          stroke="#50A010"
          strokeWidth="0.85"
          opacity="0.26"
        />
        {/* Leaf 1 */}
        <path
          d="M 45 190 C 70 180, 95 195, 100 215 C 85 225, 55 210, 45 190 Z"
          stroke="#50A010"
          strokeWidth="0.75"
          fill="rgba(80, 160, 16, 0.04)"
          opacity="0.24"
        />
        {/* Leaf 2 */}
        <path
          d="M 52 270 C 85 260, 110 278, 115 300 C 95 308, 65 292, 52 270 Z"
          stroke="#50A010"
          strokeWidth="0.75"
          fill="rgba(80, 160, 16, 0.04)"
          opacity="0.22"
        />
        {/* Leaf 3 */}
        <path
          d="M 25 340 C 50 330, 80 345, 85 365 C 68 375, 40 360, 25 340 Z"
          stroke="#50A010"
          strokeWidth="0.75"
          fill="rgba(80, 160, 16, 0.03)"
          opacity="0.20"
        />

        {/* Right side delicate organic arc framing the upper section */}
        <path
          d="M 280 20 C 330 80, 390 140, 420 220"
          stroke="#50A010"
          strokeWidth="0.8"
          opacity="0.22"
        />
        <path
          d="M 330 80 C 355 70, 380 82, 385 100 C 365 108, 345 95, 330 80 Z"
          stroke="#50A010"
          strokeWidth="0.7"
          fill="rgba(80, 160, 16, 0.04)"
          opacity="0.22"
        />

        {/* Lower organic ground curve */}
        <path
          d="M -30 680 Q 180 620 430 710"
          stroke="#50A010"
          strokeWidth="0.7"
          strokeDasharray="4 8"
          opacity="0.14"
        />
      </g>
    </svg>
  );
}

/**
 * Frozen World Decorative Line Art:
 * Ultra-thin cold-line structures, delicate frost/crystal geometry facets, and icy arcs.
 */
export function FrozenDecorativeArt(): React.JSX.Element {
  return (
    <svg
      className="three-worlds-decor-svg tw-frozen-art"
      viewBox="0 0 400 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="tw-frozen-ambient">
        {/* Precision Cold-chain geometric concentric arcs */}
        <circle cx="200" cy="180" r="130" stroke="#68AFC7" strokeWidth="0.65" opacity="0.18" />
        <circle cx="200" cy="180" r="185" stroke="#68AFC7" strokeWidth="0.55" strokeDasharray="3 8" opacity="0.14" />
        
        {/* Angular faceted crystal line vectors (30/60 degree precision) */}
        <path
          d="M 30 140 L 70 90 L 130 90 L 90 140 Z"
          stroke="#68AFC7"
          strokeWidth="0.75"
          fill="rgba(104, 175, 199, 0.03)"
          opacity="0.25"
        />
        <path
          d="M 130 90 L 160 50 L 210 50 L 180 90"
          stroke="#68AFC7"
          strokeWidth="0.7"
          opacity="0.20"
        />

        {/* Right side technical cold-chain facet lines */}
        <path
          d="M 370 280 L 330 330 L 330 400 L 370 350 Z"
          stroke="#68AFC7"
          strokeWidth="0.75"
          fill="rgba(104, 175, 199, 0.03)"
          opacity="0.22"
        />
        <path
          d="M 330 330 L 280 330 L 250 370"
          stroke="#68AFC7"
          strokeWidth="0.7"
          opacity="0.18"
        />

        {/* Vertical controlled calibration ticks */}
        <line x1="20" y1="240" x2="20" y2="360" stroke="#68AFC7" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.16" />
        <line x1="380" y1="160" x2="380" y2="280" stroke="#68AFC7" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.16" />

        {/* Lower cold-shelf horizon line */}
        <path
          d="M 0 650 L 150 650 L 190 690 L 400 690"
          stroke="#68AFC7"
          strokeWidth="0.7"
          opacity="0.18"
        />
      </g>
    </svg>
  );
}

/**
 * Dried World Decorative Line Art:
 * Thin dried botanical seed hulls, gentle grain geometry, and warm radiating warmth arcs.
 */
export function DriedDecorativeArt(): React.JSX.Element {
  return (
    <svg
      className="three-worlds-decor-svg tw-dried-art"
      viewBox="0 0 400 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g className="tw-dried-ambient">
        {/* Gentle radiating sun-drying warmth arcs */}
        <path
          d="M 60 70 A 160 160 0 0 1 340 70"
          stroke="#B76A2B"
          strokeWidth="0.65"
          strokeDasharray="4 6"
          opacity="0.18"
        />
        <path
          d="M 100 95 A 110 110 0 0 1 300 95"
          stroke="#B76A2B"
          strokeWidth="0.7"
          opacity="0.15"
        />

        {/* Dried botanical seed stalks on the right side */}
        <path
          d="M 380 460 C 350 400, 340 320, 355 240 C 365 180, 350 120, 330 80"
          stroke="#B76A2B"
          strokeWidth="0.85"
          opacity="0.25"
        />
        {/* Husk 1 */}
        <path
          d="M 355 240 C 330 230, 315 242, 310 260 C 325 268, 345 255, 355 240 Z"
          stroke="#B76A2B"
          strokeWidth="0.75"
          fill="rgba(183, 106, 43, 0.04)"
          opacity="0.24"
        />
        {/* Husk 2 */}
        <path
          d="M 350 310 C 320 300, 305 315, 302 332 C 320 340, 338 325, 350 310 Z"
          stroke="#B76A2B"
          strokeWidth="0.75"
          fill="rgba(183, 106, 43, 0.03)"
          opacity="0.22"
        />
        {/* Husk 3 */}
        <path
          d="M 360 170 C 340 160, 328 172, 325 186 C 340 192, 352 182, 360 170 Z"
          stroke="#B76A2B"
          strokeWidth="0.7"
          fill="rgba(183, 106, 43, 0.04)"
          opacity="0.22"
        />

        {/* Left grain contour lines */}
        <path
          d="M -20 280 C 40 290, 80 340, 70 410 C 60 470, 90 530, 130 560"
          stroke="#B76A2B"
          strokeWidth="0.8"
          opacity="0.20"
        />
        <path
          d="M 70 410 C 95 400, 115 412, 118 428 C 102 436, 82 425, 70 410 Z"
          stroke="#B76A2B"
          strokeWidth="0.7"
          fill="rgba(183, 106, 43, 0.03)"
          opacity="0.20"
        />

        {/* Lower dried field texture line */}
        <path
          d="M 0 710 Q 200 660 400 730"
          stroke="#B76A2B"
          strokeWidth="0.7"
          strokeDasharray="3 7"
          opacity="0.14"
        />
      </g>
    </svg>
  );
}

/**
 * Returns the decorative line art component matching the active world.
 */
export function renderWorldDecorativeArt(world: WorldKey): React.JSX.Element {
  switch (world) {
    case "fresh":
      return <FreshDecorativeArt />;
    case "frozen":
      return <FrozenDecorativeArt />;
    case "dried":
      return <DriedDecorativeArt />;
  }
}
