import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services } from "@/content/services";

// Bump when page content changes meaningfully.
const UPDATED = new Date("2026-10-20");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, lastModified: UPDATED, changeFrequency: "monthly", priority: 1 },
    ...services.map((s) => ({
      url: `${site.url}/${s.slug}`,
      lastModified: UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.url}/cenik`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/kontakt`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/zasebnost`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
