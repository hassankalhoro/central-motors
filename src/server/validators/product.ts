import { z } from "zod";

export const variantSchema = z.object({
  name: z.string().trim().min(1, "Variant name is required.").max(80),
  price: z.coerce.number().int().min(0, "Price must be 0 or more."),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category."),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  status: z.enum(["IN_STOCK", "COMING_SOON", "DISCONTINUED"]),
  featured: z.coerce.boolean().optional().default(false),
  published: z.coerce.boolean().optional().default(true),
  brochureUrl: z.string().trim().url().optional().or(z.literal("")),
  variants: z.array(variantSchema).min(1, "Add at least one variant."),
  features: z.array(z.string().trim().min(1)).default([]),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        blurData: z.string().optional(),
        alt: z.string().optional(),
      }),
    )
    .default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
