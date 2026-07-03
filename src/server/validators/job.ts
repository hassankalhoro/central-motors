import { z } from "zod";

export const JOB_TYPES = ["Permanent", "Contract", "Internship", "Part-time"] as const;

export const jobSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(120),
  location: z.string().trim().min(2, "Location is required.").max(80),
  type: z.string().trim().min(2).max(40),
  description: z.string().trim().min(20, "Please write a short description (at least 20 characters).").max(5000),
  published: z.boolean().default(true),
});

export type JobInput = z.infer<typeof jobSchema>;
