import "server-only";
import type { TeamGroup } from "@prisma/client";
import { db } from "@/lib/db";
import { ServiceError } from "./categoryService";
import type { TeamMemberInput } from "../validators/team";

/* Team / management members shown on the public /management page.
   Fully admin-managed: CRUD, publish toggle and ordering. */

export const listTeam = () => db.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

export const getTeamMember = (id: string) => db.teamMember.findUnique({ where: { id } });

export async function createTeamMember(input: TeamMemberInput) {
  const last = await db.teamMember.findFirst({ orderBy: { order: "desc" } });
  return db.teamMember.create({
    data: {
      name: input.name,
      title: input.title,
      group: input.group as TeamGroup,
      phone: input.phone || null,
      photoUrl: input.photoUrl || null,
      published: input.published,
      order: (last?.order ?? 0) + 1,
    },
  });
}

export async function updateTeamMember(id: string, input: TeamMemberInput) {
  const existing = await db.teamMember.findUnique({ where: { id } });
  if (!existing) throw new ServiceError("Team member not found.");
  return db.teamMember.update({
    where: { id },
    data: {
      name: input.name,
      title: input.title,
      group: input.group as TeamGroup,
      phone: input.phone || null,
      photoUrl: input.photoUrl || null,
      published: input.published,
    },
  });
}

export async function deleteTeamMember(id: string) {
  const existing = await db.teamMember.findUnique({ where: { id } });
  if (!existing) throw new ServiceError("Team member not found.");
  await db.teamMember.delete({ where: { id } });
  return existing;
}

/** Move one step up/down within the full ordered list (renumbers 1..n). */
export async function moveTeamMember(id: string, dir: "up" | "down") {
  const all = await db.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } });
  const i = all.findIndex((m) => m.id === id);
  if (i === -1) throw new ServiceError("Team member not found.");
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= all.length) return;
  const ordered = [...all];
  [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  await db.$transaction(ordered.map((m, idx) => db.teamMember.update({ where: { id: m.id }, data: { order: idx + 1 } })));
}
