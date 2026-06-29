"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { categorySchema } from "@/server/validators/category";
import { createCategory, updateCategory, deleteCategory, ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";

function revalidateAll() {
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

export async function saveCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  blurb?: string;
}): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path[0] as string | undefined };
  }
  try {
    const cat = input.id
      ? await updateCategory(input.id, parsed.data)
      : await createCategory(parsed.data);
    await writeAudit({
      userId: session.sub,
      action: input.id ? "category.update" : "category.create",
      entity: `Category:${cat.id}`,
    });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message, field: e.field };
    throw e;
  }
}

export async function removeCategory(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.delete"));
  try {
    await deleteCategory(id);
    await writeAudit({ userId: session.sub, action: "category.delete", entity: `Category:${id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}
