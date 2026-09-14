const PRODUCT_IMAGE_BY_ID: Readonly<Record<string, string>> = {
  "fresh::Citrus::Oranges": "/assets/products/fresh/oranges.avif",
  "fresh::Citrus::Lemons": "/assets/products/fresh/lemons.avif",
  "fresh::Citrus::Egyptian Limes": "/assets/products/fresh/egyptian-limes.avif",
  "fresh::Citrus::Mandarins": "/assets/products/fresh/mandarins.avif",
  "fresh::Citrus::Grapefruit": "/assets/products/fresh/grapefruit.avif",
  "frozen::IQF Fruits::Strawberries": "/assets/products/frozen/strawberries.avif",
  "frozen::IQF Fruits::Mango": "/assets/products/frozen/mango.avif",
  "frozen::IQF Fruits::Pomegranate Arils": "/assets/products/frozen/pomegranate-arils.avif",
  "frozen::IQF Fruits::Guava": "/assets/products/frozen/guava.avif",
  "frozen::IQF Vegetables::Green Beans": "/assets/products/frozen/green-beans.avif",
  "frozen::IQF Vegetables::Green Peas": "/assets/products/frozen/green-peas.avif",
  "frozen::IQF Vegetables::Okra": "/assets/products/frozen/okra.avif",
  "frozen::IQF Vegetables::Molokhia": "/assets/products/frozen/molokhia.avif",
  "frozen::IQF Vegetables::Spinach": "/assets/products/frozen/spinach.avif",
  "frozen::IQF Vegetables::Artichokes": "/assets/products/frozen/artichokes.avif",
};

export function productImageFor(productId: string): string | undefined {
  return PRODUCT_IMAGE_BY_ID[productId];
}
