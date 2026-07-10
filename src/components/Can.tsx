"use client";

import { usePermissions } from "@/hooks/usePermissions";
import type { PermModule, PermAction } from "@/lib/permissions";

/**
 * Render children only if the current admin has MODULE:ACTION (super admins
 * always pass). Use to hide action buttons a scoped admin can't perform.
 *
 *   <Can module="PROPERTY_MANAGEMENT" action="EDIT"><ApproveButton/></Can>
 */
export default function Can({
  module,
  action,
  children,
  fallback = null,
}: {
  module: PermModule;
  action: PermAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = usePermissions();
  return <>{can(module, action) ? children : fallback}</>;
}
