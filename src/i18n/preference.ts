import type { Locale } from "./config";

export const localePreferenceCookieName = "agrica_locale";
export const localePreferenceMaxAge = 60 * 60 * 24 * 365;

export function localePreferenceCookie(locale: Locale, secure = false): string {
  return [
    `${localePreferenceCookieName}=${locale}`,
    "Path=/",
    `Max-Age=${localePreferenceMaxAge}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ].filter(Boolean).join("; ");
}
