export type WorldKey = "fresh" | "frozen" | "dried";

export interface WorldConfig {
  readonly key: WorldKey;
  readonly label: string;
  readonly title: string;
  readonly number: string;
  readonly actionText: string;
  readonly actionHref: string;
  readonly imgSrc: string;
  readonly imgAlt: string;
  readonly editorialLines: readonly [string, string];
}

export const THREE_WORLDS_LIST: readonly WorldKey[] = ["fresh", "frozen", "dried"];

export const THREE_WORLDS_DATA: Record<WorldKey, WorldConfig> = {
  fresh: {
    key: "fresh",
    label: "Fresh",
    title: "Fresh Produce",
    number: "01",
    actionText: "Explore Fresh",
    actionHref: "/products?world=fresh",
    imgSrc: "/assets/world-card-fresh.png",
    imgAlt: "Sunlit oranges growing in an Egyptian citrus orchard",
    editorialLines: [
      "Season-led Egyptian produce,",
      "selected for global export.",
    ],
  },
  frozen: {
    key: "frozen",
    label: "Frozen",
    title: "Frozen Produce",
    number: "02",
    actionText: "Explore Frozen",
    actionHref: "/products?world=frozen",
    imgSrc: "/assets/world-card-frozen.png",
    imgAlt: "Individually frozen green produce moving through a clean IQF line",
    editorialLines: [
      "IQF-controlled Egyptian produce,",
      "ready for year-round supply.",
    ],
  },
  dried: {
    key: "dried",
    label: "Dried",
    title: "Dried Produce",
    number: "03",
    actionText: "Explore Dried",
    actionHref: "/products?world=dried",
    imgSrc: "/assets/world-card-dried.png",
    imgAlt: "Citrus slices arranged on a wooden drying tray in Egypt",
    editorialLines: [
      "Naturally concentrated produce,",
      "prepared for global trade.",
    ],
  },
};
