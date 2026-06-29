import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight liveness/readiness probe for uptime monitoring. */
export async function GET() {
  let database = false;
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }
  const ok = database;
  return NextResponse.json(
    { ok, database, storage: Boolean(process.env.CLOUDINARY_URL), time: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}
