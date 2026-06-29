"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole, requireSession } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { updateSettings, updateEmailConfig, getEmailConfig } from "@/server/services/settingsService";
import { sendMail, verifyConfig } from "@/server/services/mailer";
import { userRepo } from "@/server/repositories/user.repo";
import { hashPassword } from "@/server/services/authService";
import { emailSettingsSchema, passwordChangeSchema } from "@/server/validators/settings";
import type { ActionResult } from "@/lib/action-result";

const SITE_KEYS = [
  "siteName", "tagline", "address", "phone", "uan", "tel", "fax",
  "email", "email2", "servicePhone", "warrantyPhone", "facebook", "twitter", "instagram",
];

export async function saveSiteSettings(input: Record<string, string>): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  const map: Record<string, string> = {};
  for (const k of SITE_KEYS) if (typeof input[k] === "string") map[k] = input[k];
  await updateSettings(map);
  await writeAudit({ userId: session.sub, action: "settings.update", meta: { keys: Object.keys(map) } });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function saveEmailSettings(input: unknown): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  const parsed = emailSettingsSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const v = parsed.data;
  await updateEmailConfig({
    provider: v.smtpProvider,
    host: v.smtpHost,
    port: v.smtpPort,
    secure: v.smtpSecure,
    user: v.smtpUser,
    fromName: v.fromName,
    fromEmail: v.fromEmail,
    notifyTo: v.notifyTo,
    ...(v.smtpPass ? { pass: v.smtpPass } : {}),
  });
  await writeAudit({ userId: session.sub, action: "settings.email.update" });
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function sendTestEmail(input: unknown): Promise<ActionResult> {
  await requireRole(...rolesFor("settings.manage"));
  const parsed = emailSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  // Use the typed password if provided, else fall back to the stored one.
  const stored = await getEmailConfig();
  const cfg = {
    provider: v.smtpProvider,
    host: v.smtpHost,
    port: v.smtpPort,
    secure: v.smtpSecure,
    user: v.smtpUser,
    pass: v.smtpPass || stored.pass,
    fromName: v.fromName,
    fromEmail: v.fromEmail,
    notifyTo: v.notifyTo,
  };
  if (!cfg.pass) return { ok: false, error: "Enter the SMTP password to send a test." };
  try {
    await verifyConfig(cfg);
    await sendMail(cfg, {
      to: cfg.notifyTo,
      subject: "Test email — Suzuki Central Motors",
      text: "This is a test email confirming your SMTP settings are working.",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `SMTP error: ${(e as Error).message}` };
  }
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const user = await userRepo.byId(session.sub);
  if (!user || !(await bcrypt.compare(parsed.data.current, user.passwordHash))) {
    return { ok: false, error: "Current password is incorrect.", field: "current" };
  }
  await userRepo.update(user.id, { passwordHash: await hashPassword(parsed.data.next) });
  await writeAudit({ userId: user.id, action: "auth.password_change" });
  return { ok: true };
}
