import React from "react";

export interface MobileQuoteBarProps {
  readonly count: number;
  readonly onOpen: () => void;
}

export function MobileQuoteBar({ count, onOpen }: MobileQuoteBarProps): React.JSX.Element {
  return (
    <button
      className="mobile-quote quote-trigger"
      type="button"
      aria-controls="quote-drawer"
      onClick={onOpen}
    >
      <span>Quotation</span>
      <strong>
        <b className="quote-count">{count}</b> items ↗
      </strong>
    </button>
  );
}
