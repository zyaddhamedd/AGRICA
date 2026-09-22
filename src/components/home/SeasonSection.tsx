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
import { useHomeDictionary } from "@/i18n/locale-context";

export function SeasonSection(): React.JSX.Element {
  const dictionary = useHomeDictionary().season;
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
        aria-label={dictionary.calendar}
        style={{ backgroundColor: selectedMonth.bgTint }}
      >
        <div className="season-mobile-container">
          {/* Header Kicker & Editorial Headline */}
          <header className="season-mobile-header">
            <div className="section-kicker section-kicker--mobile">
              <span className="season-kicker-num">02 / {dictionary.rhythm}</span>
              <span className="season-kicker-tag">{dictionary.calendar}</span>
            </div>
            <h2 className="season-mobile-headline">
              {dictionary.heading} <br />
              <em>{dictionary.emphasis}</em>
            </h2>
          </header>

          {/* Native Touch-Safe Horizontal Month Ribbon */}
          <nav className="season-ribbon-viewport" aria-label={dictionary.selectMonthLabel}>
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
                    <span className="season-ribbon-code">{dictionary.months[idx].slice(0, 3)}</span>
                    {isActive && <span className="season-ribbon-active-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Active Month Readout Indicator */}
          <div className="season-active-readout">
            <span className="season-readout-season-tag">{dictionary.calendar}</span>
            <h3 className="season-readout-title">{dictionary.months[selectedMonth.number - 1]} — {dictionary.productAvailability}</h3>
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
                    alt={dictionary.cropNames[crop.id]}
                    className="season-floating-asset-img"
                  />
                </div>
                <div className="season-floating-label">
                  <span className="season-floating-name">{dictionary.cropNames[crop.id]}</span>
                  <span className="season-floating-status" style={{ color: statusColor }}>
                    {status === "PEAK HARVEST" ? dictionary.statuses.peak : dictionary.statuses.available}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop-Only Original Season Section (>= 961px, completely untouched) */}
      <section
        className="season season-desktop-stage"
        aria-labelledby="season-title"
        data-motion="season-index"
      >
        <div className="section-kicker section-kicker--light">
          <span>02 / {dictionary.rhythm}</span>
          <span>{dictionary.availability}</span>
        </div>

        <div className="season-layout">
          <div className="season-heading">
            <p className="eyebrow">{dictionary.selectMonth}</p>
            <h2 id="season-title">
              {dictionary.heading} <br />
              <em>{dictionary.emphasis}</em>
            </h2>
          </div>

          <div className="month-stage">
            <div className="month-readout" aria-live="polite">
              <span>{selectedMonth.number < 10 ? `0${selectedMonth.number}` : selectedMonth.number}</span>
              <strong>{dictionary.months[selectedMonth.number - 1]}</strong>
              <small>{dictionary.productAvailability}</small>
            </div>

            <div className="month-grid" role="list" aria-label={dictionary.monthsLabel}>
              {MONTHS.map((m, index) => {
                const isActive = m.number === selectedMonth.number;
                return (
                  <button
                    key={m.code}
                    className={`month${isActive ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setSelectedMonth(m)}
                  >
                    {dictionary.months[index].slice(0, 3)}
                  </button>
                );
              })}
            </div>

            <div className="season-products">
              <span>{dictionary.illustrativeIndex}</span>
              <p>{dictionary.illustrativeProducts}</p>
              <small>{dictionary.notice}</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default SeasonSection;
