"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/features/auth/authSlice";
import { authzFromToken, canWith, type PermModule, type PermAction } from "@/lib/permissions";

/**
 * Current admin's permission state, read from the access-token claims.
 * `can(module, action)` returns true for super admins or when the scoped role
 * was granted that exact permission.
 */
export function usePermissions() {
  const token = useAppSelector(selectAccessToken);
  return useMemo(() => {
    const authz = authzFromToken(token);
    return {
      isSuperAdmin: authz.isSuperAdmin,
      userType: authz.userType,
      can: (module: PermModule, action: PermAction) => canWith(authz, module, action),
    };
  }, [token]);
}
