import { NextResponse } from "next/server";
import { appointmentCreateSchema } from "@/server/validators/appointment";
import { createAppointment } from "@/server/services/bookingService";
import { ServiceError } from "@/server/services/categoryService";
import { sendRequestedEmails } from "@/lib/appointmentEmail";
import { rateLimited, clientIp } from "@/lib/leads";

export const runtime = "nodejs"; // nodemailer needs Node, not Edge
export const dynamic = "force-dynamic";

/** Public booking request → PENDING appointment + both-way notifications. */
export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests, please try again in a minute." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // honeypot, silently accept bots
  if (typeof (raw as Record<string, unknown>)?.company === "string" && String((raw as Record<string, unknown>).company).trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = appointmentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: issue.message, field: issue.path.join(".") }, { status: 400 });
  }

  try {
    const appt = await createAppointment(parsed.data);
    try {
      await sendRequestedEmails(appt); // dealership + customer
    } catch (err) {
      console.error("[appointments:create] notification failed:", err); // booking survives mail outages
    }
    return NextResponse.json({
      ok: true,
      code: appt.code,
      date: appt.date.toISOString().slice(0, 10),
      startTime: appt.startTime,
      endTime: appt.endTime,
    });
  } catch (err) {
    if (err instanceof ServiceError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error("[appointments:create]", err);
    return NextResponse.json({ error: "Could not create the booking, please try again." }, { status: 500 });
  }
}
