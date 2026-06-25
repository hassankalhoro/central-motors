import { products } from "./products";
import { categories } from "./catalog";
import { team } from "./team";
import { news } from "./news";
import { jobs } from "./jobs";
import { settings } from "./settings";
import type { CategorySlug, Product, TeamMember } from "./types";

export { products, categories, team, news, jobs, settings };
export * from "./types";
export * from "./content";

/* Categories */
export const getCategories = () => categories;
export const getCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
export const getCategoryCount = (slug: CategorySlug) => products.filter((p) => p.category === slug).length;
export const categoryName = (slug: string) => getCategoryBySlug(slug)?.name ?? slug;

/* Products */
export const getProducts = () => [...products].sort((a, b) => a.order - b.order);
export const getProductsByCategory = (slug: string) => getProducts().filter((p) => p.category === slug);
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getFeaturedProducts = (limit = 8) =>
  getProducts()
    .filter((p) => p.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit);
export const getRelatedProducts = (p: Product, limit = 4) =>
  getProductsByCategory(p.category).filter((x) => x.slug !== p.slug).slice(0, limit);

/** Previous/next product in the lineup (wraps around) for detail-page navigation. */
export const getAdjacentProducts = (slug: string): { prev?: Product; next?: Product } => {
  const list = getProducts();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  const n = list.length;
  return { prev: list[(i - 1 + n) % n], next: list[(i + 1) % n] };
};

/** Distinct body types (from product.tag) for filtering. */
export const getBodyTypes = () => Array.from(new Set(getProducts().map((p) => p.tag)));
export const getProductGroups = () =>
  categories.map((c) => ({ ...c, count: getCategoryCount(c.slug), products: getProductsByCategory(c.slug) }));
export const getProductNames = () => getProducts().map((p) => p.name);

/* Team */
export const TEAM_GROUPS = ["Top Management", "General Managers", "Managers"] as const;
export const getTeamGrouped = (): { group: string; members: TeamMember[] }[] =>
  TEAM_GROUPS.map((group) => ({ group, members: team.filter((m) => m.group === group) })).filter(
    (g) => g.members.length > 0
  );

/* News / jobs / settings */
export const getNews = (limit?: number) => (limit ? news.slice(0, limit) : news);
export const getNewsBySlug = (slug: string) => news.find((n) => n.slug === slug);
export const getJobs = () => jobs;
export const getJobBySlug = (slug: string) => jobs.find((j) => j.slug === slug);
export const getSettings = () => settings;
