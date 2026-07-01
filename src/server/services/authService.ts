import "server-only";
import bcrypt from "bcryptjs";
import { userRepo } from "../repositories/user.repo";
import type { SessionUser } from "../auth";

/**
 * Verifies credentials. Returns a session payload on success, or null on any
 * failure (bad email, bad password, inactive), callers must show a generic
 * error so accounts can't be enumerated.
 */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
  const user = await userRepo.byEmail(email);
  if (!user || !user.isActive) {
    // Constant-ish time: still run a hash compare against a dummy to reduce timing signal.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  await userRepo.touchLogin(user.id);
  return { sub: user.id, email: user.email, name: user.name, role: user.role };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
