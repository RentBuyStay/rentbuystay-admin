"use client";
import { pageTotal } from "@/services/types";

import Image from "next/image";
import { useMemo, useState } from "react";
import AdminPropertyCard from "@/components/AdminPropertyCard";
import { toAdminPropertyFromApi } from "@/lib/property";
import { EmptyState, FilterDropdown } from "@/components/admin/userRows";
import { useGetAdminPropertiesQuery, useGetAwaitingPropertiesQuery } from "@/services/adminApi";

export default function AwaitingApprovalPage() {
  const [tab, setTab] = useState<"Awaiting Approval" | "Rejected">("Awaiting Approval");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  const { data: awaitingPage, isLoading: loadingAwaiting } = useGetAwaitingPropertiesQuery({ page: 0, size: 100 });
  // Rejected listings come from the full platform list (no dedicated endpoint).
  const { data: allPage, isLoading: loadingAll } = useGetAdminPropertiesQuery({ page: 0, size: 100 });
  const isLoading = tab === "Awaiting Approval" ? loadingAwaiting : loadingAll;

  const awaiting = useMemo(() => (awaitingPage?.content ?? []).map(toAdminPropertyFromApi), [awaitingPage]);
  const rejected = useMemo(
    () => (allPage?.content ?? []).filter((p) => p.status === "REJECTED").map(toAdminPropertyFromApi),
    [allPage],
  );

  const TABS: { key: "Awaiting Approval" | "Rejected"; count: number }[] = [
    { key: "Awaiting Approval", count: pageTotal(awaitingPage) },
    { key: "Rejected", count: rejected.length },
  ];

  const locationOptions = useMemo(
    () => [...new Set([...awaiting, ...rejected].map((p) => p.location).filter((l) => l !== "—"))].sort(),
    [awaiting, rejected],
  );

  const properties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tab === "Awaiting Approval" ? awaiting : rejected).filter(
      (p) =>
        (!locationFilter || p.location === locationFilter) &&
        (!q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.lister.name.toLowerCase().includes(q)),
    );
  }, [awaiting, rejected, tab, query, locationFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs + Location filter + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="shrink-0"
                style={{
                  fontSize: 12, fontWeight: 500, lineHeight: "20px", padding: "8px 12px",
                  color: active ? "#305E82" : "#807E7E",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                }}
              >
                {t.key} ({t.count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <FilterDropdown label="Location" options={locationOptions} value={locationFilter} onChange={setLocationFilter} />
          <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-[12px] h-12 px-4 flex-1 min-w-[220px] lg:max-w-[394px]">
            <Image src="/icons/admin/search-normal.svg" alt="" width={20} height={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter name, email or phone..."
              className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-[#121212] placeholder:text-[rgba(128,126,126,0.75)]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          Loading listings…
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
          <EmptyState
            title={query.trim() ? "No results found" : `No ${tab.toLowerCase()} listings`}
            subtitle={
              query.trim()
                ? "No listings match your search. Try a different title, location or lister."
                : tab === "Awaiting Approval"
                ? "You're all caught up. New listings submitted for approval will appear here."
                : "Listings you reject will appear here."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          {properties.map((p) => (
            <AdminPropertyCard key={p.id} property={p} hideTrash />
          ))}
        </div>
      )}
    </div>
  );
}
