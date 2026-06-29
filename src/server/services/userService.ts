import "server-only";
import { userRepo } from "../repositories/user.repo";
import { hashPassword } from "./authService";
import { ServiceError } from "./categoryService";
import type { Role } from "@prisma/client";

export const listUsers = () => userRepo.list();

export async function createUser(input: { name: string; email: string; role: Role; password: string }) {
  if (await userRepo.byEmail(input.email)) throw new ServiceError("That email is already in use.", "email");
  return userRepo.create({
    name: input.name,
    email: input.email,
    role: input.role,
    passwordHash: await hashPassword(input.password),
  });
}

export async function updateUser(
  id: string,
  input: { name?: string; role?: Role; isActive?: boolean; password?: string },
) {
  const user = await userRepo.byId(id);
  if (!user) throw new ServiceError("User not found.");

  // Never lock everyone out: protect the last active super-admin.
  const demoting = input.role && input.role !== "SUPER_ADMIN";
  const deactivating = input.isActive === false;
  if (user.role === "SUPER_ADMIN" && (demoting || deactivating)) {
    const supers = await userRepo.countActiveSuperAdmins();
    if (supers <= 1) throw new ServiceError("You can't remove the last active Super Admin.");
  }

  return userRepo.update(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
  });
}
