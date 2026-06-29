import "server-only";
import nodemailer from "nodemailer";
import type { EmailConfig } from "./settingsService";

function buildTransport(cfg: EmailConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
  });
}

export async function sendMail(
  cfg: EmailConfig,
  msg: { to: string; subject: string; text?: string; html?: string; replyTo?: string },
): Promise<void> {
  const t = buildTransport(cfg);
  await t.sendMail({
    from: `${cfg.fromName} <${cfg.fromEmail}>`,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    replyTo: msg.replyTo,
  });
}

/** Confirms the SMTP credentials/connection are valid (used by the Settings "test" button). */
export async function verifyConfig(cfg: EmailConfig): Promise<void> {
  await buildTransport(cfg).verify();
}
