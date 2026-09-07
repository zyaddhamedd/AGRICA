import React from "react";

export interface ProductStageProps {
  readonly visual: string;
  readonly isChanging: boolean;
  readonly stageCode: string;
  readonly familyName: string;
  readonly worldFormat: string;
  readonly productName: string;
  readonly isAddedToQuote: boolean;
  readonly addFeedback: string;
  readonly onAddToQuote: () => void;
}

export function ProductStage({
  visual,
  isChanging,
  stageCode,
  familyName,
  worldFormat,
  productName,
  isAddedToQuote,
  addFeedback,
  onAddToQuote,
}: ProductStageProps): React.JSX.Element {
  return (
    <div className="product-stage" aria-live="polite">
      <div
        className={`stage-media${isChanging ? " is-changing" : ""}`}
        id="stage-media"
        data-visual={visual}
      >
        <span className="stage-code" id="stage-code">
          {stageCode}
        </span>
        <span className="stage-origin">Product of Egypt</span>
      </div>

      <div className="stage-content">
        <div className="stage-meta">
          <span id="stage-family">{familyName}</span>
          <span id="stage-format">{worldFormat}</span>
        </div>
        <h2 id="stage-name">{productName}</h2>
        <p id="stage-description">
          {productName} prepared around the buyer&apos;s destination, grade, format and packing
          brief.
        </p>
        <dl>
          <div>
            <dt>Origin</dt>
            <dd>Egypt</dd>
          </div>
          <div>
            <dt>Condition</dt>
            <dd id="stage-condition">{worldFormat}</dd>
          </div>
          <div>
            <dt>Grade</dt>
            <dd>On specification</dd>
          </div>
          <div>
            <dt>Packing</dt>
            <dd>Buyer programme</dd>
          </div>
        </dl>
        <button
          className={`add-quote${isAddedToQuote ? " is-added" : ""}`}
          id="add-quote"
          type="button"
          onClick={onAddToQuote}
        >
          {isAddedToQuote ? (
            <>
              Added to quotation <span aria-hidden="true">✓</span>
            </>
          ) : (
            <>
              Add to quotation <span aria-hidden="true">+</span>
            </>
          )}
        </button>
        <small className="add-feedback" id="add-feedback" aria-live="polite">
          {addFeedback}
        </small>
      </div>
    </div>
  );
}
