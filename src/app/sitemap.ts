import type { MetadataRoute } from "next";
import { products, categories, news, jobs } from "@/data";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/products", "/about", "/management", "/media-center", "/services",
    "/customer-care", "/genuine-parts", "/careers", "/contact", "/online-inquiry", "/service-appointment",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 }));

  const dynamic = [
    ...categories.map((c) => `/products/${c.slug}`),
    ...products.map((p) => `/product/${p.slug}`),
    ...jobs.map((j) => `/careers/${j.slug}`),
    ...news.map((n) => `/news/${n.slug}`),
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 }));

  return [...staticRoutes, ...dynamic];
}
