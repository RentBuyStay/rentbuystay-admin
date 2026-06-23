"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

type Role = "Seeker" | "Owner" | "Agent" | "Agency";
type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
  joined: string;
  listings: number;
  status: "Active" | "Suspended";
  verified: boolean;
};

const TABS: { key: "All" | Role; label: string; count: number }[] = [
  { key: "All", label: "All", count: 2416 },
  { key: "Seeker", label: "Seekers", count: 1284 },
  { key: "Owner", label: "Owners", count: 612 },
  { key: "Agent", label: "Agents", count: 384 },
  { key: "Agency", label: "Agencies", count: 136 },
];

const ROWS: UserRow[] = [
  { id: "1", name: "Chiamaka Femi", email: "chiamakafemi@email.com", role: "Owner", location: "Lagos", joined: "Apr 2026", listings: 0, status: "Active", verified: true },
  { id: "2", name: "Jasper Lin", email: "jasperlin@email.com", role: "Agent", location: "Lagos", joined: "Apr 2026", listings: 7, status: "Active", verified: true },
  { id: "3", name: "Amina Yusuf", email: "aminayusuf@email.com", role: "Agent", location: "Ibadan", joined: "Mar 2026", listings: 12, status: "Active", verified: true },
  { id: "4", name: "Lara Moretti", email: "laramoretti@email.com", role: "Agent", location: "Lagos", joined: "Mar 2026", listings: 4, status: "Active", verified: true },
  { id: "5", name: "Sofia Garcia", email: "sofiagarcia@email.com", role: "Owner", location: "Ogun", joined: "Mar 2026", listings: 2, status: "Suspended", verified: false },
  { id: "6", name: "Ben Thompson", email: "benthompson@email.com", role: "Agency", location: "Port-Harcourt", joined: "Mar 2026", listings: 28, status: "Active", verified: false },
  { id: "7", name: "Mira Patel", email: "mirapatel@email.com", role: "Seeker", location: "Lagos", joined: "Mar 2026", listings: 0, status: "Active", verified: true },
  { id: "8", name: "Omar Al-Faro", email: "omaralfaro@email.com", role: "Seeker", location: "Ogun", joined: "Mar 2026", listings: 0, status: "Active", verified: false },
  { id: "9", name: "Lina Haddad", email: "linahaddad@email.com", role: "Agent", location: "Abuja", joined: "Feb 2026", listings: 11, status: "Suspended", verified: true },
  { id: "10", name: "Karim Mansour", email: "karimmansour@email.com", role: "Owner", location: "Lagos", joined: "Feb 2026", listings: 3, status: "Active", verified: true },
];

// Per-role badge colors from the Figma detail variants (text = solid, bg = same hue @8%).
const ROLE_STYLE: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full whitespace-nowrap"
      style={{ background: bg, color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 10px" }}
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

export default function UsersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"All" | Role>("All");
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROWS.filter((r) => (tab === "All" || r.role === tab) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)));
  }, [tab, query]);

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
                      <Badge bg="#ECFDF3" color="#067647">Active</Badge>
                    ) : (
                      <Badge bg="#FEF3F2" color="#B42318">Suspended</Badge>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {r.verified ? (
                      <Badge bg="#ECFDF3" color="#067647">Verified</Badge>
                    ) : (
                      <Badge bg="#FFFAEB" color="#B54708">Unverified</Badge>
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
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-medium hover:bg-[#fafafa]" style={{ color: "#E30045" }}>
                          <Image src="/icons/admin/menu-suspend.svg" alt="" width={16} height={16} /> Suspend
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
          <button className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa]">
            ← Previous
          </button>
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3, "…", 8, 9, 10].map((n, i) => (
              <button
                key={i}
                className="rounded-[8px] text-[14px] font-medium"
                style={{
                  width: 40, height: 40,
                  background: n === 1 ? "rgba(48,94,130,0.1)" : "transparent",
                  color: n === 1 ? "#305E82" : "#667085",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa]">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
