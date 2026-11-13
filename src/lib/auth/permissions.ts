/**
 * Roles and permissions. The database (Role, Permission, RolePermission) is
 * the source of truth at runtime; this file defines the canonical set the
 * seed writes, and the typed keys the code checks against.
 */
export const PERMISSIONS = {
  "admin.access": "Sign in to the admin dashboard",
  "content.create": "Create people, organizations and articles",
  "content.edit": "Edit any content",
  "content.editOwn": "Edit content you created (while unpublished)",
  "content.publish": "Publish, archive and feature content",
  "content.delete": "Delete content",
  "taxonomy.manage": "Manage categories, tags, skills and locations",
  "media.upload": "Upload images",
  "media.manage": "Edit and delete any media",
  "users.manage": "Manage users and roles",
  "settings.manage": "Edit website settings",
  "audit.view": "View the activity log",
  "forms.manage": "Build journey forms and manage their questions",
  "submissions.review": "Review, approve and reject form submissions",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const ROLE_KEYS = ["SUPER_ADMIN", "ADMIN", "EDITOR", "CONTRIBUTOR", "MEMBER"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

const ALL = Object.keys(PERMISSIONS) as PermissionKey[];

export const ROLE_DEFINITIONS: Record<
  RoleKey,
  { name: string; description: string; rank: number; permissions: PermissionKey[] }
> = {
  SUPER_ADMIN: {
    name: "Super Admin",
    description: "Full access, including users and roles.",
    rank: 100,
    permissions: ALL,
  },
  ADMIN: {
    name: "Admin",
    description: "Manages all content, taxonomy, media and settings.",
    rank: 75,
    permissions: ALL.filter((p) => p !== "users.manage"),
  },
  EDITOR: {
    name: "Editor",
    description: "Creates, edits and publishes content.",
    rank: 50,
    permissions: [
      "admin.access",
      "content.create",
      "content.edit",
      "content.publish",
      "media.upload",
      "submissions.review",
    ],
  },
  CONTRIBUTOR: {
    name: "Contributor",
    description: "Drafts content and submits it for review; cannot publish.",
    rank: 25,
    permissions: ["admin.access", "content.create", "content.editOwn", "media.upload"],
  },
  MEMBER: {
    name: "Member",
    description: "Public account (Google sign-in). Reads full guidance and submits journey forms. No admin access.",
    rank: 0,
    permissions: [],
  },
};

/** Roles that belong to staff (can reach /admin). */
export const STAFF_ROLE_KEYS: RoleKey[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "CONTRIBUTOR"];
