"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./TradeSection.css";
import { useHomeDictionary, useLocale } from "@/i18n/locale-context";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TradeFormData {
  readonly product: string;
  readonly destination: string;
  readonly volume: string;
  readonly company: string;
  readonly email: string;
}

export function TradeSection(): React.JSX.Element {
  const dictionary = useHomeDictionary().trade;
  const locale = useLocale();
  const [formData, setFormData] = useState<TradeFormData>({
    product: "",
    destination: "",
    volume: "",
    company: "",
    email: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const form = formRef.current;

    if (!section || !heading || !form) return;

    const ctx = gsap.context(() => {
      // Heading Stagger Reveal
      const headingElements = heading.querySelectorAll(".trade-reveal");
      gsap.fromTo(
        headingElements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Form Fields Stagger Reveal
      const fieldElements = form.querySelectorAll(".trade-field-group, .trade-submit-wrapper");
      gsap.fromTo(
        fieldElements,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: form,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="trade-section" id="trade" ref={sectionRef} aria-labelledby="trade-title">
      <div className="trade-container">
        {/* Editorial Sales Heading Column */}
        <div className="trade-heading" ref={headingRef}>
          <div className="trade-kicker trade-reveal">
            <span className="trade-kicker-dot" aria-hidden="true" />
            <span className="trade-eyebrow">{dictionary.eyebrow}</span>
          </div>

          <h2 id="trade-title" className="trade-title trade-reveal">
            {dictionary.heading}
            <br />
            <em className="trade-title-italic">{locale === "en" ? "needs to arrive." : dictionary.emphasis}</em>
          </h2>

          <p className="trade-subline trade-reveal">
            {dictionary.description}
          </p>
        </div>

        {/* Trade Form Column */}
        <form className="trade-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="trade-fields-grid">
            {/* Field 1: Product */}
            <div className="trade-field-group">
              <label htmlFor="trade-product" className="trade-label">
                {dictionary.product}
              </label>
              <div className="trade-input-wrapper">
                <input
                  id="trade-product"
                  type="text"
                  name="product"
                  className="trade-input"
                  placeholder={dictionary.productPlaceholder}
                  value={formData.product}
                  onChange={handleChange}
                />
                <span className="trade-line" aria-hidden="true" />
              </div>
            </div>

            {/* Field 2: Destination */}
            <div className="trade-field-group">
              <label htmlFor="trade-destination" className="trade-label">
                {dictionary.destination}
              </label>
              <div className="trade-input-wrapper">
                <input
                  id="trade-destination"
                  type="text"
                  name="destination"
                  className="trade-input"
                  placeholder={dictionary.destinationPlaceholder}
                  value={formData.destination}
                  onChange={handleChange}
                />
                <span className="trade-line" aria-hidden="true" />
              </div>
            </div>

            {/* Field 3: Volume */}
            <div className="trade-field-group">
              <label htmlFor="trade-volume" className="trade-label">
                {dictionary.volume}
              </label>
              <div className="trade-input-wrapper">
                <input
                  id="trade-volume"
                  type="text"
                  name="volume"
                  className="trade-input"
                  placeholder={dictionary.volumePlaceholder}
                  value={formData.volume}
                  onChange={handleChange}
                />
                <span className="trade-line" aria-hidden="true" />
              </div>
            </div>

            {/* Field 4: Company */}
            <div className="trade-field-group">
              <label htmlFor="trade-company" className="trade-label">
                {dictionary.company}
              </label>
              <div className="trade-input-wrapper">
                <input
                  id="trade-company"
                  type="text"
                  name="company"
                  className="trade-input"
                  placeholder={dictionary.companyPlaceholder}
                  value={formData.company}
                  onChange={handleChange}
                />
                <span className="trade-line" aria-hidden="true" />
              </div>
            </div>

            {/* Field 5: Email */}
            <div className="trade-field-group trade-field-full">
              <label htmlFor="trade-email" className="trade-label">
                {dictionary.email}
              </label>
              <div className="trade-input-wrapper">
                <input
                  id="trade-email"
                  type="email"
                  name="email"
                  className="trade-input"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <span className="trade-line" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="trade-submit-wrapper">
            <button type="submit" className={`trade-submit-btn ${submitted ? "is-submitted" : ""}`}>
              <span>{submitted ? dictionary.sent : dictionary.send}</span>
              <svg className="trade-submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            {submitted && (
              <p className="trade-success-note">
                {dictionary.success}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default TradeSection;
