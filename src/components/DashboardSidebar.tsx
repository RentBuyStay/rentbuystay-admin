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

// `perm` gates the item behind MODULE:VIEW. Items with no `perm` (Dashboard,
// Analytics) are always shown. Super admins see everything.
type NavItem = { label: string; href: string; Icon: LucideIcon; perm?: PermModule };
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
    items: [{ label: "Analytics", href: "/dashboard/analytics", Icon: TrendingUp }],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Notification/Email", href: "/dashboard/notifications", Icon: Bell, perm: "SETTINGS" },
      { label: "Blog Management", href: "/dashboard/blog", Icon: BookOpen, perm: "BLOG_MANAGEMENT" },
      { label: "Platform Settings", href: "/dashboard/settings", Icon: Settings, perm: "SETTINGS" },
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
  const { can, isSuperAdmin } = usePermissions();

  // Hide nav items a scoped admin can't view; drop groups left empty.
  const visibleGroups = adminGroups
    .map((g) => ({ ...g, items: g.items.filter((it) => !it.perm || can(it.perm, "VIEW")) }))
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
            {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
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
