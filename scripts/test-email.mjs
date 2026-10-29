/**
 * SMTP smoke test — verifies the Titan connection and (optionally) sends one
 * sample of each lead email using the REAL template, so you can confirm
 * delivery + rendering (dark/light, mobile) in the destination inbox.
 *
 *   node --experimental-strip-types scripts/test-email.mjs          # verify + send
 *   node --experimental-strip-types scripts/test-email.mjs verify   # verify only
 *
 * Reads SMTP_* / MAIL_* from .env.local.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import nodemailer from "nodemailer";
import { renderLeadEmail } from "../src/lib/email.ts";

// --- minimal .env.local loader (no extra deps) ---
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
} catch {
  console.error("Could not read .env.local"); process.exit(1);
}

const { SMTP_HOST = "smtp.titan.email", SMTP_PORT = "465", SMTP_USER, SMTP_PASS } = process.env;
if (!SMTP_USER || !SMTP_PASS || SMTP_PASS === "REPLACE_WITH_PASSWORD") {
  console.error("✗ SMTP_USER / SMTP_PASS not set in .env.local"); process.exit(1);
}

const port = Number(SMTP_PORT);
const transport = nodemailer.createTransport({
  host: SMTP_HOST, port, secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10000, greetingTimeout: 8000,
});

const SAMPLES = {
  contact: { firstName: "Ahmed", lastName: "Khan", email: "ahmed.khan@example.com", phone: "0300-1234567", method: "WhatsApp", intent: "Buy a vehicle", message: "Salam, I'm interested in the Swift GLX. What's the on-road price and is it available this week?" },
  inquiry: { product: "Fronx", name: "Sara Malik", phone: "0321-9876543", email: "sara.malik@example.com", cnic: "37405-1234567-8", address: "Bahria Town, Rawalpindi", message: "Please share the GLX 6AT two-tone availability and booking process." },
  appointment: { name: "M Hammad", phone: "0300-1232132", email: "mhammad@vectortechsol.com", model: "Swift 2018", registration: "RIK-1234", date: "2026-07-02", serviceType: "General service", notes: "Car pulls slightly to the left and AC cooling is weak. Please check during the service." },
};

async function main() {
  process.stdout.write(`→ Verifying ${SMTP_HOST}:${port} as ${SMTP_USER} … `);
  await transport.verify();
  console.log("OK ✓");
  if (process.argv[2] === "verify") return;

  const to = process.env.MAIL_TO || SMTP_USER;
  const from = process.env.MAIL_FROM || `Central Motors <${SMTP_USER}>`;

  for (const [kind, data] of Object.entries(SAMPLES)) {
    const { subject, html, text } = renderLeadEmail({ kind, data });
    process.stdout.write(`→ Sending ${kind} (real template) to ${to} … `);
    const info = await transport.sendMail({ from, to, subject: `[TEST] ${subject}`, html, text, replyTo: data.email });
    console.log(`sent ✓ (${info.messageId})`);
  }
  console.log("\nDone. Check the inbox for both messages.");
}

main().catch((e) => { console.error("\n✗ FAILED:", e.message); process.exit(1); });
