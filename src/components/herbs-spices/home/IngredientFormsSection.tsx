"use client";

import React, { useState } from "react";
import DepthCarousel from "@/components/ui/DepthCarousel/DepthCarousel";
import { useHerbsSpicesDictionary } from "@/i18n/locale-context";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import styles from "./IngredientFormsSection.module.css";

export function IngredientFormsSection(): React.JSX.Element {
  const { formsIntro, forms } = useHerbsSpicesDictionary().homepage;
  const staticIntro = HERBS_SPICES_HOMEPAGE.formsIntro;
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems = forms.map((form) => {
    const media =
      HERBS_SPICES_MEDIA.forms[
        form.id as keyof typeof HERBS_SPICES_MEDIA.forms
      ];
    return {
      id: form.id,
      image: media?.src || "/assets/herbs-spices/home/form-whole.webp",
      alt: `${form.name} processing format`,
      index: form.index,
      name: form.name,
      descriptor: form.descriptor,
    };
  });

  const activeItem = carouselItems[activeIndex] ?? carouselItems[0];
  const totalCountFormatted = String(carouselItems.length).padStart(2, "0");

  return (
    <section
      className={styles.section}
      id="ingredient-forms"
      aria-label={formsIntro.eyebrow || staticIntro.eyebrow || "03 / MATERIAL EXPRESSION"}
    >
      <div className={styles.inner}>
        {/* Chapter Label */}
        <div className={styles.chapterHeader}>
          <span className={styles.chapterLabel}>
            {formsIntro.eyebrow || staticIntro.eyebrow || "03 / MATERIAL EXPRESSION"}
          </span>
        </div>

        {/* 3D Depth Carousel Stage from React Bits */}
        <div className={styles.stageWrapper}>
          <div className={styles.carouselContainer}>
            <DepthCarousel
              items={carouselItems}
              cardWidth={300}
              cardHeight={380}
              radius={18}
              tint="#192A24"
              depth={220}
              spread={90}
              tilt={22}
              tiltDirection="right"
              perspective={1400}
              visibleCards={4}
              falloff={0.2}
              blur={6}
              loop={true}
              showControls={true}
              showIndicators={true}
              onChange={(idx) => setActiveIndex(idx)}
            />
          </div>

          {/* Active Format Editorial Details */}
          <div
            key={`active-${activeItem.id}`}
            className={styles.activeDetails}
            aria-live="polite"
          >
            <div className={styles.detailsHeader}>
              <span className={styles.detailsIndex}>
                {activeItem.index} / {totalCountFormatted}
              </span>
              <h3 className={styles.detailsTitle}>{activeItem.name}</h3>
            </div>
            <p className={styles.detailsDesc}>{activeItem.descriptor}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
