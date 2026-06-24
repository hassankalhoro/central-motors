import { NextResponse } from "next/server";

export type LeadKind = "contact" | "inquiry" | "appointment";

/**
 * Shared handler for public lead forms. Phase 1: validates required fields and
 * acknowledges. Persistence + email notification are added in Phase 2 — the
 * contract ({ ok: true } / { error }) stays the same so the client never changes.
 */
export function createLeadHandler(kind: LeadKind, required: string[]) {
  return async function POST(req: Request) {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // honeypot — silently accept bots
    if (typeof body.company === "string" && body.company.trim()) {
      return NextResponse.json({ ok: true });
    }

    const missing = required.filter((k) => !String(body[k] ?? "").trim());
    if (missing.length) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    // TODO (Phase 2): persist submission + email notification (failure must not fail the request).
    return NextResponse.json({ ok: true, kind });
  };
}
