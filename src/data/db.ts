import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Product, Category, TeamMember, NewsPost, Settings, CategorySlug } from "./types";
import { settings as defaultSettings } from "./settings";

/* ------------------------------------------------------------------ *
 * DB-backed public data layer. Returns the SAME shapes as the Phase-1
 * static modules so public pages/components are unchanged apart from
 * `await`. Only published, non-deleted records are exposed.
 * ------------------------------------------------------------------ */

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
  };
}

/* ---- Products ----------------------------------------------------- */
export async function getProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { deletedAt: null, published: true },
    include: productInclude,
    orderBy: { order: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const p = await db.product.findFirst({ where: { slug, deletedAt: null, published: true }, include: productInclude });
  return p ? toProduct(p) : undefined;
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
export async function getCategories(): Promise<Category[]> {
  const rows = await db.category.findMany({ orderBy: { order: "asc" } });
  return rows.map((c) => ({ slug: c.slug as CategorySlug, name: c.name, glyph: c.name[0] ?? "A", blurb: c.blurb ?? "" }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getCategoryCount(slug: string): Promise<number> {
  return db.product.count({ where: { deletedAt: null, published: true, category: { slug } } });
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
export async function getTeamGrouped(): Promise<{ group: string; members: TeamMember[] }[]> {
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
}

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

export async function getNews(limit?: number): Promise<NewsPost[]> {
  const rows = await db.newsPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
  return rows.map(toNews);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | undefined> {
  const n = await db.newsPost.findFirst({ where: { slug, published: true } });
  return n ? toNews(n) : undefined;
}

/** Paginated published news for the home slider and the /news index. */
export async function getNewsPaged(
  page = 1,
  pageSize = 6,
): Promise<{ items: NewsPost[]; total: number; hasMore: boolean }> {
  const skip = (Math.max(1, page) - 1) * pageSize;
  const [rows, total] = await Promise.all([
    db.newsPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    db.newsPost.count({ where: { published: true } }),
  ]);
  return { items: rows.map(toNews), total, hasMore: skip + rows.length < total };
}

/* ---- Settings ----------------------------------------------------- */
export async function getSettings(): Promise<Settings> {
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
}
