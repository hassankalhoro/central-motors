import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.")
    .optional()
    .or(z.literal("")),
  blurb: z.string().trim().max(400).optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
