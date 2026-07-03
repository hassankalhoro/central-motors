import { NextResponse } from "next/server";
import { sendLeadEmail } from "./email";
import { db } from "./db";

export type LeadKind = "contact" | "inquiry" | "appointment";

/** Pulls a best-effort display name from a form payload (varies by form). */
function displayName(body: Record<string, string>): string {
  return (
    body.name ||
    [body.firstName, body.lastName].filter(Boolean).join(" ") ||
    ""
  ).trim();
}

/** Persists a submission. Returns the row id, or null if the write fails. */
async function saveSubmission(kind: LeadKind, body: Record<string, string>) {
  try {
    const row = await db.submission.create({
      data: {
        kind,
        name: displayName(body) || null,
        email: body.email || null,
        phone: body.phone || null,
        message: body.message || null,
        productSlug: body.product || body.model || null,
        payload: body,
      },
    });
    return row.id;
  } catch (err) {
    console.error(`[lead:${kind}] failed to persist submission:`, err);
    return null;
  }
}

/** Max characters accepted for any single field (defence against abuse). */
const MAX_FIELD_LEN = 4000;
/** Max distinct fields accepted in one payload. */
const MAX_FIELDS = 40;

/* ------------------------------------------------------------------ *
 * Lightweight in-memory rate limiter (per IP).
 * Good enough for a single-instance dealership site; swap for Redis/
 * Upstash when scaling horizontally (see BACKEND-ARCHITECTURE.md).
 * ------------------------------------------------------------------ */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    // opportunistic cleanup so the map can't grow unbounded
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}

/** Normalises raw form input: trims, caps length, drops oversized payloads. */
function sanitize(body: Record<string, unknown>): Record<string, string> | null {
  const keys = Object.keys(body);
  if (keys.length > MAX_FIELDS) return null;
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = body[k];
    if (v == null) continue;
    const s = String(v);
    if (s.length > MAX_FIELD_LEN) return null;
    out[k] = s.trim();
  }
  return out;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared handler for public lead forms. Rate-limits, validates and sanitises
 * input, emails the dealership a notification, and acknowledges. The response
 * contract ({ ok: true } / { error }) is stable so the client never changes.
 *
 * Email delivery is best-effort: an SMTP failure is logged but does NOT fail
 * the request, so a visitor's submission is never lost to a mail outage.
 */
export function createLeadHandler(kind: LeadKind, required: string[]) {
  return async function POST(req: Request) {
    if (rateLimited(clientIp(req))) {
      return NextResponse.json(
        { error: "Too many requests, please try again in a minute." },
        { status: 429 },
      );
    }

    let raw: Record<string, unknown>;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // honeypot, silently accept bots (don't tip them off)
    if (typeof raw.company === "string" && raw.company.trim()) {
      return NextResponse.json({ ok: true });
    }

    const body = sanitize(raw);
    if (!body) {
      return NextResponse.json({ error: "Submission too large." }, { status: 413 });
    }

    const missing = required.filter((k) => !body[k]);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    // light format validation, email is the channel we reply on
    if (body.email && !EMAIL_RE.test(body.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // Persist first, a saved lead is never lost, even if email later fails.
    await saveSubmission(kind, body);

    try {
      await sendLeadEmail({ kind, data: body });
    } catch (err) {
      // Never block the user on a mail failure, log for ops to follow up.
      console.error(`[lead:${kind}] email notification failed:`, err);
    }

    return NextResponse.json({ ok: true, kind });
  };
}
