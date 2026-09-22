"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useId, useRef, useState } from "react";
import { languageOptions, localeRegistry, type Locale } from "@/i18n/config";
import { useCommonDictionary, useLocale } from "@/i18n/locale-context";
import { languageSwitchPath } from "@/i18n/navigation";
import { localePreferenceCookie } from "@/i18n/preference";
import styles from "./LanguageSwitcher.module.css";

export interface LanguageSwitcherProps {
  readonly tone?: "light" | "dark" | "herbs";
  readonly className?: string;
}

export function LanguageSwitcher({ tone = "light", className }: LanguageSwitcherProps): React.JSX.Element {
  const locale = useLocale();
  const common = useCommonDictionary();
  const pathname = usePathname();
  const active = localeRegistry[locale];
  const [isOpen, setIsOpen] = useState(false);
  const [locationState, setLocationState] = useState({ search: "", hash: "" });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef(new Map<Locale, HTMLAnchorElement>());
  const menuId = `language-menu-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const syncLocation = () => setLocationState({ search: window.location.search, hash: window.location.hash });
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const close = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const focusOption = (index: number) => {
    const option = languageOptions[(index + languageOptions.length) % languageOptions.length];
    optionRefs.current.get(option.code)?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setIsOpen(true);
    const activeIndex = languageOptions.findIndex((option) => option.code === locale);
    window.requestAnimationFrame(() => focusOption(event.key === "ArrowDown" ? activeIndex : activeIndex - 1));
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    const focusedLocale = (document.activeElement as HTMLElement | null)?.dataset.locale;
    const focusedIndex = languageOptions.findIndex((option) => option.code === focusedLocale);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(focusedIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusOption(event.key === "Home" ? 0 : languageOptions.length - 1);
    }
  };

  const selectLocale = (nextLocale: Locale) => {
    document.cookie = localePreferenceCookie(nextLocale, window.location.protocol === "https:");
    setIsOpen(false);
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`} data-language-switcher data-tone={tone} ref={rootRef}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        data-language-trigger
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? common.languageSwitcher.closeLabel : common.languageSwitcher.openLabel}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
      >
        <Image className={styles.flag} src={active.flag.src} alt={active.flag.alt} width={22} height={15} />
        <span className={styles.activeLabel} lang={active.code} dir={active.direction}>{active.label}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.popover} data-language-menu id={menuId} onKeyDown={handleMenuKeyDown}>
          <p className={styles.heading}>{common.languageSwitcher.label}</p>
          <nav aria-label={common.languageSwitcher.optionsLabel}>
            {languageOptions.map((option) => {
              const isActive = option.code === locale;
              return (
                <Link
                  key={option.code}
                  ref={(node) => {
                    if (node) optionRefs.current.set(option.code, node);
                    else optionRefs.current.delete(option.code);
                  }}
                  className={styles.option}
                  data-language-option
                  data-locale={option.code}
                  href={languageSwitchPath(option.code, pathname, locationState.search, locationState.hash)}
                  hrefLang={option.code}
                  lang={option.code}
                  dir={option.direction}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => selectLocale(option.code)}
                >
                  <Image className={styles.flag} src={option.flag.src} alt={option.flag.alt} width={24} height={16} />
                  <span>{option.label}</span>
                  {isActive && <span className={styles.current} aria-label={common.languageSwitcher.currentLanguage}>✓</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
