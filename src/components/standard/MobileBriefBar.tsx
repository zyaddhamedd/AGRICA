import React from "react";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import { useCommonDictionary } from "@/i18n/locale-context";

export function MobileBriefBar(): React.JSX.Element {
  const common = useCommonDictionary();
  return (
    <Link className="mobile-brief" href="/products">
      <span>{common.footer.buildQuotation}</span>
      <strong>{common.actions.enquire} ↗</strong>
    </Link>
  );
}
