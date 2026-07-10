import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  UserX,
  Building2,
  ClipboardCheck,
  CreditCard,
  TrendingUp,
  Bell,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { PermModule, PermAction } from "@/lib/permissions";

// Gating (super admins always pass):
//  - perm          → needs MODULE:VIEW
//  - anyPerm       → needs VIEW on ANY of the listed modules
//  - superAdminOnly→ super admin only (backend endpoints are SUPER_ADMIN-gated)
//  - none          → always shown
export type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  perm?: PermModule;
  anyPerm?: PermModule[];
  superAdminOnly?: boolean;
};
export type NavGroup = { label: string; items: NavItem[] };

export const ADMIN_GROUPS: NavGroup[] = [
  {
    label: "OVERVIEW",
    // The platform-health overview aggregates privileged, platform-wide stats —
    // it only makes sense (and only loads) for a super admin.
    items: [{ label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard, superAdminOnly: true }],
  },
  {
    label: "USERS",
    items: [
      { label: "User Management", href: "/dashboard/users", Icon: Users, perm: "USER_MANAGEMENT" },
      { label: "Verification Management", href: "/dashboard/verifications", Icon: ShieldCheck, perm: "VERIFICATION_MANAGEMENT" },
      { label: "Suspended Users", href: "/dashboard/suspended-users", Icon: UserX, perm: "USER_MANAGEMENT" },
    ],
  },
  {
    label: "LISTINGS",
    items: [
      { label: "Property Management", href: "/dashboard/properties", Icon: Building2, perm: "PROPERTY_MANAGEMENT" },
      { label: "Awaiting Approval", href: "/dashboard/awaiting-approval", Icon: ClipboardCheck, perm: "AWAITING_APPROVAL" },
    ],
  },
  {
    label: "FINANCE",
    items: [{ label: "Subscription Management", href: "/dashboard/subscriptions", Icon: CreditCard, perm: "SUBSCRIPTIONS" }],
  },
  {
    label: "REPORTS",
    // Analytics needs subscriptions- or user-view (matches AdminAnalyticsController).
    items: [{ label: "Analytics", href: "/dashboard/analytics", Icon: TrendingUp, anyPerm: ["SUBSCRIPTIONS", "USER_MANAGEMENT"] }],
  },
  {
    label: "PLATFORM",
    items: [
      // Notifications and Platform Settings (admin/role mgmt) are super-admin-only endpoints.
      { label: "Notification/Email", href: "/dashboard/notifications", Icon: Bell, superAdminOnly: true },
      { label: "Blog Management", href: "/dashboard/blog", Icon: BookOpen, perm: "BLOG_MANAGEMENT" },
      { label: "Platform Settings", href: "/dashboard/settings", Icon: Settings, superAdminOnly: true },
    ],
  },
];

export type NavPerms = { isSuperAdmin: boolean; can: (m: PermModule, a: PermAction) => boolean };

/** Whether a nav item is visible for the given permissions. */
export function isNavItemVisible(it: NavItem, { isSuperAdmin, can }: NavPerms): boolean {
  if (it.superAdminOnly) return isSuperAdmin;
  if (it.anyPerm) return isSuperAdmin || it.anyPerm.some((m) => can(m, "VIEW"));
  if (it.perm) return isSuperAdmin || can(it.perm, "VIEW");
  return true;
}

/** Groups with their hidden items removed and empty groups dropped. */
export function visibleNavGroups(perms: NavPerms): NavGroup[] {
  return ADMIN_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((it) => isNavItemVisible(it, perms)) }))
    .filter((g) => g.items.length > 0);
}

/**
 * First route the admin can actually open — used to land scoped admins somewhere
 * useful instead of the super-admin overview. Returns null if they have nothing.
 */
export function firstAccessibleHref(perms: NavPerms): string | null {
  for (const g of ADMIN_GROUPS) {
    for (const it of g.items) {
      if (isNavItemVisible(it, perms)) return it.href;
    }
  }
  return null;
}
