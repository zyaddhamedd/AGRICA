import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";

export function StandardProofInterlude(): React.JSX.Element {
  const ui = useStandardDictionary().produce.ui;
  const pillars = ui.proofPillars.map((label, index) => ({ num:String(index + 1).padStart(2, "0"), label }));

  return (
    <section className="standard-proof-interlude">
      <div className="proof-interlude-inner">
        <span className="proof-interlude-kicker">{ui.controlledSpecification}</span>
        <h3 className="proof-interlude-title">{ui.destinationTitle}</h3>
        <div className="proof-interlude-pillars">
          {pillars.map((p) => (
            <div key={p.num} className="proof-pillar">
              <span className="pillar-num">{p.num}</span>
              <span className="pillar-label">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
