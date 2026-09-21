import React from "react";
import { HERBS_SPICES_HOMEPAGE } from "@/data/herbs-spices/homepage";
import { HERBS_SPICES_MEDIA } from "@/data/herbs-spices/media";
import { MaterialStage } from "./MaterialStage";
import styles from "./IngredientFormsSection.module.css";

export function IngredientFormsSection(): React.JSX.Element {
  const { formsIntro, forms } = HERBS_SPICES_HOMEPAGE;
  const stageItems = forms.map((form) => ({
    id: form.id,
    index: form.index,
    name: form.name,
    descriptor: form.descriptor,
    media: HERBS_SPICES_MEDIA.forms[form.id as keyof typeof HERBS_SPICES_MEDIA.forms],
  }));

  return (
    <section className={styles.section} id="ingredient-forms" aria-labelledby="forms-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p>{formsIntro.eyebrow}</p>
          <h2 id="forms-title">{formsIntro.title}</h2>
          <span>{formsIntro.description}</span>
        </header>
        <MaterialStage items={stageItems} />
      </div>
    </section>
  );
}
