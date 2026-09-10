"use client";

import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  MONTHS,
  getCropsForMonth,
  SEASON_ILLUSTRATIVE_NOTICE,
  type MonthDefinition,
} from "@/data/seasons";
import "./SeasonSection.css";

export function SeasonSection(): React.JSX.Element {
  const [selectedMonth, setSelectedMonth] = useState<MonthDefinition>(MONTHS[0]);
  const ribbonTrackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prevMonthNumRef = useRef<number>(MONTHS[0].number);

  // Active crops for the selected month
  const activeCrops = getCropsForMonth(selectedMonth.number);
  const heroCrops = activeCrops.slice(0, 3);
  const secondaryCrops = activeCrops.slice(3);

  // Smooth scroll item to center when active month changes via click
  const handleSelectMonth = (m: MonthDefinition, index: number) => {
    setSelectedMonth(m);

    if (ribbonTrackRef.current) {
      const buttons = ribbonTrackRef.current.querySelectorAll<HTMLButtonElement>(".season-ribbon-item");
      const targetBtn = buttons[index];
      if (targetBtn) {
        targetBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  // Organic GSAP Product Continuity & Stage Reveal Motion
  useEffect(() => {
    if (typeof window === "undefined" || !stageRef.current) return;

    const stage = stageRef.current;
    const floatingItems = stage.querySelectorAll<HTMLElement>(".season-floating-item");

    if (floatingItems.length > 0) {
      gsap.fromTo(
        floatingItems,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }

    prevMonthNumRef.current = selectedMonth.number;
  }, [selectedMonth]);

  return (
    <>
      {/* Mobile-Only Light Editorial Season Interactive Section (< 960px) */}
      <section
        id="season-mobile-section"
        className="season-mobile-section"
        aria-label="AGRICA Seasonal Rhythm Calendar"
        style={{ backgroundColor: selectedMonth.bgTint }}
      >
        <div className="season-mobile-container">
          {/* Header Kicker & Editorial Headline */}
          <header className="season-mobile-header">
            <div className="section-kicker section-kicker--mobile">
              <span className="season-kicker-num">02 / SEASONAL RHYTHM</span>
              <span className="season-kicker-tag">HARVEST CALENDAR</span>
            </div>
            <h2 className="season-mobile-headline">Every harvest has its moment.</h2>
            <p className="season-mobile-subline">
              Move through the year to discover what’s naturally in season and ready for export.
            </p>
          </header>

          {/* Native Touch-Safe Horizontal Month Ribbon */}
          <nav className="season-ribbon-viewport" aria-label="Select harvest month">
            <div ref={ribbonTrackRef} className="season-ribbon-track">
              {MONTHS.map((m, idx) => {
                const isActive = m.number === selectedMonth.number;
                return (
                  <button
                    key={m.code}
                    className={`season-ribbon-item${isActive ? " is-active" : ""}`}
                    type="button"
                    onClick={() => handleSelectMonth(m, idx)}
                  >
                    <span className="season-ribbon-num">0{m.number}</span>
                    <span className="season-ribbon-code">{m.code}</span>
                    {isActive && <span className="season-ribbon-active-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Active Month Readout Indicator */}
          <div className="season-active-readout">
            <span className="season-readout-season-tag">{selectedMonth.seasonLabel.toUpperCase()}</span>
            <h3 className="season-readout-title">{selectedMonth.name} Produce</h3>
          </div>

          {/* Editorial Floating Harvest Stage (Hero Produce Asset Pool Composition) */}
          <div ref={stageRef} className="season-floating-stage">
            {heroCrops.map(({ crop, status, statusColor }, idx) => (
              <div
                key={crop.id}
                className={`season-floating-item season-floating-role--${crop.heroRole} season-floating-pos--${crop.preferredPosition}`}
                style={{ "--item-idx": idx } as React.CSSProperties}
              >
                <div className="season-floating-asset-wrap">
                  <img
                    src={crop.imageSrc}
                    alt={crop.name}
                    className="season-floating-asset-img"
                  />
                </div>
                <div className="season-floating-label">
                  <span className="season-floating-name">{crop.name}</span>
                  <span className="season-floating-status" style={{ color: statusColor }}>
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Crops Line (if > 3 active crops) */}
          {secondaryCrops.length > 0 && (
            <div className="season-secondary-crops">
              <span className="season-secondary-label">Also in season:</span>
              <p className="season-secondary-text">
                {secondaryCrops.map((c) => c.crop.name).join(" · ")}
              </p>
            </div>
          )}

          {/* Illustrative Notice Disclaimer */}
          <footer className="season-disclaimer-notice">
            <p>{SEASON_ILLUSTRATIVE_NOTICE}</p>
          </footer>
        </div>
      </section>

      {/* Desktop-Only Original Season Section (>= 961px, completely untouched) */}
      <section
        className="season season-desktop-stage"
        aria-labelledby="season-title"
        data-motion="season-index"
      >
        <div className="section-kicker section-kicker--light">
          <span>02 / Seasons</span>
          <span>Availability across the year</span>
        </div>

        <div className="season-layout">
          <div className="season-heading">
            <p className="eyebrow">Select a month</p>
            <h2 id="season-title">
              Nature has
              <br />
              a schedule.
            </h2>
            <p>Move through the year to discover what is in season and ready for planning.</p>
          </div>

          <div className="month-stage">
            <div className="month-readout" aria-live="polite">
              <span>{selectedMonth.number < 10 ? `0${selectedMonth.number}` : selectedMonth.number}</span>
              <strong>{selectedMonth.name}</strong>
              <small>Product availability</small>
            </div>

            <div className="month-grid" role="list" aria-label="Months">
              {MONTHS.map((m) => {
                const isActive = m.number === selectedMonth.number;
                return (
                  <button
                    key={m.code}
                    className={`month${isActive ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setSelectedMonth(m)}
                  >
                    {m.code}
                  </button>
                );
              })}
            </div>

            <div className="season-products">
              <span>Illustrative index</span>
              <p>Orange · Lemon · Sweet potato</p>
              <small>Final seasonal availability to be confirmed.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default SeasonSection;
