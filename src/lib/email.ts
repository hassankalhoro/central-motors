import nodemailer from "nodemailer";
import type { LeadKind } from "./leads";
import { getEmailConfig } from "@/server/services/settingsService";

/* ------------------------------------------------------------------ *
 * SMTP transport (Titan Email by default)
 * ------------------------------------------------------------------ *
 * Configure via env (.env.local locally / Vercel env in prod):
 *   SMTP_HOST   e.g. smtp.titan.email
 *   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER   full mailbox e.g. contact@caisol.com
 *   SMTP_PASS   mailbox password
 *   MAIL_FROM   "Central Motors <contact@caisol.com>"
 *   MAIL_TO     destination inbox for notifications
 * ------------------------------------------------------------------ */

/* Compliance / footer config, env-overridable, with defaults matching the
 * dealership's published details (kept here so this module stays self-contained
 * and the preview/test scripts can import it without the Next path alias). */
const DEALER_NAME = "Central Motors";
const DEALER_ADDRESS =
  process.env.DEALER_ADDRESS ||
  "Main G.T. Road, Soan Camp, Opposite Toyota Rawal, Rawalpindi 46000, Pakistan";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk").replace(/\/$/, "");
const PRIVACY_URL = `${SITE_URL}/privacy`;
/** Where a recipient asks to stop these internal notifications. */
function unsubscribeMailto(): string {
  const admin = process.env.MAIL_TO || process.env.SMTP_USER || "";
  return `mailto:${admin}?subject=${encodeURIComponent("Unsubscribe: website form notifications")}`;
}

/** Builds an SMTP transport from the admin-configured email settings (DB). */
function buildTransport(cfg: { host: string; port: number; secure: boolean; user: string; pass: string }) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // 465 = implicit TLS, 587 = STARTTLS
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 12_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

/** Confirms the SMTP credentials/connection are valid. */
export async function verifyTransport(): Promise<void> {
  await buildTransport(await getEmailConfig()).verify();
}

/* ------------------------------------------------------------------ *
 * Generic outbound mail, used by the appointment notifications and any
 * future transactional email. Uses the same admin-configured transport.
 * ------------------------------------------------------------------ */
export type OutgoingMail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Calendar invite attachment (e.g. a confirmed appointment). */
  icalEvent?: { filename: string; method: "REQUEST" | "PUBLISH" | "CANCEL"; content: string };
};

export async function sendMail(mail: OutgoingMail): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    throw new Error("Email is not configured. Set SMTP details in Admin → Settings.");
  }
  await buildTransport(cfg).sendMail({
    from: `${cfg.fromName} <${cfg.fromEmail}>`,
    ...mail,
    headers: { "Auto-Submitted": "auto-generated" },
  });
}

/** The dealership inbox that receives operational notifications. */
export async function notificationInbox(): Promise<string> {
  const cfg = await getEmailConfig();
  return cfg.notifyTo || cfg.fromEmail || cfg.user;
}

/* ------------------------------------------------------------------ *
 * Field label maps, keep the email readable regardless of raw keys.
 * Order here = order in the email.
 * ------------------------------------------------------------------ */
const LABELS: Record<LeadKind, { field: string; label: string }[]> = {
  contact: [
    { field: "firstName", label: "First name" },
    { field: "lastName", label: "Last name" },
    { field: "email", label: "Email" },
    { field: "phone", label: "Phone" },
    { field: "method", label: "Preferred contact" },
    { field: "intent", label: "Intent" },
    { field: "message", label: "Message" },
  ],
  inquiry: [
    { field: "product", label: "Interested model" },
    { field: "name", label: "Full name" },
    { field: "phone", label: "Phone" },
    { field: "email", label: "Email" },
    { field: "cnic", label: "CNIC" },
    { field: "ntn", label: "NTN" },
    { field: "address", label: "Address" },
    { field: "message", label: "Message" },
  ],
  appointment: [
    { field: "name", label: "Full name" },
    { field: "phone", label: "Phone" },
    { field: "email", label: "Email" },
    { field: "model", label: "Vehicle / model" },
    { field: "registration", label: "Registration no." },
    { field: "date", label: "Preferred date" },
    { field: "serviceType", label: "Service type" },
    { field: "notes", label: "Notes" },
  ],
};

const KIND_TITLE: Record<LeadKind, string> = {
  contact: "New contact message",
  inquiry: "New sales inquiry",
  appointment: "New appointment request",
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type RenderInput = { kind: LeadKind; data: Record<string, unknown> };

/** Builds subject + HTML + plain-text bodies for a lead notification. */
export function renderLeadEmail({ kind, data }: RenderInput): {
  subject: string;
  html: string;
  text: string;
} {
  const title = KIND_TITLE[kind];
  const rows = LABELS[kind].filter((f) => String(data[f.field] ?? "").trim());

  // Subject line, pull a useful identifier into the subject.
  const who =
    String(data.name ?? "").trim() ||
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
    String(data.email ?? "").trim() ||
    "Website visitor";
  const model = String(data.product ?? "").trim();
  const serviceType = String(data.serviceType ?? "").trim();
  const subject =
    kind === "inquiry" && model
      ? `${title}: ${model}, ${who}`
      : kind === "appointment" && serviceType
        ? `${title}: ${serviceType}, ${who}`
        : `${title}, ${who}`;

  const text =
    `${title}\n` +
    `${"-".repeat(title.length)}\n\n` +
    rows.map((r) => `${r.label}: ${String(data[r.field])}`).join("\n") +
    `\n\n--\n` +
    `Automated notification to ${DEALER_NAME} staff, a visitor submitted a form on the website.\n` +
    `${DEALER_NAME}, ${DEALER_ADDRESS}\n` +
    `Privacy policy: ${PRIVACY_URL}\n` +
    `To stop these notifications, reply with "unsubscribe" or email the site administrator.\n` +
    `Sent ${new Date().toUTCString()}`;

  const tableRows = rows
    .map((r) => {
      const isMsg = r.field === "message";
      const value = esc(data[r.field]).replace(/\n/g, "<br>");
      return `
        <tr>
          <td class="lbl" style="padding:14px 0 4px;font:600 11px/1.4 -apple-system,Segoe UI,Roboto,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#7a8aa6;">${esc(
            r.label,
          )}</td>
        </tr>
        <tr>
          <td class="val" style="padding:0 0 12px;border-bottom:1px solid #eef1f6;font:${
            isMsg ? "400 15px/1.6" : "600 16px/1.4"
          } -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16203a;">${value}</td>
        </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin:0; padding:0; background:#eef1f7; -webkit-text-size-adjust:100%; }
  .wrap { width:100%; background:#eef1f7; padding:24px 12px; }
  .card { width:100%; max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(6,36,92,.12); }
  .pad { padding:28px 30px; }
  a { color:#1E55A8; }
  @media (max-width:480px) {
    .wrap { padding:14px 8px !important; }
    .pad { padding:22px 18px !important; }
    .hpad { padding:22px 18px !important; }
    .brand-name { font-size:17px !important; }
  }
  /* Dark mode (Apple Mail, iOS Mail, clients honouring prefers-color-scheme) */
  @media (prefers-color-scheme: dark) {
    body, .wrap { background:#0b1220 !important; }
    .card { background:#131c2e !important; box-shadow:0 10px 30px rgba(0,0,0,.5) !important; }
    .val { color:#e7edf5 !important; border-bottom-color:#26324a !important; }
    .lbl { color:#8aa0c6 !important; }
    .muted { color:#8aa0c6 !important; }
    .foot { background:#0e1626 !important; border-top-color:#26324a !important; }
    .intro { color:#c3d2ea !important; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <!--[if mso]><center><table role="presentation" width="560" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
    <table role="presentation" class="card" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;">
      <!-- header -->
      <tr>
        <td class="hpad" style="padding:26px 30px;background:#06245C;background:linear-gradient(135deg,#06245C 0%,#0d3a86 100%);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:middle;">
                <div class="brand-name" style="font:800 19px/1.1 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#ffffff;letter-spacing:-.01em;">Central Motors</div>
                <div style="margin-top:3px;font:600 11px/1.3 -apple-system,Segoe UI,Roboto,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9db8e6;">Website Notification</div>
              </td>
              <td style="vertical-align:middle;text-align:right;">
                <span style="display:inline-block;background:#E11622;color:#fff;font:700 11px/1 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:7px 12px;border-radius:999px;letter-spacing:.03em;">${esc(
                  kind.toUpperCase(),
                )}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- body -->
      <tr>
        <td class="pad" style="padding:28px 30px;">
          <h1 style="margin:0 0 4px;font:800 22px/1.2 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f1a30;">${esc(
            title,
          )}</h1>
          <p class="intro muted" style="margin:0 0 6px;font:400 14px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#5e6e8c;">
            A visitor submitted the ${esc(
              kind,
            )} form on the website. Details below.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${tableRows}
          </table>
        </td>
      </tr>
      <!-- footer (compliance) -->
      <tr>
        <td class="foot" style="padding:18px 30px;background:#f6f8fc;border-top:1px solid #eef1f6;">
          <p class="muted" style="margin:0 0 8px;font:400 12px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8090ad;">
            This is an automated notification sent to ${esc(
              DEALER_NAME,
            )} staff because a visitor submitted a form on the website. No action is required unless you wish to follow up.
          </p>
          <p class="muted" style="margin:0 0 8px;font:600 12px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8090ad;">
            ${esc(DEALER_NAME)} · ${esc(DEALER_ADDRESS)}
          </p>
          <p class="muted" style="margin:0;font:400 12px/1.6 -apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#8090ad;">
            <a href="${esc(PRIVACY_URL)}" style="color:#1E55A8;text-decoration:underline;">Privacy Policy</a>
            &nbsp;·&nbsp;
            <a href="${esc(unsubscribeMailto())}" style="color:#1E55A8;text-decoration:underline;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <span>${esc(new Date().toUTCString())}</span>
          </p>
        </td>
      </tr>
    </table>
    <!--[if mso]></td></tr></table></center><![endif]-->
  </div>
</body>
</html>`;

  return { subject, html, text };
}

/** Sends a lead notification email using the admin-configured SMTP (DB). Throws on failure. */
export async function sendLeadEmail(input: RenderInput): Promise<void> {
  const cfg = await getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    throw new Error("Email is not configured. Set SMTP details in Admin → Settings.");
  }
  const { subject, html, text } = renderLeadEmail(input);
  const from = `${cfg.fromName} <${cfg.fromEmail}>`;
  const to = cfg.notifyTo || cfg.fromEmail || cfg.user; // dealership inbox
  const replyTo = String(input.data.email ?? "").trim() || undefined;

  await buildTransport(cfg).sendMail({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    // RFC 2369, lets mail clients surface a native unsubscribe control.
    headers: {
      "List-Unsubscribe": `<mailto:${to}?subject=${encodeURIComponent("Unsubscribe: website form notifications")}>`,
      "Auto-Submitted": "auto-generated",
    },
  });
}
