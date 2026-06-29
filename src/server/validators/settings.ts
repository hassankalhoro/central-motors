import { z } from "zod";

export const emailSettingsSchema = z.object({
  smtpProvider: z.enum(["titan", "gmail", "custom"]),
  smtpHost: z.string().trim().min(1, "SMTP host is required."),
  smtpPort: z.coerce.number().refine((p) => p === 465 || p === 587, "Port must be 465 (SSL) or 587 (STARTTLS)."),
  smtpSecure: z.coerce.boolean(),
  smtpUser: z.string().trim().min(1, "SMTP username is required."),
  smtpPass: z.string().optional().or(z.literal("")), // only re-saved when provided
  fromName: z.string().trim().min(1, "From name is required."),
  fromEmail: z.string().trim().email("Enter a valid From email."),
  notifyTo: z.string().trim().email("Enter a valid notification email."),
});
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;

export const siteSettingsSchema = z.record(z.string(), z.string());

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Current password is required."),
    next: z.string().min(8, "New password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });
