import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  title: z.string().trim().min(2, "Title is required.").max(120),
  group: z.enum(["TOP_MANAGEMENT", "GENERAL_MANAGERS", "MANAGERS"]),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
