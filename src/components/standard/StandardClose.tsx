import React from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { useCommonDictionary, useStandardDictionary } from "@/i18n/locale-context";

export function StandardClose(): React.JSX.Element {
  const common = useCommonDictionary();
  const ui = useStandardDictionary().produce.ui;
  return (
    <section className="standard-close" aria-labelledby="closing-title">
      <span>{ui.closeEyebrow}</span>
      <h2 id="closing-title">
        {ui.closeTitle}
        <br />
        <em>{ui.closeEmphasis}</em>
      </h2>
      <div>
        <p>
          {ui.closeDescription}
        </p>
        <Link className="standard-cta" href="/products">
          {common.footer.buildQuotation} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
