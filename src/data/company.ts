export interface WorkflowStep {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly mediaType: "video" | "image";
  readonly mediaSrc: string;
  readonly posterSrc?: string;
  readonly alt: string;
  readonly tags: readonly string[];
}

export interface OperationalStandard {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

export interface TeamMemberPortrait {
  readonly id: string;
  readonly number: string;
  readonly nameKey: string;
  readonly role: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
}

export interface TradeDesk {
  readonly number: string;
  readonly city: string;
  readonly country: string;
  readonly role: string;
  readonly address: string;
  readonly phone: string;
  readonly phoneHref: string;
}

export const COMPANY_HERO = {
  eyebrow: "01 / THE COMPANY",
  headlineLead: "Egyptian by origin.",
  headlineEmphasis: "discipline.",
  headlinePreEmphasis: "International by ",
  supporting:
    "AGRICA coordinates the supply of Egyptian fresh, frozen, and dried produce for international commercial buyers. We connect agricultural origin with the handling, packing, and logistical care global trade requires.",
  metadataBadges: [
    { label: "Origin", value: "Egypt" },
    { label: "Operation", value: "Produce Export" },
    { label: "Categories", value: "Fresh · Frozen · Dried" },
  ],
  videoDesktop: "/assets/hero/hero-01-origin.mp4",
  videoMobile: "/assets/hero/hero-01-origin.mp4",
  poster: "/assets/company/hero_01_origin_start_keyframe.png",
} as const;

export const COMPANY_ORIGIN = {
  eyebrow: "02 / THE LAND & GROWERS",
  headline: "Rooted in Egyptian agricultural production.",
  paragraphs: [
    "Export consistency begins at the agricultural source. AGRICA collaborates with regional Egyptian growers and agricultural networks to coordinate produce selection around optimal seasonal harvest windows.",
    "Our approach emphasizes operational discipline from harvest forward. Field coordination focuses on produce condition, careful crate handling, and staged handover into regional packing facilities.",
  ],
  principles: [
    {
      title: "Field Handling",
      description:
        "Harvested produce is transferred into dedicated crates to protect outer condition during initial field aggregation.",
    },
    {
      title: "Temperature Awareness",
      description:
        "Harvested produce is shaded and staged promptly to maintain condition prior to packing house intake.",
    },
  ],
  primaryImage: "/assets/REF_HERO/Orange Grove Harvest Portrait (1).png",
  primaryAlt: "Egyptian citrus farmer inspecting sunlit oranges in a mature orchard",
  secondaryImage: "/assets/standard_stage_01_source.jpg",
  secondaryAlt: "Close inspection of crop foliage at dawn in an Egyptian field",
} as const;

export const COMPANY_WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    id: "step-harvest",
    number: "01",
    title: "Harvest & Field Aggregation",
    summary: "Selective picking & field staging",
    description:
      "Produce is gathered into field crates and staged for transport to regional packing facilities.",
    mediaType: "video",
    mediaSrc: "/assets/hero/hero-01-origin.mp4",
    posterSrc: "/assets/company/hero_01_origin_start_keyframe.png",
    alt: "Egyptian citrus harvest and orchard origin operations",
    tags: ["Selective Harvest", "Vented Crates", "Field Intake"],
  },
  {
    id: "step-sorting",
    number: "02",
    title: "Washing & Sorting",
    summary: "Conveyor inspection & sizing",
    description:
      "Produce passes through wash lines and rolling conveyors where technicians monitor sorting, sizing, and exterior appearance.",
    mediaType: "video",
    mediaSrc: "/assets/hero/hero_02_processing_final.mp4",
    posterSrc: "/assets/company/facility_reveal.png",
    alt: "Industrial citrus washing and conveyor sorting facility in operation",
    tags: ["Conveyor Wash", "Visual Inspection", "Roller Grading"],
  },
  {
    id: "step-packing",
    number: "03",
    title: "Standardized Packing",
    summary: "Export carton placement",
    description:
      "Sorted produce is placed into standardized export cartons with protective liners suited for commercial transport.",
    mediaType: "video",
    mediaSrc: "/assets/hero/hero_03_packing_final.mp4",
    posterSrc: "/assets/standard_stage_04_pack.jpg",
    alt: "Packhouse technicians hand-packing oranges into AGRICA branded export cartons",
    tags: ["Export Cartons", "Protective Liners", "Uniform Packing"],
  },
  {
    id: "step-logistics",
    number: "04",
    title: "Palletizing & Dispatch Staging",
    summary: "Secured pallets & transport handover",
    description:
      "Cartons are palletized, stretch-wrapped for transport stability, and prepared for temperature-managed container dispatch.",
    mediaType: "video",
    mediaSrc: "/assets/hero/hero_04_shipping_final.mp4",
    posterSrc: "/assets/REF_HERO/Agrica Loading Dock Operations (1).png",
    alt: "Forklift loading wrapped pallet of AGRICA cartons into refrigerated shipping container",
    tags: ["Pallet Stretch Wrap", "Cold-Chain Staging", "Reefer Dispatch"],
  },
];

export const COMPANY_QUALITY = {
  eyebrow: "04 / OPERATIONAL STANDARDS",
  headline: "Quality supported by structured handling.",
  supporting:
    "Rather than relying on ungrounded claims, AGRICA focuses on consistent physical verification and disciplined handling across each stage of post-harvest preparation.",
  standards: [
    {
      number: "01",
      title: "Manual Defect Removal",
      description:
        "Technicians examine produce along rolling conveyors, sorting out non-conforming or blemished fruit.",
    },
    {
      number: "02",
      title: "Facility Hygiene Practices",
      description:
        "Packhouse personnel observe standard hygiene protocols, including protective hair coverings and sanitized gloves.",
    },
    {
      number: "03",
      title: "Calibrated Sizing",
      description:
        "Sorting lines categorize produce by diameter and class to ensure uniform counts per carton.",
    },
  ] as readonly OperationalStandard[],
  notice:
    "Order specifications, grade classifications, and commercial export paperwork are coordinated directly with trade partners for each consignment.",
  videoSrc: "/assets/hero/u2-the-standard.mp4",
  videoPoster: "/assets/company/human_qc.png",
  videoAlt: "Gloved quality inspector examining freshly sorted orange on inspection tray",
} as const;

export const COMPANY_TEAM: readonly TeamMemberPortrait[] = [
  {
    id: "grower",
    number: "01",
    nameKey: "Partner Grower",
    role: "Orchard & Farm Partnerships",
    description: "Coordinating seasonal varieties and harvest windows with AGRICA.",
    imageSrc: "/assets/REF_HERO/Orange Grove Harvest Portrait (1).png",
    imageAlt: "Egyptian farmer inspecting citrus fruit on the tree",
  },
  {
    id: "harvest",
    number: "02",
    nameKey: "Harvest Lead",
    role: "Field Collection",
    description: "Supervising selective picking and orchard crate transfer.",
    imageSrc: "/assets/REF_HERO/AGRICA Orange Grove Harvest Worker.png",
    imageAlt: "Field harvest specialist carrying crate of oranges",
  },
  {
    id: "inspection",
    number: "03",
    nameKey: "Quality Inspector",
    role: "Conveyor Inspection",
    description: "Monitoring sorting lines and grading consistency.",
    imageSrc: "/assets/REF_HERO/Citrus Sorting Line Worker.png",
    imageAlt: "QC technician inspecting rolling oranges on sorting belt",
  },
  {
    id: "warehouse",
    number: "04",
    nameKey: "Facility Handler",
    role: "Palletizing & Staging",
    description: "Securing pallets and coordinating cold-room staging.",
    imageSrc: "/assets/REF_HERO/AGRICA Warehouse Loading Scene.png",
    imageAlt: "Logistics specialist pulling pallet jack loaded with AGRICA cartons",
  },
  {
    id: "export",
    number: "05",
    nameKey: "Logistics Officer",
    role: "Commercial Coordination",
    description: "Liaising with freight forwarders and destination trade desks.",
    imageSrc: "/assets/REF_HERO/Agrica Loading Dock Operations (1).png",
    imageAlt: "Logistics officer signaling forklift container loading at export dock",
  },
];

export const COMPANY_LOGISTICS = {
  eyebrow: "06 / EXPORT PREPARATION",
  headline: "Prepared for international transit.",
  supporting:
    "Long-haul maritime and land transit requires structured packaging and coordinated transfer. AGRICA prepares consignments to maintain product condition throughout the journey.",
  pillars: [
    {
      title: "Export Packaging",
      description:
        "Corrugated packaging specifications selected to protect fresh produce during commercial transit.",
    },
    {
      title: "Pallet Integrity",
      description:
        "Standardized pallet stacking and stretch wrapping to maintain load stability during transit.",
    },
    {
      title: "Cold-Chain Staging",
      description:
        "Staging in temperature-managed environments prior to container loading.",
    },
  ],
  videoSrc: "/assets/hero/hero_04_shipping_final.mp4",
  videoPoster: "/assets/REF_HERO/Agrica Loading Dock Operations (1).png",
  videoAlt: "Forklift loading palletized AGRICA citrus cartons into refrigerated ocean shipping container",
  tradeDesks: [
    {
      number: "01",
      city: "Cairo",
      country: "Egypt",
      role: "Headquarters & Commercial Coordination",
      address:
        "Building No. 41, Heliopolis Gardens, First Floor, Sheraton – El Nozha, Cairo, Egypt",
      phone: "+20 106 168 0854",
      phoneHref: "tel:+201061680854",
    },
    {
      number: "02",
      city: "Calgary",
      country: "Canada",
      role: "North America Desk",
      address: "PO Box 381 Station M, Calgary, AB, T2P 2H9, Canada",
      phone: "+1 587 917 4538",
      phoneHref: "tel:+15879174538",
    },
    {
      number: "03",
      city: "Den Haag",
      country: "The Netherlands",
      role: "European Trade Desk",
      address: "Lange Beestenmarkt, 2512 EG Den Haag, The Netherlands",
      phone: "+31 6 47 29 69 78",
      phoneHref: "tel:+31647296978",
    },
  ] as readonly TradeDesk[],
} as const;

export const COMPANY_CTA = {
  eyebrow: "07 / TRADE ENQUIRY",
  headline: "Start an export conversation with AGRICA.",
  supporting:
    "Connect directly with our commercial team to discuss seasonal produce availability, custom packaging specifications, or container allocations for your market.",
  primaryAction: "SUBMIT A TRADE ENQUIRY",
  primaryHref: "/#trade",
  secondaryAction: "VIEW PRODUCE CATALOGUE",
  secondaryHref: "/products",
} as const;
