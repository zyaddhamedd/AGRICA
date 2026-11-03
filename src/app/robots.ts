import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/seo/site";

export default function robots(): MetadataRoute.Robots {
  // Noindex pages remain crawlable so their page-level policy can be read.
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_ORIGIN}/sitemap.xml` };
}
