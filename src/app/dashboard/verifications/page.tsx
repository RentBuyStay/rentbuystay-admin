"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import type { Role } from "@/lib/demoUsers";

/* Per-role badge colors (text = solid, bg = same hue @8%). */
const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

type Verification = {
  id: string;
  name: string;
  email: string;
  role: Role;
  doc: string;
  submitted: string;
  affiliatedWith?: string;
};

/* Pending verifications (swap for admin GET /admin/verifications?status=pending). */
const PENDING: Verification[] = [
  { id: "v1", name: "Michael Adegbite", email: "ademichael@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "2 hours ago" },
  { id: "v2", name: "Obinna Eze", email: "obinna.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "5 hours ago" },
  { id: "v3", name: "Kemi Adesanya", email: "kemiadesanya@gmail.com", role: "Agent", doc: "International Passport", submitted: "8 hours ago", affiliatedWith: "Urban Nest Realty" },
  { id: "v4", name: "Oladunni Praise", email: "praiserealty@gmail.com", role: "Agent", doc: "International Passport", submitted: "1 day ago" },
  { id: "v5", name: "Urban Nest Realty", email: "admin@urbannestrealty.com", role: "Agency", doc: "CAC + Director’s NIN", submitted: "2 days ago" },
];

/* Approved / rejected verifications — same card, view-only action. */
const APPROVED: Verification[] = [
  { id: "a1", name: "Tunde Bakare", email: "tunde.b@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "1 day ago" },
  { id: "a2", name: "Grace Effiong", email: "grace.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "2 days ago" },
  { id: "a3", name: "Urban Nest Realty", email: "admin@urbannestrealty.com", role: "Agency", doc: "CAC + Director’s NIN", submitted: "3 days ago" },
];

const REJECTED: Verification[] = [
  { id: "r1", name: "Michael Adegbite", email: "ademichael@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "2 hours ago" },
  { id: "r2", name: "Obinna Eze", email: "obinna.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "5 hours ago" },
  { id: "r3", name: "Oladunni Praise", email: "praiserealty@gmail.com", role: "Agent", doc: "International Passport", submitted: "1 day ago" },
  { id: "r4", name: "Ifeoma Chukwu", email: "ifeoma.c@gmail.com", role: "Owner", doc: "International Passport", submitted: "2 days ago" },
];

const TABS: { key: "Pending" | "Approved" | "Rejected"; count: number }[] = [
  { key: "Pending", count: 16 },
  { key: "Approved", count: 1612 },
  { key: "Rejected", count: 8 },
];

export default function VerificationManagementPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("Pending");
  const list = tab === "Pending" ? PENDING : tab === "Approved" ? APPROVED : REJECTED;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          gradient
          icon={<Image src="/icons/admin/verify/stat-pending.svg" alt="" width={16} height={16} />}
          label="Pending Review"
          value="16"
          delta={<><ArrowUp size={16} color="#FFFFFF" /><span style={{ color: "#FFFFFF" }}>+32% </span><span style={{ color: "#FFFFFF" }}>this week</span></>}
        />
        <StatCard
          icon={<Image src="/icons/admin/verify/stat-approved.svg" alt="" width={16} height={16} />}
          label="Approved"
          labelColor="#027B2A"
          value="1612"
          delta={<><ArrowUp size={16} color="#027B2A" /><span style={{ color: "#027B2A" }}>+63 </span><span style={{ color: "#807E7E" }}>this week</span></>}
        />
        <StatCard
          icon={<Image src="/icons/admin/verify/stat-rejected.svg" alt="" width={16} height={16} />}
          label="Rejected"
          labelColor="#E30045"
          value="8"
          delta={<span style={{ color: "#807E7E" }}>Suspicious Documents</span>}
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

      {/* List */}
      {list.length === 0 ? (
        <EmptyState>No {tab.toLowerCase()} verifications.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((v) => (
            <VerificationCard key={v.id} v={v} pending={tab === "Pending"} />
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

function VerificationCard({ v, pending }: { v: Verification; pending?: boolean }) {
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
            <button type="button" className="flex items-center justify-center hover:opacity-70" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#E30045" }}>
              <Image src="/icons/admin/verify/reject.svg" alt="" width={20} height={20} /> Reject
            </button>
            <button type="button" className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
              <Image src="/icons/admin/verify/approve-check.svg" alt="" width={20} height={20} /> Approve
            </button>
          </>
        )}
        <button type="button" aria-label="View documents" className="flex items-center justify-center hover:opacity-70 shrink-0" style={{ width: 48, height: 48, borderRadius: 12 }}>
          <Image src="/icons/admin/verify/eye.svg" alt="" width={24} height={24} />
        </button>
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
