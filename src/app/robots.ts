import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://printstore.ca";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/checkout/"] }, sitemap: `${base}/sitemap.xml` };
}
