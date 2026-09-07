"use client";

import React, { useState } from "react";

export interface TradeFormData {
  readonly product: string;
  readonly destination: string;
  readonly volume: string;
  readonly email: string;
}

export function TradeSection(): React.JSX.Element {
  const [formData, setFormData] = useState<TradeFormData>({
    product: "",
    destination: "",
    volume: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prototype submission behaviour: prevent default without pretending the enquiry was sent to AGRICA backend
    e.preventDefault();
  };

  return (
    <section className="trade" id="trade" aria-labelledby="trade-title">
      <div className="trade-heading">
        <p className="eyebrow">Start a trade</p>
        <h2 id="trade-title">
          Tell us what
          <br />
          needs to arrive.
        </h2>
      </div>

      <form className="trade-form" onSubmit={handleSubmit}>
        <label>
          Product or category
          <input
            type="text"
            name="product"
            placeholder="e.g. Fresh citrus"
            value={formData.product}
            onChange={handleChange}
          />
        </label>
        <label>
          Destination market
          <input
            type="text"
            name="destination"
            placeholder="Country / port"
            value={formData.destination}
            onChange={handleChange}
          />
        </label>
        <label>
          Estimated volume
          <input
            type="text"
            name="volume"
            placeholder="Monthly requirement"
            value={formData.volume}
            onChange={handleChange}
          />
        </label>
        <label>
          Your email
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <button type="submit">
          Send enquiry <span aria-hidden="true">↗</span>
        </button>
      </form>
    </section>
  );
}
