import React from "react";
import Link from "next/link";

export function MobileBriefBar(): React.JSX.Element {
  return (
    <Link className="mobile-brief" href="/products">
      <span>Build a quotation</span>
      <strong>Start brief ↗</strong>
    </Link>
  );
}
