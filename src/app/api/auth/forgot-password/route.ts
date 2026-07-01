import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/server/services/passwordResetService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX = 5;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX;
}

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  let found = false;
  try {
    ({ found } = await requestPasswordReset(parsed.data.email, origin));
  } catch (err) {
    console.error("[forgot-password] failed:", err);
  }
  // Per request: tell the user when no account exists. (Note: this allows email
  // enumeration, acceptable for a small internal admin.)
  return NextResponse.json({ ok: true, found });
}
