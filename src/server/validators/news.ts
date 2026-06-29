import { z } from "zod";

export const newsSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.")
    .optional()
    .or(z.literal("")),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().max(50000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional().or(z.literal("")),
  published: z.coerce.boolean().optional().default(false),
});

export type NewsInput = z.infer<typeof newsSchema>;
