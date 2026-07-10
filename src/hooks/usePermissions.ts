"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/features/auth/authSlice";
import { useGetMyPermissionsQuery } from "@/services/meApi";
import { authzFromToken, type PermModule, type PermAction } from "@/lib/permissions";

/**
 * Current admin's permission state.
 *
 * Authoritative source is GET /me/permissions (also gives the role name). While
 * that request is in flight we fall back to the access-token claims so buttons
 * never flash — the token carries the same MODULE:ACTION list. Super admins pass
 * every check.
 */
export function usePermissions() {
  const token = useAppSelector(selectAccessToken);
  const { data } = useGetMyPermissionsQuery(undefined, { skip: !token });

  return useMemo(() => {
    const fromToken = authzFromToken(token);
    const isSuperAdmin = data ? data.userType === "SUPER_ADMIN" : fromToken.isSuperAdmin;
    const perms = data ? new Set(data.permissions ?? []) : fromToken.permissions;
    const roleName = data?.roleName ?? null;
    const userType = data?.userType ?? fromToken.userType;

    return {
      isSuperAdmin,
      userType,
      roleName,
      can: (module: PermModule, action: PermAction) =>
        isSuperAdmin || perms.has(`${module}:${action}`),
    };
  }, [token, data]);
}
