import { PrismaClient } from "@prisma/client";

/* Single Prisma instance, reused across hot-reloads in dev (Next.js re-evaluates
 * modules on every change, which would otherwise open a new connection each time). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
