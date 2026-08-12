import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://printstore.ca";
  return ["", "/categories/t-shirts", "/categories/mugs", "/categories/art-prints", "/categories/accessories", "/categories/home-living", "/about", "/faq", "/shipping", "/privacy", "/terms"].map((path, index) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: index <= 5 ? "weekly" : "monthly", priority: index === 0 ? 1 : index <= 5 ? 0.8 : 0.6 }));
}
