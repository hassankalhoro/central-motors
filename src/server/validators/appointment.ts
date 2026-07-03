import { z } from "zod";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/; // "09:00" … "23:59"
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/; // "2026-07-04"

export const SERVICE_TYPES = [
  "General service",
  "Oil change",
  "Body & paint",
  "Electrical / diagnostics",
  "Warranty claim",
  "Test drive preparation",
] as const;

/** Public booking request. */
export const appointmentCreateSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30),
  email: z.string().trim().email("Please enter a valid email address.").max(200).optional().or(z.literal("")),
  vehicle: z.string().trim().min(2, "Please tell us the vehicle / model.").max(120),
  registration: z.string().trim().max(30).optional().or(z.literal("")),
  serviceType: z.string().trim().min(2).max(60),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  date: z.string().regex(DATE_RE, "Invalid date."),
  startTime: z.string().regex(TIME_RE, "Invalid time slot."),
});
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

/** Admin: weekly schedule (7 rows, one per weekday). */
export const scheduleDaySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    isOpen: z.boolean(),
    startTime: z.string().regex(TIME_RE, "Invalid start time."),
    endTime: z.string().regex(TIME_RE, "Invalid end time."),
    breakStart: z.string().regex(TIME_RE).nullable().optional(),
    breakEnd: z.string().regex(TIME_RE).nullable().optional(),
  })
  .refine((d) => !d.isOpen || d.startTime < d.endTime, {
    message: "Opening time must be before closing time.",
    path: ["endTime"],
  })
  .refine((d) => !d.breakStart || !d.breakEnd || d.breakStart < d.breakEnd, {
    message: "Break start must be before break end.",
    path: ["breakEnd"],
  });

export const scheduleSchema = z.array(scheduleDaySchema).length(7, "Provide all seven weekdays.");

/** Admin: global booking rules. */
export const bookingConfigSchema = z.object({
  slotMinutes: z.coerce.number().int().min(15, "Minimum 15 minutes.").max(240, "Maximum 4 hours."),
  gapMinutes: z.coerce.number().int().min(0, "Gap cannot be negative.").max(120, "Maximum 2 hours."),
  capacity: z.coerce.number().int().min(1, "At least 1 booking per slot.").max(50),
  windowDays: z.coerce.number().int().min(1).max(90),
  minNoticeHours: z.coerce.number().int().min(0).max(72),
});
export type BookingConfig = z.infer<typeof bookingConfigSchema>;

export const blackoutSchema = z.object({
  date: z.string().regex(DATE_RE, "Invalid date."),
  reason: z.string().trim().max(200).optional().or(z.literal("")),
});
