import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  return process.env.APP_URL
    ? [{ url: process.env.APP_URL, changeFrequency: "weekly", priority: 1 }]
    : [];
}
