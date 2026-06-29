import "server-only";
import { productRepo } from "../repositories/product.repo";
import { ServiceError } from "./categoryService";
import { slugify } from "@/lib/slug";
import type { ProductInput } from "../validators/product";

const PAGE_SIZE = 10;

export async function listProducts(opts: { categoryId?: string; search?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const args = { categoryId: opts.categoryId, search: opts.search, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
  const [items, total] = await Promise.all([productRepo.list(args), productRepo.count(args)]);
  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const getProduct = (id: string) => productRepo.byId(id);

function startPrice(variants: { price: number }[]): number {
  return variants.length ? Math.min(...variants.map((v) => v.price)) : 0;
}

export async function createProduct(input: ProductInput) {
  const slug = slugify(input.slug || input.name);
  if (!slug) throw new ServiceError("Could not derive a slug from the name.", "name");
  if (await productRepo.bySlug(slug)) throw new ServiceError("A product with this slug already exists.", "slug");

  const product = await productRepo.create({
    slug,
    name: input.name,
    category: { connect: { id: input.categoryId } },
    tag: input.tag || null,
    description: input.description || null,
    status: input.status,
    featured: input.featured,
    published: input.published,
    brochureUrl: input.brochureUrl || null,
    startPrice: startPrice(input.variants),
    order: await productRepo.nextOrder(),
  });

  await Promise.all([
    productRepo.replaceVariants(product.id, input.variants),
    productRepo.replaceFeatures(product.id, input.features),
    productRepo.replaceImages(product.id, input.images),
  ]);
  return product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await productRepo.byId(id);
  if (!existing) throw new ServiceError("Product not found.");
  const slug = slugify(input.slug || input.name);
  const clash = await productRepo.bySlug(slug);
  if (clash && clash.id !== id) throw new ServiceError("A product with this slug already exists.", "slug");

  await productRepo.update(id, {
    slug,
    name: input.name,
    category: { connect: { id: input.categoryId } },
    tag: input.tag || null,
    description: input.description || null,
    status: input.status,
    featured: input.featured,
    published: input.published,
    brochureUrl: input.brochureUrl || null,
    startPrice: startPrice(input.variants),
  });
  await Promise.all([
    productRepo.replaceVariants(id, input.variants),
    productRepo.replaceFeatures(id, input.features),
    productRepo.replaceImages(id, input.images),
  ]);
  return { id };
}

export async function deleteProduct(id: string) {
  const existing = await productRepo.byId(id);
  if (!existing) throw new ServiceError("Product not found.");
  return productRepo.softDelete(id);
}
