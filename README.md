# AGRICA — One Origin. Three Worlds.

> From Egyptian soil, AGRICA reaches the world.

A premium, interactive digital brand experience for **AGRICA**, showcasing Egypt's agricultural origin across three core commercial categories: **Fresh Produce**, **IQF Frozen**, and **Dried Range**.

---

## ✨ Features & Interactive Highlights

- **Editorial Hero Section**:
  - Continuous GSAP horizontal marquee video ribbons with seamless looping.
  - Masked typography reveal sequence for the AGRICA brand statement.
  - Floating utilitarian navigation bar with custom backdrop treatment.
  - Atmospheric drifting botanical background assets (`s1`, `s2`, `s3`).

- **Mobile Hero → Three Worlds Live-Preview Transition**:
  - Live React preview window in Row 2 running an automated living film demonstration (cycling through Fresh, Frozen, and Dried every 5.5s with internal card stack autoplay).
  - Pinned GSAP ScrollTrigger transition (`scrub: 1.35`) smoothly expanding the compact `5 / 6` preview frame into the full viewport.
  - Freezes automated category cycling during user entry to lock the destination state.
  - Seamless document-flow handoff to the interactive Three Worlds section with zero flash, zero layout jump, and zero category reset.

- **Three Worlds Interactive System**:
  - **OptionWheel**: Custom 3D curved typography selector with smooth inertia and touch/drag controls.
  - **Card Stack**: Multi-card rotating visual stack driven by the active category, featuring touch-swipe and auto-cycle disciplines.
  - **Dynamic Theme Accents**: World-specific editorial color systems:
    - **Fresh**: `#50A010` (AGRICA Green)
    - **Frozen**: `#287B9C` (Cold-Chain Cyan)
    - **Dried**: `#B66E28` (Sun-cured Amber)

- **Synchronized State Architecture**:
  - Lightweight pub/sub reactive store (`useSharedWorld`) keeping the preview and destination sections 100% synchronized in real time.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animation & Physics**:
  - [GSAP 3](https://greensock.com/gsap/) with [ScrollTrigger](https://greensock.com/scrolltrigger/)
  - [Motion (Framer Motion)](https://motion.dev/)
- **Styling**: Vanilla CSS Design Tokens (Warm Paper `#F3F1E8`, Deep Twilight `#000E1E`, AGRICA Navy `#002050`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or later
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/zyaddhamedd/AGRICA.git

# Navigate to project directory
cd AGRICA

# Install dependencies
npm install
```

### Development Server

```bash
# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Production Build

```bash
# Typecheck and build for production
npm run build

# Start production server
npm run start
```

---

## 📁 Project Structure

```text
├── public/
│   └── assets/             # Brand videos, botanical PNGs, SVG masks
├── src/
│   ├── app/                # Next.js App Router pages & layout
│   ├── components/
│   │   ├── common/         # GlobalMenu, SiteHeader, SiteFooter
│   │   └── home/           # HeroSection, ThreeWorldsSection, OptionWheel, Stack, etc.
│   ├── data/               # Three Worlds data models & shared reactive store
│   ├── styles/             # Global CSS design system & typography tokens
│   └── types/              # TypeScript definitions
├── AGENTS.md               # Agent guidelines
└── tsconfig.json           # TypeScript configuration
```

---

## 📄 License

Private commercial repository. All rights reserved by AGRICA.
