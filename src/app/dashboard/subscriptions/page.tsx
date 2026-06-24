"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Plan = {
  id: string;
  name: string;
  amount: string;
  duration: string;
  listings: string;
  featured: string;
};

/* Subscription plans (swap for admin GET /admin/subscription-plans). */
const PLANS: Plan[] = [
  { id: "p1", name: "Starter Owner", amount: "₦0", duration: "Monthly", listings: "10", featured: "0" },
  { id: "p2", name: "Owner Pro", amount: "₦15,000", duration: "Monthly", listings: "25", featured: "2" },
  { id: "p3", name: "Owner - Mogul", amount: "₦25,000", duration: "Monthly", listings: "50", featured: "4" },
  { id: "p4", name: "Starter Agent", amount: "₦5,000", duration: "Monthly", listings: "12", featured: "0" },
  { id: "p5", name: "Agent Pro", amount: "₦20,000", duration: "Monthly", listings: "25", featured: "2" },
  { id: "p6", name: "Agent - Growth", amount: "₦10,000", duration: "Monthly", listings: "20", featured: "2" },
  { id: "p7", name: "Agency Pro", amount: "₦50,000", duration: "Monthly", listings: "40", featured: "4" },
  { id: "p8", name: "Agency - Growth", amount: "₦75,000", duration: "Monthly", listings: "60", featured: "6" },
  { id: "p9", name: "Agency - Enterprise", amount: "₦120,000", duration: "Monthly", listings: "100", featured: "10" },
];

const TABS = ["Subscription Plans", "User Subscriptions"] as const;

export default function SubscriptionManagementPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Subscription Plans");
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const plans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANS.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard gradient icon="/icons/admin/sub-mrr.svg" label="MRR" value="₦18.4M" delta="+31% MoM" deltaColor="#FFFFFF" />
        <StatCard icon="/icons/admin/sub-active.svg" label="Active Subs" value="1,124" delta="+89 this month" deltaColor="#027B2A" />
        <StatCard icon="/icons/admin/sub-churn.svg" label="Churn Rate" value="2.1%" delta="Improved 0.4%" deltaColor="#027B2A" />
        <StatCard icon="/icons/admin/sub-expiring.svg" label="Expiring (7 Days)" value="28" delta="Try to send reminders" deltaColor="#807E7E" />
      </div>

      {/* Tabs + Create Plan */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="shrink-0"
                style={{
                  fontSize: 12, fontWeight: 500, lineHeight: "20px", padding: "8px 12px",
                  color: active ? "#305E82" : "#807E7E",
                  borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
          style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/add-rounded.svg" alt="" width={20} height={20} /> Create Plan
        </button>
      </div>

      {/* Filter + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>Filter:</span>
          <button
            type="button"
            className="flex items-center justify-between bg-[#F6F6F6] rounded-[12px] hover:bg-[#ededed]"
            style={{ height: 48, padding: "8px 16px", gap: 16, minWidth: 133, color: "#807E7E", fontSize: 14 }}
          >
            User type
            <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} />
          </button>
        </div>
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

      {/* Content */}
      {tab === "User Subscriptions" ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          User subscriptions appear here.
        </div>
      ) : (
        <div className="rounded-[20px] border border-[#F6F6F6] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 1000 }}>
              <colgroup>
                <col style={{ width: 346 }} />
                <col style={{ width: 149 }} />
                <col style={{ width: 191 }} />
                <col style={{ width: 155 }} />
                <col style={{ width: 154 }} />
                <col style={{ width: 93 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: "1px solid #F6F6F6" }}>
                  {["User", "Amount", "Duration", "Listings", "Featured Listing", ""].map((h, i) => (
                    <th key={i} className="text-left" style={{ padding: "12px 24px", fontSize: 12, fontWeight: 500, color: "#807E7E", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F6F6F6" }} className="hover:bg-[#fafafa]">
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500, color: "#121212", whiteSpace: "nowrap" }}>{p.name}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{p.amount}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{p.duration}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212" }}>{p.listings}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212" }}>{p.featured}</td>
                    <td style={{ padding: "16px 24px", position: "relative" }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === p.id ? null : p.id); }}
                        aria-label="Actions"
                        className="inline-flex items-center justify-center hover:opacity-70"
                      >
                        <Image src="/icons/admin/suspended-action.svg" alt="" width={28} height={28} />
                      </button>
                      {menuFor === p.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} aria-hidden="true" />
                          <div
                            className="absolute right-6 top-12 z-20 bg-white rounded-[16px] border border-[#F6F6F6] overflow-hidden flex flex-col"
                            style={{ width: 135, gap: 8, boxShadow: "0px 15px 40px rgba(165,165,165,0.25)" }}
                          >
                            <button type="button" className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
                              <Image src="/icons/admin/menu-edit.svg" alt="" width={16} height={16} /> Edit Plan
                            </button>
                            <button type="button" className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#E30045" }}>
                              <Image src="/icons/admin/menu-delete.svg" alt="" width={16} height={16} /> Delete Plan
                            </button>
                          </div>
                        </>
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
                  style={{ width: 40, height: 40, background: n === 1 ? "rgba(48,94,130,0.1)" : "transparent", color: n === 1 ? "#305E82" : "#667085" }}
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
    </div>
  );
}

function StatCard({
  gradient,
  icon,
  label,
  value,
  delta,
  deltaColor,
}: {
  gradient?: boolean;
  icon: string;
  label: string;
  value: string;
  delta: string;
  deltaColor: string;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        padding: "16px 24px",
        gap: 16,
        borderRadius: 20,
        border: "1px solid #F6F6F6",
        background: gradient ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#FFFFFF",
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <Image src={icon} alt="" width={16} height={16} />
        <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "24px", color: gradient ? "#FFFFFF" : "#807E7E" }}>{label}</span>
      </div>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: gradient ? "#FFFFFF" : "#121212" }}>{value}</span>
        <span style={{ fontSize: 12, lineHeight: "24px", color: deltaColor }}>{delta}</span>
      </div>
    </div>
  );
}
