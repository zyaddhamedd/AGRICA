import React, { useState, useEffect, useRef } from "react";
import type { QuoteItem } from "@/types/agrica";

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
      setSuccessMessage("Add at least one product before preparing your enquiry.");
      return;
    }
    setSuccessMessage(
      "Enquiry prepared. In production, this will be sent directly to the AGRICA export team."
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
            <span>Export enquiry</span>
            <h2 id="quote-title">Build your quotation.</h2>
          </div>
          <button
            className="quote-close"
            type="button"
            aria-label="Close quotation"
            ref={closeButtonRef}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="quote-items" id="quote-items">
          {items.map((item) => (
            <div className="quote-item" key={item.key}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {item.world} · {item.family}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => onRemoveItem(item.key)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <p className="quote-empty" id="quote-empty" hidden={items.length > 0}>
          Select products from the shelf to begin.
        </p>

        <form className="quote-form" id="quote-form" onSubmit={handleSubmit}>
          <label>
            Destination market
            <input
              name="destination"
              required
              placeholder="Country / port"
              value={formData.destination}
              onChange={handleChange}
            />
          </label>
          <label>
            Estimated volume
            <input
              name="volume"
              required
              placeholder="Monthly requirement"
              value={formData.volume}
              onChange={handleChange}
            />
          </label>
          <label>
            Company
            <input
              name="company"
              required
              placeholder="Company name"
              value={formData.company}
              onChange={handleChange}
            />
          </label>
          <label>
            Work email
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
            Prepare enquiry <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="quote-success" id="quote-success" role="status">
          {successMessage}
        </p>
      </aside>
    </>
  );
}
