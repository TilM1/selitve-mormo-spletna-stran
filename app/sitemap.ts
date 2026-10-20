import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/prijava`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/pogoji`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/zasebnost`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
