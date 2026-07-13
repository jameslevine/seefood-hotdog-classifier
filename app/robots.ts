import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://seefood-hotdog-classifier.vercel.app";

// Allow marketing/discovery routes; keep the application surface out of the
// index (nothing to rank, and it will sit behind auth in Phase 1).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/dashboard", "/keys", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
