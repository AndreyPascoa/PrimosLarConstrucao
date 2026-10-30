import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/crm", "/api/"] },
    ...(process.env.APP_URL
      ? { sitemap: `${process.env.APP_URL.replace(/\/$/, "")}/sitemap.xml` }
      : {}),
  };
}
