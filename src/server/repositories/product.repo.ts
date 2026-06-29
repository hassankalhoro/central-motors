import { db } from "@/lib/db";
import type { Prisma, ProductStatus } from "@prisma/client";

type ListArgs = { categoryId?: string; search?: string; skip?: number; take?: number };

function whereClause({ categoryId, search }: ListArgs): Prisma.ProductWhereInput {
  return {
    deletedAt: null,
    ...(categoryId ? { categoryId } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };
}

export const productRepo = {
  list: (args: ListArgs) =>
    db.product.findMany({
      where: whereClause(args),
      include: { category: true, images: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: args.skip,
      take: args.take,
    }),
  count: (args: ListArgs) => db.product.count({ where: whereClause(args) }),
  byId: (id: string) =>
    db.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        variants: { orderBy: { order: "asc" } },
        features: { orderBy: { order: "asc" } },
        images: { orderBy: { order: "asc" } },
      },
    }),
  bySlug: (slug: string) => db.product.findUnique({ where: { slug } }),
  create: (data: Prisma.ProductCreateInput) => db.product.create({ data }),
  update: (id: string, data: Prisma.ProductUpdateInput) => db.product.update({ where: { id }, data }),
  softDelete: (id: string) => db.product.update({ where: { id }, data: { deletedAt: new Date() } }),
  nextOrder: async () => {
    const last = await db.product.findFirst({ where: { deletedAt: null }, orderBy: { order: "desc" } });
    return (last?.order ?? 0) + 1;
  },
  replaceVariants: async (productId: string, variants: { name: string; price: number }[]) => {
    await db.variant.deleteMany({ where: { productId } });
    if (variants.length)
      await db.variant.createMany({ data: variants.map((v, order) => ({ ...v, productId, order })) });
  },
  replaceFeatures: async (productId: string, labels: string[]) => {
    await db.feature.deleteMany({ where: { productId } });
    if (labels.length)
      await db.feature.createMany({ data: labels.map((label, order) => ({ label, productId, order })) });
  },
  replaceImages: async (
    productId: string,
    images: { url: string; publicId?: string; blurData?: string; alt?: string }[],
  ) => {
    await db.productImage.deleteMany({ where: { productId } });
    if (images.length)
      await db.productImage.createMany({
        data: images.map((img, order) => ({
          productId,
          url: img.url,
          publicId: img.publicId ?? null,
          blurData: img.blurData ?? null,
          alt: img.alt ?? null,
          order,
        })),
      });
  },
};

export type { ProductStatus };
