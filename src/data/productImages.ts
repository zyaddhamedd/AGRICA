import type { ProduceProductId } from "@/types/agrica";

const PRODUCT_IMAGE_BY_ID: Readonly<Partial<Record<ProduceProductId, string>>> = {
  "produce:orange": "/assets/products/fresh/oranges-profile.avif",
  "produce:lemon": "/assets/products/fresh/lemons-profile.avif",
  "produce:egyptian-lime": "/assets/products/fresh/egyptian-limes-profile.avif",
  "produce:grapefruit": "/assets/products/fresh/grapefruit.avif",
  "produce:mandarin": "/assets/products/fresh/mandarins-profile.avif",
  "produce:grape": "/assets/products/fresh/grapes-profile.avif",
  "produce:pomegranate": "/assets/products/fresh/pomegranates-profile.avif",
  "produce:fresh-strawberry": "/assets/products/fresh/strawberries-profile.avif",
  "produce:blueberry": "/assets/products/fresh/blueberries-profile.avif",
  "produce:fresh-mango": "/assets/products/fresh/mangoes-profile.avif",
  "produce:guava": "/assets/products/fresh/guava-profile.avif",
  "produce:date": "/assets/products/fresh/dates-profile.avif",
  "produce:watermelon": "/assets/products/fresh/watermelon-profile.avif",
  "produce:potato": "/assets/products/fresh/potatoes-profile.avif",
  "produce:sweet-potato": "/assets/products/fresh/sweet-potatoes-profile.avif",
  "produce:onion": "/assets/products/fresh/onions-profile.avif",
  "produce:garlic": "/assets/products/fresh/garlic-profile.avif",
  "produce:fresh-green-bean": "/assets/products/fresh/green-beans-profile.avif",
  "produce:fresh-artichoke": "/assets/products/fresh/artichokes-profile.avif",
  "produce:carrot": "/assets/products/fresh/carrots-profile.avif",
  "produce:taro": "/assets/products/fresh/taro-profile.avif",
  "produce:iqf-strawberry": "/assets/products/frozen/strawberries-profile.avif",
  "produce:iqf-mango": "/assets/products/frozen/mango-profile.avif",
  "produce:iqf-pomegranate-arils": "/assets/products/frozen/pomegranate-arils-profile.avif",
  "produce:iqf-green-bean": "/assets/products/frozen/green-beans-profile.avif",
  "produce:iqf-green-pea": "/assets/products/frozen/green-peas-profile.avif",
  "produce:iqf-okra": "/assets/products/frozen/okra-profile.avif",
  "produce:iqf-molokhia": "/assets/products/frozen/molokhia-profile.avif",
  "produce:iqf-artichoke": "/assets/products/frozen/artichokes-profile.avif",
  "produce:iqf-broccoli": "/assets/products/frozen/broccoli-profile.avif",
  "produce:mixed-vegetables": "/assets/products/frozen/mixed-vegetables-profile.avif",
  "produce:half-fried-french-fries": "/assets/products/frozen/french-fries-profile.avif",
};

export function productImageFor(productId: ProduceProductId): string | undefined {
  return PRODUCT_IMAGE_BY_ID[productId];
}
