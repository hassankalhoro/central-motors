import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/server/auth";
import { writeAudit } from "@/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getSession();
  clearSessionCookie();
  if (session) await writeAudit({ userId: session.sub, action: "auth.logout" });
  return NextResponse.json({ ok: true });
}
