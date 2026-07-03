"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { writeAudit } from "@/server/audit";
import { ServiceError } from "@/server/services/categoryService";
import {
  confirmAppointment,
  cancelAppointment,
  approveCancellation,
  declineCancellation,
  completeAppointment,
  markNoShow,
  saveSchedule,
  updateBookingConfig,
  addBlackout,
  removeBlackout,
} from "@/server/services/bookingService";
import { sendConfirmedEmail, sendCancelledEmail, sendCancelApprovedEmail, sendCancelDeclinedEmail } from "@/lib/appointmentEmail";
import { scheduleSchema, bookingConfigSchema, blackoutSchema } from "@/server/validators/appointment";
import type { ActionResult } from "@/lib/action-result";

function revalidate() {
  revalidatePath("/admin/appointments");
  revalidatePath("/service-appointment");
}

/* ---- appointment lifecycle ----------------------------------------- */

export async function confirm(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await confirmAppointment(id, session.sub);
    await writeAudit({ userId: session.sub, action: "appointment.confirm", entity: `Appointment:${appt.code}` });
    try {
      await sendConfirmedEmail(appt); // customer notification (with calendar invite)
    } catch (err) {
      console.error("[appointments] confirm email failed:", err);
    }
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function cancel(id: string, reason?: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await cancelAppointment(id, reason);
    await writeAudit({ userId: session.sub, action: "appointment.cancel", entity: `Appointment:${appt.code}`, meta: { reason } });
    try {
      await sendCancelledEmail(appt);
    } catch (err) {
      console.error("[appointments] cancel email failed:", err);
    }
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Approve a customer's online cancellation request → booking becomes CANCELLED. */
export async function approveCancel(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await approveCancellation(id);
    await writeAudit({ userId: session.sub, action: "appointment.cancel_approve", entity: `Appointment:${appt.code}` });
    try {
      await sendCancelApprovedEmail(appt);
    } catch (err) {
      console.error("[appointments] cancel-approve email failed:", err);
    }
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Decline the request → booking returns to the pending queue, customer is told. */
export async function declineCancel(id: string, note?: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await declineCancellation(id);
    await writeAudit({ userId: session.sub, action: "appointment.cancel_decline", entity: `Appointment:${appt.code}`, meta: { note } });
    try {
      await sendCancelDeclinedEmail(appt, note);
    } catch (err) {
      console.error("[appointments] cancel-decline email failed:", err);
    }
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function complete(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await completeAppointment(id);
    await writeAudit({ userId: session.sub, action: "appointment.complete", entity: `Appointment:${appt.code}` });
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

export async function noShow(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("inquiry.manage"));
  try {
    const appt = await markNoShow(id);
    await writeAudit({ userId: session.sub, action: "appointment.no_show", entity: `Appointment:${appt.code}` });
    revalidate();
    return { ok: true };
  } catch (e) {
    if (e instanceof ServiceError) return { ok: false, error: e.message };
    throw e;
  }
}

/* ---- schedule & rules ------------------------------------------------ */

export async function saveScheduleAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await saveSchedule(parsed.data);
  await writeAudit({ userId: session.sub, action: "appointment.schedule_update", entity: "ScheduleDay" });
  revalidate();
  return { ok: true };
}

export async function saveConfigAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  const parsed = bookingConfigSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await updateBookingConfig(parsed.data);
  await writeAudit({ userId: session.sub, action: "appointment.config_update", entity: "Setting:booking*", meta: parsed.data });
  revalidate();
  return { ok: true };
}

export async function addBlackoutAction(input: unknown): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  const parsed = blackoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  await addBlackout(parsed.data.date, parsed.data.reason || undefined);
  await writeAudit({ userId: session.sub, action: "appointment.blackout_add", entity: `BlackoutDate:${parsed.data.date}` });
  revalidate();
  return { ok: true };
}

export async function removeBlackoutAction(id: string): Promise<ActionResult> {
  const session = await requireRole(...rolesFor("settings.manage"));
  await removeBlackout(id);
  await writeAudit({ userId: session.sub, action: "appointment.blackout_remove", entity: `BlackoutDate:${id}` });
  revalidate();
  return { ok: true };
}
