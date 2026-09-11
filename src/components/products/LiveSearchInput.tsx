"use client";

import React, { useState, useRef, useEffect } from "react";

export interface LiveSearchInputProps {
  readonly query: string;
  readonly onChange: (value: string) => void;
  readonly totalMatches: number;
}

export function LiveSearchInput({
  query,
  onChange,
}: LiveSearchInputProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isExpanded = isOpen || query.trim() !== "";

  // Auto-focus input when search expands
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Collapse search if clicking outside when query is empty
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        query.trim() === ""
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isOpen, query]);

  const handleToggle = () => {
    if (isOpen && query.trim() === "") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleClearOrClose = () => {
    if (query.trim() !== "") {
      onChange("");
      inputRef.current?.focus();
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (query.trim() !== "") {
        onChange("");
      } else {
        setIsOpen(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`minimal-search-shell${isExpanded ? " is-expanded" : ""}`}
    >
      {!isExpanded ? (
        <button
          type="button"
          className="minimal-search-trigger"
          onClick={handleToggle}
          aria-expanded="false"
          aria-label="Open product search"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      ) : (
        <div className="minimal-search-field-wrap">
          <span className="minimal-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <label htmlFor="minimal-search-input" className="visually-hidden">
            Search products
          </label>
          <input
            ref={inputRef}
            id="minimal-search-input"
            type="text"
            className="minimal-search-input"
            placeholder="Search products"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="button"
            className="minimal-search-close"
            onClick={handleClearOrClose}
            aria-label={query.trim() !== "" ? "Clear search query" : "Close search bar"}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

