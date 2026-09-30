import type { ProduceProductId } from "@/types/agrica";

const PRODUCT_IMAGE_BY_ID: Readonly<Partial<Record<ProduceProductId, string>>> = {
  "produce:orange": "/assets/products/fresh/oranges-luminous-preview.avif",
  "produce:lemon": "/assets/products/fresh/lemons-final.avif",
  "produce:egyptian-lime": "/assets/products/fresh/egyptian-limes-final.avif",
  "produce:mandarin": "/assets/products/fresh/mandarins-final.avif",
  "produce:pomegranate": "/assets/products/fresh/pomegranates-final.avif",
  "produce:fresh-strawberry": "/assets/products/fresh/strawberries-final.avif",
  "produce:blueberry": "/assets/products/fresh/blueberries-final.avif",
  "produce:fresh-mango": "/assets/products/fresh/mangoes-final.avif",
  "produce:guava": "/assets/products/fresh/guava-final.avif",
  "produce:date": "/assets/products/fresh/dates-final.avif",
  "produce:watermelon": "/assets/products/fresh/watermelon-final.avif",
  "produce:potato": "/assets/products/fresh/potatoes-final.avif",
  "produce:sweet-potato": "/assets/products/fresh/sweet-potatoes-final.avif",
  "produce:onion": "/assets/products/fresh/onions.avif",
  "produce:garlic": "/assets/products/fresh/garlic.avif",
  "produce:fresh-green-bean": "/assets/products/fresh/green-beans.avif",
  "produce:fresh-artichoke": "/assets/products/fresh/artichokes.avif",
  "produce:carrot": "/assets/products/fresh/carrots-final.avif",
  "produce:taro": "/assets/products/fresh/taro-final.avif",
  "produce:iqf-strawberry": "/assets/products/frozen/strawberries-final.avif",
  "produce:iqf-mango": "/assets/products/frozen/mango-final.avif",
  "produce:iqf-pomegranate-arils": "/assets/products/frozen/pomegranate-arils-final.avif",
  "produce:iqf-green-bean": "/assets/products/frozen/green-beans-final.avif",
  "produce:iqf-green-pea": "/assets/products/frozen/green-peas-validation.avif",
  "produce:iqf-okra": "/assets/products/frozen/okra-final.avif",
  "produce:iqf-molokhia": "/assets/products/frozen/molokhia-final.avif",
  "produce:iqf-artichoke": "/assets/products/frozen/artichokes-final.avif",
  "produce:iqf-broccoli": "/assets/products/frozen/broccoli-final.avif",
  "produce:mixed-vegetables": "/assets/products/frozen/mixed-vegetables-final.avif",
  "produce:half-fried-french-fries": "/assets/products/frozen/pre-fried-french-fries-final.avif",
  "produce:raisin": "/assets/products/dried/raisins-final.avif",
  "produce:dried-molokhia": "/assets/products/dried/dried-molokhia-final.avif",
  "produce:dried-lemon": "/assets/products/dried/dried-lemon-final.avif",
  "produce:sun-dried-tomato": "/assets/products/dried/sun-dried-tomatoes-final.avif",
  "produce:dehydrated-onion": "/assets/products/dried/dehydrated-onion-flakes-final.avif",
  "produce:dehydrated-garlic": "/assets/products/dried/dehydrated-garlic-flakes-final.avif",
};

export function productImageFor(productId: ProduceProductId): string | undefined {
  return PRODUCT_IMAGE_BY_ID[productId];
}
