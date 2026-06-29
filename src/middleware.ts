import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/* Edge gate for the admin panel. Verifies the session cookie (no DB) and
 * redirects unauthenticated users to the login page. Defence-in-depth: every
 * Server Action re-checks the session + role server-side. */

const SESSION_COOKIE = "cm_session";

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login, password-reset and auth API are public; everything else under /admin is gated.
  const PUBLIC = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  if (PUBLIC.includes(pathname) || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secret());
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
