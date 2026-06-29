import { db } from "@/lib/db";

export const categoryRepo = {
  list: () => db.category.findMany({ orderBy: { order: "asc" } }),
  byId: (id: string) => db.category.findUnique({ where: { id } }),
  bySlug: (slug: string) => db.category.findUnique({ where: { slug } }),
  create: (data: { slug: string; name: string; blurb: string | null; order: number }) =>
    db.category.create({ data }),
  update: (id: string, data: { slug?: string; name?: string; blurb?: string | null }) =>
    db.category.update({ where: { id }, data }),
  delete: (id: string) => db.category.delete({ where: { id } }),
  /** Non-deleted product count, grouped by category. */
  async productCounts(): Promise<Record<string, number>> {
    const rows = await db.product.groupBy({
      by: ["categoryId"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [r.categoryId, r._count._all]));
  },
  countProducts: (categoryId: string) => db.product.count({ where: { categoryId, deletedAt: null } }),
  nextOrder: async () => {
    const last = await db.category.findFirst({ orderBy: { order: "desc" } });
    return (last?.order ?? -1) + 1;
  },
};
