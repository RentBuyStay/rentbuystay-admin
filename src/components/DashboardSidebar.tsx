"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ShieldUser,
  type LucideIcon,
} from "lucide-react";
import { useLogoutMutation } from "@/services/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logOut, selectRefreshToken } from "@/features/auth/authSlice";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermModule } from "@/lib/permissions";

// Gating (super admins always pass):
//  - perm          → needs MODULE:VIEW
//  - anyPerm       → needs VIEW on ANY of the listed modules
//  - superAdminOnly→ super admin only (backend endpoints are SUPER_ADMIN-gated)
//  - none          → always shown (Dashboard)
type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
  perm?: PermModule;
  anyPerm?: PermModule[];
  superAdminOnly?: boolean;
};
type NavGroup = { label: string; items: NavItem[] };

const adminGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard }],
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

const TINT = "rgba(117,163,199,0.4)";

export default function DashboardSidebar({
  onClose,
}: {
  /** kept for layout API compat; the admin app has a single (super-admin) nav */
  role?: string;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(selectRefreshToken);
  const [logout] = useLogoutMutation();
  const { can, isSuperAdmin, roleName } = usePermissions();
  const roleBadge = isSuperAdmin ? "SUPER ADMIN" : (roleName?.toUpperCase() || "ADMIN");

  // Hide nav items a scoped admin can't view; drop groups left empty.
  const showItem = (it: NavItem) => {
    if (it.superAdminOnly) return isSuperAdmin;
    if (it.anyPerm) return isSuperAdmin || it.anyPerm.some((m) => can(m, "VIEW"));
    if (it.perm) return can(it.perm, "VIEW");
    return true;
  };
  const visibleGroups = adminGroups
    .map((g) => ({ ...g, items: g.items.filter(showItem) }))
    .filter((g) => g.items.length > 0);

  async function handleLogout() {
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } catch {
      /* ignore — local clear below is what matters */
    }
    dispatch(logOut());
    router.replace("/log-in");
  }

  return (
    <aside
      className="flex flex-col text-white shrink-0 fixed md:sticky top-0 left-0 z-10 md:z-auto w-[242px] md:w-[272px]"
      style={{ background: "#305E82", height: "100vh" }}
    >
      <div style={{ paddingTop: "24px" }}>
        <Image
          src="/icons/dash/rbs-dash-logo.svg"
          alt="RentBuyStay"
          width={272}
          height={56}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* SUPER ADMIN badge */}
      <div style={{ marginTop: "16px", paddingLeft: "24px" }}>
        <div
          className="inline-flex items-center"
          style={{ background: TINT, borderRadius: "25px", padding: "5px 10px", gap: "8px", height: "30px" }}
        >
          <ShieldUser size={20} strokeWidth={1.6} color="#FFFFFF" />
          <span style={{ fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#FFFFFF" }}>
            {roleBadge}
          </span>
        </div>
      </div>

      <nav className="flex flex-col" style={{ padding: "32px 16px 30px", gap: "16px", flex: 1, overflowY: "auto" }}>
        {visibleGroups.map((g) => (
          <div key={g.label} className="flex flex-col" style={{ gap: "8px" }}>
            <div style={{ padding: "0 16px" }}>
              <span style={{ fontSize: "10px", lineHeight: "20px", fontWeight: 500, color: "#FFFFFF", letterSpacing: "2px" }}>
                {g.label}
              </span>
            </div>
            {g.items.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center transition-colors"
                  style={{
                    height: "48px",
                    padding: "8px 16px",
                    gap: "8px",
                    borderRadius: "12px",
                    background: active ? TINT : "transparent",
                    fontSize: "13px",
                    lineHeight: "24px",
                    fontWeight: 500,
                    color: "#FFFFFF",
                  }}
                >
                  <item.Icon size={20} strokeWidth={1.6} color="#FFFFFF" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-between hover:opacity-90 w-full"
        style={{ height: "64px", padding: "12px 24px", background: TINT, border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: "14px", lineHeight: "24px", fontWeight: 500, color: "#FFFFFF" }}>Log out</span>
        <LogOut size={24} strokeWidth={1.6} color="#FFFFFF" />
      </button>
    </aside>
  );
}
