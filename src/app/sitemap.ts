import type { MetadataRoute } from "next";
import { jobs } from "@/data";
import { getProducts, getCategories, getNews } from "@/data/db";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The DB (Neon) auto-suspends and can be unreachable during a build.
  // A sitemap must never fail the deploy, fall back to the static routes.
  let products: { slug: string }[] = [];
  let categories: { slug: string }[] = [];
  let news: { slug: string }[] = [];
  try {
    [products, categories, news] = await Promise.all([getProducts(), getCategories(), getNews()]);
  } catch {
    // build continues with static routes only
  }

  const staticRoutes = [
    "", "/products", "/about", "/management", "/media-center", "/services",
    "/customer-care", "/genuine-parts", "/careers", "/contact", "/online-inquiry", "/service-appointment",
    "/after-sales/mechanical-workshop", "/after-sales/paint-body-shop", "/after-sales/extended-warranty",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 }));

  const dynamic = [
    ...categories.map((c) => `/products/${c.slug}`),
    ...products.map((p) => `/product/${p.slug}`),
    ...jobs.map((j) => `/careers/${j.slug}`),
    ...news.map((n) => `/news/${n.slug}`),
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 }));

  return [...staticRoutes, ...dynamic];
}
