"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PlanFormModal, SuccessModal } from "@/components/PlanModals";

const SUCCESS_COPY = {
  create: { title: "Subscription Plan Created", body: "Well-done! The new plan has been added to the platform. Eligible users can now discover and subscribe to it. You can edit or deactivate it at any time from Subscription Management." },
  edit: { title: "Changes Saved", body: "Great! The new changes has been saved to the subscription plan. You can edit or deactivate it at any time from Subscription Management." },
};

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

type SubStatus = "Active" | "Extended" | "Expired";
const SUB_STATUS: Record<SubStatus, { bg: string; color: string }> = {
  Active: { bg: "rgba(0,157,53,0.08)", color: "#009D35" },
  Extended: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Expired: { bg: "rgba(227,0,69,0.08)", color: "#E30045" },
};

type Sub = {
  id: string;
  name: string;
  email: string;
  plan: string;
  amount: string;
  paymentDate: string;
  renews: string;
  status: SubStatus;
};

/* User subscriptions (swap for admin GET /admin/subscriptions). */
const USER_SUBS: Sub[] = [
  { id: "s1", name: "Chiamaka Femi", email: "chiamakafemi@gmail.com", plan: "Owner’s Circle", amount: "₦20,000", paymentDate: "15 Mar 2025", renews: "17 Mar 2026", status: "Active" },
  { id: "s2", name: "Urban Nest Realty", email: "urbannestrealty@gmail.com", plan: "Agency Premium", amount: "₦65,000", paymentDate: "17 Feb 2026", renews: "28 Feb 2026", status: "Active" },
  { id: "s3", name: "Amina Yusuf", email: "amina.yusuf@yahoo.com", plan: "Agent Pro", amount: "₦25,000", paymentDate: "28 Jan 2026", renews: "13 Feb 2026", status: "Extended" },
  { id: "s4", name: "Luca Moretti", email: "luca.moretti@mail.it", plan: "Agent Pro", amount: "₦30,000", paymentDate: "13 Jan 2026", renews: "13 Feb 2026", status: "Active" },
  { id: "s5", name: "Aura Homes", email: "contact@aurahomes.com", plan: "Agency Lite", amount: "₦40,000", paymentDate: "10 Jan 2026", renews: "10 Feb 2026", status: "Expired" },
  { id: "s6", name: "Ben Thompson", email: "b.thompson@company.com", plan: "Agency Premium", amount: "₦50,000", paymentDate: "05 Jan 2026", renews: "05 Feb 2026", status: "Active" },
  { id: "s7", name: "Mira Patel", email: "mira.patel@domain.org", plan: "Owner’s Circle", amount: "₦35,000", paymentDate: "02 Jan 2026", renews: "02 Feb 2026", status: "Active" },
  { id: "s8", name: "Omar Al-Farsi", email: "omar.alfarsi@email.net", plan: "Owner’s Circle", amount: "₦45,000", paymentDate: "28 Dec 2025", renews: "28 Jan 2026", status: "Active" },
  { id: "s9", name: "Lina Haddad", email: "lina.haddad@email.net", plan: "Agent Pro", amount: "₦55,000", paymentDate: "20 Dec 2025", renews: "20 Jan 2026", status: "Expired" },
  { id: "s10", name: "Karim Mansour", email: "karim.mansour@email.net", plan: "Owner’s Circle", amount: "₦60,000", paymentDate: "15 Dec 2025", renews: "15 Jan 2026", status: "Active" },
];

const TABS = ["Subscription Plans", "User Subscriptions"] as const;

export default function SubscriptionManagementPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Subscription Plans");
  const [query, setQuery] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [planModal, setPlanModal] = useState<{ mode: "create" | "edit"; plan?: Plan } | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

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
        {tab === "Subscription Plans" && (
          <button
            type="button"
            onClick={() => setPlanModal({ mode: "create" })}
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/add-rounded.svg" alt="" width={20} height={20} /> Create Plan
          </button>
        )}
      </div>

      {/* Filter + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>Filter:</span>
          {tab === "User Subscriptions" && <FilterPill label="Plan" minWidth={109} />}
          <FilterPill label="User type" minWidth={133} />
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
        <div className="rounded-[20px] border border-[#F6F6F6] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 1000 }}>
              <colgroup>
                <col style={{ width: 272 }} />
                <col style={{ width: 181 }} />
                <col style={{ width: 116 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 151 }} />
                <col style={{ width: 134 }} />
                <col style={{ width: 84 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: "1px solid #F6F6F6" }}>
                  {["User", "Plan", "Amount", "Payment Date", "Renews", "Status", ""].map((h, i) => (
                    <th key={i} className="text-left" style={{ padding: "12px 24px", fontSize: 12, fontWeight: 500, color: "#807E7E", whiteSpace: "nowrap" }}>
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
                {USER_SUBS.map((s) => {
                  const st = SUB_STATUS[s.status];
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #F6F6F6" }} className="hover:bg-[#fafafa]">
                      <td style={{ padding: "16px 24px" }}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 rounded accent-[#305E82] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[#121212] truncate">{s.name}</p>
                            <p className="text-[12px] text-[#807e7e] truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{s.plan}</td>
                      <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{s.amount}</td>
                      <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{s.paymentDate}</td>
                      <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{s.renews}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{s.status}</span>
                      </td>
                      <td style={{ padding: "16px 24px", position: "relative" }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === s.id ? null : s.id); }} aria-label="Actions" className="inline-flex items-center justify-center hover:opacity-70">
                          <Image src="/icons/admin/suspended-action.svg" alt="" width={28} height={28} />
                        </button>
                        {menuFor === s.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} aria-hidden="true" />
                            <div className="absolute right-6 top-12 z-20 bg-white rounded-[16px] border border-[#F6F6F6] overflow-hidden flex flex-col" style={{ width: 170, gap: 8, boxShadow: "0px 15px 40px rgba(165,165,165,0.25)" }}>
                              <button type="button" className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
                                <Image src="/icons/admin/menu-extend.svg" alt="" width={16} height={16} /> Extend Subscription
                              </button>
                              <button type="button" className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#E30045" }}>
                                <Image src="/icons/admin/menu-cancel.svg" alt="" width={16} height={16} /> Cancel Subscription
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ededed]">
            <button className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa]">← Previous</button>
            <div className="hidden sm:flex items-center gap-1">
              {[1, 2, 3, "…", 8, 9, 10].map((n, i) => (
                <button key={i} className="rounded-[8px] text-[14px] font-medium" style={{ width: 40, height: 40, background: n === 1 ? "rgba(48,94,130,0.1)" : "transparent", color: n === 1 ? "#305E82" : "#667085" }}>{n}</button>
              ))}
            </div>
            <button className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa]">Next →</button>
          </div>
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
                            <button type="button" onClick={() => { setMenuFor(null); setPlanModal({ mode: "edit", plan: p }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
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

      {planModal && (
        <PlanFormModal
          mode={planModal.mode}
          initial={planModal.plan}
          onClose={() => setPlanModal(null)}
          onSaved={() => {
            const copy = SUCCESS_COPY[planModal.mode];
            setPlanModal(null);
            setSuccess(copy);
          }}
        />
      )}
      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}

function FilterPill({ label, minWidth }: { label: string; minWidth: number }) {
  return (
    <button
      type="button"
      className="flex items-center justify-between bg-[#F6F6F6] rounded-[12px] hover:bg-[#ededed]"
      style={{ height: 48, padding: "8px 16px", gap: 16, minWidth, color: "#807E7E", fontSize: 14 }}
    >
      {label}
      <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} />
    </button>
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
