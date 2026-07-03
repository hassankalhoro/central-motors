import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Product, ProductSpecs, Category, TeamMember, NewsPost, Settings, CategorySlug } from "./types";
import { settings as defaultSettings } from "./settings";

/* ------------------------------------------------------------------ *
 * DB-backed public data layer. Returns the SAME shapes as the Phase-1
 * static modules so public pages/components are unchanged apart from
 * `await`. Only published, non-deleted records are exposed.
 * ------------------------------------------------------------------ */

/* Public reads are cached in-process and revalidated either by time or
 * instantly via revalidateTag(PUBLIC_CACHE_TAG) from every admin write.
 * This is what makes page-to-page navigation fast: a navigation renders
 * from cache instead of paying multiple Neon round-trips. */
export const PUBLIC_CACHE_TAG = "public-data";
const cached = <A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { revalidate: 300, tags: [PUBLIC_CACHE_TAG] });

const TEAM_LABEL: Record<string, TeamMember["group"]> = {
  TOP_MANAGEMENT: "Top Management",
  GENERAL_MANAGERS: "General Managers",
  MANAGERS: "Managers",
};
export const TEAM_GROUPS = ["Top Management", "General Managers", "Managers"] as const;

const productInclude = {
  category: true,
  variants: { orderBy: { order: "asc" } },
  features: { orderBy: { order: "asc" } },
  images: { orderBy: { order: "asc" } },
} as const;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(p: DbProduct): Product {
  return {
    slug: p.slug,
    name: p.name,
    category: (p.category?.slug ?? "automobiles") as CategorySlug,
    desc: p.description ?? "",
    tag: p.tag ?? "",
    features: p.features.map((f) => f.label),
    variants: p.variants.map((v) => ({ name: v.name, price: v.price })),
    startPrice: p.startPrice,
    featured: p.featured,
    order: p.order,
    images: p.images.map((i) => i.url),
    blur: p.images.map((i) => i.blurData ?? ""),
    brochure: p.brochureUrl ?? null,
    status: p.status,
    specs: (p.specs as ProductSpecs | null) ?? null,
  };
}

/* ---- Products ----------------------------------------------------- */
export const getProducts = cached(async (): Promise<Product[]> => {
  const rows = await db.product.findMany({
    where: { deletedAt: null, published: true },
    include: productInclude,
    orderBy: { order: "asc" },
  });
  return rows.map(toProduct);
}, "products");

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(p: Product, limit = 4): Promise<Product[]> {
  return (await getProductsByCategory(p.category)).filter((x) => x.slug !== p.slug).slice(0, limit);
}

export async function getAdjacentProducts(slug: string): Promise<{ prev?: Product; next?: Product }> {
  const list = await getProducts();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  const n = list.length;
  return { prev: list[(i - 1 + n) % n], next: list[(i + 1) % n] };
}

export async function getBodyTypes(): Promise<string[]> {
  return Array.from(new Set((await getProducts()).map((p) => p.tag)));
}

export async function getProductNames(): Promise<string[]> {
  return (await getProducts()).map((p) => p.name);
}

/* ---- Categories --------------------------------------------------- */
export const getCategories = cached(async (): Promise<Category[]> => {
  const rows = await db.category.findMany({ orderBy: { order: "asc" } });
  return rows.map((c) => ({ slug: c.slug as CategorySlug, name: c.name, glyph: c.name[0] ?? "A", blurb: c.blurb ?? "" }));
}, "categories");

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getCategoryCount(slug: string): Promise<number> {
  return (await getProducts()).filter((p) => p.category === slug).length;
}

export async function categoryName(slug: string): Promise<string> {
  return (await getCategoryBySlug(slug))?.name ?? slug;
}

export async function getProductGroups() {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  return cats.map((c) => ({
    ...c,
    products: products.filter((p) => p.category === c.slug),
    count: products.filter((p) => p.category === c.slug).length,
  }));
}

/* ---- Team --------------------------------------------------------- */
export const getTeamGrouped = cached(async (): Promise<{ group: string; members: TeamMember[] }[]> => {
  const rows = await db.teamMember.findMany({ where: { published: true }, orderBy: { order: "asc" } });
  const members: TeamMember[] = rows.map((m) => ({
    name: m.name,
    title: m.title,
    group: TEAM_LABEL[m.group] ?? "Managers",
    phone: m.phone ?? "",
  }));
  return TEAM_GROUPS.map((group) => ({ group, members: members.filter((m) => m.group === group) })).filter(
    (g) => g.members.length > 0,
  );
}, "team");

/* ---- News --------------------------------------------------------- */
function toNews(n: { slug: string; title: string; publishedAt: Date | null; createdAt: Date; excerpt: string | null; body: string | null; imageUrl: string | null }): NewsPost {
  return {
    slug: n.slug,
    title: n.title,
    date: (n.publishedAt ?? n.createdAt).toISOString(),
    excerpt: n.excerpt ?? "",
    body: n.body ?? "",
    image: n.imageUrl,
  };
}

const getAllNews = cached(async (): Promise<NewsPost[]> => {
  const rows = await db.newsPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toNews);
}, "news");

export async function getNews(limit?: number): Promise<NewsPost[]> {
  const all = await getAllNews();
  return limit ? all.slice(0, limit) : all;
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | undefined> {
  return (await getAllNews()).find((n) => n.slug === slug);
}

/** Paginated published news for the home slider and the /news index. */
export async function getNewsPaged(
  page = 1,
  pageSize = 6,
): Promise<{ items: NewsPost[]; total: number; hasMore: boolean }> {
  const all = await getAllNews();
  const skip = (Math.max(1, page) - 1) * pageSize;
  const items = all.slice(skip, skip + pageSize);
  return { items, total: all.length, hasMore: skip + items.length < all.length };
}

/* ---- Settings ----------------------------------------------------- */
export const getSettings = cached(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  // Fall back to the static defaults for any key not yet in the DB.
  return {
    siteName: m.siteName || defaultSettings.siteName,
    tagline: m.tagline || defaultSettings.tagline,
    address: m.address || defaultSettings.address,
    phone: m.phone || defaultSettings.phone,
    uan: m.uan || defaultSettings.uan,
    tel: m.tel || defaultSettings.tel,
    fax: m.fax || defaultSettings.fax,
    email: m.email || defaultSettings.email,
    email2: m.email2 || defaultSettings.email2,
    servicePhone: m.servicePhone || defaultSettings.servicePhone,
    warrantyPhone: m.warrantyPhone || defaultSettings.warrantyPhone,
    facebook: m.facebook || defaultSettings.facebook,
    twitter: m.twitter || defaultSettings.twitter,
    instagram: m.instagram || defaultSettings.instagram,
  };
}, "settings");

/* ---- Careers ------------------------------------------------------- */
export const getJobs = cached(async (): Promise<{ slug: string; title: string; location: string; type: string; description: string }[]> => {
  const rows = await db.job.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return rows.map((j) => ({ slug: j.slug, title: j.title, location: j.location, type: j.type, description: j.description }));
}, "jobs");

export async function getJobBySlug(slug: string) {
  return (await getJobs()).find((j) => j.slug === slug);
}
