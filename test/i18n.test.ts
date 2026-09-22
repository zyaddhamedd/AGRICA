import assert from "node:assert/strict";
import {
  defaultLocale,
  directionForLocale,
  isLocale,
  isRtlLocale,
  languageOptions,
  localeRegistry,
  locales,
} from "../src/i18n/config";
import enCommon from "../src/i18n/dictionaries/en/common";
import arCommon from "../src/i18n/dictionaries/ar/common";
import ruCommon from "../src/i18n/dictionaries/ru/common";
import deCommon from "../src/i18n/dictionaries/de/common";
import frCommon from "../src/i18n/dictionaries/fr/common";
import { localePreferenceCookie, localePreferenceCookieName } from "../src/i18n/preference";

assert.deepEqual(locales, ["en", "ar", "ru", "de", "fr"]);
assert.equal(defaultLocale, "en");

for (const locale of locales) {
  assert.equal(isLocale(locale), true);
  assert.equal(localeRegistry[locale].code, locale);
  assert.ok(localeRegistry[locale].label.length > 0);
  assert.ok(localeRegistry[locale].flag.src.startsWith("/assets/flags/"));
  assert.ok(localeRegistry[locale].flag.alt.length > 0);
  assert.equal(directionForLocale(locale), locale === "ar" ? "rtl" : "ltr");
  assert.equal(isRtlLocale(locale), locale === "ar");
}

for (const invalidLocale of ["", "EN", "ar-EG", "en-US", "es", null, undefined]) {
  assert.equal(isLocale(invalidLocale), false);
}

assert.deepEqual(languageOptions.map((option) => option.code), locales);
assert.deepEqual(languageOptions.map((option) => option.label), [
  "English",
  "العربية",
  "Русский",
  "Deutsch",
  "Français",
]);

function leafPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  assert.ok(value && typeof value === "object", `${prefix || "common"} must be an object or string`);
  return Object.entries(value).flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key));
}

const commonDictionaries = { en: enCommon, ar: arCommon, ru: ruCommon, de: deCommon, fr: frCommon } as const;
const requiredCommonPaths = leafPaths(enCommon).sort();
assert.ok(requiredCommonPaths.length >= 100, "the Phase 2 common contract must cover the complete shared UI");

for (const [locale, common] of Object.entries(commonDictionaries)) {
  assert.deepEqual(leafPaths(common).sort(), requiredCommonPaths, `${locale} common keys must match English`);
  for (const path of requiredCommonPaths) {
    const value = path.split(".").reduce<unknown>((current, key) => (current as Record<string, unknown>)[key], common);
    assert.equal(typeof value, "string", `${locale}.${path} must be a string`);
    assert.ok((value as string).trim().length > 0, `${locale}.${path} must not be empty`);
  }
}

for (const locale of ["ar", "ru", "de", "fr"] as const) {
  assert.notEqual(commonDictionaries[locale].navigation.home, enCommon.navigation.home);
  assert.notEqual(commonDictionaries[locale].languageSwitcher.openLabel, enCommon.languageSwitcher.openLabel);
  assert.notEqual(commonDictionaries[locale].enquiry.exportEnquiry, enCommon.enquiry.exportEnquiry);
}

assert.equal(localePreferenceCookieName, "agrica_locale");
assert.match(localePreferenceCookie("de"), /^agrica_locale=de; Path=\/; Max-Age=31536000; SameSite=Lax$/);
assert.match(localePreferenceCookie("ar", true), /; Secure$/);

console.log("✓ Locale registry, validation, display metadata, and text direction verified");
console.log("✓ Complete Phase 2 shared UI dictionaries and locale preference cookie verified");
