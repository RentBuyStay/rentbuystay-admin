/**
 * Admin permission gating, derived entirely from the access-token JWT.
 *
 * The backend signs each admin's access token with:
 *   - `user_type`         → "SUPER_ADMIN" | "ADMIN" | …
 *   - `admin_permissions` → ["PROPERTY_MANAGEMENT:EDIT", "USER_MANAGEMENT:VIEW", …]
 *     (present only for scoped ADMINs that were given a role; SUPER_ADMIN has none)
 *
 * So a SUPER_ADMIN bypasses every check, and a scoped ADMIN only passes the
 * exact MODULE:ACTION pairs their role was granted. No extra API call needed.
 */

export type PermModule =
  | "USER_MANAGEMENT"
  | "VERIFICATION_MANAGEMENT"
  | "PROPERTY_MANAGEMENT"
  | "AWAITING_APPROVAL"
  | "SUBSCRIPTIONS"
  | "SETTINGS"
  | "BLOG_MANAGEMENT";

export type PermAction = "CREATE" | "VIEW" | "EDIT" | "DELETE";

export type AdminAuthz = {
  userType: string | null;
  isSuperAdmin: boolean;
  permissions: Set<string>; // "MODULE:ACTION"
};

/** Decode a JWT payload segment (base64url) without any dependency. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const seg = token.split(".")[1];
    if (!seg) return null;
    const b64 = seg.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function authzFromToken(token: string | null | undefined): AdminAuthz {
  const claims = token ? decodeJwtPayload(token) : null;
  const userType = typeof claims?.user_type === "string" ? (claims.user_type as string) : null;
  const raw = claims?.admin_permissions;
  const permissions = new Set<string>(Array.isArray(raw) ? (raw as string[]) : []);
  return { userType, isSuperAdmin: userType === "SUPER_ADMIN", permissions };
}

/** Does this authz allow MODULE:ACTION? Super admins always pass. */
export function canWith(authz: AdminAuthz, module: PermModule, action: PermAction): boolean {
  if (authz.isSuperAdmin) return true;
  return authz.permissions.has(`${module}:${action}`);
}
