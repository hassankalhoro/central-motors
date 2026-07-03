import { NextResponse } from "next/server";
import { selfRescheduleAppointment } from "@/server/services/bookingService";
import { ServiceError } from "@/server/services/categoryService";
import { sendRescheduledEmails } from "@/lib/appointmentEmail";
import { rateLimited, clientIp } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests, please try again in a minute." }, { status: 429 });
  }
  let body: { code?: string; phone?: string; date?: string; startTime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.code?.trim() || !body.phone?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.startTime ?? "")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    const { updated, previous } = await selfRescheduleAppointment(body.code, body.phone, body.date!, body.startTime!);
    try {
      await sendRescheduledEmails(updated, previous); // customer + dealership
    } catch (err) {
      console.error("[appointments:self-reschedule] notification failed:", err);
    }
    return NextResponse.json({
      ok: true,
      date: updated.date.toISOString().slice(0, 10),
      startTime: updated.startTime,
      endTime: updated.endTime,
    });
  } catch (err) {
    if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[appointments:self-reschedule]", err);
    return NextResponse.json({ error: "Could not move the booking, please try again." }, { status: 500 });
  }
}
