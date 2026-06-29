import { z } from "zod";

const role = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  role,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  role,
  isActive: z.coerce.boolean(),
  password: z.string().min(8).optional().or(z.literal("")),
});
