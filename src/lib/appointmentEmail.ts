import type { Appointment } from "@prisma/client";
import { sendMail, notificationInbox } from "./email";

/* ────────────────────────────────────────────────────────────────
   Appointment notifications, both directions:
   - customer: request received → confirmed (with calendar invite) →
     cancelled (with reason)
   - dealership: new request landed (with a link to the admin panel)
   Every sender is fire-safe: callers wrap in try/catch so a mail
   outage never blocks or loses a booking.
   ──────────────────────────────────────────────────────────────── */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://centralmotors.com.pk").replace(/\/$/, "");
const DEALER = "Central Motors";
const ADDRESS = "Main G.T. Road, Soan Camp, Opposite Toyota Rawal, Rawalpindi";

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function prettyDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F6F9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#06245C;border-radius:14px 14px 0 0;padding:18px 24px;">
      <span style="color:#fff;font-size:17px;font-weight:bold;">${esc(DEALER)}</span>
    </div>
    <div style="background:#fff;border:1px solid #E3E7ED;border-top:0;border-radius:0 0 14px 14px;padding:26px 24px;">
      <h1 style="margin:0 0 12px;font-size:19px;color:#11161F;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="color:#94A1B3;font-size:11.5px;line-height:1.5;margin:14px 6px;">
      ${esc(DEALER)} · ${esc(ADDRESS)} · <a href="${SITE_URL}" style="color:#94A1B3;">${SITE_URL.replace("https://", "")}</a>
    </p>
  </div></body></html>`;
}

function detailsTable(a: Appointment): string {
  const rows: [string, string][] = [
    ["Reference", a.code],
    ["Date", prettyDate(a.date)],
    ["Time", `${a.startTime} – ${a.endTime}`],
    ["Vehicle", a.vehicle + (a.registration ? ` (${a.registration})` : "")],
    ["Service", a.serviceType],
    ["Name", a.name],
    ["Phone", a.phone],
  ];
  return `<table style="width:100%;border-collapse:collapse;margin:14px 0;">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 0;color:#6B7587;font-size:13px;width:110px;vertical-align:top;">${esc(k)}</td><td style="padding:7px 0;color:#11161F;font-size:13.5px;font-weight:bold;">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function textDetails(a: Appointment): string {
  return [
    `Reference: ${a.code}`,
    `Date: ${prettyDate(a.date)}`,
    `Time: ${a.startTime} - ${a.endTime}`,
    `Vehicle: ${a.vehicle}${a.registration ? ` (${a.registration})` : ""}`,
    `Service: ${a.serviceType}`,
    `Name: ${a.name}`,
    `Phone: ${a.phone}`,
  ].join("\n");
}

/** Minimal iCalendar event so the confirmation drops straight into the customer's calendar. */
function makeICS(a: Appointment): string {
  // Asia/Karachi is UTC+5 with no DST, emit UTC times.
  const utc = (hhmm: string) => {
    const mins = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) - 300; // -5h
    const d = new Date(Date.parse(`${a.date.toISOString().slice(0, 10)}T00:00:00Z`) + mins * 60_000);
    return d.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  };
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Central Motors//Appointments//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${a.code}@centralmotors.com.pk`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${utc(a.startTime)}`,
    `DTEND:${utc(a.endTime)}`,
    `SUMMARY:Workshop appointment (${a.serviceType}) — ${DEALER}`,
    `DESCRIPTION:Reference ${a.code}. Vehicle: ${a.vehicle}.`,
    `LOCATION:${ADDRESS}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ---- senders -------------------------------------------------------- */

export async function sendRequestedEmails(a: Appointment): Promise<void> {
  // dealership
  await sendMail({
    to: await notificationInbox(),
    subject: `New appointment request ${a.code}, ${a.name} · ${prettyDate(a.date)} ${a.startTime}`,
    html: shell(
      "New appointment request",
      `${detailsTable(a)}
       ${a.notes ? `<p style="color:#3A4458;font-size:13.5px;"><b>Notes:</b> ${esc(a.notes)}</p>` : ""}
       <a href="${SITE_URL}/admin/appointments" style="display:inline-block;background:#E11622;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;margin-top:6px;">Review &amp; confirm</a>`,
    ),
    text: `New appointment request\n\n${textDetails(a)}${a.notes ? `\nNotes: ${a.notes}` : ""}\n\nReview: ${SITE_URL}/admin/appointments`,
    replyTo: a.email || undefined,
  });

  // customer (when we have an email)
  if (a.email) {
    await sendMail({
      to: a.email,
      subject: `We received your booking request ${a.code}, ${DEALER}`,
      html: shell(
        "Your booking request is in",
        `<p style="color:#3A4458;font-size:14px;line-height:1.6;">Thank you, ${esc(a.name.split(" ")[0])}! We've received your workshop booking request and our team will <b>confirm your slot shortly</b>. Keep your reference handy:</p>
         ${detailsTable(a)}
         <p style="color:#6B7587;font-size:12.5px;">Need to change something? <a href="${SITE_URL}/manage-booking" style="color:#1E55A8;font-weight:bold;">Cancel or reschedule online</a> with your reference.</p>`,
      ),
      text: `Thank you! We received your workshop booking request and will confirm your slot shortly.\n\n${textDetails(a)}`,
    });
  }
}

export async function sendConfirmedEmail(a: Appointment): Promise<void> {
  if (!a.email) return;
  await sendMail({
    to: a.email,
    subject: `Confirmed: your appointment ${a.code} on ${prettyDate(a.date)}, ${DEALER}`,
    html: shell(
      "Your appointment is confirmed ✔",
      `<p style="color:#3A4458;font-size:14px;line-height:1.6;">Good news, ${esc(a.name.split(" ")[0])}! Your slot is booked. We look forward to seeing you.</p>
       ${detailsTable(a)}
       <p style="color:#6B7587;font-size:12.5px;">${esc(ADDRESS)}. Please arrive 10 minutes early with your registration documents.</p>`,
    ),
    text: `Your appointment is confirmed.\n\n${textDetails(a)}\n\n${ADDRESS}. Please arrive 10 minutes early.`,
    icalEvent: { filename: `${a.code}.ics`, method: "PUBLISH", content: makeICS(a) },
  });
}

export async function sendCancelledEmail(a: Appointment): Promise<void> {
  if (!a.email) return;
  await sendMail({
    to: a.email,
    subject: `Your appointment ${a.code} has been cancelled, ${DEALER}`,
    html: shell(
      "Appointment cancelled",
      `<p style="color:#3A4458;font-size:14px;line-height:1.6;">Your appointment <b>${esc(a.code)}</b> for ${esc(prettyDate(a.date))} at ${esc(a.startTime)} has been cancelled${a.cancelReason ? `: <i>${esc(a.cancelReason)}</i>` : "."}</p>
       <p style="color:#3A4458;font-size:14px;">You can book a new slot any time:</p>
       <a href="${SITE_URL}/service-appointment" style="display:inline-block;background:#E11622;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;">Book a new appointment</a>`,
    ),
    text: `Your appointment ${a.code} for ${prettyDate(a.date)} at ${a.startTime} has been cancelled${a.cancelReason ? `: ${a.cancelReason}` : "."}\n\nBook again: ${SITE_URL}/service-appointment`,
  });
}

/** Customer asked to cancel online → the booking is NOT cancelled yet. Alert the
 *  dealership to approve or decline, and acknowledge the request to the customer. */
export async function sendCancelRequestedEmails(a: Appointment): Promise<void> {
  await sendMail({
    to: await notificationInbox(),
    subject: `Cancellation requested: ${a.code}, ${a.name} · ${prettyDate(a.date)} ${a.startTime}`,
    html: shell(
      "Customer requests a cancellation",
      `<p style="color:#3A4458;font-size:14px;line-height:1.6;">The customer asked to cancel this booking online. The slot stays reserved until you <b>approve or decline</b> the request in the admin panel.</p>
       ${detailsTable(a)}
       <a href="${SITE_URL}/admin/appointments?status=CANCEL_REQUESTED" style="display:inline-block;background:#E11622;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;margin-top:6px;">Review request</a>`,
    ),
    text: `The customer asked to cancel this booking online. It stays reserved until you approve or decline the request.\n\n${textDetails(a)}\n\nReview: ${SITE_URL}/admin/appointments?status=CANCEL_REQUESTED`,
    replyTo: a.email || undefined,
  });
  if (a.email) {
    await sendMail({
      to: a.email,
      subject: `We received your cancellation request ${a.code}, ${DEALER}`,
      html: shell(
        "Cancellation request received",
        `<p style="color:#3A4458;font-size:14px;line-height:1.6;">We've received your request to cancel appointment <b>${esc(a.code)}</b> for ${esc(prettyDate(a.date))} at ${esc(a.startTime)}. Our team will review it shortly and you'll get an email as soon as it's processed.</p>
         <p style="color:#6B7587;font-size:12.5px;">Until then the booking remains in place. If this was a mistake, please call the workshop.</p>`,
      ),
      text: `We've received your request to cancel appointment ${a.code} for ${prettyDate(a.date)} at ${a.startTime}. Our team will review it shortly and email you once it's processed. Until then the booking remains in place.`,
    });
  }
}

/** Dealership approved the cancellation request → final confirmation to the customer. */
export async function sendCancelApprovedEmail(a: Appointment): Promise<void> {
  if (!a.email) return;
  await sendMail({
    to: a.email,
    subject: `Your appointment ${a.code} is now cancelled, ${DEALER}`,
    html: shell(
      "Your booking is cancelled",
      `<p style="color:#3A4458;font-size:14px;line-height:1.6;">As requested, your appointment <b>${esc(a.code)}</b> for ${esc(prettyDate(a.date))} at ${esc(a.startTime)} has been cancelled. We hope to see you another time.</p>
       <a href="${SITE_URL}/service-appointment" style="display:inline-block;background:#E11622;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;">Book a new appointment</a>`,
    ),
    text: `As requested, your appointment ${a.code} for ${prettyDate(a.date)} at ${a.startTime} has been cancelled.\n\nBook again: ${SITE_URL}/service-appointment`,
  });
}

/** Dealership declined the request → tell the customer the booking still stands. */
export async function sendCancelDeclinedEmail(a: Appointment, note?: string): Promise<void> {
  if (!a.email) return;
  await sendMail({
    to: a.email,
    subject: `About your cancellation request ${a.code}, ${DEALER}`,
    html: shell(
      "Your booking is still in place",
      `<p style="color:#3A4458;font-size:14px;line-height:1.6;">We couldn't process your request to cancel appointment <b>${esc(a.code)}</b>${note ? `: <i>${esc(note)}</i>` : "."} Your booking for ${esc(prettyDate(a.date))} at ${esc(a.startTime)} remains in place.</p>
       ${detailsTable(a)}
       <p style="color:#6B7587;font-size:12.5px;">If you still need to cancel or move it, please call the workshop and we'll sort it out.</p>`,
    ),
    text: `We couldn't process your request to cancel appointment ${a.code}${note ? `: ${note}` : "."} Your booking remains in place.\n\n${textDetails(a)}\n\nIf you still need to cancel or move it, please call the workshop.`,
  });
}

/** Customer moved the booking online → notify both sides (slot needs re-confirmation). */
export async function sendRescheduledEmails(
  a: Appointment,
  previous: { date: Date; startTime: string; endTime: string },
): Promise<void> {
  const oldLine = `${prettyDate(previous.date)} · ${previous.startTime} – ${previous.endTime}`;
  await sendMail({
    to: await notificationInbox(),
    subject: `Rescheduled by customer: ${a.code}, now ${prettyDate(a.date)} ${a.startTime} (needs confirmation)`,
    html: shell(
      "Booking rescheduled by the customer",
      `<p style="color:#3A4458;font-size:14px;">Moved from <b>${esc(oldLine)}</b>. The new slot is pending, please review and confirm.</p>
       ${detailsTable(a)}
       <a href="${SITE_URL}/admin/appointments" style="display:inline-block;background:#E11622;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 22px;border-radius:999px;">Review &amp; confirm</a>`,
    ),
    text: `The customer moved this booking online.\nPrevious: ${oldLine}\n\n${textDetails(a)}\n\nReview: ${SITE_URL}/admin/appointments`,
    replyTo: a.email || undefined,
  });
  if (a.email) {
    await sendMail({
      to: a.email,
      subject: `Your appointment ${a.code} has been moved, ${DEALER}`,
      html: shell(
        "Your new time is requested",
        `<p style="color:#3A4458;font-size:14px;line-height:1.6;">We've moved your booking from <b>${esc(oldLine)}</b> to the details below. Our team will <b>confirm the new slot shortly</b>.</p>${detailsTable(a)}`,
      ),
      text: `We've moved your booking from ${oldLine}.\n\n${textDetails(a)}\n\nOur team will confirm the new slot shortly.`,
    });
  }
}
