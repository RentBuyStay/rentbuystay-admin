import type { AdminRoleItem, RolePermissionDto } from "@/services/adminApi";
import { MODULES, type PermMatrix } from "@/lib/demoRoles";

/** UI module labels ↔ backend AdminModule enum. */
export const MODULE_BY_LABEL: Record<string, RolePermissionDto["module"]> = {
  "User Management": "USER_MANAGEMENT",
  "Verification Management": "VERIFICATION_MANAGEMENT",
  "Property Management": "PROPERTY_MANAGEMENT",
  "Awaiting Approval": "AWAITING_APPROVAL",
  Subscriptions: "SUBSCRIPTIONS",
  "Blog Management": "BLOG_MANAGEMENT",
};

const LABEL_BY_MODULE = Object.fromEntries(
  Object.entries(MODULE_BY_LABEL).map(([label, mod]) => [mod, label]),
) as Record<string, string>;

/** PermMatrix (module label → [create, view, edit, delete]) → API DTO list. */
export function toPermissionDtos(matrix: PermMatrix): RolePermissionDto[] {
  return MODULES.map((label) => {
    const [canCreate, canView, canEdit, canDelete] = matrix[label] ?? [false, false, false, false];
    return { module: MODULE_BY_LABEL[label], canCreate, canView, canEdit, canDelete };
  });
}

/** API permissions → PermMatrix for the RolePermissions grid. */
export function toPermMatrix(role?: AdminRoleItem): PermMatrix {
  const matrix: PermMatrix = Object.fromEntries(MODULES.map((m) => [m, [false, false, false, false]]));
  (role?.permissions ?? []).forEach((perm) => {
    const label = LABEL_BY_MODULE[perm.module];
    if (label && matrix[label]) matrix[label] = [perm.canCreate, perm.canView, perm.canEdit, perm.canDelete];
  });
  return matrix;
}

export const fmtRoleDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
};
