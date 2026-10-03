"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiteHeader } from "@/components/common/SiteHeader";
import { SiteFooter } from "@/components/common/SiteFooter";
import { LocaleLink as Link } from "@/components/common/LocaleLink";
import {
  COMPANY_HERO,
  COMPANY_ORIGIN,
  COMPANY_WORKFLOW_STEPS,
  COMPANY_QUALITY,
  COMPANY_TEAM,
  COMPANY_LOGISTICS,
  COMPANY_CTA,
  type WorkflowStep,
} from "@/data/company";
import styles from "./CompanyPageContent.module.css";

// Register ScrollTrigger once on module load
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CompanyPageContent(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const originRef = useRef<HTMLElement>(null);
  const workflowRef = useRef<HTMLElement>(null);
  const qualityRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);
  const logisticsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Section 03 Desktop Interactive Step State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep: WorkflowStep = COMPANY_WORKFLOW_STEPS[activeStepIndex] ?? COMPANY_WORKFLOW_STEPS[0]!;

  const handleStepSelect = useCallback((index: number) => {
    setActiveStepIndex(index);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobileQuery = window.matchMedia("(max-width: 860px)");

    if (reducedMotionQuery.matches || isMobileQuery.matches) {
      // Skip heavy GSAP animations on mobile and for reduced motion users
      // to ensure fast 60fps native scrolling and prevent layout jitter
      return;
    }

    const ctx = gsap.context(() => {
      // 01 / Hero Reveal
      if (heroRef.current) {
        gsap.from(`.${styles.heroHeadline}`, {
          y: 45,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
        });
        gsap.from(`.${styles.heroSupporting}`, {
          y: 30,
          opacity: 0,
          duration: 1.0,
          delay: 0.2,
          ease: "power3.out",
        });
        gsap.from(`.${styles.heroMetadataRibbon} .${styles.metaItem}`, {
          y: 20,
          opacity: 0,
          duration: 0.8,
          delay: 0.35,
          stagger: 0.1,
          ease: "power2.out",
        });
      }

      // 02 / Origin Parallax & Entrance
      if (originRef.current) {
        gsap.from(`.${styles.originMainImageFrame}`, {
          scrollTrigger: {
            trigger: originRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          clipPath: "inset(15% 0% 0% 0%)",
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        });

        gsap.from(`.${styles.originCutinImageFrame}`, {
          scrollTrigger: {
            trigger: originRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
          scale: 0.9,
          opacity: 0,
          duration: 0.9,
          delay: 0.2,
          ease: "back.out(1.2)",
        });
      }

      // Note: Section 03 (Export Chain) relies on pure, stable CSS layout
      // without GSAP opacity/transform triggers to ensure the left column
      // remains 100% visible, fully readable, and stable at all times.

      // 04 / Quality Section Entrance
      if (qualityRef.current) {
        gsap.from(`.${styles.qualityStandardCard}`, {
          scrollTrigger: {
            trigger: qualityRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          y: 25,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
        });
      }

      // 05 / Team Portraits Gallery
      if (teamRef.current) {
        gsap.from(`.${styles.teamCard}`, {
          scrollTrigger: {
            trigger: teamRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
        });
      }

      // 06 / Logistics & Global Desks
      if (logisticsRef.current) {
        gsap.from(`.${styles.logisticsPillar}`, {
          scrollTrigger: {
            trigger: logisticsRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          x: 20,
          opacity: 0,
          stagger: 0.12,
          duration: 0.7,
          ease: "power2.out",
        });

        gsap.from(`.${styles.tradeDeskCard}`, {
          scrollTrigger: {
            trigger: `.${styles.tradeDesksContainer}`,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 25,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power2.out",
        });
      }

      // 07 / CTA Section
      if (ctaRef.current) {
        gsap.from(`.${styles.ctaCard}`, {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          scale: 0.96,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      }
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className={styles.page} ref={containerRef}>
      <SiteHeader variant="internal" />

      <main className={styles.main} id="main-content">
        {/* =================================================================
            01 / HERO — ORIGIN & DISCIPLINE
            ================================================================= */}
        <section
          className={styles.hero}
          ref={heroRef}
          aria-labelledby="company-hero-title"
        >
          <div className={styles.heroMediaBackdrop} aria-hidden="true">
            <video
              className={styles.heroVideo}
              src={COMPANY_HERO.videoDesktop}
              poster={COMPANY_HERO.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className={styles.heroVignette} />
          </div>

          <div className={styles.sectionContainer}>
            <div className={styles.heroContent}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
                {COMPANY_HERO.eyebrow}
              </span>

              <h1 className={styles.heroHeadline} id="company-hero-title">
                {COMPANY_HERO.headlineLead}{" "}
                <span className={styles.nowrap}>
                  {COMPANY_HERO.headlinePreEmphasis}
                  <em className={styles.serifWordLight}>
                    {COMPANY_HERO.headlineEmphasis}
                  </em>
                </span>
              </h1>

              <p className={styles.heroSupporting}>{COMPANY_HERO.supporting}</p>

              <div className={styles.heroMetadataRibbon}>
                {COMPANY_HERO.metadataBadges.map((badge) => (
                  <div className={styles.metaItem} key={badge.label}>
                    <span className={styles.metaLabel}>{badge.label}</span>
                    <span className={styles.metaValue}>{badge.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            02 / ROOTED IN EGYPT — ORIGIN & GROWERS
            ================================================================= */}
        <section
          className={styles.originSection}
          ref={originRef}
          aria-labelledby="company-origin-title"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.originGrid}>
              {/* Media Column (Clean stacking on mobile, asymmetrical on desktop) */}
              <div className={styles.originVisualCol}>
                <div className={styles.originMainImageFrame}>
                  <Image
                    src={COMPANY_ORIGIN.primaryImage}
                    alt={COMPANY_ORIGIN.primaryAlt}
                    fill
                    className={styles.originMainImage}
                    sizes="(max-width: 860px) 100vw, 45vw"
                    priority
                  />
                </div>
                <div className={styles.originCutinImageFrame}>
                  <Image
                    src={COMPANY_ORIGIN.secondaryImage}
                    alt={COMPANY_ORIGIN.secondaryAlt}
                    fill
                    className={styles.originCutinImage}
                    sizes="(max-width: 860px) 100vw, 30vw"
                  />
                </div>
              </div>

              {/* Copy & Principles Column */}
              <div className={styles.originCopyCol}>
                <span className={styles.eyebrow}>{COMPANY_ORIGIN.eyebrow}</span>
                <h2 className={styles.sectionTitle} id="company-origin-title">
                  {COMPANY_ORIGIN.headline}
                </h2>
                {COMPANY_ORIGIN.paragraphs.map((p, idx) => (
                  <p className={styles.leadParagraph} key={idx}>
                    {p}
                  </p>
                ))}

                <div className={styles.originPrinciplesList}>
                  {COMPANY_ORIGIN.principles.map((pr) => (
                    <div key={pr.title} className={styles.originPrincipleItem}>
                      <h3 className={styles.originPrincipleTitle}>{pr.title}</h3>
                      <p className={styles.originPrincipleDesc}>{pr.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            03 / THE EXPORT CHAIN (4-STAGE CONTROLLED JOURNEY)
            ================================================================= */}
        <section
          className={styles.workflowSection}
          ref={workflowRef}
          aria-labelledby="company-workflow-title"
        >
          <div className={styles.sectionContainer}>
            {/* Desktop 2-Column Layout */}
            <div className={styles.workflowDesktopLayout}>
              {/* Left Column: Eyebrow, Headline, Supporting copy, Navigation, Active stage details */}
              <div className={styles.workflowLeftCol}>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
                  03 / EXPORT CHAIN
                </span>
                <h2
                  className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
                  id="company-workflow-title"
                >
                  A controlled physical progression.
                </h2>
                <p className={styles.workflowSubtitle}>
                  Follow fresh produce handling from harvest aggregation through washing, sorting, carton packing, and refrigerated transport dispatch.
                </p>

                {/* Step Navigation Rail / Tabs */}
                <div
                  className={styles.workflowNavRail}
                  role="tablist"
                  aria-label="Export chain workflow stages"
                >
                  {COMPANY_WORKFLOW_STEPS.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`step-panel-${step.id}`}
                        id={`step-tab-${step.id}`}
                        className={`${styles.workflowStepCard} ${
                          isActive ? styles.workflowStepCardActive : ""
                        }`}
                        onClick={() => handleStepSelect(idx)}
                      >
                        <div className={styles.stepCardHead}>
                          <span className={styles.stepCardNumber}>STAGE {step.number}</span>
                          <span className={styles.stepCardSummary}>{step.summary}</span>
                        </div>
                        <h3 className={styles.stepCardTitle}>{step.title}</h3>
                        <p className={styles.stepCardDesc}>{step.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Large Active Media Panel */}
              <div className={styles.workflowRightCol}>
                <div
                  className={styles.workflowStageViewport}
                  role="tabpanel"
                  id={`step-panel-${activeStep.id}`}
                  aria-labelledby={`step-tab-${activeStep.id}`}
                >
                  <div className={styles.workflowViewportMedia}>
                    {activeStep.mediaType === "video" ? (
                      <video
                        key={activeStep.mediaSrc}
                        src={activeStep.mediaSrc}
                        poster={activeStep.posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={styles.workflowMediaElement}
                        aria-label={activeStep.alt}
                      />
                    ) : (
                      <Image
                        src={activeStep.mediaSrc}
                        alt={activeStep.alt}
                        fill
                        className={styles.workflowMediaElement}
                        sizes="(max-width: 992px) 100vw, 55vw"
                      />
                    )}
                    <div className={styles.workflowMediaShade} aria-hidden="true" />
                  </div>

                  <div className={styles.workflowViewportOverlay}>
                    <div className={styles.workflowTagList}>
                      {activeStep.tags.map((t) => (
                        <span className={styles.workflowTag} key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <h4 className={styles.workflowStageName}>
                      STAGE {activeStep.number} · {activeStep.title}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Vertical 4-Step Journey (No heavy pinning, no horizontal overflow) */}
            <div
              className={styles.workflowMobileJourney}
              aria-label="Export chain stages"
            >
              <div className={styles.workflowMobileHeader}>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
                  03 / EXPORT CHAIN
                </span>
                <h2
                  className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
                >
                  A controlled physical progression.
                </h2>
                <p className={styles.workflowSubtitle}>
                  Follow fresh produce handling from harvest aggregation through washing, sorting, carton packing, and refrigerated transport dispatch.
                </p>
              </div>

              {COMPANY_WORKFLOW_STEPS.map((step) => (
                <article key={step.id} className={styles.workflowMobileStepCard}>
                  <div className={styles.workflowMobileCardHead}>
                    <span className={styles.stepCardNumber}>STAGE {step.number} / 04</span>
                    <span className={styles.stepCardSummary}>{step.summary}</span>
                  </div>
                  <h3 className={styles.stepCardTitle}>{step.title}</h3>
                  <div className={styles.workflowMobileMediaFrame}>
                    {step.mediaType === "video" ? (
                      <video
                        src={step.mediaSrc}
                        poster={step.posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={styles.workflowMobileMedia}
                        aria-label={step.alt}
                      />
                    ) : (
                      <Image
                        src={step.mediaSrc}
                        alt={step.alt}
                        fill
                        className={styles.workflowMobileMedia}
                        sizes="(max-width: 860px) 100vw, 420px"
                      />
                    )}
                  </div>
                  <p className={styles.stepCardDesc}>{step.description}</p>
                  <div className={styles.workflowTagList}>
                    {step.tags.map((t) => (
                      <span className={styles.workflowTag} key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            04 / OPERATIONAL STANDARDS — POST-HARVEST HANDLING
            ================================================================= */}
        <section
          className={styles.qualitySection}
          ref={qualityRef}
          aria-labelledby="company-quality-title"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.qualityGrid}>
              <div className={styles.qualityMediaWrapper}>
                <video
                  src={COMPANY_QUALITY.videoSrc}
                  poster={COMPANY_QUALITY.videoPoster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className={styles.qualityVideo}
                  aria-label={COMPANY_QUALITY.videoAlt}
                />
              </div>

              <div className={styles.qualityCopyWrapper}>
                <span className={styles.eyebrow}>{COMPANY_QUALITY.eyebrow}</span>
                <h2 className={styles.sectionTitle} id="company-quality-title">
                  {COMPANY_QUALITY.headline}
                </h2>
                <p className={styles.leadParagraph}>{COMPANY_QUALITY.supporting}</p>

                <div className={styles.qualityStandardsList}>
                  {COMPANY_QUALITY.standards.map((st) => (
                    <div className={styles.qualityStandardCard} key={st.number}>
                      <span className={styles.standardCardNum}>{st.number}</span>
                      <div className={styles.standardCardBody}>
                        <h3 className={styles.standardCardTitle}>{st.title}</h3>
                        <p className={styles.standardCardDesc}>{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.qualityNoticeBox}>
                  <strong>Documentation Coordination:</strong> {COMPANY_QUALITY.notice}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            05 / PEOPLE BEHIND AGRICA — OPERATIONAL ROLES
            ================================================================= */}
        <section
          className={styles.teamSection}
          ref={teamRef}
          aria-labelledby="company-team-title"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.teamHeader}>
              <span className={styles.eyebrow}>05 / THE TEAM</span>
              <h2 className={styles.sectionTitle} id="company-team-title">
                People behind the export chain.
              </h2>
              <p className={styles.leadParagraph}>
                Agricultural export relies on dedicated professionals across every stage: orchard partners, harvest crews, packhouse technicians, and logistics coordinators working to deliver export-grade produce.
              </p>
            </div>

            {/* Desktop Grid / Mobile 82vw Peek Swipe Carousel */}
            <div className={styles.teamScrollStrip}>
              {COMPANY_TEAM.map((member) => (
                <article className={styles.teamCard} key={member.id}>
                  <div className={styles.teamPhotoFrame}>
                    <Image
                      src={member.imageSrc}
                      alt={member.imageAlt}
                      fill
                      className={styles.teamPhoto}
                      sizes="(max-width: 860px) 82vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <div className={styles.teamCardShade} aria-hidden="true" />
                    <span className={styles.teamMemberBadge}>
                      {member.number}
                    </span>
                  </div>

                  <div className={styles.teamCardInfo}>
                    <span className={styles.teamRoleTag}>{member.role}</span>
                    <h3 className={styles.teamMemberName}>{member.nameKey}</h3>
                    <p className={styles.teamMemberDesc}>{member.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            06 / EXPORT PREPARATION & TRADE DESKS
            ================================================================= */}
        <section
          className={styles.logisticsSection}
          ref={logisticsRef}
          aria-labelledby="company-logistics-title"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.logisticsGrid}>
              <div className={styles.logisticsCopyCol}>
                <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
                  {COMPANY_LOGISTICS.eyebrow}
                </span>
                <h2
                  className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
                  id="company-logistics-title"
                >
                  {COMPANY_LOGISTICS.headline}
                </h2>
                <p className={`${styles.leadParagraph} ${styles.leadParagraphLight}`}>
                  {COMPANY_LOGISTICS.supporting}
                </p>

                <div className={styles.logisticsPillarsList}>
                  {COMPANY_LOGISTICS.pillars.map((pillar) => (
                    <div className={styles.logisticsPillar} key={pillar.title}>
                      <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                      <p className={styles.pillarDesc}>{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.logisticsMediaCol}>
                <div className={styles.logisticsMediaWrapper}>
                  <video
                    src={COMPANY_LOGISTICS.videoSrc}
                    poster={COMPANY_LOGISTICS.videoPoster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={styles.logisticsVideo}
                    aria-label={COMPANY_LOGISTICS.videoAlt}
                  />
                </div>
              </div>
            </div>

            {/* International Trade Desks */}
            <div className={styles.tradeDesksContainer}>
              <div className={styles.tradeDesksHeader}>
                <span className={styles.tradeDesksLabel}>Commercial Contact Points</span>
                <span className={styles.tradeDesksRule} aria-hidden="true" />
              </div>

              <div className={styles.tradeDesksGrid}>
                {COMPANY_LOGISTICS.tradeDesks.map((desk) => (
                  <div className={styles.tradeDeskCard} key={desk.city}>
                    <div className={styles.tradeDeskHead}>
                      <span className={styles.tradeDeskCity}>
                        {desk.city}, {desk.country}
                      </span>
                      <span className={styles.tradeDeskNum}>{desk.number}</span>
                    </div>
                    <div className={styles.tradeDeskRole}>{desk.role}</div>
                    <address className={styles.tradeDeskAddress}>
                      {desk.address}
                    </address>
                    <a
                      href={desk.phoneHref}
                      className={styles.tradeDeskPhone}
                      aria-label={`Call ${desk.city} desk at ${desk.phone}`}
                    >
                      {desk.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            07 / DIRECT TRADE ENQUIRY — CONVERSION CARD
            ================================================================= */}
        <section
          className={styles.ctaSection}
          ref={ctaRef}
          aria-labelledby="company-cta-title"
        >
          <div className={styles.sectionContainer}>
            <div className={styles.ctaCard}>
              <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
                {COMPANY_CTA.eyebrow}
              </span>
              <h2 className={styles.ctaHeadline} id="company-cta-title">
                {COMPANY_CTA.headline}
              </h2>
              <p className={styles.ctaSupporting}>{COMPANY_CTA.supporting}</p>

              <div className={styles.ctaButtonRow}>
                <Link href={COMPANY_CTA.primaryHref} className={styles.primaryCtaBtn}>
                  {COMPANY_CTA.primaryAction}
                </Link>
                <Link
                  href={COMPANY_CTA.secondaryHref}
                  className={styles.secondaryCtaBtn}
                >
                  {COMPANY_CTA.secondaryAction}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
