"use client";

import { useEffect, useRef, useState } from "react";

export interface UseNavbarScrollVisibilityOptions {
  /** If the mobile menu or a drawer is currently open */
  readonly isMenuOpen?: boolean;
  /** If a language dropdown or similar popover is open */
  readonly isDropdownOpen?: boolean;
  /** Scroll delta threshold to ignore micro-scroll jitter (default: 8px) */
  readonly threshold?: number;
  /** Always keep navbar visible when scrollY is below this offset (default: 20px) */
  readonly topOffset?: number;
}

export function useNavbarScrollVisibility({
  isMenuOpen = false,
  isDropdownOpen = false,
  threshold = 8,
  topOffset = 20,
}: UseNavbarScrollVisibilityOptions = {}): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // If menu or dropdown is open, keep navbar visible
    if (isMenuOpen || isDropdownOpen) {
      setIsVisible(true);
      return;
    }

    const updateVisibility = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollY.current;

      // 1. Always show navbar when near the top of the page (scrollY < 20px)
      if (currentScrollY < topOffset) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Check if any open popover/dropdown is active in the DOM
      const isAnyDropdownActive = Boolean(
        document.querySelector('[data-language-trigger][aria-expanded="true"]') ||
        document.querySelector('[aria-expanded="true"][aria-controls*="menu"]')
      );
      if (isAnyDropdownActive) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // 2. Ignore tiny scroll deltas under threshold (e.g. 8px) to avoid flicker
      if (Math.abs(delta) < threshold) {
        ticking.current = false;
        return;
      }

      // 3. Prevent false hides on iOS rubber-band bounce at page bottom
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY > maxScrollY) {
        ticking.current = false;
        return;
      }

      // 4. Meaningful downward scroll -> smoothly hide
      if (delta > 0) {
        setIsVisible(false);
      }
      // 5. Meaningful upward scroll -> immediately reveal
      else if (delta < 0) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      updateVisibility();
    };

    // Initial check on mount
    updateVisibility();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isMenuOpen, isDropdownOpen, threshold, topOffset]);

  return isVisible;
}
