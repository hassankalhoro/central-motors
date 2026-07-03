import { NextResponse } from "next/server";
import { getAvailability } from "@/server/services/bookingService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Slot availability for one day: /api/appointments/availability?date=YYYY-MM-DD */
export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }
  try {
    return NextResponse.json(await getAvailability(date));
  } catch (err) {
    console.error("[appointments:availability]", err);
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }
}
