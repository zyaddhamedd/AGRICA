import React from "react";

export function CompanySection(): React.JSX.Element {
  return (
    <section className="company" id="company" aria-labelledby="company-title">
      <div className="company-index">03</div>

      <div className="company-copy">
        <p className="eyebrow">AGRICA / The company</p>
        <h2 id="company-title">
          Egyptian by origin.
          <br />
          <em>International by discipline.</em>
        </h2>
        <p>
          AGRICA connects agricultural origin with the standards, coordination and clarity
          global trade demands.
        </p>
        <a className="arrow-link" href="#trade">
          Meet AGRICA <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="company-data">
        <div>
          <span>Origin</span>
          <strong>
            Cairo
            <br />
            Egypt
          </strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>
            Fresh
            <br />
            Frozen
            <br />
            Dried
          </strong>
        </div>
        <div>
          <span>Reach</span>
          <strong>
            Global
            <br />
            Markets
          </strong>
        </div>
      </div>
    </section>
  );
}
