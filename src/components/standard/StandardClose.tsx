import React from "react";
import Link from "next/link";

export function StandardClose(): React.JSX.Element {
  return (
    <section className="standard-close" aria-labelledby="closing-title">
      <span>From origin to arrival</span>
      <h2 id="closing-title">
        Controlled at every step.
        <br />
        <em>Trusted at every destination.</em>
      </h2>
      <div>
        <p>
          Choose the products and destination. AGRICA will shape the export brief
          around your programme.
        </p>
        <Link className="standard-cta" href="/products">
          Build your quotation <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
