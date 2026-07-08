"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAdminUsersQuery,
  useUnsuspendUserMutation,
  useEraseUserDataMutation,
} from "@/services/adminApi";
import { unwrapApiError } from "@/services/api";
import { Badge, EmptyState, ROLE_STYLE, VerificationCell, toRow } from "@/components/admin/userRows";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { useToast } from "@/components/Toast";

export default function SuspendedUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  // Server-side status filter + search.
  const { data: usersPage, isLoading } = useGetAdminUsersQuery({
    page: 0,
    size: 200,
    status: "SUSPENDED",
    q: query.trim() || undefined,
  });
  const [unsuspendUser] = useUnsuspendUserMutation();
  const [eraseUserData, { isLoading: erasing }] = useEraseUserDataMutation();
  const [confirmErase, setConfirmErase] = useState<{ id: string; name: string } | null>(null);

  const rows = useMemo(
    () => (usersPage?.content ?? []).filter((u) => u.status === "SUSPENDED").map((u) => toRow(u)),
    [usersPage],
  );

  const handleReactivate = async (id: string) => {
    try {
      await unsuspendUser(id).unwrap();
    } catch {
      // list re-fetches via tag invalidation; row stays if the call failed
    }
  };

  const handleErase = async () => {
    if (!confirmErase) return;
    try {
      await eraseUserData(confirmErase.id).unwrap();
      toast("User data permanently erased.", "success");
      setConfirmErase(null);
    } catch (e) {
      toast(unwrapApiError(e)?.message ?? "Couldn't erase this user's data. Please try again.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search (top-right) */}
      <div className="flex">
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-[12px] h-12 px-4 flex-1 min-w-[220px] lg:max-w-[410px] lg:ml-auto">
          <Image src="/icons/admin/search-normal.svg" alt="" width={20} height={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name, email or phone..."
            className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-[#121212] placeholder:text-[rgba(128,126,126,0.75)]"
          />
        </div>
      </div>

      {/* Loading / empty states — same pattern as messages + verifications */}
      {isLoading ? (
        <div
          className="bg-white flex items-center justify-center text-center"
          style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}
        >
          Loading suspended users…
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
          <EmptyState
            title={query.trim() ? "No results found" : "No suspended users"}
            subtitle={
              query.trim()
                ? "No suspended users match your search. Try a different name, email or phone."
                : "All accounts are in good standing. Users you suspend from User Management will appear here."
            }
          />
        </div>
      ) : (
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
                        <input type="checkbox" onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded accent-[#305E82] shrink-0" />
                        {h}
                      </span>
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => router.push(`/dashboard/users/${r.id}`)} style={{ borderBottom: "1px solid #F6F6F6", cursor: "pointer" }} className="hover:bg-[#fafafa]">
                  <td style={{ padding: "16px 24px" }}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded accent-[#305E82] shrink-0" />
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
                    <Badge bg="rgba(227,0,69,0.08)" color="#E30045">Suspended</Badge>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <VerificationCell verified={r.verified} />
                  </td>
                  <td style={{ padding: "16px 24px" }} onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu width={180} trigger={<Image src="/icons/admin/suspended-action.svg" alt="" width={28} height={28} />}>
                      {(close) => (
                        <>
                          <button type="button" onClick={() => { close(); handleReactivate(r.id); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
                            <Image src="/icons/admin/menu-reactivate.svg" alt="" width={16} height={16} /> Reactivate User
                          </button>
                          <button type="button" onClick={() => { close(); setConfirmErase({ id: r.id, name: r.name }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#E30045" }}>
                            <Image src="/icons/admin/menu-delete.svg" alt="" width={16} height={16} /> Delete User Data
                          </button>
                        </>
                      )}
                    </RowActionsMenu>
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
      )}

      {/* Permanent erase confirmation */}
      {confirmErase && (
        <div
          className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
          style={{ background: "rgba(18,18,18,0.5)" }}
          onClick={() => !erasing && setConfirmErase(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full md:w-[460px] md:max-w-full rounded-t-[24px] md:rounded-[24px] p-6 md:p-8 flex flex-col"
            style={{ gap: 16 }}
          >
            <div className="flex items-center justify-center rounded-full" style={{ width: 48, height: 48, background: "rgba(227,0,69,0.08)" }}>
              <Image src="/icons/admin/menu-delete.svg" alt="" width={22} height={22} />
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#121212" }}>Permanently erase user data?</h2>
              <p style={{ fontSize: 14, lineHeight: "22px", color: "#807E7E" }}>
                This permanently erases and anonymises <span style={{ fontWeight: 600, color: "#121212" }}>{confirmErase.name}</span>&rsquo;s
                data. This can&rsquo;t be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmErase(null)}
                disabled={erasing}
                className="flex-1 flex items-center justify-center rounded-[12px] border border-[#EDEDED] hover:bg-[#fafafa] disabled:opacity-60"
                style={{ height: 48, fontSize: 14, fontWeight: 500, color: "#121212" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleErase}
                disabled={erasing}
                className="flex-1 flex items-center justify-center rounded-[12px] text-white hover:opacity-90 disabled:opacity-60"
                style={{ height: 48, fontSize: 14, fontWeight: 600, background: "#E30045" }}
              >
                {erasing ? "Erasing…" : "Erase Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
