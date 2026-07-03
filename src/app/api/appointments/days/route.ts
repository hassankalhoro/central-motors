import { NextResponse } from "next/server";
import { getDaysOverview } from "@/server/services/bookingService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Day-by-day overview of the booking window (drives the public date picker). */
export async function GET() {
  try {
    const days = await getDaysOverview();
    return NextResponse.json({ days });
  } catch (err) {
    console.error("[appointments:days]", err);
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }
}
