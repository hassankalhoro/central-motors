import { z } from "zod";

export const variantSchema = z.object({
  name: z.string().trim().min(1, "Variant name is required.").max(80),
  price: z.coerce.number().int().min(0, "Price must be 0 or more."),
});

/** Flexible per-car comparison matrix + colour options (Product.specs JSON). */
const specValueSchema = z.union([z.boolean(), z.string().trim().max(80), z.null()]);
export const productSpecsSchema = z
  .object({
    comparison: z
      .object({
        columns: z
          .array(
            z.object({
              name: z.string().trim().min(1, "Column name is required.").max(60),
              price: z.coerce.number().int().min(0).optional(),
              discontinued: z.boolean().optional(),
            }),
          )
          .max(8),
        groups: z
          .array(
            z.object({
              title: z.string().trim().min(1, "Group title is required.").max(80),
              rows: z
                .array(
                  z.object({
                    label: z.string().trim().min(1, "Row label is required.").max(80),
                    values: z.array(specValueSchema).max(8),
                  }),
                )
                .max(50),
            }),
          )
          .max(12),
        note: z.string().trim().max(300).optional(),
      })
      .optional(),
    announcement: z
      .object({
        enabled: z.boolean(),
        phrases: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
      })
      .optional(),
    tax: z
      .object({
        filer: z.coerce.number().int().min(1, "Enter the filer tax amount."),
        nonFiler: z.coerce.number().int().min(1, "Enter the non-filer tax amount."),
      })
      .optional(),
    colors: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Colour name is required.").max(60),
          hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #1A2B3C."),
          roofHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
          images: z
            .array(z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Must be an image URL or path."))
            .max(12)
            .optional(),
          discontinued: z.boolean().optional(),
        }),
      )
      .max(24)
      .optional(),
  })
  .nullable();

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
  specs: productSpecsSchema.optional(),
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
