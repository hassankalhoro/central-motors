import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export const userRepo = {
  list: () => db.user.findMany({ orderBy: { createdAt: "asc" } }),
  byId: (id: string) => db.user.findUnique({ where: { id } }),
  byEmail: (email: string) => db.user.findUnique({ where: { email: email.toLowerCase() } }),
  create: (data: { email: string; name: string; passwordHash: string; role: Role }) =>
    db.user.create({ data: { ...data, email: data.email.toLowerCase() } }),
  update: (id: string, data: { name?: string; role?: Role; isActive?: boolean; passwordHash?: string }) =>
    db.user.update({ where: { id }, data }),
  touchLogin: (id: string) => db.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
  countActiveSuperAdmins: () => db.user.count({ where: { role: "SUPER_ADMIN", isActive: true } }),
};
