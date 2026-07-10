"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PlanFormModal, SuccessModal, ExtendModal, ConfirmModal, CancelExtras, DeleteWarning, type PlanFormValues, type ExtendValues } from "@/components/PlanModals";
import {
  useGetAdminPlansQuery,
  useGetPlanFrequenciesQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
  useGetAdminUserSubscriptionsQuery,
  useGetRevenueStatsQuery,
  useCancelUserSubscriptionMutation,
  useExtendUserSubscriptionMutation,
  useGetAdminUsersQuery,
  useGetProfessionalsQuery,
  type AdminSubscriptionPlan,
} from "@/services/adminApi";
import { useGetAgentsQuery } from "@/services/agentApi";
import { usePermissions } from "@/hooks/usePermissions";
import { formatPrice } from "@/lib/property";
import { EmptyState, FilterDropdown, pageItems } from "@/components/admin/userRows";
import RowActionsMenu from "@/components/admin/RowActionsMenu";

const SUCCESS_COPY = {
  create: { title: "Subscription Plan Created", body: "Well-done! The new plan has been added to the platform. Eligible users can now discover and subscribe to it. You can edit or deactivate it at any time from Subscription Management." },
  edit: { title: "Changes Saved", body: "Great! The new changes has been saved to the subscription plan. You can edit or deactivate it at any time from Subscription Management." },
  extend: { title: "Subscription Extension Successful", body: "The subscription has been extended successfully. Their new expiry date has been updated and a confirmation email has been sent to the user." },
  cancel: { title: "Subscription Cancelled", body: "The subscription has been successfully cancelled. The account has been moved to the free tier and all premium features have been disabled. A cancellation confirmation has been sent to their email." },
  delete: { title: "Subscription Plan Deleted", body: "The subscription plan has been permanently removed from the system. It will no longer be available for new sign-ups or renewals. You can review impacted users from the Users section." },
};

type Plan = {
  id: string;
  name: string;
  amount: string;
  duration: string;
  listings: string;
  featured: string;
  targetRole?: string;
  agentSeats?: string;
  features?: string;
  raw: AdminSubscriptionPlan;
};

type SubStatus = "Active" | "Grace" | "Expired" | "Cancelled";
const SUB_STATUS: Record<SubStatus, { bg: string; color: string }> = {
  Active: { bg: "rgba(0,157,53,0.08)", color: "#009D35" },
  Grace: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Expired: { bg: "rgba(227,0,69,0.08)", color: "#E30045" },
  Cancelled: { bg: "rgba(227,0,69,0.08)", color: "#E30045" },
};

const STATUS_LABEL: Record<string, SubStatus> = {
  ACTIVE: "Active",
  GRACE: "Grace",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

type Sub = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planTargetRole?: string;
  amount: string;
  paymentDate: string;
  renews: string;
  endsAtIso?: string;
  status: SubStatus;
};

const fmtDate = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
};

const SUBS_PAGE_SIZE = 20;

const TABS = ["Subscription Plans", "User Subscriptions"] as const;

export default function SubscriptionManagementPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Subscription Plans");
  const [query, setQuery] = useState("");
  const [planModal, setPlanModal] = useState<{ mode: "create" | "edit"; plan?: Plan } | null>(null);
  const [action, setAction] = useState<{ type: "extend" | "cancel"; sub: Sub } | { type: "delete"; plan: Plan } | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [subsPage, setSubsPage] = useState(0);
  const [planPage, setPlanPage] = useState(0);
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const { data: apiPlans = [], isLoading: loadingPlans } = useGetAdminPlansQuery();
  const { data: frequencies = [] } = useGetPlanFrequenciesQuery();
  const { data: subsPageData, isLoading: loadingSubs } = useGetAdminUserSubscriptionsQuery({ page: subsPage, size: SUBS_PAGE_SIZE });
  // Aggregate fetch (all subs) + revenue breakdown for the MRR / churn stat cards.
  const { data: allSubsData } = useGetAdminUserSubscriptionsQuery({ page: 0, size: 500 });
  const { data: revenue } = useGetRevenueStatsQuery();
  const { data: usersPage } = useGetAdminUsersQuery({ page: 0, size: 200 });
  const { data: agentsPage } = useGetAgentsQuery({ size: 200 });
  const { data: prosPage } = useGetProfessionalsQuery({ size: 200 });
  const [createPlan, { isLoading: creatingPlan }] = useCreateAdminPlanMutation();
  const [updatePlan, { isLoading: updatingPlan }] = useUpdateAdminPlanMutation();
  const [deletePlan, { isLoading: deletingPlan }] = useDeleteAdminPlanMutation();
  const { can } = usePermissions();
  const canEditSub = can("SUBSCRIPTIONS", "EDIT");
  const [cancelSub, { isLoading: cancelling }] = useCancelUserSubscriptionMutation();
  const [extendSub, { isLoading: extending }] = useExtendUserSubscriptionMutation();

  const allPlans: Plan[] = useMemo(
    () =>
      apiPlans.map((p) => ({
        id: p.id,
        name: p.name,
        amount: formatPrice(p.price),
        duration: p.frequency?.name ?? (p.durationDays ? `${p.durationDays} days` : "—"),
        listings: String(p.listingLimit ?? 0),
        featured: String(p.featuredLimit ?? 0),
        targetRole: p.targetRole ?? undefined,
        agentSeats: String(p.agentSeats ?? 0),
        features: p.features ?? "",
        raw: p,
      })),
    [apiPlans],
  );
  const plansById = useMemo(() => new Map(allPlans.map((p) => [p.id, p])), [allPlans]);

  const plans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPlans.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!roleFilter || (p.targetRole ?? "").toLowerCase() === roleFilter.toLowerCase()),
    );
  }, [allPlans, query, roleFilter]);

  // User subscriptions joined with plans (name/amount) and users/directories (identity).
  const subs: Sub[] = useMemo(() => {
    const usersById = new Map((usersPage?.content ?? []).map((u) => [u.id, u]));
    const agentsById = new Map((agentsPage?.content ?? []).map((a) => [a.userId, a]));
    const prosById = new Map((prosPage?.content ?? []).map((pr) => [pr.id, pr]));
    return (subsPageData?.content ?? []).map((sub) => {
      const plan = plansById.get(sub.planId);
      const u = usersById.get(sub.userId);
      const agent = agentsById.get(sub.userId);
      const pro = prosById.get(sub.userId) ?? (u?.organizationId ? prosById.get(u.organizationId) : undefined);
      const name =
        [agent?.firstName, agent?.lastName].filter(Boolean).join(" ") ||
        pro?.name || pro?.organizationName || u?.email?.split("@")[0] || "—";
      return {
        id: sub.id,
        name,
        email: u?.email ?? "—",
        plan: plan?.name ?? "—",
        planTargetRole: plan?.targetRole,
        amount: plan ? plan.amount : "—",
        paymentDate: fmtDate(sub.startsAt),
        renews: fmtDate(sub.endsAt),
        endsAtIso: sub.endsAt,
        status: STATUS_LABEL[sub.status] ?? "Expired",
      };
    });
  }, [subsPageData, plansById, usersPage, agentsPage, prosPage]);

  const visibleSubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subs.filter(
      (sv) =>
        (!q || sv.name.toLowerCase().includes(q) || sv.email.toLowerCase().includes(q)) &&
        (!planFilter || sv.plan === planFilter) &&
        (!roleFilter || (sv.planTargetRole ?? "").toLowerCase() === roleFilter.toLowerCase()),
    );
  }, [subs, query, planFilter, roleFilter]);

  const PLANS_PAGE_SIZE = 10;
  const planTotalPages = Math.max(1, Math.ceil(plans.length / PLANS_PAGE_SIZE));
  const pagedPlans = plans.slice(planPage * PLANS_PAGE_SIZE, (planPage + 1) * PLANS_PAGE_SIZE);

  const subsTotalPages = subsPageData?.totalPages ?? 1;
  const expiringSoon = (allSubsData?.content ?? []).filter((s) => {
    if (s.status !== "ACTIVE" || !s.endsAt) return false;
    const diff = new Date(s.endsAt).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 86400000;
  }).length;

  // ── MRR: sum of each plan's monthly-normalised price × its active subscribers ──
  const monthlyPrice = (planId: string): number => {
    const p = plansById.get(planId)?.raw;
    if (!p) return 0;
    const days = p.durationDays ?? p.frequency?.days ?? 30;
    return days > 0 ? p.price * (30 / days) : p.price;
  };
  const mrr = (revenue?.byPlan ?? []).reduce((sum, bp) => sum + monthlyPrice(bp.planId) * bp.subscribers, 0);
  const mrrValue = revenue ? `₦${Math.round(mrr).toLocaleString("en-NG")}` : "—";

  // ── Churn: share of all subscriptions that have cancelled or lapsed ──
  const allSubs = allSubsData?.content ?? [];
  const churnedCount = allSubs.filter((s) => s.status === "CANCELLED" || s.status === "EXPIRED").length;
  const churnValue = allSubs.length ? `${((churnedCount / allSubs.length) * 100).toFixed(1)}%` : "—";

  const frequencyNames = frequencies.map((f) => f.name);
  const roleOptions = [...new Set(allPlans.map((p) => p.targetRole).filter((r): r is string => !!r))];

  // Map form values back to the SubscriptionPlan entity shape the API expects.
  const toPlanBody = (v: PlanFormValues, base?: AdminSubscriptionPlan) => {
    const freq = frequencies.find((f) => f.name.toLowerCase() === v.duration.toLowerCase());
    return {
      ...(base ?? {}),
      name: v.name,
      price: v.price,
      listingLimit: v.listingLimit,
      featuredLimit: v.featuredLimit,
      agentSeats: v.agentSeats,
      targetRole: v.targetRole || base?.targetRole || null,
      features: v.features,
      frequency: freq ?? base?.frequency ?? null,
      durationDays: freq?.days ?? base?.durationDays ?? null,
      isActive: base?.isActive ?? true,
    };
  };

  const handleSavePlan = async (v: PlanFormValues) => {
    if (!planModal) return;
    try {
      if (planModal.mode === "create") await createPlan(toPlanBody(v)).unwrap();
      else await updatePlan({ id: planModal.plan!.id, body: toPlanBody(v, planModal.plan!.raw) }).unwrap();
      const copy = SUCCESS_COPY[planModal.mode];
      setPlanModal(null);
      setSuccess(copy);
    } catch {
      // keep the modal open so nothing is lost; the API error is non-fatal
    }
  };

  const handleExtend = async (v: ExtendValues) => {
    if (action?.type !== "extend") return;
    try {
      await extendSub({ id: action.sub.id, newEndDate: v.newEndDate, reason: v.reason, internalNote: v.internalNote }).unwrap();
      setAction(null);
      setSuccess(SUCCESS_COPY.extend);
    } catch {
      // keep modal open on failure
    }
  };

  const handleCancelSub = async () => {
    if (action?.type !== "cancel") return;
    try {
      await cancelSub({ id: action.sub.id, reason: cancelReason || "Cancelled by admin" }).unwrap();
      setAction(null);
      setCancelReason("");
      setSuccess(SUCCESS_COPY.cancel);
    } catch {
      // keep modal open on failure
    }
  };

  const handleDeletePlan = async () => {
    if (action?.type !== "delete") return;
    try {
      await deletePlan(action.plan.id).unwrap();
      setAction(null);
      setSuccess(SUCCESS_COPY.delete);
    } catch {
      // keep modal open on failure
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard gradient icon="/icons/admin/sub-mrr.svg" label="MRR" value={mrrValue} delta="Monthly recurring revenue" deltaColor="#FFFFFF" />
        <StatCard icon="/icons/admin/sub-active.svg" label="Active Subs" value={String(revenue?.totalSubscribers ?? (allSubsData?.content ?? []).filter((s) => s.status === "ACTIVE").length)} delta="Currently active" deltaColor="#027B2A" />
        <StatCard icon="/icons/admin/sub-churn.svg" label="Churn Rate" value={churnValue} delta="Cancelled or lapsed" deltaColor="#807E7E" />
        <StatCard icon="/icons/admin/sub-expiring.svg" label="Expiring (7 Days)" value={String(expiringSoon)} delta="Try to send reminders" deltaColor="#807E7E" />
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
          {tab === "User Subscriptions" && <FilterDropdown label="Plan" options={allPlans.map((pl) => pl.name)} value={planFilter} onChange={setPlanFilter} />}
          <FilterDropdown label="User type" options={roleOptions} value={roleFilter} onChange={setRoleFilter} minWidth={133} />
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
        loadingSubs ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          Loading subscriptions…
        </div>
        ) : visibleSubs.length === 0 ? (
        <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
          <EmptyState
            title={query.trim() || planFilter || roleFilter ? "No results found" : "No user subscriptions yet"}
            subtitle={
              query.trim() || planFilter || roleFilter
                ? "No subscriptions match your search or filters."
                : "When users subscribe to a plan, their subscriptions will appear here."
            }
          />
        </div>
        ) : (
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
                {visibleSubs.map((s) => {
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
                      <td style={{ padding: "16px 24px" }} onClick={(e) => e.stopPropagation()}>
                        <RowActionsMenu width={190} trigger={<Image src="/icons/admin/suspended-action.svg" alt="" width={28} height={28} />}>
                          {(close) => (
                            <>
                              {canEditSub && (
                              <button type="button" onClick={() => { close(); setAction({ type: "extend", sub: s }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa] whitespace-nowrap" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
                                <Image src="/icons/admin/menu-extend.svg" alt="" width={16} height={16} className="shrink-0" /> Extend Subscription
                              </button>
                              )}
                              {canEditSub && (
                              <button type="button" onClick={() => { close(); setAction({ type: "cancel", sub: s }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa] whitespace-nowrap" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#E30045" }}>
                                <Image src="/icons/admin/menu-cancel.svg" alt="" width={16} height={16} className="shrink-0" /> Cancel Subscription
                              </button>
                              )}
                              {!canEditSub && (
                                <span className="flex items-center px-4" style={{ height: 42, fontSize: 12, color: "#807E7E" }}>No actions available</span>
                              )}
                            </>
                          )}
                        </RowActionsMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ededed]">
            <button onClick={() => setSubsPage((n) => Math.max(0, n - 1))} disabled={subsPage === 0} className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50">← Previous</button>
            <div className="hidden sm:flex items-center gap-1">
              {pageItems(subsPage, subsTotalPages).map((n, i) => (
                <button key={i} onClick={() => typeof n === "number" && setSubsPage(n - 1)} className="rounded-[8px] text-[14px] font-medium" style={{ width: 40, height: 40, background: n === subsPage + 1 ? "rgba(48,94,130,0.1)" : "transparent", color: n === subsPage + 1 ? "#305E82" : "#667085" }}>{n}</button>
              ))}
            </div>
            <button onClick={() => setSubsPage((n) => Math.min(subsTotalPages - 1, n + 1))} disabled={subsPage >= subsTotalPages - 1} className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50">Next →</button>
          </div>
        </div>
        )
      ) : (
        loadingPlans ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          Loading plans…
        </div>
        ) : plans.length === 0 ? (
        <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
          <EmptyState
            title={query.trim() || roleFilter ? "No results found" : "No subscription plans yet"}
            subtitle={
              query.trim() || roleFilter
                ? "No plans match your search or filters."
                : "Create your first plan with the Create Plan button above."
            }
          />
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
                {pagedPlans.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F6F6F6" }} className="hover:bg-[#fafafa]">
                    <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500, color: "#121212", whiteSpace: "nowrap" }}>{p.name}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{p.amount}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212", whiteSpace: "nowrap" }}>{p.duration}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212" }}>{p.listings}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: "#121212" }}>{p.featured}</td>
                    <td style={{ padding: "16px 24px" }} onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu width={150} trigger={<Image src="/icons/admin/suspended-action.svg" alt="" width={28} height={28} />}>
                        {(close) => (
                          <>
                            <button type="button" onClick={() => { close(); setPlanModal({ mode: "edit", plan: p }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#807E7E" }}>
                              <Image src="/icons/admin/menu-edit.svg" alt="" width={16} height={16} /> Edit Plan
                            </button>
                            <button type="button" onClick={() => { close(); setAction({ type: "delete", plan: p }); }} className="flex items-center gap-2 w-full px-4 hover:bg-[#fafafa]" style={{ height: 42, fontSize: 12, fontWeight: 500, color: "#E30045" }}>
                              <Image src="/icons/admin/menu-delete.svg" alt="" width={16} height={16} /> Delete Plan
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
            <button onClick={() => setPlanPage((n) => Math.max(0, n - 1))} disabled={planPage === 0} className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50">
              ← Previous
            </button>
            <div className="hidden sm:flex items-center gap-1">
              {pageItems(planPage, planTotalPages).map((n, i) => (
                <button
                  key={i}
                  onClick={() => typeof n === "number" && setPlanPage(n - 1)}
                  className="rounded-[8px] text-[14px] font-medium"
                  style={{ width: 40, height: 40, background: n === planPage + 1 ? "rgba(48,94,130,0.1)" : "transparent", color: n === planPage + 1 ? "#305E82" : "#667085" }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPlanPage((n) => Math.min(planTotalPages - 1, n + 1))} disabled={planPage >= planTotalPages - 1} className="flex items-center gap-2 text-[14px] font-medium text-[#344054] border border-[#D0D5DD] rounded-[8px] px-3.5 py-2 hover:bg-[#fafafa] disabled:opacity-50">
              Next →
            </button>
          </div>
        </div>
        )
      )}

      {planModal && (
        <PlanFormModal
          mode={planModal.mode}
          initial={planModal.plan}
          durationOptions={frequencyNames}
          saving={creatingPlan || updatingPlan}
          onClose={() => setPlanModal(null)}
          onSaved={handleSavePlan}
        />
      )}
      {action?.type === "extend" && (
        <ExtendModal
          subtitle={`${action.sub.name} · ${action.sub.plan} Plan · Renews ${action.sub.renews}`}
          currentEndDate={action.sub.endsAtIso}
          saving={extending}
          onClose={() => setAction(null)}
          onConfirm={handleExtend}
        />
      )}
      {action?.type === "cancel" && (
        <ConfirmModal
          maxWidth={650}
          title="Cancel Subscription"
          body={`Are you sure you want to cancel ${action.sub.name}'s ${action.sub.plan} plan? This will downgrade the account to the free tier.`}
          confirmLabel="Cancel Subscription"
          busy={cancelling}
          onConfirm={handleCancelSub}
          onClose={() => { setAction(null); setCancelReason(""); }}
        >
          <CancelExtras reason={cancelReason} onReasonChange={setCancelReason} />
        </ConfirmModal>
      )}
      {action?.type === "delete" && (
        <ConfirmModal
          title="Delete Subscription Plan"
          body={`You're about to permanently delete the ${action.plan.name} plan. This action cannot be undone.`}
          confirmLabel="Delete Plan"
          busy={deletingPlan}
          onConfirm={handleDeletePlan}
          onClose={() => setAction(null)}
        >
          <DeleteWarning />
        </ConfirmModal>
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
