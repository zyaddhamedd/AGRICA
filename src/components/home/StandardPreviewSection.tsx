import React from "react";
import Link from "next/link";

export function StandardPreviewSection(): React.JSX.Element {
  return (
    <section className="standard" id="standard" aria-labelledby="standard-title">
      <div className="section-kicker">
        <span>02 / Our standard</span>
        <span>From source to shipment</span>
      </div>

      <div className="standard-head">
        <h2 id="standard-title">
          Nothing leaves origin
          <br />
          to chance.
        </h2>
        <p>
          Sourcing, specification, quality control and export coordination — managed as one
          connected journey.
        </p>
      </div>

      <div className="journey" data-motion="standard-journey">
        <div className="journey-line" aria-hidden="true"></div>
        <div className="journey-marker" aria-hidden="true">
          <strong>AGRĪCA</strong>
          <span>LOT 01</span>
        </div>
        <ol>
          <li>
            <span>01</span>
            <strong>Source</strong>
            <small>Origin selection</small>
          </li>
          <li>
            <span>02</span>
            <strong>Inspect</strong>
            <small>Quality control</small>
          </li>
          <li>
            <span>03</span>
            <strong>Prepare</strong>
            <small>Process & grade</small>
          </li>
          <li>
            <span>04</span>
            <strong>Pack</strong>
            <small>Specification</small>
          </li>
          <li>
            <span>05</span>
            <strong>Deliver</strong>
            <small>Export coordination</small>
          </li>
        </ol>
      </div>

      <div className="standard-closing">
        <p>Controlled at every step.</p>
        <p>
          <em>Trusted at every destination.</em>
        </p>
        <Link className="arrow-link" href="/standard">
          Discover our standard <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
