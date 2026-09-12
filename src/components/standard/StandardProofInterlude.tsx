import React from "react";

export function StandardProofInterlude(): React.JSX.Element {
  const pillars = [
    { num: "01", label: "Market" },
    { num: "02", label: "Grade" },
    { num: "03", label: "Pack" },
    { num: "04", label: "Condition" },
    { num: "05", label: "Handover" },
  ];

  return (
    <section className="standard-proof-interlude">
      <div className="proof-interlude-inner">
        <span className="proof-interlude-kicker">CONTROLLED SPECIFICATION</span>
        <h3 className="proof-interlude-title">Built around the destination.</h3>
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
