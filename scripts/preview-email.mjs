/**
 * Renders the REAL lead-email template to HTML files so you can open them in a
 * browser and verify light/dark mode + mobile width before any SMTP send.
 *
 *   node --experimental-strip-types scripts/preview-email.mjs
 *
 * Writes preview/contact.html and preview/inquiry.html.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLeadEmail } from "../src/lib/email.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "preview");
mkdirSync(outDir, { recursive: true });

const SAMPLES = {
  contact: { firstName: "Ahmed", lastName: "Khan", email: "ahmed.khan@example.com", phone: "0300-1234567", method: "WhatsApp", intent: "Buy a vehicle", message: "Salam, I'm interested in the Swift GLX. What's the on-road price and is it available this week?\n\nAlso do you offer leasing?" },
  inquiry: { product: "Fronx", name: "Sara Malik", phone: "0321-9876543", email: "sara.malik@example.com", cnic: "37405-1234567-8", address: "Bahria Town, Rawalpindi", message: "Please share the GLX 6AT two-tone availability and booking process." },
  appointment: { name: "M Hammad", phone: "0300-1232132", email: "mhammad@vectortechsol.com", model: "Swift 2018", registration: "RIK-1234", date: "2026-07-02", serviceType: "General service", notes: "Car pulls slightly to the left and AC cooling is weak. Please check during the service." },
};

for (const [kind, data] of Object.entries(SAMPLES)) {
  const { subject, html } = renderLeadEmail({ kind, data });
  writeFileSync(join(outDir, `${kind}.html`), html);
  console.log(`✓ ${kind}.html  —  subject: ${subject}`);
}
console.log(`\nOpen the files in ./preview to verify rendering.`);
