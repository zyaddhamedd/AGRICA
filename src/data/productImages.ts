import type { ProduceProductId } from "@/types/agrica";

const PRODUCT_IMAGE_BY_ID: Readonly<Partial<Record<ProduceProductId, string>>> = {
  "produce:orange": "/assets/products/fresh/oranges.avif",
  "produce:lemon": "/assets/products/fresh/lemons.avif",
  "produce:egyptian-lime": "/assets/products/fresh/egyptian-limes.avif",
  "produce:mandarin": "/assets/products/fresh/mandarins.avif",
  "produce:iqf-strawberry": "/assets/products/frozen/strawberries.avif",
  "produce:iqf-mango": "/assets/products/frozen/mango.avif",
  "produce:iqf-pomegranate-arils": "/assets/products/frozen/pomegranate-arils.avif",
  "produce:iqf-green-bean": "/assets/products/frozen/green-beans.avif",
  "produce:iqf-green-pea": "/assets/products/frozen/green-peas.avif",
  "produce:iqf-okra": "/assets/products/frozen/okra.avif",
  "produce:iqf-molokhia": "/assets/products/frozen/molokhia.avif",
  "produce:iqf-artichoke": "/assets/products/frozen/artichokes.avif",
};

export function productImageFor(productId: ProduceProductId): string | undefined {
  return PRODUCT_IMAGE_BY_ID[productId];
}
