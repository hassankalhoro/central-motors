import { NextResponse } from "next/server";
import { authenticate } from "@/server/services/authService";
import { signSession, setSessionCookie } from "@/server/auth";
import { loginSchema } from "@/server/validators/auth";
import { writeAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Per-IP login throttle to slow credential stuffing. In-memory is fine for a
 * single-instance dealership site (matches the public-form limiter). */
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 400 });
  }

  const { email, password, remember } = parsed.data;
  const user = await authenticate(email, password);
  if (!user) {
    // Generic message — no account enumeration.
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  // Remember me → persistent 30-day cookie. Otherwise → session cookie (clears on
  // browser close) with a 1-day token cap as a safety net.
  const tokenTtl = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const token = await signSession(user, tokenTtl);
  setSessionCookie(token, remember ? tokenTtl : undefined);
  await writeAudit({ userId: user.sub, action: "auth.login" });

  return NextResponse.json({ ok: true });
}
