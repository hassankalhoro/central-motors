import "server-only";
import { randomBytes } from "crypto";
import type { Appointment, AppointmentStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ServiceError } from "./categoryService";
import type { AppointmentCreateInput, BookingConfig } from "../validators/appointment";

/* ────────────────────────────────────────────────────────────────
   Workshop booking engine.
   - Weekly hours per weekday (ScheduleDay) + holiday blackouts.
   - Slot duration / capacity / booking window / minimum notice are
     admin-tunable Setting keys (booking*).
   - A slot's capacity is consumed by PENDING + CONFIRMED bookings;
     creation and confirmation run under a Postgres advisory lock so
     concurrent requests can never overbook.
   ──────────────────────────────────────────────────────────────── */

/** Statuses that hold a place in a slot. A cancellation request keeps its
 *  slot reserved until the team approves it, so it still counts. */
const ACTIVE: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CANCEL_REQUESTED"];

export const CONFIG_KEYS = {
  slotMinutes: "bookingSlotMinutes",
  gapMinutes: "bookingSlotGapMinutes",
  capacity: "bookingCapacity",
  windowDays: "bookingWindowDays",
  minNoticeHours: "bookingMinNoticeHours",
} as const;

export const CONFIG_DEFAULTS: BookingConfig = { slotMinutes: 60, gapMinutes: 0, capacity: 2, windowDays: 30, minNoticeHours: 2 };

/* ---- time helpers (Asia/Karachi, UTC+5 year-round) ---------------- */
const PKT_OFFSET_MS = 5 * 60 * 60_000;

function nowPKT(): { dateStr: string; minutes: number } {
  const shifted = new Date(Date.now() + PKT_OFFSET_MS);
  return {
    dateStr: shifted.toISOString().slice(0, 10),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
/** DATE column value for a "YYYY-MM-DD" string (UTC midnight, consistent both ways). */
const toDbDate = (dateStr: string) => new Date(`${dateStr}T00:00:00.000Z`);
export const dbDateToStr = (d: Date) => d.toISOString().slice(0, 10);

function weekdayOf(dateStr: string): number {
  return toDbDate(dateStr).getUTCDay(); // 0 = Sunday … 6 = Saturday
}

/* ---- config & schedule -------------------------------------------- */
export async function getBookingConfig(): Promise<BookingConfig> {
  const rows = await db.setting.findMany({ where: { key: { in: Object.values(CONFIG_KEYS) } } });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const num = (key: string, fallback: number) => {
    const n = Number(m[key]);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const nonNeg = (key: string, fallback: number) => {
    const n = Number(m[key]);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return {
    slotMinutes: num(CONFIG_KEYS.slotMinutes, CONFIG_DEFAULTS.slotMinutes),
    gapMinutes: nonNeg(CONFIG_KEYS.gapMinutes, CONFIG_DEFAULTS.gapMinutes),
    capacity: num(CONFIG_KEYS.capacity, CONFIG_DEFAULTS.capacity),
    windowDays: num(CONFIG_KEYS.windowDays, CONFIG_DEFAULTS.windowDays),
    minNoticeHours: nonNeg(CONFIG_KEYS.minNoticeHours, CONFIG_DEFAULTS.minNoticeHours),
  };
}

export async function updateBookingConfig(cfg: BookingConfig): Promise<void> {
  await db.$transaction(
    (Object.keys(CONFIG_KEYS) as (keyof BookingConfig)[]).map((k) =>
      db.setting.upsert({
        where: { key: CONFIG_KEYS[k] },
        update: { value: String(cfg[k]) },
        create: { key: CONFIG_KEYS[k], value: String(cfg[k]) },
      }),
    ),
  );
}

export type ScheduleDayInput = {
  weekday: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};

const DEFAULT_DAY = (weekday: number): ScheduleDayInput => ({
  weekday,
  isOpen: true, // open every day, including Sunday, for after-sales
  startTime: "09:00",
  endTime: "17:00",
  breakStart: "13:00",
  breakEnd: "14:00",
});

export async function getSchedule(): Promise<ScheduleDayInput[]> {
  const rows = await db.scheduleDay.findMany({ orderBy: { weekday: "asc" } });
  return Array.from({ length: 7 }, (_, w) => {
    const r = rows.find((x) => x.weekday === w);
    return r
      ? { weekday: w, isOpen: r.isOpen, startTime: r.startTime, endTime: r.endTime, breakStart: r.breakStart, breakEnd: r.breakEnd }
      : DEFAULT_DAY(w);
  });
}

export async function saveSchedule(days: ScheduleDayInput[]): Promise<void> {
  await db.$transaction(
    days.map((d) =>
      db.scheduleDay.upsert({
        where: { weekday: d.weekday },
        update: { isOpen: d.isOpen, startTime: d.startTime, endTime: d.endTime, breakStart: d.breakStart ?? null, breakEnd: d.breakEnd ?? null },
        create: { weekday: d.weekday, isOpen: d.isOpen, startTime: d.startTime, endTime: d.endTime, breakStart: d.breakStart ?? null, breakEnd: d.breakEnd ?? null },
      }),
    ),
  );
}

/* ---- blackout dates ------------------------------------------------ */
export async function listBlackouts() {
  const { dateStr } = nowPKT();
  return db.blackoutDate.findMany({ where: { date: { gte: toDbDate(dateStr) } }, orderBy: { date: "asc" } });
}

export async function addBlackout(dateStr: string, reason?: string) {
  return db.blackoutDate.upsert({
    where: { date: toDbDate(dateStr) },
    update: { reason: reason || null },
    create: { date: toDbDate(dateStr), reason: reason || null },
  });
}

export async function removeBlackout(id: string) {
  await db.blackoutDate.delete({ where: { id } });
}

/* ---- slots & availability ------------------------------------------ */
export type Slot = { start: string; end: string };

export function slotsForDay(day: ScheduleDayInput, slotMinutes: number, gapMinutes = 0): Slot[] {
  if (!day.isOpen) return [];
  const open = toMin(day.startTime);
  const close = toMin(day.endTime);
  const bStart = day.breakStart ? toMin(day.breakStart) : null;
  const bEnd = day.breakEnd ? toMin(day.breakEnd) : null;
  const slots: Slot[] = [];
  for (let s = open; s + slotMinutes <= close; s += slotMinutes + gapMinutes) {
    const e = s + slotMinutes;
    const inBreak = bStart != null && bEnd != null && s < bEnd && e > bStart; // overlaps break
    if (!inBreak) slots.push({ start: toHHMM(s), end: toHHMM(e) });
  }
  return slots;
}

/** Earliest bookable moment (PKT minutes since midnight) for a given date, or null if the whole day is past. */
function noticeCutoff(dateStr: string, minNoticeHours: number): number | null {
  const now = nowPKT();
  const cutoffAbs = Date.parse(`${now.dateStr}T00:00:00Z`) + (now.minutes + minNoticeHours * 60) * 60_000;
  const dayStartAbs = Date.parse(`${dateStr}T00:00:00Z`);
  const dayEndAbs = dayStartAbs + 24 * 60 * 60_000;
  if (cutoffAbs >= dayEndAbs) return null; // entire day within notice window
  if (cutoffAbs <= dayStartAbs) return 0;
  return Math.ceil((cutoffAbs - dayStartAbs) / 60_000);
}

export type SlotAvailability = Slot & { remaining: number; available: boolean };
export type DayAvailability = {
  date: string;
  weekday: number;
  isOpen: boolean;
  reason?: string; // why closed: "closed" | blackout reason
  slots: SlotAvailability[];
};

async function activeCounts(dates: Date[]): Promise<Map<string, number>> {
  const rows = await db.appointment.groupBy({
    by: ["date", "startTime"],
    where: { date: { in: dates }, status: { in: ACTIVE } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [`${dbDateToStr(r.date)}|${r.startTime}`, r._count._all]));
}

export async function getAvailability(dateStr: string): Promise<DayAvailability> {
  const [config, schedule] = await Promise.all([getBookingConfig(), getSchedule()]);
  const { dateStr: today } = nowPKT();
  const weekday = weekdayOf(dateStr);
  const base: DayAvailability = { date: dateStr, weekday, isOpen: false, slots: [] };

  // window check
  const offset = (Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  if (offset < 0 || offset >= config.windowDays) return { ...base, reason: "closed" };

  const blackout = await db.blackoutDate.findUnique({ where: { date: toDbDate(dateStr) } });
  if (blackout) return { ...base, reason: blackout.reason || "Holiday" };

  const day = schedule[weekday];
  if (!day.isOpen) return { ...base, reason: "closed" };

  const cutoff = noticeCutoff(dateStr, config.minNoticeHours);
  if (cutoff == null) return { ...base, isOpen: true, slots: slotsForDay(day, config.slotMinutes, config.gapMinutes).map((s) => ({ ...s, remaining: 0, available: false })) };

  const counts = await activeCounts([toDbDate(dateStr)]);
  const slots = slotsForDay(day, config.slotMinutes, config.gapMinutes).map((s) => {
    const used = counts.get(`${dateStr}|${s.start}`) ?? 0;
    const remaining = Math.max(0, config.capacity - used);
    return { ...s, remaining, available: remaining > 0 && toMin(s.start) >= cutoff };
  });
  return { date: dateStr, weekday, isOpen: true, slots };
}

/** Day-by-day overview for the booking window (drives the date picker). */
export async function getDaysOverview(): Promise<{ date: string; weekday: number; isOpen: boolean; hasSpace: boolean; reason?: string }[]> {
  const [config, schedule, blackouts] = await Promise.all([getBookingConfig(), getSchedule(), db.blackoutDate.findMany()]);
  const { dateStr: today } = nowPKT();
  const startAbs = Date.parse(`${today}T00:00:00Z`);
  const dates = Array.from({ length: config.windowDays }, (_, i) => new Date(startAbs + i * 86_400_000).toISOString().slice(0, 10));
  const blackoutSet = new Map(blackouts.map((b) => [dbDateToStr(b.date), b.reason || "Holiday"]));
  const counts = await activeCounts(dates.map(toDbDate));

  return dates.map((date) => {
    const weekday = weekdayOf(date);
    const day = schedule[weekday];
    const blackout = blackoutSet.get(date);
    if (blackout || !day.isOpen) return { date, weekday, isOpen: false, hasSpace: false, reason: blackout ?? "closed" };
    const cutoff = noticeCutoff(date, config.minNoticeHours);
    const hasSpace =
      cutoff != null &&
      slotsForDay(day, config.slotMinutes, config.gapMinutes).some((s) => {
        const used = counts.get(`${date}|${s.start}`) ?? 0;
        return used < config.capacity && toMin(s.start) >= cutoff;
      });
    return { date, weekday, isOpen: true, hasSpace };
  });
}

/* ---- booking -------------------------------------------------------- */
function newCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I/L
  const bytes = randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[bytes[i] % alphabet.length];
  return `SCM-${s}`;
}

/** Serialises all writes for one (date, slot) so capacity can never be exceeded. */
async function lockSlot(tx: Prisma.TransactionClient, dateStr: string, startTime: string) {
  // ::text cast because the function returns void, which Prisma can't deserialize
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`${dateStr}|${startTime}`}))::text`;
}

export async function createAppointment(input: AppointmentCreateInput): Promise<Appointment> {
  const availability = await getAvailability(input.date);
  const slot = availability.slots.find((s) => s.start === input.startTime);
  if (!availability.isOpen || !slot) throw new ServiceError("That day is not open for bookings. Please pick another day.");
  if (!slot.available) throw new ServiceError("That time slot is no longer available. Please pick another slot.");

  const config = await getBookingConfig();
  return db.$transaction(async (tx) => {
    await lockSlot(tx, input.date, input.startTime);
    const used = await tx.appointment.count({
      where: { date: toDbDate(input.date), startTime: input.startTime, status: { in: ACTIVE } },
    });
    if (used >= config.capacity) {
      throw new ServiceError("That time slot has just been fully booked. Please pick another slot.");
    }
    // retry the human code on the (astronomically rare) collision
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = newCode();
      const exists = await tx.appointment.findUnique({ where: { code } });
      if (exists) continue;
      return tx.appointment.create({
        data: {
          code,
          name: input.name,
          phone: input.phone,
          email: input.email || null,
          vehicle: input.vehicle,
          registration: input.registration || null,
          serviceType: input.serviceType,
          notes: input.notes || null,
          date: toDbDate(input.date),
          startTime: slot.start,
          endTime: slot.end,
        },
      });
    }
    throw new ServiceError("Could not generate a booking reference, please try again.");
  });
}

/* ---- admin: listing & stats ---------------------------------------- */
const PAGE_SIZE = 12;

export async function listAppointments(opts: {
  status?: AppointmentStatus;
  date?: string;
  search?: string;
  page?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const where: Prisma.AppointmentWhereInput = {
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.date ? { date: toDbDate(opts.date) } : {}),
    ...(opts.search
      ? {
          OR: [
            { name: { contains: opts.search, mode: "insensitive" } },
            { phone: { contains: opts.search } },
            { code: { contains: opts.search, mode: "insensitive" } },
            { vehicle: { contains: opts.search, mode: "insensitive" } },
            { registration: { contains: opts.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    db.appointment.findMany({
      where,
      include: { confirmedBy: { select: { name: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { createdAt: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.appointment.count({ where }),
  ]);
  return { items, total, page, pageSize: PAGE_SIZE, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function appointmentStats() {
  const { dateStr } = nowPKT();
  const today = toDbDate(dateStr);
  const [pending, confirmedUpcoming, todayCount, cancelRequests] = await Promise.all([
    db.appointment.count({ where: { status: "PENDING" } }),
    db.appointment.count({ where: { status: "CONFIRMED", date: { gte: today } } }),
    db.appointment.count({ where: { date: today, status: { in: ACTIVE } } }),
    db.appointment.count({ where: { status: "CANCEL_REQUESTED" } }),
  ]);
  return { pending, confirmedUpcoming, todayCount, cancelRequests };
}

export const getAppointment = (id: string) =>
  db.appointment.findUnique({ where: { id }, include: { confirmedBy: { select: { name: true } } } });

/* ---- admin: status transitions -------------------------------------- */
export async function confirmAppointment(id: string, adminId: string): Promise<Appointment> {
  const config = await getBookingConfig();
  return db.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({ where: { id } });
    if (!appt) throw new ServiceError("Appointment not found.");
    if (appt.status !== "PENDING") throw new ServiceError(`Only pending appointments can be confirmed (this one is ${appt.status.toLowerCase()}).`);
    await lockSlot(tx, dbDateToStr(appt.date), appt.startTime);
    const confirmed = await tx.appointment.count({
      where: { date: appt.date, startTime: appt.startTime, status: "CONFIRMED" },
    });
    if (confirmed >= config.capacity) {
      throw new ServiceError("This slot is already fully confirmed. Cancel another booking or move this one.");
    }
    return tx.appointment.update({ where: { id }, data: { status: "CONFIRMED", confirmedById: adminId } });
  });
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new ServiceError("Appointment not found.");
  if (appt.status === "CANCELLED") throw new ServiceError("Already cancelled.");
  if (appt.status === "COMPLETED") throw new ServiceError("Completed appointments cannot be cancelled.");
  return db.appointment.update({ where: { id }, data: { status: "CANCELLED", cancelReason: reason || null } });
}

/** Approve a customer's online cancellation request → the booking is finally cancelled. */
export async function approveCancellation(id: string): Promise<Appointment> {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new ServiceError("Appointment not found.");
  if (appt.status !== "CANCEL_REQUESTED") throw new ServiceError("Only cancellation requests can be approved.");
  return db.appointment.update({
    where: { id },
    data: { status: "CANCELLED", cancelReason: appt.cancelReason ?? "Cancelled at the customer's request" },
  });
}

/** Decline the request: the booking goes back to the queue as pending (the slot
 *  was never released, so this can never overbook). */
export async function declineCancellation(id: string): Promise<Appointment> {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new ServiceError("Appointment not found.");
  if (appt.status !== "CANCEL_REQUESTED") throw new ServiceError("Only cancellation requests can be declined.");
  return db.appointment.update({
    where: { id },
    data: { status: "PENDING", cancelReason: null, confirmedById: null },
  });
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new ServiceError("Appointment not found.");
  if (appt.status !== "CONFIRMED") throw new ServiceError("Only confirmed appointments can be marked completed.");
  return db.appointment.update({ where: { id }, data: { status: "COMPLETED" } });
}

export async function markNoShow(id: string): Promise<Appointment> {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new ServiceError("Appointment not found.");
  if (appt.status !== "CONFIRMED") throw new ServiceError("Only confirmed appointments can be marked as no-show.");
  return db.appointment.update({ where: { id }, data: { status: "NO_SHOW" } });
}

/* ---- customer self-service (by reference code + phone) -------------- */
const normPhone = (p: string) => p.replace(/\D/g, "").slice(-10);

export async function findAppointmentForCustomer(code: string, phone: string): Promise<Appointment | null> {
  const appt = await db.appointment.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!appt || !normPhone(phone) || normPhone(appt.phone) !== normPhone(phone)) return null;
  return appt;
}

/** Whether the customer may still cancel/reschedule this booking online. */
export function selfServiceEligibility(appt: Appointment, minNoticeHours: number): { ok: boolean; reason?: string } {
  if (appt.status === "CANCEL_REQUESTED") {
    return { ok: false, reason: "A cancellation request for this booking is already with our team. You will receive an email once it has been reviewed." };
  }
  if (appt.status !== "PENDING" && appt.status !== "CONFIRMED") {
    return { ok: false, reason: `This booking is ${appt.status.toLowerCase().replace("_", "-")} and can no longer be changed online.` };
  }
  const startAbs = Date.parse(`${dbDateToStr(appt.date)}T00:00:00Z`) + toMin(appt.startTime) * 60_000;
  const now = nowPKT();
  const nowAbs = Date.parse(`${now.dateStr}T00:00:00Z`) + now.minutes * 60_000;
  if (startAbs - nowAbs < Math.max(1, minNoticeHours) * 3_600_000) {
    return { ok: false, reason: "This booking is too close to its time to change online, please call the workshop instead." };
  }
  return { ok: true };
}

/** The customer can only *request* a cancellation; it takes effect once the
 *  dealership approves it, so the booking (and its slot) stays in place. */
export async function selfCancelAppointment(code: string, phone: string): Promise<Appointment> {
  const appt = await findAppointmentForCustomer(code, phone);
  if (!appt) throw new ServiceError("We couldn't find a booking with that reference and phone number.");
  const config = await getBookingConfig();
  const eligible = selfServiceEligibility(appt, config.minNoticeHours);
  if (!eligible.ok) throw new ServiceError(eligible.reason!);
  return db.appointment.update({
    where: { id: appt.id },
    data: { status: "CANCEL_REQUESTED", cancelReason: "Cancellation requested by the customer online" },
  });
}

export async function selfRescheduleAppointment(
  code: string,
  phone: string,
  dateStr: string,
  startTime: string,
): Promise<{ updated: Appointment; previous: { date: Date; startTime: string; endTime: string } }> {
  const appt = await findAppointmentForCustomer(code, phone);
  if (!appt) throw new ServiceError("We couldn't find a booking with that reference and phone number.");
  const config = await getBookingConfig();
  const eligible = selfServiceEligibility(appt, config.minNoticeHours);
  if (!eligible.ok) throw new ServiceError(eligible.reason!);
  if (dbDateToStr(appt.date) === dateStr && appt.startTime === startTime) {
    throw new ServiceError("That is already your booked slot.");
  }

  const availability = await getAvailability(dateStr);
  const slot = availability.slots.find((s) => s.start === startTime);
  if (!availability.isOpen || !slot) throw new ServiceError("That day is not open for bookings. Please pick another day.");
  if (!slot.available) throw new ServiceError("That time slot is no longer available. Please pick another slot.");

  const previous = { date: appt.date, startTime: appt.startTime, endTime: appt.endTime };
  const updated = await db.$transaction(async (tx) => {
    await lockSlot(tx, dateStr, startTime);
    const used = await tx.appointment.count({
      where: { date: toDbDate(dateStr), startTime, status: { in: ACTIVE }, NOT: { id: appt.id } },
    });
    if (used >= config.capacity) {
      throw new ServiceError("That time slot has just been fully booked. Please pick another slot.");
    }
    // a moved booking needs the team's confirmation again
    return tx.appointment.update({
      where: { id: appt.id },
      data: { date: toDbDate(dateStr), startTime: slot.start, endTime: slot.end, status: "PENDING", confirmedById: null },
    });
  });
  return { updated, previous };
}

/** Non-cancelled appointments in an inclusive date range (calendar views). */
export async function appointmentsBetween(fromStr: string, toStr: string) {
  return db.appointment.findMany({
    where: { date: { gte: toDbDate(fromStr), lte: toDbDate(toStr) }, status: { not: "CANCELLED" } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}
