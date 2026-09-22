"use client";

import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";

export function ControlRegister(): React.JSX.Element {
  const { controls, ui } = useStandardDictionary().produce;
  return (
    <section className="control-register" aria-labelledby="register-title">
      <div className="section-kicker">
        <span>{ui.registerEyebrow}</span>
        <span>{ui.registerStrap}</span>
      </div>
      <div className="register-head">
        <h2 id="register-title">
          {ui.registerLead}
          <br />
          <em>{ui.registerEmphasis}</em>
        </h2>
        <p>
          {ui.registerDescription}
        </p>
      </div>
      <div className="register-grid">
        {controls.map((discipline) => (
          <article key={discipline.number}>
            <span>{discipline.number}</span>
            <h3>{discipline.title}</h3>
            <p>{discipline.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
