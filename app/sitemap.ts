import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://seefood-hotdog-classifier.vercel.app";

// Public, indexable routes only. The application surface (/app, /dashboard,
// /keys) is intentionally excluded — see robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/api-access", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/brand", priority: 0.3, changeFrequency: "monthly" as const },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
