"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreVertical } from "lucide-react";
import type { Role } from "@/lib/demoUsers";
import {
  useGetAdminUsersQuery,
  useGetPlatformStatsQuery,
  useGetProfessionalsQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  type ProfessionalListItem,
} from "@/services/adminApi";
import { useGetAgentsQuery } from "@/services/agentApi";
import type { AgentListItem } from "@/services/types";
import { Badge, FilterDropdown, ROLE_STYLE, VerificationCell, pageItems, toRow, type UserRow } from "@/components/admin/userRows";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"All" | Role>("All");
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<string | null>(null);

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

  const allRows = useMemo(
    () => (usersPage?.content ?? []).map((u) => toRow(u, agentsById, prosById)),
    [usersPage, agentsById, prosById],
  );

  // Location options from the data actually on screen (only enriched rows carry one).
  const locationOptions = useMemo(
    () => [...new Set(allRows.map((r) => r.location).filter((l) => l !== "—"))].sort(),
    [allRows],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter(
      (r) =>
        (tab === "All" || r.role === tab) &&
        (!locationFilter || r.location === locationFilter) &&
        (!statusFilter || r.status === statusFilter) &&
        (!verificationFilter || (verificationFilter === "Verified") === r.verified) &&
        (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)),
    );
  }, [allRows, tab, query, locationFilter, statusFilter, verificationFilter]);

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
        <FilterDropdown label="Location" options={locationOptions} value={locationFilter} onChange={setLocationFilter} />
        <FilterDropdown label="Status" options={["Active", "Suspended"]} value={statusFilter} onChange={setStatusFilter} minWidth={133} />
        <FilterDropdown label="Verification" options={["Verified", "Unverified"]} value={verificationFilter} onChange={setVerificationFilter} minWidth={133} />
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
                    <VerificationCell userId={r.id} fallback={r.verified} />
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
