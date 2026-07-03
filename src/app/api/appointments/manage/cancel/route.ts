import { NextResponse } from "next/server";
import { selfCancelAppointment } from "@/server/services/bookingService";
import { ServiceError } from "@/server/services/categoryService";
import { sendSelfCancelledEmails } from "@/lib/appointmentEmail";
import { rateLimited, clientIp } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests, please try again in a minute." }, { status: 429 });
  }
  let body: { code?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.code?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Enter your booking reference and phone number." }, { status: 400 });
  }
  try {
    const appt = await selfCancelAppointment(body.code, body.phone);
    try {
      await sendSelfCancelledEmails(appt); // customer + dealership
    } catch (err) {
      console.error("[appointments:self-cancel] notification failed:", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[appointments:self-cancel]", err);
    return NextResponse.json({ error: "Could not cancel the booking, please try again." }, { status: 500 });
  }
}
