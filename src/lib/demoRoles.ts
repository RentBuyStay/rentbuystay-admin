/* Demo roles & permissions (swap for admin GET /admin/roles). UI-first. */

// NOTE: "Settings" (admin & role management) is intentionally NOT grantable —
// it stays SUPER_ADMIN-only (the backend enforces hasRole('SUPER_ADMIN') on
// role/admin endpoints). Blog Management IS delegable to a content role.
export const MODULES = [
  "User Management",
  "Verification Management",
  "Property Management",
  "Awaiting Approval",
  "Subscriptions",
  "Blog Management",
] as const;

export const PERMISSIONS = ["Create", "View", "Edit", "Delete"] as const;

export type PermMatrix = Record<string, boolean[]>; // module -> [create, view, edit, delete]

export const DEFAULT_PERMS: PermMatrix = {
  "User Management": [true, true, true, true],
  "Verification Management": [false, true, true, false],
  "Property Management": [true, true, true, true],
  "Awaiting Approval": [false, true, true, false],
  Subscriptions: [true, true, true, false],
  "Blog Management": [false, true, false, false],
};

export const EMPTY_PERMS: PermMatrix = Object.fromEntries(MODULES.map((m) => [m, [false, false, false, false]]));

export type Role = { id: string; name: string; users: number; created: string };

export const ROLES: Role[] = [
  { id: "r1", name: "Admin 1", users: 2, created: "15 May 2025" },
  { id: "r2", name: "Admin 2", users: 1, created: "15 May 2025" },
  { id: "r3", name: "Auditor", users: 1, created: "15 May 2025" },
];

export const getRole = (id: string) => ROLES.find((r) => r.id === id);
