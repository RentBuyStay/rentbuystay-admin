"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import AdminPropertyCard from "@/components/AdminPropertyCard";
import { ADMIN_PROPERTIES, toAdminProperty } from "@/lib/demoProperties";

/* Cards derived from the shared property data (so the card and its detail match). */
const PROPERTIES = ADMIN_PROPERTIES.map(toAdminProperty);

const TABS: { key: "All" | "Active" | "Archived" | "Removed"; label: string; count: number }[] = [
  { key: "All", label: "All", count: 2416 },
  { key: "Active", label: "Active", count: 2619 },
  { key: "Archived", label: "Archived", count: 273 },
  { key: "Removed", label: "Removed", count: 8 },
];

const FILTERS = ["Location", "Status"];

export default function PropertyManagementPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("All");
  const [query, setQuery] = useState("");

  const properties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROPERTIES.filter(
      (p) =>
        (tab === "All" || p.status === tab) &&
        (!q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.lister.name.toLowerCase().includes(q)),
    );
  }, [tab, query]);

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs + Add New Property */}
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
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
          style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/add-rounded.svg" alt="" width={20} height={20} /> Add New Property
        </Link>
      </div>

      {/* Filter + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="flex items-center justify-between bg-[#F6F6F6] rounded-[12px] hover:bg-[#ededed]"
              style={{ height: 48, padding: "8px 16px", gap: 16, minWidth: f === "Status" ? 133 : 109, color: "#807E7E", fontSize: 14 }}
            >
              {f}
              <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-[12px] h-12 px-4 flex-1 min-w-[220px] lg:max-w-[394px] lg:ml-auto">
          <Image src="/icons/admin/search-normal.svg" alt="" width={20} height={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter name, email or phone..."
            className="flex-1 min-w-0 bg-transparent outline-none text-[12px] text-[#121212] placeholder:text-[rgba(128,126,126,0.75)]"
          />
        </div>
      </div>

      {/* Grid */}
      {properties.length === 0 ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          No properties found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
          {properties.map((p) => (
            <AdminPropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
