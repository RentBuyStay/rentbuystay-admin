"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import { type Role } from "@/lib/demoUsers";
import {
  useGetAdminUsersQuery,
  useGetPlatformStatsQuery,
  useGetProfessionalsQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  type AdminUser,
  type ProfessionalListItem,
} from "@/services/adminApi";
import { useGetAgentsQuery } from "@/services/agentApi";
import type { AgentListItem } from "@/services/types";

type UserRow = {
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

const PAGE_SIZE = 20;

/** Backend UserType → display role used by the badges/tabs. */
const ROLE_BY_TYPE: Record<string, UserRow["role"]> = {
  PROPERTY_SEEKER: "Seeker",
  PROPERTY_OWNER: "Owner",
  PROPERTY_AGENT: "Agent",
  PROPERTY_AGENCY: "Agency",
  AGENCY_STAFF: "Staff",
  ADMIN: "Admin",
  SUPER_ADMIN: "Admin",
};

function toRow(
  u: AdminUser,
  agentsById: Map<string, AgentListItem>,
  prosById: Map<string, ProfessionalListItem>,
): UserRow {
  const joined = new Date(u.createdAt);
  // Enrich from the public directories: /agents covers agents (name, state/city,
  // listing count); /professionals covers agencies. Seekers/owners have no
  // profile endpoint yet, so their name/location/listings stay "—".
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
    verified: agent?.identityVerified ?? pro?.verified ?? !!u.emailVerifiedAt,
  };
}

// Per-role badge colors from the Figma detail variants (text = solid, bg = same hue @8%).
const ROLE_STYLE: Record<UserRow["role"], { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
  Admin: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Staff: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
};

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full whitespace-nowrap"
      style={{ background: bg, color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}
    >
      {children}
    </span>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between gap-2 bg-[#F6F6F6] rounded-[12px] h-12 px-4 text-[14px] text-[#807e7e] hover:bg-[#ededed] transition-colors shrink-0"
    >
      {label}
      <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} />
    </button>
  );
}

/** Page buttons like the design: 1 2 3 … 8 9 10 (collapses when few pages). */
function pageItems(page: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1);
  const current = page + 1;
  if (current <= 3) return [1, 2, 3, "…", totalPages - 2, totalPages - 1, totalPages];
  if (current >= totalPages - 2) return [1, 2, 3, "…", totalPages - 2, totalPages - 1, totalPages];
  return [1, "…", current - 1, current, current + 1, "…", totalPages];
}

export default function UsersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"All" | Role>("All");
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const { data: usersPage } = useGetAdminUsersQuery({ page, size: PAGE_SIZE });
  const { data: stats } = useGetPlatformStatsQuery();
  // Directory lookups used to enrich rows with names/locations/listing counts.
  const { data: agentsPage } = useGetAgentsQuery({ size: 200 });
  const { data: prosPage } = useGetProfessionalsQuery({ size: 200 });
  const [suspendUser] = useSuspendUserMutation();
  const [unsuspendUser] = useUnsuspendUserMutation();

  const agentsById = useMemo(() => {
    const m = new Map<string, AgentListItem>();
    (agentsPage?.content ?? []).forEach((a) => a.userId && m.set(a.userId, a));
    return m;
  }, [agentsPage]);

  const prosById = useMemo(() => {
    const m = new Map<string, ProfessionalListItem>();
    (prosPage?.content ?? []).forEach((p) => p.id && m.set(p.id, p));
    return m;
  }, [prosPage]);

  // Live per-type counts from /admin/stats; fall back to page total while loading.
  const TABS: { key: "All" | Role; label: string; count: number }[] = [
    { key: "All", label: "All", count: stats?.totalUsers ?? usersPage?.totalElements ?? 0 },
    { key: "Seeker", label: "Seekers", count: stats?.usersByType?.seekers ?? 0 },
    { key: "Owner", label: "Owners", count: stats?.usersByType?.owners ?? 0 },
    { key: "Agent", label: "Agents", count: stats?.usersByType?.agents ?? 0 },
    { key: "Agency", label: "Agencies", count: stats?.usersByType?.agencies ?? 0 },
  ];

  const rows = useMemo(() => {
    const all = (usersPage?.content ?? []).map((u) => toRow(u, agentsById, prosById));
    const q = query.trim().toLowerCase();
    return all.filter((r) => (tab === "All" || r.role === tab) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)));
  }, [usersPage, agentsById, prosById, tab, query]);

  const totalPages = usersPage?.totalPages ?? 1;

  const handleSuspendToggle = async (row: UserRow) => {
    setMenuFor(null);
    try {
      if (row.status === "Suspended") await unsuspendUser(row.id).unwrap();
      else await suspendUser({ id: row.id, reason: "Suspended by admin", notifyUser: true }).unwrap();
    } catch {
      // list re-fetches via tag invalidation; errors keep current state
    }
  };

  return (
    <div className="flex flex-col gap-6" onClick={() => setMenuFor(null)}>
      {/* Tabs + Create User */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="whitespace-nowrap pb-2 transition-colors"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? "#305E82" : "#807E7E",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                  padding: "8px 12px",
                }}
              >
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-white rounded-[12px] h-12 px-6 text-[14px] font-medium hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/add-rounded.svg" alt="" width={20} height={20} /> Create User
        </button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[16px] font-medium text-[#121212]">Filter:</span>
        <FilterPill label="Location" />
        <FilterPill label="Status" />
        <FilterPill label="Verification" />
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-[12px] h-12 px-4 flex-1 min-w-[220px] lg:max-w-[394px] lg:ml-auto">
          <Image src="/icons/admin/search-normal.svg" alt="" width={20} height={20} className="shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name, email or phone..."
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px] text-[#121212] placeholder:text-[rgba(128,126,126,0.75)] placeholder:text-[12px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[20px] border border-[#F6F6F6] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 1012 }}>
            <colgroup>
              <col style={{ width: 262 }} />
              <col style={{ width: 116 }} />
              <col style={{ width: 141 }} />
              <col style={{ width: 159 }} />
              <col style={{ width: 76 }} />
              <col style={{ width: 129 }} />
              <col style={{ width: 129 }} />
              <col style={{ width: 76 }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "1px solid #F6F6F6" }}>
                {["User", "Role", "Location", "Joined", "Listings", "Status", "Verification", ""].map((h, i) => (
                  <th
                    key={i}
                    className="text-left"
                    style={{ padding: "12px 24px", fontSize: 12, fontWeight: 500, color: "#807E7E", whiteSpace: "nowrap" }}
                  >
                    {i === 0 ? (
                      <span className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 rounded accent-[#305E82] shrink-0" />
                        {h}
                      </span>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F6F6F6" }} className="hover:bg-[#fafafa]">
                  <td style={{ padding: "16px 24px" }}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded accent-[#305E82] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#121212] truncate">{r.name}</p>
                        <p className="text-[12px] text-[#807e7e] truncate">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <Badge bg={ROLE_STYLE[r.role].bg} color={ROLE_STYLE[r.role].color}>{r.role}</Badge>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{r.location}</td>
                  <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{r.joined}</td>
                  <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212" }}>{r.listings}</td>
                  <td style={{ padding: "16px 24px" }}>
                    {r.status === "Active" ? (
                      <Badge bg="rgba(0,157,53,0.08)" color="#009D35">Active</Badge>
                    ) : (
                      <Badge bg="rgba(227,0,69,0.08)" color="#E30045">Suspended</Badge>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {r.verified ? (
                      <span className="inline-flex items-center gap-2 rounded-[16px] whitespace-nowrap" style={{ background: "rgba(0,157,53,0.08)", color: "#009D35", fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>
                        <Image src="/icons/admin/shield-tick.svg" alt="" width={16} height={16} /> Verified
                      </span>
                    ) : (
                      <Badge bg="rgba(227,0,69,0.08)" color="#E30045">Unverified</Badge>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", position: "relative" }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === r.id ? null : r.id); }}
                      className="hover:bg-[#f0f0f0] rounded-lg p-1.5"
                      aria-label="Actions"
                    >
                      <MoreVertical size={18} className="text-[#807e7e]" />
                    </button>
                    {menuFor === r.id && (
                      <div
                        className="absolute right-6 top-12 z-20 bg-white rounded-[16px] border border-[#f6f6f6] py-2 w-[180px]"
                        style={{ boxShadow: "0px 15px 40px 0px rgba(165,165,165,0.25)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button onClick={() => router.push(`/dashboard/users/${r.id}`)} className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-medium text-[#807e7e] hover:bg-[#fafafa]">
                          <Image src="/icons/admin/menu-eye.svg" alt="" width={16} height={16} /> View Profile
                        </button>
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-medium text-[#807e7e] hover:bg-[#fafafa]">
                          <Image src="/icons/admin/menu-notification.svg" alt="" width={16} height={16} /> Send Notification
                        </button>
                        <button onClick={() => handleSuspendToggle(r)} className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-medium hover:bg-[#fafafa]" style={{ color: "#E30045" }}>
                          <Image src="/icons/admin/menu-suspend.svg" alt="" width={16} height={16} /> {r.status === "Suspended" ? "Unsuspend" : "Suspend"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ededed]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50"
          >
            ← Previous
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {pageItems(page, totalPages).map((n, i) => (
              <button
                key={i}
                onClick={() => typeof n === "number" && setPage(n - 1)}
                className="rounded-[8px] text-[14px] font-medium"
                style={{
                  width: 40, height: 40,
                  background: n === page + 1 ? "rgba(48,94,130,0.1)" : "transparent",
                  color: n === page + 1 ? "#305E82" : "#667085",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
