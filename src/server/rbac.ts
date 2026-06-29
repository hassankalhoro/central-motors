import type { Role } from "@prisma/client";

/* Capability-based RBAC. UI hides what a role can't do; every server action also
 * calls `can()` (or requireRole) — UI hiding is never the security boundary. */

export type Capability =
  | "content.view" // see admin + lists
  | "content.edit" // create/update products, news, categories, team
  | "inquiry.manage" // change status, reply
  | "content.delete" // hard delete content
  | "settings.manage" // site + email settings
  | "users.manage" // create/edit users & roles
  | "pii.export"; // export inquiries / view CNIC-NTN

const MATRIX: Record<Role, Capability[]> = {
  SUPER_ADMIN: [
    "content.view",
    "content.edit",
    "inquiry.manage",
    "content.delete",
    "settings.manage",
    "users.manage",
    "pii.export",
  ],
  ADMIN: ["content.view", "content.edit", "inquiry.manage", "content.delete", "settings.manage", "pii.export"],
  EDITOR: ["content.view", "content.edit", "inquiry.manage"],
};

export function can(role: Role, cap: Capability): boolean {
  return MATRIX[role]?.includes(cap) ?? false;
}

/** Roles allowed for a capability — handy for `requireRole(...rolesFor("x"))`. */
export function rolesFor(cap: Capability): Role[] {
  return (Object.keys(MATRIX) as Role[]).filter((r) => can(r, cap));
}
