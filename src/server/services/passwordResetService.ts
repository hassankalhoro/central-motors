import "server-only";
import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { getEmailConfig } from "./settingsService";
import { sendMail } from "./mailer";
import { hashPassword } from "./authService";
import { ServiceError } from "./categoryService";

const TTL_MS = 60 * 60 * 1000; // 1 hour

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/**
 * Starts a reset: creates a single-use token and emails the user a link.
 * Always resolves (no account enumeration), callers show a generic message.
 * Returns whether an email was actually sent (for logging only).
 */
export async function requestPasswordReset(
  email: string,
  origin: string,
): Promise<{ found: boolean; emailed: boolean }> {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) return { found: false, emailed: false };

  // Invalidate any outstanding tokens for this user, then mint a fresh one.
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const raw = randomBytes(32).toString("hex");
  await db.passwordResetToken.create({
    data: { userId: user.id, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + TTL_MS) },
  });

  const base = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, "");
  const link = `${base}/admin/reset-password?token=${raw}`;

  const cfg = await getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    console.error("[reset] SMTP not configured, cannot email reset link.");
    return { found: true, emailed: false };
  }

  const { subject, html, text } = resetEmail(user.name, link, cfg.fromName);
  await sendMail(cfg, { to: user.email, subject, html, text, replyTo: cfg.fromEmail });
  return { found: true, emailed: true };
}

/** Completes a reset: validates the token and sets the new password. */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  if (!rawToken) throw new ServiceError("Invalid or missing reset link.");
  if (newPassword.length < 8) throw new ServiceError("Password must be at least 8 characters.", "password");

  const token = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(rawToken) } });
  if (!token || token.usedAt || token.expiresAt < new Date()) {
    throw new ServiceError("This reset link is invalid or has expired. Please request a new one.");
  }

  await db.$transaction([
    db.user.update({ where: { id: token.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
    db.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
}

function resetEmail(name: string, link: string, fromName: string): { subject: string; html: string; text: string } {
  const subject = "Reset your Suzuki Central Motors admin password";
  const text =
    `Hello ${name},\n\n` +
    `We received a request to reset your admin password. Open the link below to choose a new one (valid for 1 hour):\n\n` +
    `${link}\n\n` +
    `If you didn't request this, you can safely ignore this email, your password won't change.\n\n— ${fromName}`;
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#eef1f7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(6,36,92,.12);">
      <tr><td style="background:linear-gradient(135deg,#06245C,#0d3a86);padding:24px 30px;">
        <div style="font:800 18px/1.1 sans-serif;color:#fff;">Suzuki Central Motors</div>
        <div style="margin-top:3px;font:600 11px/1.3 sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9db8e6;">Dealer Management Portal</div>
      </td></tr>
      <tr><td style="padding:30px;">
        <h1 style="margin:0 0 8px;font:800 20px/1.2 sans-serif;color:#0f1a30;">Reset your password</h1>
        <p style="margin:0 0 20px;font:400 15px/1.6 sans-serif;color:#5e6e8c;">Hello ${esc(name)}, we received a request to reset your admin password. Click below to choose a new one. This link is valid for <strong>1 hour</strong>.</p>
        <a href="${esc(link)}" style="display:inline-block;background:#E11622;color:#fff;font:700 14px sans-serif;text-decoration:none;padding:13px 26px;border-radius:10px;">Reset password</a>
        <p style="margin:22px 0 0;font:400 13px/1.6 sans-serif;color:#8090ad;">If the button doesn't work, copy this link into your browser:<br><a href="${esc(link)}" style="color:#1E55A8;word-break:break-all;">${esc(link)}</a></p>
        <p style="margin:18px 0 0;font:400 13px/1.6 sans-serif;color:#8090ad;">Didn't request this? You can safely ignore this email, your password won't change.</p>
      </td></tr>
      <tr><td style="padding:16px 30px;background:#f6f8fc;border-top:1px solid #eef1f6;font:400 12px/1.6 sans-serif;color:#8090ad;">${esc(fromName)} · Automated message</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, html, text };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
