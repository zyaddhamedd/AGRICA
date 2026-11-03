import type { ProduceProductId } from "@/types/agrica";
import { PRODUCT_CARD_CONTENT } from "@/data/productCardContent";

// An intentionally bounded pilot, not every synonym, market, variety or product.
const PILOT = [
  { slug: "oranges", id: "produce:orange", world: "fresh" },
  { slug: "fresh-strawberries", id: "produce:fresh-strawberry", world: "fresh" },
  { slug: "iqf-strawberries", id: "produce:iqf-strawberry", world: "frozen" },
  { slug: "iqf-broccoli", id: "produce:iqf-broccoli", world: "frozen" },
] as const;

export function hasApprovedProductContent(id: ProduceProductId): boolean {
  const content = PRODUCT_CARD_CONTENT[id];
  return !!content && !content.clientReview.required && content.fields.length > 0 && content.fields.every((field) => !field.assumed && !field.reviewRequired && field.confidence === "HIGH" && field.sourceRefs.length > 0);
}

export const SEO_PRODUCTS = PILOT.filter((product) => hasApprovedProductContent(product.id));
export function seoProductBySlug(slug: string) {
  return SEO_PRODUCTS.find((product) => product.slug === slug);
}

export function seoProductById(id: ProduceProductId) {
  return SEO_PRODUCTS.find((product) => product.id === id);
}
