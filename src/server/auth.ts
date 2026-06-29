import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export const SESSION_COOKIE = "cm_session";
const ALG = "HS256";

export type SessionUser = { sub: string; email: string; name: string; role: Role };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (≥ 32 chars).");
  return new TextEncoder().encode(s);
}

/** Signs a session JWT. `maxAgeSec` controls expiry (default 7 days). */
export async function signSession(user: SessionUser, maxAgeSec = 60 * 60 * 24 * 7): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(secret());
}

/** Verifies a token (edge-safe — no DB). Returns the session or null. */
export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name), role: payload.role as Role };
  } catch {
    return null;
  }
}

/** Reads the current session from the cookie (server components / actions). */
export async function getSession(): Promise<SessionUser | null> {
  return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
}

/** Throws via redirect to login if there is no valid session. */
export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

/** Like requireSession, but also enforces one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const s = await requireSession();
  if (!roles.includes(s.role)) redirect("/admin?error=forbidden");
  return s;
}

/**
 * Sets the session cookie. Pass `maxAgeSec` for a persistent cookie ("remember
 * me"); omit it for a session cookie that clears when the browser closes.
 */
export function setSessionCookie(token: string, maxAgeSec?: number) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(maxAgeSec ? { maxAge: maxAgeSec } : {}),
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
