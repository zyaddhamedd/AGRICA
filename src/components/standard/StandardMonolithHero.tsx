import React from "react";

export function StandardMonolithHero(): React.JSX.Element {
  return (
    <section className="standard-monolith-hero" aria-labelledby="standard-hero-title">
      <div className="hero-inner">
        <h1 id="standard-hero-title" className="hero-headline">
          One lot. <em>Every step</em> controlled.
        </h1>

        <p className="hero-subline">
          From Egyptian field selection to export handover, every AGRICA shipment follows one controlled process.
        </p>

        <div className="hero-scroll-line" aria-hidden="true">
          <span className="scroll-line-fill" />
        </div>
      </div>
    </section>
  );
}
