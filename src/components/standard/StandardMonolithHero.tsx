import React from "react";
import { useStandardDictionary } from "@/i18n/locale-context";

export function StandardMonolithHero(): React.JSX.Element {
  const hero = useStandardDictionary().produce.hero;
  return (
    <section className="standard-monolith-hero" aria-labelledby="standard-hero-title">
      <div className="hero-inner">
        <h1 id="standard-hero-title" className="hero-headline">
          {hero.titleLead} <em>{hero.titleEmphasis}</em> {hero.titleClose}
        </h1>

        <p className="hero-subline">
          {hero.description}
        </p>

        <div className="hero-scroll-line" aria-hidden="true">
          <span className="scroll-line-fill" />
        </div>
      </div>
    </section>
  );
}
