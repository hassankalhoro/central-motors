import "server-only";
import { submissionRepo } from "../repositories/submission.repo";
import { getEmailConfig } from "./settingsService";
import { sendMail } from "./mailer";
import { ServiceError } from "./categoryService";
import type { SubmissionStatus } from "@prisma/client";

const PAGE_SIZE = 12;

export async function listInquiries(opts: { kind?: string; status?: SubmissionStatus; search?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const args = { kind: opts.kind, status: opts.status, search: opts.search, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
  const [items, total] = await Promise.all([submissionRepo.list(args), submissionRepo.count(args)]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const getInquiry = (id: string) => submissionRepo.byId(id);
export const inquiryCounts = () => submissionRepo.countsByStatus();

export async function setInquiryStatus(id: string, status: SubmissionStatus, userId: string) {
  const sub = await submissionRepo.byId(id);
  if (!sub) throw new ServiceError("Inquiry not found.");
  return submissionRepo.markHandled(id, userId, status);
}

function prettyModel(s: string): string {
  return s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function replyToInquiry(id: string, userId: string, message: string, subject?: string) {
  const sub = await submissionRepo.byId(id);
  if (!sub) throw new ServiceError("Inquiry not found.");
  if (!sub.email) throw new ServiceError("This inquiry has no email address to reply to.");

  const cfg = await getEmailConfig();
  if (!cfg.user || !cfg.pass) {
    throw new ServiceError("Email is not configured yet. Set SMTP details in Settings first.");
  }

  const model = sub.productSlug ? prettyModel(sub.productSlug) : "";
  const finalSubject =
    subject?.trim() ||
    (model
      ? `Re: your inquiry about the Suzuki ${model}, Suzuki Central Motors`
      : "Re: your inquiry, Suzuki Central Motors");

  // The message is the full body the staff composed (greeting + signature included).
  await sendMail(cfg, {
    to: sub.email,
    subject: finalSubject,
    text: message,
    replyTo: cfg.fromEmail,
  });

  await submissionRepo.markHandled(id, userId, "IN_PROGRESS");
  return { ok: true as const };
}
