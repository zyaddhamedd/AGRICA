import React from "react";

export interface FloatingEnquiryDockProps {
  readonly count: number;
  readonly onOpenQuote: () => void;
}

export function FloatingEnquiryDock({
  count,
  onOpenQuote,
}: FloatingEnquiryDockProps): React.JSX.Element | null {
  if (count === 0) return null;

  const cropText = count === 1 ? "1 CROP SELECTED" : `${count} CROPS SELECTED`;

  return (
    <div className="enquiry-dock-shell">
      <div className="enquiry-dock-inner">
        <div className="enquiry-dock-info">
          <span className="enquiry-dock-pulse" aria-hidden="true" />
          <strong className="enquiry-dock-count">{cropText}</strong>
        </div>
        <button
          type="button"
          className="enquiry-dock-btn"
          onClick={onOpenQuote}
          aria-label={`Review ${count} items in your export enquiry`}
        >
          <span>Review enquiry</span>
          <span className="enquiry-dock-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </div>
  );
}
