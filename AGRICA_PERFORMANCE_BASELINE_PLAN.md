# AGRICA — Performance Baseline Measurement Plan

> **Companion Document to:** `AGRICA_PERFORMANCE_MASTER_PLAN.md`  
> **Purpose:** Detailed, repeatable measurement methodology covering production builds, mobile and desktop network profiles, route benchmarks, and before/after comparisons.  
> **Status:** APPROVED METHODOLOGY — READY FOR EXECUTION

---

## 1. Measurement Principles & Environment Definition

To ensure scientific accuracy and eliminate development-mode distortions, all baseline and post-optimization measurements must be conducted under strict, repeatable conditions.

### 1.1 Environment Requirements
- **Build Mode:** Production only (`NODE_ENV=production`, `next build`). Never benchmark against `next dev`.
- **Runtime Port:** Use dedicated port `3005` (`next start -p 3005`) to isolate benchmarking from any active development session on port `3000`.
- **Network Profiling:**
  - **Unthrottled Local Baseline:** Measures raw server execution speed, TTFB, and document parsing.
  - **Simulated Mobile 4G Profile:** 4 Mbps download, 3 Mbps upload, 40 ms round-trip latency.
  - **Simulated Desktop Cable/Broadband:** 30 Mbps download, 15 Mbps upload, 10 ms round-trip latency.
- **Device Emulation Profiles:**
  - **Desktop:** Viewport 1440×900, Device Scale Factor 1.0.
  - **Mobile:** Viewport 390×844 (iPhone 14/15 profile), Device Scale Factor 3.0, Touch Emulation enabled.

---

## 2. Repeatable Benchmark Execution Procedure

### Step 1: Execute Production Build
```powershell
npm run build
```
Verify terminal output confirms build status and inspect the Route Manifest table:
- Identify static prerendered routes (`● SSG`)
- Identify dynamic server-rendered routes (`ƒ Dynamic`)

### Step 2: Start Dedicated Production Server
```powershell
npx next start -p 3005
```

### Step 3: Run Automated HTTP Route Benchmarking
Run the standardized Node.js benchmark script against port `3005`. The script executes:
1. One warmup run across all routes to prime disk caches and server processes.
2. Two measurement iterations measuring exact Time to First Byte (TTFB), total response time, HTML payload bytes, and HTTP response headers.

```javascript
// Reference methodology from scratch/perf_bench.mjs
const routes = [
  "/en",
  "/en/products",
  "/en/products?world=fresh",
  "/en/products?world=frozen",
  "/en/standard",
  "/en/company",
  "/en/herbs-spices",
  "/en/herbs-spices/products",
  "/en/herbs-spices/standard",
  "/ar",
  "/ru",
];
```

### Step 4: Run Browser Runtime Metrics Collection
Using the automated browser CDP socket or Puppeteer/Playwright:
1. Navigate to target routes.
2. Query Navigation Timing API:
   ```javascript
   const nav = performance.getEntriesByType('navigation')[0];
   const ttfb = nav.responseStart - nav.requestStart;
   const dcl = nav.domContentLoadedEventEnd - nav.startTime;
   const load = nav.loadEventEnd - nav.startTime;
   ```
3. Query Resource Timing API:
   ```javascript
   const resources = performance.getEntriesByType('resource');
   const totalTransferBytes = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
   ```
4. Query Paint and DOM metrics:
   ```javascript
   const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
   const domNodes = document.querySelectorAll('*').length;
   ```

### Step 5: Terminate Port 3005 Server
Cancel or terminate the `next start -p 3005` process immediately upon benchmark completion.

---

## 3. Master Metric Recording Tables

### 3.1 Initial Verified Baseline (Recorded Prior to Phase 1)

| Route | Render Type | Measured TTFB (Local) | HTML Size | HTTP Cache Header | Videos Mounted | Images Count | DOM Node Count |
| :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: |
| `/en` (Home) | `● SSG` | **9.5 ms** | 109.4 KB | `s-maxage=31536000` | 5 | 38 | 342 |
| `/en/products` | `ƒ Dynamic` | **109.0 ms** | 173.3 KB | `private, no-cache, no-store` | 0 | 32 | **588** |
| `/en/products?world=fresh` | `ƒ Dynamic` | **71.1 ms** | 173.3 KB | `private, no-cache, no-store` | 0 | 32 | **588** |
| `/en/products?world=frozen` | `ƒ Dynamic` | **88.3 ms** | 136.0 KB | `private, no-cache, no-store` | 0 | 22 | 442 |
| `/en/standard` | `● SSG` | **10.5 ms** | 58.7 KB | `s-maxage=31536000` | 0 | 8 | 198 |
| `/en/company` | `● SSG` | **8.2 ms** | 82.7 KB | `s-maxage=31536000` | **8** | 9 | 284 |
| `/en/herbs-spices` | `● SSG` | **9.8 ms** | 113.5 KB | `s-maxage=31536000` | 0 | 36 | 315 |
| `/en/herbs-spices/products`| `ƒ Dynamic` | **42.9 ms** | 121.9 KB | `private, no-cache, no-store` | 0 | 14 | 260 |
| `/en/herbs-spices/standard`| `● SSG` | **8.7 ms** | 64.4 KB | `s-maxage=31536000` | 0 | 8 | 185 |
| `/ar` (Arabic Home) | `● SSG` | **9.3 ms** | 119.8 KB | `s-maxage=31536000` | 5 | 38 | 342 |
| `/ru` (Russian Home) | `● SSG` | **11.2 ms** | 125.8 KB | `s-maxage=31536000` | 5 | 38 | 342 |

### 3.2 Media & Resource Weight Baseline

| Component / Section | Asset Names | Current Format | Current Aggregate Payload | Target Format | Target Payload | Target Savings |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hero Posters (Homepage)** | `hero_02_processing_poster.png`, `hero_03_packing_poster.png`, `Agrica Loading Dock Operations (1).png` | Raw PNG | **7.12 MB** | AVIF / WebP | **< 160 KB** | **-97.7%** |
| **Hero Background & Decor** | `hero-bg.jpg`, `s1.png`, `s2.png`, `s3.png` | JPG / PNG | **2.23 MB** | AVIF / WebP | **< 180 KB** | **-91.9%** |
| **Certificates Loop** | 8 `ChatGPT Image...` certificate PNGs in `public/certificates/` | Raw PNG | **8.59 MB** | WebP Thumbnails | **< 96 KB** | **-98.8%** |
| **Company Page Posters** | `facility_reveal.png`, `hero_01_origin_start_keyframe.png`, `human_qc.png`, `sizing_completion.png` | Raw PNG | **9.14 MB** | AVIF / WebP | **< 200 KB** | **-97.8%** |
| **Products Atlas Grid DOM** | Double-face card nodes (`ProductCardBack` + `ProductSpecTable`) | DOM nodes | **588 nodes** | Single-face Front | **< 320 nodes** | **-45.6%** |
| **Products Route TTFB** | `/[lang]/products` Page SSR | Dynamic SSR | **71–109 ms** | Static `● SSG` | **< 15 ms** | **-85.0%** |

---

## 4. Before vs. After Target Comparison Matrix

| Evaluation Dimension | Metric | Baseline (Measured) | Target (Post-All Phases) | Acceptance Gate |
| :--- | :--- | :---: | :---: | :---: |
| **Network Payload** | Initial Homepage Media Payload | **9.35 MB** | **< 450 KB** | > 90% reduction |
| **Network Payload** | Quality Documentation Certificates | **8.59 MB** | **< 100 KB** | > 98% reduction |
| **Rendering Architecture**| Products Route Rendering Mode | `ƒ Dynamic` | `● SSG` | Confirmed by build output |
| **Server Response** | Products Route Local TTFB | **109.0 ms** | **< 15.0 ms** | Verified via HTTP test |
| **DOM Complexity** | Products Page Total DOM Nodes | **588 nodes** | **< 320 nodes** | Document node count |
| **Main Thread / Memory** | Company Page Active Video Elements | 8 concurrent | 1 active (viewport-gated) | Zero mobile CPU lag |
| **Functional Parity** | Automated Test Pass Rate | 100% | **100%** | Zero regression |
| **Localization Parity** | 5-Language & Arabic RTL Accuracy | Complete | **Complete** | Visual & functional QA |

---
*End of Performance Baseline Measurement Plan.*
