import "server-only";
import { redirect } from "next/navigation";
import type { PermissionKey } from "./permissions";
import { getCurrentUser, type SessionUser } from "./session";

export class PermissionError extends Error {
  constructor(public readonly permission: PermissionKey) {
    super(`Missing permission: ${permission}`);
    this.name = "PermissionError";
  }
}

export const can = (user: SessionUser | null, permission: PermissionKey) => Boolean(user?.permissions.has(permission));

/** For admin pages: redirects to login when signed out, to the dashboard when not permitted. */
export async function requireUser(permission?: PermissionKey): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  // Public members (Google sign-in) have a session but no admin access.
  if (!can(user, "admin.access")) redirect("/admin/login?member=1");
  if (permission && !can(user, permission)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: throws instead of redirecting so callers can return an error. */
export async function authorize(permission: PermissionKey): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError(permission);
  if (!can(user, permission)) throw new PermissionError(permission);
  return user;
}

/**
 * Whether `user` may edit a content record. Editors/admins (content.edit) may
 * edit anything; contributors (content.editOwn) only their own unpublished drafts.
 */
export function canEditRecord(user: SessionUser, record: { createdById: string | null; status: string }) {
  if (can(user, "content.edit")) return true;
  return (
    can(user, "content.editOwn") &&
    record.createdById === user.id &&
    (record.status === "DRAFT" || record.status === "IN_REVIEW")
  );
}
