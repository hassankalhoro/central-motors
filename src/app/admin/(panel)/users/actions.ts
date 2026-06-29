"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { userCreateSchema, userUpdateSchema } from "@/server/validators/user";
import { createUser, updateUser } from "@/server/services/userService";
import { ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";

export async function saveUser(input: unknown & { id?: string }): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("users.manage"));
  const id = (input as { id?: string }).id;
  const schema = id ? userUpdateSchema : userCreateSchema;
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  try {
    if (id) {
      const d = parsed.data as { name: string; role: "SUPER_ADMIN" | "ADMIN" | "EDITOR"; isActive: boolean; password?: string };
      await updateUser(id, { name: d.name, role: d.role, isActive: d.isActive, password: d.password || undefined });
    } else {
      const d = parsed.data as { name: string; email: string; role: "SUPER_ADMIN" | "ADMIN" | "EDITOR"; password: string };
      await createUser(d);
    }
    await writeAudit({ userId: session.sub, action: id ? "user.update" : "user.create", entity: id ? `User:${id}` : undefined });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message, field: e.field };
    throw e;
  }
}
