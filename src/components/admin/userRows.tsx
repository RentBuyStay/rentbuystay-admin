"use client";

import Image from "next/image";
import type { Role } from "@/lib/demoUsers";
import {
  useGetUserKycStatusQuery,
  type AdminUser,
  type ProfessionalListItem,
} from "@/services/adminApi";
import type { AgentListItem } from "@/services/types";

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

export function toRow(
  u: AdminUser,
  agentsById: Map<string, AgentListItem>,
  prosById: Map<string, ProfessionalListItem>,
): UserRow {
  const joined = new Date(u.createdAt);
  // Enrich from the public directories: /agents covers agents (name, state/city,
  // listing count); /professionals covers agencies. Seekers/owners have no
  // profile endpoint yet, so their name/location/listings stay "—" (issue #7).
  const agent = agentsById.get(u.id);
  const pro = prosById.get(u.id) ?? (u.organizationId ? prosById.get(u.organizationId) : undefined);
  const name =
    [agent?.firstName, agent?.lastName].filter(Boolean).join(" ") ||
    pro?.name ||
    pro?.organizationName ||
    "—";
  const location = [agent?.city, agent?.state].filter(Boolean).join(", ") || "—";
  return {
    id: u.id,
    name,
    email: u.email,
    role: ROLE_BY_TYPE[u.userType] ?? "Seeker",
    location,
    joined: Number.isNaN(joined.getTime())
      ? "—"
      : joined.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
    listings: agent?.listingCount !== undefined ? String(agent.listingCount) : "—",
    status: u.status === "SUSPENDED" ? "Suspended" : "Active",
    // Identity (KYC) verification only — email verification is NOT what the
    // Verification column claims. VerificationCell refines this per row.
    verified: agent?.identityVerified ?? pro?.verified ?? false,
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
 * Verification badge backed by the authoritative KYC endpoint. Identity OR
 * business VERIFIED → Verified; while loading (or on error) it falls back to
 * the directory-derived flag so the cell never flickers wrong-then-right.
 */
export function VerificationCell({ userId, fallback }: { userId: string; fallback: boolean }) {
  const { data: kyc } = useGetUserKycStatusQuery(userId);
  const verified = kyc
    ? kyc.identity?.status === "VERIFIED" || kyc.business?.status === "VERIFIED"
    : fallback;
  return verified ? (
    <span className="inline-flex items-center gap-2 rounded-[16px] whitespace-nowrap" style={{ background: "rgba(0,157,53,0.08)", color: "#009D35", fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>
      <Image src="/icons/admin/shield-tick.svg" alt="" width={16} height={16} /> Verified
    </span>
  ) : (
    <Badge bg="rgba(227,0,69,0.08)" color="#E30045">Unverified</Badge>
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
