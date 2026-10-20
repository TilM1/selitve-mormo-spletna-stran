import type { MetadataRoute } from "next";
import { site } from "@/config/site";

// Everything public is open to search engines and to AI search/answer crawlers
// (Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot...).
// Training-only crawlers (e.g. GPTBot, Google-Extended, CCBot) are also allowed by default.
// To opt out of model training without losing search visibility, add for example:
//   { userAgent: ["GPTBot", "Google-Extended", "CCBot"], disallow: "/" }
// Do NOT block Googlebot, Bingbot, OAI-SearchBot or PerplexityBot: that removes the site from those searches.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
