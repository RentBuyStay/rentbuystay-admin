"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AdminPropertyCard, { type AdminProperty } from "@/components/AdminPropertyCard";

/* Properties for the admin grid (swap for admin GET /admin/properties). */
const PROPERTIES: AdminProperty[] = [
  { id: "1", image: "/images/prop1.jpg", listingType: "For Rent", price: "₦2,800,000", priceSuffix: "/yr", status: "Active", title: "3-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", sqft: "3500 sqft", beds: 3, baths: 4, lister: { name: "Urban Nest Realty", initials: "UN", verified: true, role: "Agency" } },
  { id: "2", image: "/images/prop2.jpg", listingType: "For Sale", price: "₦260,000,000", status: "Removed", title: "4-Bedroom Duplex, Ikoyi", location: "Ikoyi, Lagos", sqft: "5000 sqft", beds: 5, baths: 6, lister: { name: "Aura Homes", initials: "AH", verified: true, role: "Agency" } },
  { id: "3", image: "/images/prop3.jpg", listingType: "For Rent", price: "₦1,500,000", priceSuffix: "/yr", status: "Active", title: "2-Bedroom Apartment, Yaba", location: "Yaba, Lagos", sqft: "1800 sqft", beds: 2, baths: 2, lister: { name: "Fadeke Salami", initials: "FS", verified: false, role: "Owner" } },
  { id: "4", image: "/images/prop4.jpg", listingType: "For Sale", price: "₦85,000,000", status: "Active", title: "3-Bedroom Terrace, Lekki", location: "Lekki, Lagos", sqft: "2400 sqft", beds: 3, baths: 3, lister: { name: "Chioma Ifeanyi", initials: "CI", verified: true, role: "Agent" } },
  { id: "5", image: "/images/prop5.jpg", listingType: "Shortlet", price: "₦450,000", priceSuffix: "/night", status: "Archived", title: "Studio Apartment, Victoria Island", location: "Victoria Island, Lagos", sqft: "650 sqft", beds: 1, baths: 1, lister: { name: "Damilare John", initials: "DJ", verified: false, role: "Owner" } },
  { id: "6", image: "/images/prop1.jpg", listingType: "For Rent", price: "₦3,200,000", priceSuffix: "/yr", status: "Active", title: "4-Bedroom Semi-Detached, Ikeja", location: "Ikeja, Lagos", sqft: "3200 sqft", beds: 4, baths: 4, lister: { name: "Michael Adebayo", initials: "MA", verified: true, role: "Agent" } },
];

const TABS: { key: "All" | AdminProperty["status"]; label: string; count: number }[] = [
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
        <button
          type="button"
          className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
          style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/add-rounded.svg" alt="" width={20} height={20} /> Add New Property
        </button>
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
