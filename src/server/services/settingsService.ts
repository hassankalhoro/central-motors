import "server-only";
import { settingsRepo } from "../repositories/settings.repo";
import { encryptSecret, decryptSecret } from "../crypto";

export type EmailConfig = {
  provider: string; // titan | gmail | custom
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string; // decrypted (empty if never set)
  fromName: string;
  fromEmail: string;
  notifyTo: string;
};

const SMTP_KEYS = [
  "smtpProvider",
  "smtpHost",
  "smtpPort",
  "smtpSecure",
  "smtpUser",
  "smtpPassEnc",
  "fromName",
  "fromEmail",
  "notifyTo",
];

/** All settings as a flat map (site + email). Secrets excluded by the caller. */
export async function getSettings(): Promise<Record<string, string>> {
  return settingsRepo.all();
}

/** Updates arbitrary site settings (non-secret). */
export async function updateSettings(map: Record<string, string>): Promise<void> {
  await settingsRepo.setMany(map);
}

/** Email/SMTP config with the password decrypted. Falls back to env when unset. */
export async function getEmailConfig(): Promise<EmailConfig> {
  const s = await settingsRepo.all();
  let pass = "";
  if (s.smtpPassEnc) {
    try {
      pass = decryptSecret(s.smtpPassEnc);
    } catch {
      pass = "";
    }
  } else if (process.env.SMTP_PASS) {
    pass = process.env.SMTP_PASS; // legacy env fallback so mail keeps working pre-config
  }
  return {
    provider: s.smtpProvider || "titan",
    host: s.smtpHost || process.env.SMTP_HOST || "smtp.titan.email",
    port: Number(s.smtpPort || process.env.SMTP_PORT || 465),
    secure: (s.smtpSecure ?? "true") === "true",
    user: s.smtpUser || process.env.SMTP_USER || "",
    pass,
    fromName: s.fromName || "Central Motors",
    fromEmail: s.fromEmail || s.smtpUser || process.env.SMTP_USER || "",
    notifyTo: s.notifyTo || process.env.MAIL_TO || s.smtpUser || "",
  };
}

/** Saves email config; encrypts the password only when a new one is provided. */
export async function updateEmailConfig(input: Partial<EmailConfig> & { pass?: string }): Promise<void> {
  const map: Record<string, string> = {};
  if (input.provider !== undefined) map.smtpProvider = input.provider;
  if (input.host !== undefined) map.smtpHost = input.host;
  if (input.port !== undefined) map.smtpPort = String(input.port);
  if (input.secure !== undefined) map.smtpSecure = String(input.secure);
  if (input.user !== undefined) map.smtpUser = input.user;
  if (input.fromName !== undefined) map.fromName = input.fromName;
  if (input.fromEmail !== undefined) map.fromEmail = input.fromEmail;
  if (input.notifyTo !== undefined) map.notifyTo = input.notifyTo;
  // Only (re)write the secret when a non-empty password is supplied.
  if (input.pass) map.smtpPassEnc = encryptSecret(input.pass);
  await settingsRepo.setMany(map);
}

export { SMTP_KEYS };
