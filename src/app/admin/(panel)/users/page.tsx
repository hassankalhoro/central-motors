import { requireRole } from "@/server/auth";
import { rolesFor } from "@/server/rbac";
import { listUsers } from "@/server/services/userService";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  await requireRole(...rolesFor("users.manage")); // SUPER_ADMIN only
  const users = await listUsers();
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));
  return <UsersClient users={rows} />;
}
