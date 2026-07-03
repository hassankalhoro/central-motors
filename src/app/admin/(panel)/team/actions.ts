"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAG } from "@/data/db";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { teamMemberSchema } from "@/server/validators/team";
import { createTeamMember, updateTeamMember, deleteTeamMember, moveTeamMember } from "@/server/services/teamService";
import { ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";

function revalidateAll() {
  revalidateTag(PUBLIC_CACHE_TAG); // public pages re-read the DB on next request
  revalidatePath("/management");
  revalidatePath("/admin/team");
}

export async function saveTeamMember(input: unknown & { id?: string }): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const id = (input as { id?: string }).id;
  try {
    const member = id ? await updateTeamMember(id, parsed.data) : await createTeamMember(parsed.data);
    await writeAudit({ userId: session.sub, action: id ? "team.update" : "team.create", entity: `TeamMember:${member.id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function removeTeamMember(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.delete"));
  try {
    const member = await deleteTeamMember(id);
    await writeAudit({ userId: session.sub, action: "team.delete", entity: `TeamMember:${member.id}`, meta: { name: member.name } });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function reorderTeamMember(id: string, dir: "up" | "down"): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("content.edit"));
  try {
    await moveTeamMember(id, dir);
    await writeAudit({ userId: session.sub, action: "team.reorder", entity: `TeamMember:${id}` });
    revalidateAll();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}
