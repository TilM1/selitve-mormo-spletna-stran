import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/racun", "/vpis", "/novo-geslo", "/pozabljeno-geslo", "/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
