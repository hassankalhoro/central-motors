import { NextResponse } from "next/server";
import { findAppointmentForCustomer, selfServiceEligibility, getBookingConfig, dbDateToStr } from "@/server/services/bookingService";
import { rateLimited, clientIp } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Look up a booking by reference code + phone (both must match). */
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
  const appt = await findAppointmentForCustomer(body.code, body.phone);
  if (!appt) {
    return NextResponse.json({ error: "We couldn't find a booking with that reference and phone number." }, { status: 404 });
  }
  const config = await getBookingConfig();
  const eligibility = selfServiceEligibility(appt, config.minNoticeHours);
  return NextResponse.json({
    ok: true,
    appointment: {
      code: appt.code,
      name: appt.name,
      vehicle: appt.vehicle + (appt.registration ? ` (${appt.registration})` : ""),
      serviceType: appt.serviceType,
      date: dbDateToStr(appt.date),
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      canModify: eligibility.ok,
      reason: eligibility.reason ?? null,
    },
  });
}
