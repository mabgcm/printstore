import type { MetadataRoute } from "next";
import { getStorefrontCatalog } from "@/lib/catalog/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://printstore.ca";
  const { products, categories } = await getStorefrontCatalog().catch(() => ({ products: [], categories: [] }));
  const paths = [
    "",
    ...categories.map((category) => `/categories/${category.slug}`),
    ...products.map((product) => `/products/${product.id}`),
    "/about", "/faq", "/shipping", "/privacy", "/terms",
  ];
  return paths.map((path, index) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: index <= categories.length + products.length ? "weekly" : "monthly", priority: index === 0 ? 1 : path.startsWith("/categories/") ? 0.8 : 0.6 }));
}
