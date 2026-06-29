import { db } from "@/lib/db";
import type { Prisma, SubmissionStatus } from "@prisma/client";

type ListArgs = { kind?: string; status?: SubmissionStatus; search?: string; skip?: number; take?: number };

function whereClause({ kind, status, search }: ListArgs): Prisma.SubmissionWhereInput {
  return {
    ...(kind ? { kind } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };
}

export const submissionRepo = {
  list: (args: ListArgs) =>
    db.submission.findMany({ where: whereClause(args), orderBy: { createdAt: "desc" }, skip: args.skip, take: args.take }),
  count: (args: ListArgs) => db.submission.count({ where: whereClause(args) }),
  byId: (id: string) => db.submission.findUnique({ where: { id } }),
  countsByStatus: async (): Promise<Record<SubmissionStatus, number>> => {
    const rows = await db.submission.groupBy({ by: ["status"], _count: { _all: true } });
    const out = { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0 } as Record<SubmissionStatus, number>;
    for (const r of rows) out[r.status] = r._count._all;
    return out;
  },
  setStatus: (id: string, status: SubmissionStatus) => db.submission.update({ where: { id }, data: { status } }),
  markHandled: (id: string, userId: string, status: SubmissionStatus) =>
    db.submission.update({ where: { id }, data: { status, handledById: userId, handledAt: new Date() } }),
};
