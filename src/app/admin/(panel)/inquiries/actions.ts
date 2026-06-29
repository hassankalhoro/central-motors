"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { setInquiryStatus, replyToInquiry } from "@/server/services/leadService";
import { ServiceError } from "@/server/services/categoryService";
import type { ActionResult } from "@/lib/action-result";
import type { SubmissionStatus } from "@prisma/client";

export async function setStatus(id: string, status: SubmissionStatus): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    await setInquiryStatus(id, status, session.sub);
    await writeAudit({ userId: session.sub, action: "inquiry.status", entity: `Submission:${id}`, meta: { status } });
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function reply(id: string, message: string, subject?: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  if (!message.trim()) return { ok: false, error: "Reply message is empty." };
  try {
    await replyToInquiry(id, session.sub, message.trim(), subject);
    await writeAudit({ userId: session.sub, action: "inquiry.reply", entity: `Submission:${id}` });
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}
