import "server-only";
import { categoryRepo } from "../repositories/category.repo";
import { slugify } from "@/lib/slug";

export type CategoryWithCount = Awaited<ReturnType<typeof listCategories>>[number];

/** A friendly error the action layer can surface to the form. */
export class ServiceError extends Error {
  field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

export async function listCategories() {
  const [cats, counts] = await Promise.all([categoryRepo.list(), categoryRepo.productCounts()]);
  return cats.map((c) => ({ ...c, productCount: counts[c.id] ?? 0 }));
}

export async function createCategory(input: { name: string; slug?: string; blurb?: string }) {
  const slug = slugify(input.slug || input.name);
  if (!slug) throw new ServiceError("Could not derive a slug from the name.", "name");
  if (await categoryRepo.bySlug(slug)) throw new ServiceError("A category with this slug already exists.", "slug");
  return categoryRepo.create({
    slug,
    name: input.name,
    blurb: input.blurb?.trim() || null,
    order: await categoryRepo.nextOrder(),
  });
}

export async function updateCategory(id: string, input: { name: string; slug?: string; blurb?: string }) {
  const existing = await categoryRepo.byId(id);
  if (!existing) throw new ServiceError("Category not found.");
  const slug = slugify(input.slug || input.name);
  if (!slug) throw new ServiceError("Could not derive a slug from the name.", "name");
  const clash = await categoryRepo.bySlug(slug);
  if (clash && clash.id !== id) throw new ServiceError("A category with this slug already exists.", "slug");
  return categoryRepo.update(id, { slug, name: input.name, blurb: input.blurb?.trim() || null });
}

export async function deleteCategory(id: string) {
  const count = await categoryRepo.countProducts(id);
  if (count > 0) {
    throw new ServiceError(`This category has ${count} product${count === 1 ? "" : "s"}. Move or remove them first.`);
  }
  return categoryRepo.delete(id);
}
