import React from "react";
import Image from "next/image";
import type { MonthNumber, ProduceProductId } from "@/types/agrica";
import { getSeasonalHeroAsset, type SeasonalHeroDefinition } from "@/data/seasonalHeroes";
import styles from "../SeasonSection.module.css";

export interface SeasonalHeroCropProps {
  readonly heroProductId: ProduceProductId;
  readonly heroName: string;
  readonly statusLabel: string;
  readonly selectedMonth: MonthNumber;
}

/**
 * Botanical SVG silhouette development placeholders for the 8 unique Hero Crops.
 * Scaled up ~30% to provide strong organic visual presence and break naturally
 * across inner orbit geometry while maintaining complete negative clearance from month nodes.
 */
function BotanicalHeroSilhouette({
  hero,
}: {
  readonly hero: SeasonalHeroDefinition;
}): React.JSX.Element {
  const { accentColor, secondaryColor, shadowTone, silhouetteType } = hero;

  return (
    <div className={styles.silhouetteWrapper} aria-hidden="true">
      <svg
        viewBox="0 0 280 280"
        className={styles.silhouetteSvg}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`heroGrad-${hero.productId}`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="65%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.88" />
          </linearGradient>

          <radialGradient id={`ambientShadow-${hero.productId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={shadowTone} stopOpacity="0.55" />
            <stop offset="50%" stopColor={shadowTone} stopOpacity="0.2" />
            <stop offset="100%" stopColor={shadowTone} stopOpacity="0" />
          </radialGradient>

          <filter id={`softBlur-${hero.productId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Ambient botanical contact shadow */}
        <ellipse
          cx="140"
          cy="242"
          rx="92"
          ry="16"
          fill={`url(#ambientShadow-${hero.productId})`}
          filter={`url(#softBlur-${hero.productId})`}
        />

        {/* Render crop-specific organic contours scaled +28-32% */}
        {silhouetteType === "pomegranate" && (
          <g transform="translate(16, 10) scale(0.89)">
            {/* Leaves */}
            <path d="M110 50 C90 10, 140 0, 160 30 C150 45, 125 55, 110 50 Z" fill="#688045" opacity="0.88" />
            <path d="M165 42 C185 15, 230 20, 220 52 C200 60, 175 52, 165 42 Z" fill="#587038" opacity="0.75" />
            {/* Calyx Crown */}
            <path d="M125 72 L118 42 L132 52 L140 36 L148 52 L162 42 L155 72 Z" fill={accentColor} opacity="0.95" />
            {/* Body */}
            <circle cx="140" cy="160" r="88" fill={`url(#heroGrad-${hero.productId})`} />
            <path d="M140 72 C190 72, 228 110, 228 160 C228 200, 195 240, 140 248 C100 248, 52 205, 52 160 C52 115, 95 72, 140 72 Z" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="118" cy="132" rx="34" ry="24" fill="#ffffff" opacity="0.14" />
          </g>
        )}

        {silhouetteType === "orange" && (
          <g transform="translate(16, 14) scale(0.89)">
            {/* Stem & Leaf */}
            <path d="M140 68 C140 40, 150 25, 152 20" stroke="#485c2b" strokeWidth="5" strokeLinecap="round" />
            <path d="M152 28 C190 15, 225 35, 210 65 C185 75, 160 55, 152 28 Z" fill="#587232" opacity="0.88" />
            {/* Sphere */}
            <circle cx="140" cy="155" r="86" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="115" cy="122" rx="36" ry="24" fill="#ffffff" opacity="0.18" />
          </g>
        )}

        {silhouetteType === "strawberry" && (
          <g transform="translate(18, 12) scale(0.87)">
            {/* Calyx star */}
            <path d="M140 65 L120 40 L135 50 L140 25 L145 50 L160 40 L140 65 Z" fill="#507830" />
            <path d="M100 58 C115 50, 130 58, 140 65 C135 75, 110 75, 100 58 Z" fill="#507830" />
            <path d="M180 58 C165 50, 150 58, 140 65 C145 75, 170 75, 180 58 Z" fill="#446828" />
            {/* Berry Body */}
            <path d="M140 65 C200 68, 225 125, 195 190 C175 230, 150 250, 140 255 C130 250, 105 230, 85 190 C55 125, 80 68, 140 65 Z" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="118" cy="130" rx="28" ry="38" fill="#ffffff" opacity="0.14" />
          </g>
        )}

        {silhouetteType === "grape" && (
          <g transform="translate(22, 10) scale(0.85)">
            {/* Stem & Tendril */}
            <path d="M140 60 C140 30, 145 15, 150 10" stroke="#5a422a" strokeWidth="5" strokeLinecap="round" />
            <path d="M150 25 C185 10, 220 28, 205 55 C175 65, 155 45, 150 25 Z" fill="#627838" opacity="0.8" />
            {/* Cluster of Spheres */}
            <circle cx="115" cy="90" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="165" cy="90" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="140" cy="80" r="28" fill={secondaryColor} opacity="0.9" />
            <circle cx="95" cy="130" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="140" cy="125" r="28" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="185" cy="130" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="115" cy="168" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="165" cy="168" r="26" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="140" cy="205" r="24" fill={`url(#heroGrad-${hero.productId})`} />
            <circle cx="140" cy="238" r="18" fill={accentColor} />
          </g>
        )}

        {silhouetteType === "mango" && (
          <g transform="translate(18, 12) scale(0.87)">
            {/* Leaf */}
            <path d="M145 45 C180 15, 235 25, 225 65 C195 78, 160 65, 145 45 Z" fill="#4d6e2e" opacity="0.85" />
            {/* Mango Kidney Form */}
            <path d="M140 55 C195 55, 230 105, 225 165 C220 215, 175 255, 135 250 C95 245, 65 210, 65 155 C65 95, 95 55, 140 55 Z" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="112" cy="125" rx="34" ry="46" fill="#ffffff" opacity="0.14" />
          </g>
        )}

        {silhouetteType === "date" && (
          <g transform="translate(20, 10) scale(0.85)">
            {/* Date Palm Stem */}
            <path d="M140 55 C140 25, 142 12, 144 8" stroke="#8c6a42" strokeWidth="5" strokeLinecap="round" />
            {/* Clustered Oval Dates */}
            <ellipse cx="110" cy="100" rx="26" ry="42" transform="rotate(-15 110 100)" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="170" cy="100" rx="26" ry="42" transform="rotate(15 170 100)" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="140" cy="140" rx="28" ry="44" fill={secondaryColor} opacity="0.95" />
            <ellipse cx="105" cy="180" rx="26" ry="42" transform="rotate(-8 105 180)" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="175" cy="180" rx="26" ry="42" transform="rotate(8 175 180)" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="140" cy="220" rx="25" ry="38" fill={accentColor} />
          </g>
        )}

        {silhouetteType === "potato" && (
          <g transform="translate(16, 20) scale(0.89)">
            {/* Earthy Oval Tuber */}
            <path d="M80 140 C75 90, 115 65, 160 70 C205 75, 235 110, 230 160 C225 210, 185 240, 135 235 C90 230, 85 190, 80 140 Z" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="120" cy="115" rx="6" ry="3" fill="#584832" opacity="0.4" />
            <ellipse cx="180" cy="140" rx="5" ry="2.5" fill="#584832" opacity="0.35" />
            <ellipse cx="140" cy="185" rx="6" ry="3" fill="#584832" opacity="0.35" />
            <ellipse cx="130" cy="110" rx="38" ry="22" fill="#ffffff" opacity="0.12" />
          </g>
        )}

        {silhouetteType === "sweet-potato" && (
          <g transform="translate(16, 18) scale(0.89)">
            {/* Tapered Beauregard Tuber */}
            <path d="M60 180 C50 140, 95 80, 150 70 C205 60, 245 95, 240 140 C235 185, 175 235, 120 230 C75 225, 65 205, 60 180 Z" fill={`url(#heroGrad-${hero.productId})`} />
            <ellipse cx="145" cy="120" rx="42" ry="24" transform="rotate(-12 145 120)" fill="#ffffff" opacity="0.14" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function SeasonalHeroCrop({
  heroProductId,
  heroName,
  statusLabel,
  selectedMonth,
}: SeasonalHeroCropProps): React.JSX.Element {
  const hero = getSeasonalHeroAsset(heroProductId);

  return (
    <article
      className={styles.heroCropContainer}
      aria-label={`${heroName}, ${statusLabel}`}
    >
      <div
        key={`${heroProductId}-${selectedMonth}`}
        className={styles.heroSubjectFrame}
      >
        {!hero.isPlaceholder && hero.imagePath ? (
          <div className={styles.heroImageWrapper}>
            <Image
              src={hero.imagePath}
              alt={heroName}
              fill
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 400px"
              className={styles.heroImageCutout}
              priority={true}
            />
          </div>
        ) : (
          <BotanicalHeroSilhouette hero={hero} />
        )}

        {/* Minimalist Editorial Metadata: Primary Crop Name + Secondary Status Badge */}
        <div className={styles.heroMetadata}>
          <h3 className={styles.heroCropTitle}>{heroName}</h3>
          <span className={styles.heroStatusBadge}>{statusLabel}</span>
        </div>
      </div>
    </article>
  );
}
