"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Role } from "@/lib/demoUsers";
import {
  useDecideKycMutation,
  useGetAwaitingBusinessKycQuery,
  useGetAwaitingIdentityKycQuery,
  useGetPlatformStatsQuery,
  useGetProfessionalsQuery,
  type BusinessKycEntry,
  type KycVerificationEntry,
} from "@/services/adminApi";

/* Per-role badge colors (text = solid, bg = same hue @8%). */
const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

/** One row of the review queue, merged from the identity + business queues. */
type QueueItem = {
  kind: "identity" | "business";
  id: string;
  name: string;
  email: string;
  role: Role;
  doc: string;
  submitted: string;
  subjectUserId?: string;
  affiliatedWith?: string;
};

const docLabel = (v: KycVerificationEntry): string =>
  (v.documentType || v.verificationType || "Document").replaceAll("_", " ");

const submittedLabel = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export default function VerificationManagementPage() {
  const [tab, setTab] = useState<"Pending" | "Approved" | "Rejected">("Pending");

  const { data: stats } = useGetPlatformStatsQuery();
  const { data: identityPage } = useGetAwaitingIdentityKycQuery({});
  const { data: businessPage } = useGetAwaitingBusinessKycQuery({});
  const { data: prosPage } = useGetProfessionalsQuery({ size: 200 });
  const [decideKyc, { isLoading: deciding }] = useDecideKycMutation();

  const pending = (stats?.identityKyc?.pending ?? 0) + (stats?.businessKyc?.pending ?? 0);
  const approved = (stats?.identityKyc?.verified ?? 0) + (stats?.businessKyc?.verified ?? 0);
  const rejected = (stats?.identityKyc?.rejected ?? 0) + (stats?.businessKyc?.rejected ?? 0);

  const TABS: { key: "Pending" | "Approved" | "Rejected"; count: number }[] = [
    { key: "Pending", count: pending },
    { key: "Approved", count: approved },
    { key: "Rejected", count: rejected },
  ];

  // Business rows name their subject (user/org id) — enrich via the directory.
  // Identity rows carry no user reference at all (backend gap, issue #8).
  const list: QueueItem[] = useMemo(() => {
    const pros = new Map((prosPage?.content ?? []).map((p) => [p.id, p]));
    const identity: QueueItem[] = (identityPage?.content ?? []).map((v) => ({
      kind: "identity",
      id: v.id,
      name: "—",
      email: "—",
      role: "Seeker",
      doc: docLabel(v),
      submitted: submittedLabel(v.createdAt),
    }));
    const business: QueueItem[] = (businessPage?.content ?? []).map((v: BusinessKycEntry) => {
      const pro = v.subjectId ? pros.get(v.subjectId) : undefined;
      return {
        kind: "business",
        id: v.id,
        name: pro?.name || pro?.organizationName || "—",
        email: pro?.email || "—",
        role: v.subjectKind === "ORGANIZATION" ? "Agency" : "Agent",
        doc: docLabel(v),
        submitted: submittedLabel(v.createdAt),
        subjectUserId: v.subjectKind === "USER" ? v.subjectId : undefined,
      };
    });
    return [...identity, ...business];
  }, [identityPage, businessPage, prosPage]);

  const handleDecision = async (item: QueueItem, approve: boolean) => {
    if (deciding) return;
    try {
      await decideKyc({ kind: item.kind, id: item.id, approve }).unwrap();
    } catch {
      // queue re-fetches via tag invalidation; item stays if the call failed
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          gradient
          icon={<Image src="/icons/admin/verify/stat-pending.svg" alt="" width={16} height={16} />}
          label="Pending Review"
          value={String(pending)}
          delta={<span style={{ color: "#FFFFFF" }}>Awaiting manual review</span>}
        />
        <StatCard
          icon={<Image src="/icons/admin/verify/stat-approved.svg" alt="" width={16} height={16} />}
          label="Approved"
          labelColor="#027B2A"
          value={String(approved)}
          delta={<span style={{ color: "#807E7E" }}>All time</span>}
        />
        <StatCard
          icon={<Image src="/icons/admin/verify/stat-rejected.svg" alt="" width={16} height={16} />}
          label="Rejected"
          labelColor="#E30045"
          value={String(rejected)}
          delta={<span style={{ color: "#807E7E" }}>All time</span>}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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

      {/* List — the backend only exposes the awaiting queue; approved/rejected
          have real counts (tabs/cards) but no list endpoint yet. */}
      {tab !== "Pending" || list.length === 0 ? (
        <EmptyState>No {tab.toLowerCase()} verifications.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((v) => (
            <VerificationCard
              key={`${v.kind}-${v.id}`}
              v={v}
              pending
              onApprove={() => handleDecision(v, true)}
              onReject={() => handleDecision(v, false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  gradient,
  icon,
  label,
  labelColor = "#FFFFFF",
  value,
  delta,
}: {
  gradient?: boolean;
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  value: string;
  delta: React.ReactNode;
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
        {icon}
        <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "24px", color: gradient ? "#FFFFFF" : labelColor }}>{label}</span>
      </div>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: gradient ? "#FFFFFF" : "#121212" }}>{value}</span>
        <span className="flex items-center" style={{ gap: 4, fontSize: 12, lineHeight: "24px" }}>{delta}</span>
      </div>
    </div>
  );
}

function VerificationCard({
  v,
  pending,
  verified,
  onApprove,
  onReject,
}: {
  v: QueueItem;
  pending?: boolean;
  verified?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const badge = ROLE_BADGE[v.role];
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4"
      style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: 24, background: "#FFFFFF" }}
    >
      <div className="flex items-start" style={{ gap: 16 }}>
        <Image src="/icons/admin/verify/doc.svg" alt="" width={48} height={48} className="shrink-0" />
        <div className="flex flex-col" style={{ gap: 8 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{v.name}</span>
            {verified && <Image src="/icons/dash/verify.svg" alt="verified" width={20} height={20} />}
            <span className="rounded-[16px]" style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{v.role}</span>
          </div>
          {v.affiliatedWith ? (
            <div className="flex items-center flex-wrap" style={{ gap: 16 }}>
              <span style={{ fontSize: 14, color: "#807E7E" }}>{v.email}</span>
              <span style={{ fontSize: 12, lineHeight: "24px", color: "#807E7E" }}>
                Affiliated with <span style={{ fontSize: 14, fontWeight: 600, color: "#305E82" }}>{v.affiliatedWith}</span>
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 14, color: "#807E7E" }}>{v.email}</span>
          )}
          <div className="flex items-center flex-wrap" style={{ gap: 8 }}>
            <span style={{ fontSize: 12, color: "#305E82" }}>Submitted {v.submitted}</span>
            <span className="inline-flex items-center" style={{ padding: "4px 8px", borderRadius: 25, background: "rgba(0,157,53,0.05)" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#009D35" }}>{v.doc}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center" style={{ gap: 16 }}>
        {pending && (
          <>
            <button type="button" onClick={onReject} className="flex items-center justify-center hover:opacity-70" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#E30045" }}>
              <Image src="/icons/admin/verify/reject.svg" alt="" width={20} height={20} /> Reject
            </button>
            <button type="button" onClick={onApprove} className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
              <Image src="/icons/admin/verify/approve-check.svg" alt="" width={20} height={20} /> Approve
            </button>
          </>
        )}
        <Link href={v.subjectUserId ? `/dashboard/users/${v.subjectUserId}` : "/dashboard/users"} aria-label={`View ${v.name}'s profile`} className="flex items-center justify-center hover:opacity-70 shrink-0" style={{ width: 48, height: 48, borderRadius: 12 }}>
          <Image src="/icons/admin/verify/eye.svg" alt="" width={24} height={24} />
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center text-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}
    >
      {children}
    </div>
  );
}
