import React from "react";

export function StandardMonolithHero(): React.JSX.Element {
  return (
    <section className="standard-monolith-hero" aria-labelledby="standard-hero-title">
      <div className="hero-inner">
        <div className="hero-kicker">
          <span>AGR / OPERATING STANDARD</span>
          <span className="hero-kicker-dot">·</span>
          <span>01—06 CONTROLLED JOURNEY</span>
        </div>

        <h1 id="standard-hero-title" className="hero-headline">
          One lot. <em>Every step</em> accounted for.
        </h1>

        <p className="hero-subline">
          From Egyptian field selection to destination container release, every shipment moves through one unified, transparent control process.
        </p>

        <div className="hero-scroll-line" aria-hidden="true">
          <span className="scroll-line-fill" />
        </div>
      </div>
    </section>
  );
}
