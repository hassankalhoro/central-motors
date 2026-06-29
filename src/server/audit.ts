import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/** Records an admin mutation for accountability. Never throws into the caller. */
export async function writeAudit(input: {
  userId?: string | null;
  action: string; // "product.update", "auth.login"
  entity?: string | null; // "Product:cuid"
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const ip = (headers().get("x-forwarded-for") || "").split(",")[0].trim() || null;
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity ?? null,
        meta: (input.meta ?? undefined) as object | undefined,
        ip,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write log:", err);
  }
}
