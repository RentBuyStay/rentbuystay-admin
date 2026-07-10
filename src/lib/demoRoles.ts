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

// Only the permissions the backend actually enforces per module are shown in the
// role editor — everything else is a no-op toggle, so we hide it. Derived from
// the @PreAuthorize authorities across the admin controllers. (Destructive
// actions — erase user, force-remove property, plan CRUD — are SUPER_ADMIN-only
// and not delegable, so no *:DELETE except Blog.)
export const ENFORCED_ACTIONS: Record<string, ReadonlyArray<(typeof PERMISSIONS)[number]>> = {
  "User Management": ["Create", "View", "Edit"],
  "Verification Management": ["View", "Edit"],
  "Property Management": ["View", "Edit"],
  "Awaiting Approval": ["View"],
  Subscriptions: ["View", "Edit"],
  "Blog Management": ["Create", "View", "Edit", "Delete"],
};

export type PermMatrix = Record<string, boolean[]>; // module -> [create, view, edit, delete]

// [create, view, edit, delete] — only enforced actions are ever set true.
export const DEFAULT_PERMS: PermMatrix = {
  "User Management": [true, true, true, false],
  "Verification Management": [false, true, true, false],
  "Property Management": [false, true, true, false],
  "Awaiting Approval": [false, true, false, false],
  Subscriptions: [false, true, true, false],
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
