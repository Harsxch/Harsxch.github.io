import type { MetadataRoute } from "next";
import { courses } from "@/content/courses";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/courses`, lastModified: now, priority: 0.9 },
    ...courses.map((c) => ({ url: `${SITE_URL}/courses/${c.slug}`, lastModified: now, priority: c.status === "live" ? 0.8 : 0.5 })),
    ...["about", "contact", "refund", "terms", "privacy"].map((p) => ({ url: `${SITE_URL}/${p}`, lastModified: now, priority: 0.2 })),
  ];
}
