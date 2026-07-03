"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAG } from "@/data/db";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { newsSchema } from "@/server/validators/news";
import { createNews, updateNews, deleteNews } from "@/server/services/newsService";
import { ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";

function revalidateAll() {
  revalidateTag(PUBLIC_CACHE_TAG); // public pages re-read the DB on next request
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function saveNews(input: unknown & { id?: string }): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  const parsed = newsSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const id = (input as { id?: string }).id;
  try {
    const post = id ? await updateNews(id, parsed.data) : await createNews(parsed.data, session.sub);
    await writeAudit({ userId: session.sub, action: id ? "news.update" : "news.create", entity: `NewsPost:${post.id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message, field: e.field };
    throw e;
  }
}

export async function removeNews(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.delete"));
  try {
    await deleteNews(id);
    await writeAudit({ userId: session.sub, action: "news.delete", entity: `NewsPost:${id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}
