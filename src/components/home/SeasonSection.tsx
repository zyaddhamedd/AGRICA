"use client";

import React, { useState } from "react";

interface MonthItem {
  readonly code: string;
  readonly name: string;
  readonly number: string;
}

const MONTH_ITEMS: readonly MonthItem[] = [
  { code: "JAN", name: "January", number: "01" },
  { code: "FEB", name: "February", number: "02" },
  { code: "MAR", name: "March", number: "03" },
  { code: "APR", name: "April", number: "04" },
  { code: "MAY", name: "May", number: "05" },
  { code: "JUN", name: "June", number: "06" },
  { code: "JUL", name: "July", number: "07" },
  { code: "AUG", name: "August", number: "08" },
  { code: "SEP", name: "September", number: "09" },
  { code: "OCT", name: "October", number: "10" },
  { code: "NOV", name: "November", number: "11" },
  { code: "DEC", name: "December", number: "12" },
] as const;

export function SeasonSection(): React.JSX.Element {
  const [selectedMonth, setSelectedMonth] = useState<MonthItem>(MONTH_ITEMS[0]);

  return (
    <section
      className="season"
      aria-labelledby="season-title"
      data-motion="season-index"
    >
      <div className="section-kicker section-kicker--light">
        <span>Season index</span>
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
            <span id="month-number">{selectedMonth.number}</span>
            <strong id="month-name">{selectedMonth.name}</strong>
            <small>Product availability</small>
          </div>

          <div className="month-grid" role="list" aria-label="Months">
            {MONTH_ITEMS.map((m) => {
              const isActive = m.code === selectedMonth.code;
              return (
                <button
                  key={m.code}
                  className={`month${isActive ? " is-active" : ""}`}
                  type="button"
                  data-month={m.name}
                  data-number={m.number}
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
  );
}
