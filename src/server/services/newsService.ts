import "server-only";
import DOMPurify from "isomorphic-dompurify";
import { newsRepo } from "../repositories/news.repo";
import { ServiceError } from "./categoryService";
import { slugify } from "@/lib/slug";
import type { NewsInput } from "../validators/news";

type Filter = "all" | "published" | "drafts";

/** Sanitise editor HTML server-side before it's ever stored or rendered. */
function clean(html?: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export const listNews = (filter: Filter, search?: string) => newsRepo.list(filter, search);
export const getNewsPost = (id: string) => newsRepo.byId(id);

export async function createNews(input: NewsInput, authorId: string) {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new ServiceError("Could not derive a slug from the title.", "title");
  if (await newsRepo.bySlug(slug)) throw new ServiceError("A post with this slug already exists.", "slug");
  return newsRepo.create({
    slug,
    title: input.title,
    excerpt: input.excerpt || null,
    body: clean(input.body),
    imageUrl: input.imageUrl || null,
    imagePublicId: input.imagePublicId || null,
    published: input.published,
    publishedAt: input.published ? new Date() : null,
    author: { connect: { id: authorId } },
  });
}

export async function updateNews(id: string, input: NewsInput) {
  const existing = await newsRepo.byId(id);
  if (!existing) throw new ServiceError("Post not found.");
  const slug = slugify(input.slug || input.title);
  const clash = await newsRepo.bySlug(slug);
  if (clash && clash.id !== id) throw new ServiceError("A post with this slug already exists.", "slug");
  // Set publishedAt the first time it goes live; keep the original otherwise.
  const publishedAt = input.published ? existing.publishedAt ?? new Date() : null;
  return newsRepo.update(id, {
    slug,
    title: input.title,
    excerpt: input.excerpt || null,
    body: clean(input.body),
    imageUrl: input.imageUrl || null,
    imagePublicId: input.imagePublicId || null,
    published: input.published,
    publishedAt,
  });
}

export async function deleteNews(id: string) {
  const existing = await newsRepo.byId(id);
  if (!existing) throw new ServiceError("Post not found.");
  return newsRepo.delete(id);
}
