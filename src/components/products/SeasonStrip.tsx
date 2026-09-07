import React, { useState } from "react";

export interface SeasonStripProps {
  readonly seasonFamily: string;
  readonly seasonProducts: string;
}

const MONTHS = [
  { code: "JAN", name: "January" },
  { code: "FEB", name: "February" },
  { code: "MAR", name: "March" },
  { code: "APR", name: "April" },
  { code: "MAY", name: "May" },
  { code: "JUN", name: "June" },
  { code: "JUL", name: "July" },
  { code: "AUG", name: "August" },
  { code: "SEP", name: "September" },
  { code: "OCT", name: "October" },
  { code: "NOV", name: "November" },
  { code: "DEC", name: "December" },
] as const;

export function SeasonStrip({
  seasonFamily,
  seasonProducts,
}: SeasonStripProps): React.JSX.Element {
  const [selectedMonth, setSelectedMonth] = useState<string>("January");

  return (
    <section className="season-strip" id="seasons" aria-labelledby="season-title">
      <div className="section-kicker section-kicker--light">
        <span>Season explorer</span>
        <span>Plan by month</span>
      </div>
      <div className="season-grid">
        <div>
          <p className="eyebrow">Annual availability</p>
          <h2 id="season-title">
            The year,
            <br />
            <em>mapped.</em>
          </h2>
        </div>
        <div className="month-selector" role="list" aria-label="Select month">
          {MONTHS.map(({ code, name }) => {
            const isActive = name === selectedMonth;
            return (
              <button
                key={code}
                className={`month${isActive ? " is-active" : ""}`}
                type="button"
                data-month={name}
                onClick={() => setSelectedMonth(name)}
              >
                {code}
              </button>
            );
          })}
        </div>
        <div className="season-summary">
          <span id="selected-month">{selectedMonth}</span>
          <strong id="season-family">{seasonFamily}</strong>
          <p id="season-products">{seasonProducts}</p>
          <small>
            Final availability windows will use AGRICA&apos;s approved seasonal calendar.
          </small>
        </div>
      </div>
    </section>
  );
}
