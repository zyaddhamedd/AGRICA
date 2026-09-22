import React from "react";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface FloatingEnquiryDockProps {
  readonly count: number;
  readonly onOpenQuote: () => void;
}

export function FloatingEnquiryDock({
  count,
  onOpenQuote,
}: FloatingEnquiryDockProps): React.JSX.Element | null {
  const common = useCommonDictionary();
  if (count === 0) return null;

  const cropText = count === 1 ? common.enquiry.cropSelected : formatMessage(common.enquiry.cropsSelected, { count });

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
          aria-label={formatMessage(common.enquiry.reviewItems, { count })}
        >
          <span>{common.actions.reviewEnquiry}</span>
          <span className="enquiry-dock-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </div>
  );
}
