import React from "react";
import { CONTROL_DISCIPLINES } from "@/data/controlDisciplines";

export function ControlRegister(): React.JSX.Element {
  return (
    <section className="control-register" aria-labelledby="register-title">
      <div className="section-kicker">
        <span>Control register</span>
        <span>Eight connected disciplines</span>
      </div>
      <div className="register-head">
        <h2 id="register-title">
          Not a checkpoint.
          <br />
          <em>A system.</em>
        </h2>
        <p>
          Operational disciplines remain connected around the same specification,
          lot and destination.
        </p>
      </div>
      <div className="register-grid">
        {CONTROL_DISCIPLINES.map((discipline) => (
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
