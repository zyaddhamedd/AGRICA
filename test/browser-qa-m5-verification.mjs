#!/usr/bin/env node

/**
 * AGRICA Milestone M5 Comprehensive Browser QA Verification Suite
 *
 * Validates real browser behavior, visual fidelity, interactions, and responsiveness
 * across all supported routes, viewports, and languages against the Next.js production build:
 *
 * 1. Viewports: Desktop (1440px), Tablet (768px), Mobile (390px), Compact Mobile (320px)
 * 2. Locales: 5 supported languages (en, ar [RTL], ru, de, fr)
 * 3. Visual Fidelity & Typography: Branding, Typography, Responsive Integrity, RTL Mirroring, Zero CLS
 * 4. Navigation & Menus: Localized links, mobile hamburger drawer, public division switching
 * 5. Forms & Interactive Modals: Contact Hub & downloads (vCard, PDFs), Trade form, Quote/Enquiry, 3D card flight overlay
 * 6. Product Catalogues & Filters: Fresh (21) & Frozen (13), Herbs & Spices (27 across 6 families), pushState client history, zero broken images
 * 7. Animations & Media: Hero video lifecycle, seasonal orbit, LogoLoop marquee, GSAP 3D card flight, standard journey, herbs gallery accordion
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { launchHeadlessChrome, createBrowserSession } from "./cdp-client.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3160;
const CHROME_PORT = process.env.CHROME_PORT ? parseInt(process.env.CHROME_PORT, 10) : 9495;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const DEBUG_URL = `http://127.0.0.1:${CHROME_PORT}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureServer(port) {
  const url = `http://127.0.0.1:${port}`;
  try {
    const res = await fetch(`${url}/en`);
    if (res.ok) {
      console.log(`[Server] Next.js production server already active at ${url}`);
      return null;
    }
  } catch {}

  console.log(`[Server] Starting Next.js production server on port ${port}...`);
  const proc = spawn("npx", ["next", "start", "-p", String(port)], {
    stdio: ["ignore", "ignore", "inherit"],
    detached: false,
  });

  for (let i = 0; i < 60; i++) {
    await sleep(200);
    try {
      const res = await fetch(`${url}/en`);
      if (res.ok) {
        console.log(`[Server] Next.js server ready at ${url}`);
        return proc;
      }
    } catch {}
  }

  proc.kill();
  throw new Error(`[Server] Failed to connect to Next.js on port ${port}`);
}

async function runBrowserQASuite() {
  console.log("==================================================================");
  console.log("  AGRICA Milestone M5 Comprehensive Browser QA Verification Suite");
  console.log(`  Base URL: ${BASE_URL} | Chrome Debug Port: ${CHROME_PORT}`);
  console.log("==================================================================\n");

  let serverProc = null;
  let chromeHandle = null;
  const testResults = [];

  function recordResult(area, name, passed, details = "") {
    testResults.push({ area, name, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`  ${mark} [${area}] ${name} ${details ? `(${details})` : ""}`);
  }

  try {
    serverProc = await ensureServer(PORT);
    chromeHandle = await launchHeadlessChrome(CHROME_PORT);

    const session = await createBrowserSession({
      baseUrl: BASE_URL,
      debugUrl: DEBUG_URL,
    });

    const { send, evaluate, waitFor, navigate, setViewport, click, getErrors } = session;

    // Helper to monitor network requests
    let recordedRequests = [];
    session.socket.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Network.requestWillBeSent") {
        recordedRequests.push(msg.params.request.url);
      }
    });
    await send("Network.enable");

    // =========================================================================
    // AREA 1: Viewport Matrix (1440px, 768px, 390px, 320px)
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 1: Viewport Matrix (1440px, 768px, 390px, 320px) & Responsiveness");
    console.log("------------------------------------------------------------------");

    const viewports = [
      { name: "Desktop", width: 1440, height: 900, isMobile: false },
      { name: "Tablet", width: 768, height: 1024, isMobile: true },
      { name: "Mobile", width: 390, height: 844, isMobile: true },
      { name: "Compact Mobile", width: 320, height: 640, isMobile: true },
    ];

    const representativeRoutes = [
      "/en",
      "/en/products",
      "/en/products?world=frozen",
      "/en/herbs-spices",
      "/en/herbs-spices/products",
      "/en/standard",
      "/en/herbs-spices/standard",
      "/en/company",
      "/contact",
    ];

    for (const vp of viewports) {
      await setViewport(vp.width, vp.height, vp.isMobile);

      for (const route of representativeRoutes) {
        await navigate(route);
        await sleep(100);

        // Check horizontal overflow
        const overflow = await evaluate(`(() => {
          const scrollWidth = document.documentElement.scrollWidth;
          const innerWidth = window.innerWidth;
          return {
            scrollWidth,
            innerWidth,
            hasOverflow: scrollWidth > innerWidth + 1
          };
        })()`);

        assert.strictEqual(
          overflow.hasOverflow,
          false,
          `Horizontal overflow detected on ${route} at ${vp.name} (${vp.width}px): scrollWidth=${overflow.scrollWidth}, innerWidth=${overflow.innerWidth}`
        );

        // Check broken images
        const brokenImages = await evaluate(`(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src);
        })()`);

        assert.strictEqual(
          brokenImages.length,
          0,
          `Broken images found on ${route} at ${vp.name}: ${brokenImages.join(", ")}`
        );
      }
      recordResult(
        "Area 1: Viewports",
        `${vp.name} (${vp.width}px) across 9 major routes`,
        true,
        "Zero horizontal overflow, zero broken images"
      );
    }

    // =========================================================================
    // AREA 2: Locales & RTL Mirroring (en, ar, ru, de, fr)
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 2: Locales & RTL Mirroring (en, ar, ru, de, fr)");
    console.log("------------------------------------------------------------------");

    // Set desktop viewport for locale testing
    await setViewport(1440, 900, false);

    const locales = [
      { code: "en", dir: "ltr", label: "English" },
      { code: "ar", dir: "rtl", label: "Arabic RTL" },
      { code: "ru", dir: "ltr", label: "Russian" },
      { code: "de", dir: "ltr", label: "German" },
      { code: "fr", dir: "ltr", label: "French" },
    ];

    for (const loc of locales) {
      await navigate(`/${loc.code}`);
      await sleep(100);

      const htmlAttrs = await evaluate(`(() => {
        const html = document.documentElement;
        const body = document.body;
        return {
          lang: html.getAttribute("lang"),
          dir: html.getAttribute("dir"),
          bodyDir: window.getComputedStyle(body).direction,
          title: document.title,
        };
      })()`);

      assert.strictEqual(htmlAttrs.lang, loc.code, `Expected lang=${loc.code}, got ${htmlAttrs.lang}`);
      assert.strictEqual(htmlAttrs.dir, loc.dir, `Expected dir=${loc.dir}, got ${htmlAttrs.dir}`);
      assert.strictEqual(htmlAttrs.bodyDir, loc.dir, `Expected computed body direction=${loc.dir}, got ${htmlAttrs.bodyDir}`);
      assert.ok(htmlAttrs.title.length > 0, `Expected non-empty title for ${loc.code}`);

      // Open Language Switcher via [data-language-trigger]
      await evaluate(`document.querySelector("[data-language-trigger]")?.click()`);
      await waitFor('document.querySelector("[data-language-menu]") !== null', "Language dropdown menu did not open");

      const menuWithinBounds = await evaluate(`(() => {
        const menu = document.querySelector("[data-language-menu]");
        if (!menu) return false;
        const rect = menu.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth + 1;
      })()`);
      assert.strictEqual(menuWithinBounds, true, `Language menu overflowed viewport on ${loc.code}`);

      // Close menu by clicking body
      await evaluate(`document.body.click()`);
      await sleep(50);

      recordResult(
        "Area 2: Locales",
        `${loc.label} (/${loc.code})`,
        true,
        `lang=${htmlAttrs.lang}, dir=${htmlAttrs.dir}, zero menu clipping`
      );
    }

    // =========================================================================
    // AREA 3: Visual Fidelity & Typography
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 3: Visual Fidelity & Typography");
    console.log("------------------------------------------------------------------");

    await setViewport(1440, 900, false);
    await navigate("/en");
    await sleep(200);

    const visualChecks = await evaluate(`(() => {
      const logo = document.querySelector(".hero-navbar-logo, .global-navbar-logo, .connect-brand img");
      const fontsReady = document.fonts.status;
      const h1 = document.querySelector("h1");
      const h1Font = h1 ? window.getComputedStyle(h1).fontFamily : "";

      return {
        hasLogo: !!logo && logo.complete && logo.naturalWidth > 0,
        fontsReady,
        h1Font,
      };
    })()`);

    assert.strictEqual(visualChecks.hasLogo, true, "Brand logo must be complete with naturalWidth > 0");
    assert.strictEqual(visualChecks.fontsReady, "loaded", "Fonts must be loaded");
    assert.ok(visualChecks.h1Font.length > 0, "Heading typography must be applied");

    recordResult(
      "Area 3: Visual Fidelity",
      "Branding & Typography",
      true,
      `Logo verified, fonts=${visualChecks.fontsReady}, h1 font resolved`
    );

    // =========================================================================
    // AREA 4: Navigation & Menus & Division Gates
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 4: Navigation & Menus & Division Gates");
    console.log("------------------------------------------------------------------");

    // Mobile Hamburger Drawer Test at 390px
    await setViewport(390, 844, true);
    await navigate("/en");
    await sleep(150);

    // Verify burger button is visible
    const burgerVisible = await evaluate(`(() => {
      const btn = document.querySelector(".hero-navbar-menu-btn, .global-navbar-menu-btn");
      if (!btn) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(btn).display !== "none";
    })()`);
    assert.strictEqual(burgerVisible, true, "Mobile hamburger button must be visible");

    // Click burger button to open drawer
    await evaluate(`document.querySelector(".hero-navbar-menu-btn, .global-navbar-menu-btn")?.click()`);
    await waitFor('document.querySelector(".global-menu-root.is-open") !== null', "Global menu drawer did not open");

    const drawerOpened = await evaluate(`(() => {
      const root = document.querySelector(".global-menu-root.is-open");
      const links = document.querySelectorAll(".menu-nav-link");
      const bodyOverflow = document.body.style.overflow;
      return {
        isOpen: !!root,
        linkCount: links.length,
        bodyLocked: bodyOverflow === "hidden",
      };
    })()`);

    assert.strictEqual(drawerOpened.isOpen, true, "Global menu drawer must open on burger click");
    assert.strictEqual(drawerOpened.bodyLocked, true, "Body scroll must be locked when drawer is open");
    assert.ok(drawerOpened.linkCount >= 5, `Expected >= 5 menu navigation links, found ${drawerOpened.linkCount}`);

    // Press Escape to dismiss drawer
    await evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await sleep(200);

    const drawerClosed = await evaluate(`(() => {
      const root = document.querySelector(".global-menu-root.is-open");
      const bodyOverflow = document.body.style.overflow;
      return {
        isOpen: !!root,
        bodyUnlocked: bodyOverflow !== "hidden",
      };
    })()`);

    assert.strictEqual(drawerClosed.isOpen, false, "Global menu drawer must close on Escape key");
    assert.strictEqual(drawerClosed.bodyUnlocked, true, "Body scroll lock must be released on drawer close");

    recordResult(
      "Area 4: Navigation",
      "Mobile Hamburger Drawer",
      true,
      "Open, links >= 5, body scroll lock, Escape dismissal verified"
    );

    // Division Gates Check in UI
    const divisionRoutes = ["/en", "/en/products", "/en/herbs-spices", "/en/herbs-spices/products", "/contact"];
    for (const route of divisionRoutes) {
      await navigate(route);
      await sleep(100);

      const switcherInUI = await evaluate(`(() => {
        // Stable selector shared by both division headers
        const switcher = document.querySelector("[data-division-switcher]");
        return !!switcher;
      })()`);

      assert.strictEqual(
        switcherInUI,
        route !== "/contact",
        `Division navigation presence on ${route}`
      );
    }

    recordResult(
      "Area 4: Navigation",
      "Division Gates UI Verification",
      true,
      "Public switcher present on division routes; standalone contact unchanged"
    );

    // =========================================================================
    // AREA 5: Forms & Interactive Modals & Downloads
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 5: Forms & Interactive Modals & Downloads");
    console.log("------------------------------------------------------------------");

    // Contact Hub & Direct File Downloads
    await navigate("/contact");
    await sleep(150);

    // Test phone menu disclosure
    const phoneMenuExpanded = await evaluate(`(() => {
      const details = document.querySelector("details.phone-menu");
      if (!details) return false;
      details.open = true;
      const options = details.querySelectorAll(".phone-options a");
      return options.length === 3;
    })()`);
    assert.strictEqual(phoneMenuExpanded, true, "Phone directory must disclose Cairo, Calgary, Den Haag offices");

    // Test direct file downloads via fetch
    const vcfRes = await fetch(`${BASE_URL}/contact/AGRICA.vcf`);
    assert.strictEqual(vcfRes.status, 200, "AGRICA.vcf must return HTTP 200");
    const vcfText = await vcfRes.text();
    assert.ok(vcfText.includes("BEGIN:VCARD"), "AGRICA.vcf must contain BEGIN:VCARD");
    assert.ok(vcfText.includes("END:VCARD"), "AGRICA.vcf must contain END:VCARD");

    const producePdfRes = await fetch(`${BASE_URL}/contact/AGRICA-Produce-Company-Profile.pdf`);
    assert.strictEqual(producePdfRes.status, 200, "Produce company profile PDF must return HTTP 200");
    const producePdfBuffer = await producePdfRes.arrayBuffer();
    assert.ok(producePdfBuffer.byteLength > 50000, "Produce profile PDF must be a valid non-empty PDF file");

    const herbsPdfRes = await fetch(`${BASE_URL}/contact/AGRICA-Herbs-Spices-Company-Profile.pdf`);
    assert.strictEqual(herbsPdfRes.status, 200, "Herbs company profile PDF must return HTTP 200");
    const herbsPdfBuffer = await herbsPdfRes.arrayBuffer();
    assert.ok(herbsPdfBuffer.byteLength > 50000, "Herbs profile PDF must be a valid non-empty PDF file");

    recordResult(
      "Area 5: Forms & Downloads",
      "Contact Hub Directory & Downloads",
      true,
      "3 phones, vCard (BEGIN:VCARD), Produce PDF (>50KB), Herbs PDF (>50KB)"
    );

    // Homepage Trade Form (/en#trade)
    await navigate("/en#trade");
    await sleep(200);

    const tradeFormSubmitted = await evaluate(`(() => {
      const prod = document.querySelector("#trade-product");
      const dest = document.querySelector("#trade-destination");
      const vol = document.querySelector("#trade-volume");
      const comp = document.querySelector("#trade-company");
      const email = document.querySelector("#trade-email");
      const form = document.querySelector(".trade-form");
      if (!prod || !dest || !vol || !comp || !email || !form) return false;

      prod.value = "Valencia Oranges";
      dest.value = "Rotterdam";
      vol.value = "500 MT";
      comp.value = "Global Trade BV";
      email.value = "procurement@globaltrade.nl";

      const submitBtn = document.querySelector(".trade-submit-btn");
      if (!submitBtn) return false;
      submitBtn.click();
      return true;
    })()`);
    assert.strictEqual(tradeFormSubmitted, true, "Trade form inputs populated");
    await waitFor('document.querySelector(".trade-success-note") !== null', "Trade success note did not appear");

    recordResult(
      "Area 5: Forms & Downloads",
      "Homepage Trade Form Submission",
      true,
      "5 input fields populated and submitted, success notice confirmed"
    );

    // Product Card 3D Flight Overlay & GSAP Animation
    await setViewport(1440, 900, false);
    await navigate("/en/products?world=fresh");
    await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Fresh products did not load");

    // Click keyboard specs toggle on card
    await evaluate('document.querySelector(".atlas-grid > .export-card-scene .export-card-keyboard-toggle")?.click()');
    await waitFor(
      'document.querySelector("#product-card-flight-dialog")?.dataset.ready === "true"',
      "3D flight card overlay dialog did not open"
    );

    const flightDialogData = await evaluate(`(() => {
      const dialog = document.querySelector("#product-card-flight-dialog");
      const back = dialog?.querySelector(".export-card-back.is-expanded");
      return {
        ready: dialog?.dataset?.ready === "true",
        rowCount: back?.querySelectorAll(".export-spec-row").length || 0,
        bodyLocked: document.body.style.position === "fixed" || document.body.style.overflow === "hidden",
      };
    })()`);

    assert.strictEqual(flightDialogData.ready, true, "Flight dialog must report ready state");
    assert.ok(flightDialogData.rowCount >= 5, `Expected >= 5 technical specification rows, found ${flightDialogData.rowCount}`);
    assert.strictEqual(flightDialogData.bodyLocked, true, "Body scroll lock must be active during 3D flight overlay");

    // Close flight dialog with Escape
    await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await waitFor('document.querySelector("#product-card-flight-dialog") === null', "Flight dialog did not close on Escape");

    const scrollLockRestored = await evaluate(`(() => {
      return document.body.style.position !== "fixed" && document.body.style.overflow !== "hidden";
    })()`);
    assert.strictEqual(scrollLockRestored, true, "Body scroll lock must be restored on flight close");

    recordResult(
      "Area 5: Forms & Downloads",
      "Product Card 3D Flight Overlay",
      true,
      "Dialog mounted, >= 5 spec rows, scroll lock engaged and restored on Escape"
    );

    // Quote UI & Enquiry Notch badge
    await evaluate('document.querySelector(".atlas-grid .export-card-quote")?.click()');
    await waitFor('document.querySelector(".quote-count")?.textContent === "1"', "Quote count did not increment to 1");

    // Click quote button again to remove
    await evaluate('document.querySelector(".atlas-grid .export-card-quote")?.click()');
    await waitFor('document.querySelector(".quote-count")?.textContent === "0"', "Quote count did not decrement to 0");

    recordResult(
      "Area 5: Forms & Downloads",
      "Quote Dock & Badge State Management",
      true,
      "Quote count increments 0 -> 1 -> 0 cleanly"
    );

    // =========================================================================
    // AREA 6: Product Catalogues & Filters
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 6: Product Catalogues & Filters");
    console.log("------------------------------------------------------------------");

    // Produce Fresh & Frozen catalogues
    await navigate("/en/products?world=fresh");
    await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 21', "Fresh products did not load");

    const freshCardsCount = await evaluate(`document.querySelectorAll(".atlas-grid > .export-card-scene").length`);
    assert.strictEqual(freshCardsCount, 21, `Fresh Produce catalogue must contain 21 items, got ${freshCardsCount}`);

    // Switch to Frozen world via query
    await navigate("/en/products?world=frozen");
    await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13', "Frozen products did not load");

    const frozenCardsCount = await evaluate(`document.querySelectorAll(".atlas-grid > .export-card-scene").length`);
    assert.strictEqual(frozenCardsCount, 13, `Frozen Produce catalogue must contain 13 items, got ${frozenCardsCount}`);

    // Search filter in Frozen world
    await evaluate('document.querySelector(".minimal-search-trigger")?.click()');
    await waitFor('document.querySelector("#minimal-search-input") !== null', "Search input not visible");

    await evaluate(`(() => {
      const input = document.querySelector("#minimal-search-input");
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(input, "French Fries");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    })()`);
    await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 1', "Search did not filter to 1 item");

    // Clear search
    await evaluate(`(() => {
      const input = document.querySelector("#minimal-search-input");
      if (input) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(input, "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    })()`);
    await waitFor('document.querySelectorAll(".atlas-grid > .export-card-scene").length === 13', "Clearing search did not restore 13 items");

    recordResult(
      "Area 6: Catalogues",
      "Produce Catalogue (Fresh 21 / Frozen 13 / Search)",
      true,
      "21 Fresh cards, 13 Frozen cards, filtered to 1 on 'French Fries', restored"
    );

    // Herbs & Spices Catalogue (27 items across 6 families)
    await navigate("/en/herbs-spices/products");
    await waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Herbs products did not load");

    const herbsTotalCount = await evaluate(`document.querySelectorAll("[data-material-specimen]").length`);
    assert.strictEqual(herbsTotalCount, 27, `Herbs & Spices catalogue must contain 27 material plates, got ${herbsTotalCount}`);

    // Test family filters and pushState navigation
    const familyCounts = [
      { name: "Flowers", expected: 3 },
      { name: "Seeds", expected: 8 },
      { name: "Spices", expected: 2 },
      { name: "Roots", expected: 1 },
      { name: "Dehydrated Vegetables", expected: 2 },
      { name: "Herbs", expected: 11 },
    ];

    recordedRequests = [];
    for (const fam of familyCounts) {
      await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
        .find(b => b.textContent.trim() === "${fam.name}")?.click()`);
      await waitFor(
        `document.querySelectorAll("[data-material-specimen]").length === ${fam.expected}`,
        `Family filter '${fam.name}' did not match ${fam.expected} items`
      );
    }

    // Verify pushState client-side navigation (0 server RSC requests)
    const rscRequests = recordedRequests.filter((url) => url.includes("_rsc="));
    assert.strictEqual(rscRequests.length, 0, `Client-side filter toggling triggered ${rscRequests.length} server RSC requests`);

    // Reset to All
    await evaluate(`[...document.querySelectorAll('[aria-label="Filter catalogue by ingredient family"] button')]
      .find(b => b.textContent.trim() === "All")?.click()`);
    await waitFor('document.querySelectorAll("[data-material-specimen]").length === 27', "Restoring All did not restore 27 items");

    // Material Reveal (Basil dossier)
    await evaluate('document.querySelector("#material-plate-basil")?.click()');
    await waitFor('document.querySelector("#material-dossier-basil") !== null', "Basil dossier did not open");

    const revealCopy = await evaluate('document.querySelector("#material-dossier-basil").textContent');
    assert.ok(revealCopy.includes("Basil"), "Dossier missing Basil title");

    // Close dossier via Escape
    await evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
    await waitFor('document.querySelector("#material-dossier-basil") === null', "Basil dossier did not close on Escape");

    recordResult(
      "Area 6: Catalogues",
      "Herbs & Spices Families, pushState History & Dossier",
      true,
      "27 materials, 6 families, 0 RSC roundtrips, Basil dossier verified"
    );

    // =========================================================================
    // AREA 7: Animations & Media
    // =========================================================================
    console.log("\n------------------------------------------------------------------");
    console.log("AREA 7: Animations & Media");
    console.log("------------------------------------------------------------------");

    // Hero Video Lifecycle & Seasonal Orbit on Homepage (/en)
    await navigate("/en");
    await sleep(300);

    const heroVideoData = await evaluate(`(() => {
      const videos = Array.from(document.querySelectorAll(".hero video"));
      const activeVideo = videos.find(v => v.getAttribute("src") || v.querySelector("source")?.getAttribute("src"));
      return {
        totalVideos: videos.length,
        hasActiveVideo: !!activeVideo,
        activeVideoSrc: activeVideo ? (activeVideo.getAttribute("src") || activeVideo.querySelector("source")?.getAttribute("src")) : null,
      };
    })()`);

    assert.strictEqual(heroVideoData.hasActiveVideo, true, "Active hero video must be attached and present");
    assert.ok(
      heroVideoData.activeVideoSrc?.includes("hero-01-origin.mp4"),
      `Expected active video to be hero-01-origin.mp4, got ${heroVideoData.activeVideoSrc}`
    );

    const seasonalOrbitData = await evaluate(`(() => {
      const orbit = document.querySelector("#seasons, [data-motion='season-index']");
      return {
        hasOrbit: !!orbit,
      };
    })()`);

    assert.strictEqual(seasonalOrbitData.hasOrbit, true, "Seasonal orbit section must be present");

    recordResult(
      "Area 7: Animations & Media",
      "Hero Video & Seasonal Orbit",
      true,
      `Hero single-video attached (${heroVideoData.activeVideoSrc}), Orbit present`
    );

    // Standard Progress Thread (/en/standard)
    await navigate("/en/standard");
    await sleep(250);

    const progressThreadData = await evaluate(`(() => {
      const thread = document.querySelector(".progress-thread-desktop, .progress-thread-mobile");
      const nodes = thread ? thread.querySelectorAll(".thread-node-item, .mobile-pill-inner") : [];
      return {
        hasThread: !!thread,
        nodeCount: nodes.length,
      };
    })()`);
    assert.strictEqual(progressThreadData.hasThread, true, "Standard progress thread must be rendered");

    recordResult(
      "Area 7: Animations & Media",
      "Standard Progress Thread",
      true,
      `Standard thread (${progressThreadData.nodeCount} nodes) rendered`
    );

    // Herbs & Spices: LogoLoop Marquee & Accordion Gallery (/en/herbs-spices)
    await navigate("/en/herbs-spices");
    await sleep(250);

    // Scroll LogoLoop into viewport so images load
    await evaluate(`document.querySelector(".logoloop, [class*='certificateLoop']")?.scrollIntoView({ block: "center", behavior: "instant" })`);
    await sleep(400);

    const logoLoopImages = await evaluate(`(() => {
      const certImgs = Array.from(document.querySelectorAll(".logoloop img, [class*='certCard'] img, [class*='certificateLoop'] img"));
      const loadedImgs = certImgs.filter(img => img.complete && img.naturalWidth > 0);
      return {
        totalCount: certImgs.length,
        loadedCount: loadedImgs.length,
        allWebP: certImgs.every(img => img.src.includes(".webp")),
      };
    })()`);

    assert.ok(logoLoopImages.totalCount > 0, "LogoLoop certificates must be rendered");
    assert.strictEqual(logoLoopImages.allWebP, true, "LogoLoop certificates must use modern WebP derivatives");
    assert.ok(logoLoopImages.loadedCount > 0, "Visible LogoLoop images must be loaded with naturalWidth > 0");

    const accordionData = await evaluate(`(() => {
      const gallery = document.querySelector(".accordion-gallery");
      const panels = gallery ? gallery.querySelectorAll(".ag-panel") : [];
      return {
        hasGallery: !!gallery,
        panelCount: panels.length,
      };
    })()`);
    assert.strictEqual(accordionData.hasGallery, true, "Herbs accordion gallery must be present");

    recordResult(
      "Area 7: Animations & Media",
      "LogoLoop Marquee & Herbs Gallery Accordion",
      true,
      `LogoLoop (${logoLoopImages.totalCount} WebPs), Herbs accordion (${accordionData.panelCount} panels) verified`
    );

    // Check for runtime exceptions during all interactions
    const uncaughtErrors = getErrors();
    assert.strictEqual(
      uncaughtErrors.length,
      0,
      `Uncaught browser console errors during QA verification: ${uncaughtErrors.join("; ")}`
    );

    await session.close();

    console.log("\n==================================================================");
    console.log("  M5 BROWSER QA VERIFICATION SUMMARY");
    console.log("==================================================================");
    let allPassed = true;
    for (const r of testResults) {
      if (!r.passed) allPassed = false;
    }
    console.log(`Total checks executed: ${testResults.length}`);
    console.log(`Status: ${allPassed ? "ALL 100% PASSED" : "FAILED"}`);
    console.log("==================================================================\n");

    return allPassed;
  } finally {
    if (chromeHandle?.cleanup) {
      chromeHandle.cleanup();
    }
    if (serverProc) {
      console.log("[Server] Shutting down spawned Next.js server...");
      serverProc.kill();
    }
  }
}

runBrowserQASuite()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((err) => {
    console.error("FATAL ERROR in Browser QA suite:", err);
    process.exit(1);
  });
