"use client";

import Image from "next/image";
import { useState } from "react";
import type { Role } from "@/lib/demoUsers";
import type { AdminUser } from "@/services/adminApi";

/** Row shape shared by the User Management and Suspended Users tables. */
export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role | "Admin" | "Staff";
  location: string;
  joined: string;
  listings: string;
  status: "Active" | "Suspended";
  verified: boolean;
};

/** Backend UserType → display role used by the badges/tabs. */
export const ROLE_BY_TYPE: Record<string, UserRow["role"]> = {
  PROPERTY_SEEKER: "Seeker",
  PROPERTY_OWNER: "Owner",
  PROPERTY_AGENT: "Agent",
  PROPERTY_AGENCY: "Agency",
  AGENCY_STAFF: "Staff",
  ADMIN: "Admin",
  SUPER_ADMIN: "Admin",
};

// Per-role badge colors from the Figma detail variants (text = solid, bg = same hue @8%).
export const ROLE_STYLE: Record<UserRow["role"], { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
  Admin: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Staff: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
};

export function toRow(u: AdminUser): UserRow {
  const joined = new Date(u.createdAt);
  const name =
    (u.fullName && u.fullName.trim()) ||
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.organizationName ||
    "—";
  const location = [u.city, u.state].filter(Boolean).join(", ") || "—";
  return {
    id: u.id,
    name,
    email: u.email,
    role: ROLE_BY_TYPE[u.userType] ?? "Seeker",
    location,
    joined: Number.isNaN(joined.getTime())
      ? "—"
      : joined.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
    listings: u.listingsCount !== undefined ? String(u.listingsCount) : "—",
    status: u.status === "SUSPENDED" ? "Suspended" : "Active",
    // Identity OR business KYC verified — from the enriched admin list row.
    verified: Boolean(u.identityVerified || u.businessVerified),
  };
}

export function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full whitespace-nowrap"
      style={{ background: bg, color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}
    >
      {children}
    </span>
  );
}

/**
 * Verification badge — identity OR business KYC verified, sourced from the
 * enriched admin user list row (authoritative, no extra per-row request).
 */
export function VerificationCell({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-2 rounded-[16px] whitespace-nowrap" style={{ background: "rgba(0,157,53,0.08)", color: "#009D35", fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>
      <Image src="/icons/admin/shield-tick.svg" alt="" width={16} height={16} /> Verified
    </span>
  ) : (
    <Badge bg="rgba(227,0,69,0.08)" color="#E30045">Unverified</Badge>
  );
}

/**
 * Rich empty state used across the app (dashboard "Nothing to show yet"):
 * centered illustration + bold title + muted subtitle.
 */
export function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: "48px 24px", gap: "24px" }}>
      <Image
        src="/icons/dash/empty-state.svg"
        alt=""
        width={180}
        height={180}
        className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]"
      />
      <div className="flex flex-col items-center" style={{ gap: "8px", maxWidth: "520px" }}>
        <h3 style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: "#121212", textAlign: "center" }}>
          {title}
        </h3>
        <p style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#807E7E", textAlign: "center" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/**
 * Filter pill with a dropdown — same pill styling as the static design, with
 * the app's action-menu panel for options. "All" clears the filter.
 */
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  minWidth,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between bg-[#F6F6F6] rounded-[12px] hover:bg-[#ededed]"
        style={{ height: 48, padding: "8px 16px", gap: 16, minWidth: minWidth ?? 109, color: value ? "#121212" : "#807E7E", fontSize: 14 }}
      >
        {value ?? label}
        <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute left-0 top-14 z-20 bg-white rounded-[12px] border border-[#F6F6F6] overflow-hidden flex flex-col py-2"
            style={{ minWidth: 180, maxHeight: 320, overflowY: "auto", boxShadow: "0px 15px 40px rgba(165,165,165,0.25)" }}
          >
            {["All", ...options].map((opt) => {
              const isAll = opt === "All";
              const active = isAll ? value === null : value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(isAll ? null : opt); setOpen(false); }}
                  className="flex items-center w-full px-4 text-left hover:bg-[#fafafa]"
                  style={{ height: 40, fontSize: 13, fontWeight: 500, color: active ? "#305E82" : "#807E7E", background: active ? "rgba(48,94,130,0.06)" : "transparent" }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/** Page buttons like the design: 1 2 3 … 8 9 10 (collapses when few pages). */
export function pageItems(page: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);
  const current = page + 1;
  if (current <= 3) return [1, 2, 3, "…", totalPages - 2, totalPages - 1, totalPages];
  if (current >= totalPages - 2) return [1, 2, 3, "…", totalPages - 2, totalPages - 1, totalPages];
  return [1, "…", current - 1, current, current + 1, "…", totalPages];
}
