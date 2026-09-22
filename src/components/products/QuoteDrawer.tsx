import React, { useState, useEffect, useRef } from "react";
import type { QuoteItem } from "@/types/agrica";
import { useCommonDictionary } from "@/i18n/locale-context";
import { formatMessage } from "@/i18n/format";

export interface QuoteDrawerProps {
  readonly isOpen: boolean;
  readonly items: readonly QuoteItem[];
  readonly onClose: () => void;
  readonly onRemoveItem: (key: string) => void;
}

export function QuoteDrawer({
  isOpen,
  items,
  onClose,
  onRemoveItem,
}: QuoteDrawerProps): React.JSX.Element {
  const common = useCommonDictionary();
  const [formData, setFormData] = useState({
    destination: "",
    volume: "",
    company: "",
    email: "",
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) {
      setSuccessMessage(common.enquiry.addProductFirst);
      return;
    }
    setSuccessMessage(
      common.enquiry.prepared
    );
  };

  return (
    <>
      <div
        className={`drawer-backdrop${isOpen ? " is-open" : ""}`}
        id="drawer-backdrop"
        onClick={onClose}
      />
      <aside
        className={`quote-drawer${isOpen ? " is-open" : ""}`}
        id="quote-drawer"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-labelledby="quote-title"
      >
        <div className="quote-head">
          <div>
            <span>{common.enquiry.exportEnquiry}</span>
            <h2 id="quote-title">{common.enquiry.buildQuotationTitle}</h2>
          </div>
          <button
            className="quote-close"
            type="button"
            aria-label={common.enquiry.closeQuotation}
            ref={closeButtonRef}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="quote-items" id="quote-items">
          {items.map((item) => (
            <div className="quote-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.world} · {item.family}
                </span>
              </div>
              <button
                type="button"
                aria-label={formatMessage(common.enquiry.removeItem, { name: item.name })}
                onClick={() => onRemoveItem(item.id)}
              >
                {common.actions.remove}
              </button>
            </div>
          ))}
        </div>

        <p className="quote-empty" id="quote-empty" hidden={items.length > 0}>
          {common.enquiry.empty}
        </p>

        <form className="quote-form" id="quote-form" onSubmit={handleSubmit}>
          <label>
            {common.enquiry.destinationMarket}
            <input
              name="destination"
              required
              placeholder={common.enquiry.destinationPlaceholder}
              value={formData.destination}
              onChange={handleChange}
            />
          </label>
          <label>
            {common.enquiry.estimatedVolume}
            <input
              name="volume"
              required
              placeholder={common.enquiry.volumePlaceholder}
              value={formData.volume}
              onChange={handleChange}
            />
          </label>
          <label>
            {common.enquiry.company}
            <input
              name="company"
              required
              placeholder={common.enquiry.companyPlaceholder}
              value={formData.company}
              onChange={handleChange}
            />
          </label>
          <label>
            {common.enquiry.workEmail}
            <input
              type="email"
              name="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <button type="submit">
            {common.actions.prepareEnquiry} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="quote-success" id="quote-success" role="status">
          {successMessage}
        </p>
      </aside>
    </>
  );
}
