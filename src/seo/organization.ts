import { absoluteUrl, localizedUrl, SITE_LOGO, SITE_ORIGIN } from "./site";

export const organizationGraph = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "AGRICA", url: localizedUrl("en", "/"), logo: absoluteUrl(SITE_LOGO), email: "info@agriculturecairo.com" },
    { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "AGRICA", url: localizedUrl("en", "/"), publisher: { "@id": `${SITE_ORIGIN}/#organization` }, inLanguage: ["en", "ar", "ru", "de", "fr"] },
  ],
};
