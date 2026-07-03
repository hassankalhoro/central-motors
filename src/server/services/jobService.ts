import "server-only";
import DOMPurify from "isomorphic-dompurify";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { ServiceError } from "./categoryService";
import type { JobInput } from "../validators/job";

/* Careers postings, fully admin-managed. */

/** Sanitise editor HTML server-side before it's ever stored or rendered. */
function clean(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export const listJobs = () => db.job.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

export const getJob = (id: string) => db.job.findUnique({ where: { id } });

async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title);
  if (!base) throw new ServiceError("Could not derive a link from the title.", "title");
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const clash = await db.job.findUnique({ where: { slug } });
    if (!clash || clash.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
  throw new ServiceError("Could not create a unique link for this job.");
}

export async function createJob(input: JobInput) {
  const slug = await uniqueSlug(input.title);
  const last = await db.job.findFirst({ orderBy: { order: "desc" } });
  return db.job.create({
    data: { slug, title: input.title, location: input.location, type: input.type, description: clean(input.description), published: input.published, order: (last?.order ?? 0) + 1 },
  });
}

export async function updateJob(id: string, input: JobInput) {
  const existing = await db.job.findUnique({ where: { id } });
  if (!existing) throw new ServiceError("Job not found.");
  const slug = await uniqueSlug(input.title, id);
  return db.job.update({
    where: { id },
    data: { slug, title: input.title, location: input.location, type: input.type, description: clean(input.description), published: input.published },
  });
}

export async function deleteJob(id: string) {
  const existing = await db.job.findUnique({ where: { id } });
  if (!existing) throw new ServiceError("Job not found.");
  await db.job.delete({ where: { id } });
  return existing;
}
