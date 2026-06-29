import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type Filter = "all" | "published" | "drafts";

function whereClause(filter: Filter, search?: string): Prisma.NewsPostWhereInput {
  return {
    ...(filter === "published" ? { published: true } : filter === "drafts" ? { published: false } : {}),
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
  };
}

export const newsRepo = {
  list: (filter: Filter, search?: string) =>
    db.newsPost.findMany({
      where: whereClause(filter, search),
      include: { author: { select: { name: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  byId: (id: string) => db.newsPost.findUnique({ where: { id } }),
  bySlug: (slug: string) => db.newsPost.findUnique({ where: { slug } }),
  create: (data: Prisma.NewsPostCreateInput) => db.newsPost.create({ data }),
  update: (id: string, data: Prisma.NewsPostUpdateInput) => db.newsPost.update({ where: { id }, data }),
  delete: (id: string) => db.newsPost.delete({ where: { id } }),
};
