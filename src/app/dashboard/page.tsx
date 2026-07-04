"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Home, CircleDollarSign, Eye, Building2, ArrowUp, ChevronDown, type LucideIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  useGetPlatformStatsQuery,
  useGetRegistrationStatsQuery,
  useGetRevenueStatsQuery,
  useGetRecentActivityQuery,
} from "@/services/adminApi";

const GRADIENT = "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)";

type Stat = {
  label: string; value: string; deltaNum: string; deltaPeriod: string;
  Icon: LucideIcon; highlight?: boolean; deltaColor?: string;
};

const SERIES = [
  { key: "owners", name: "Property Owners", color: "#305E82" },
  { key: "seekers", name: "Property Seekers", color: "#75A3C7" },
  { key: "agents", name: "Agents", color: "#FFAE00" },
  { key: "agencies", name: "Agencies", color: "#C9A8F0" },
] as const;

// Palette for the revenue-by-plan pie — plans come live from the backend, colours cycle.
const PLAN_COLORS = ["#305E82", "#75A3C7", "#FFAE00", "#8A38F5", "#027B2A", "#E3E8EE"];

// Icon per activity type key returned by /admin/activity.
const ACTIVITY_ICON: Record<string, string> = {
  user: "/icons/admin/alert-shield.svg",
  listing: "/icons/admin/alert-clip.svg",
  property: "/icons/admin/alert-clip.svg",
  verification: "/icons/admin/alert-shield.svg",
  kyc: "/icons/admin/alert-shield.svg",
};

const BANNER_STYLES = [
  {
    icon: "/icons/admin/alert-clip.svg",
    sub: "Review and approve or reject newly submitted listings.",
    cta: "Review now", href: "/dashboard/awaiting-approval",
    bg: "rgba(234, 101, 26, 0.05)", border: "#EA651A", badgeBg: "rgba(234, 101, 26, 0.1)", color: "#EA651A",
  },
  {
    icon: "/icons/admin/alert-shield.svg",
    sub: "Manual review required.",
    cta: "Verify Users", href: "/dashboard/verifications",
    bg: "rgba(138, 56, 245, 0.05)", border: "#8A38F5", badgeBg: "rgba(138, 56, 245, 0.1)", color: "#8A38F5",
  },
];

const fmt = (n: number | undefined, fallback: string): string =>
  n === undefined ? fallback : n.toLocaleString("en-NG");

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const dayLabel = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : WEEKDAYS[d.getDay()];
};

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export default function AdminDashboardPage() {
  const { data: stats } = useGetPlatformStatsQuery();
  const { data: registrations } = useGetRegistrationStatsQuery({ days: 7 });
  const { data: revenue } = useGetRevenueStatsQuery();
  const { data: activity } = useGetRecentActivityQuery({ size: 10 });

  // User-registrations bar chart — real per-day counts, weekday-labelled.
  const REG_DATA = (registrations ?? []).map((d) => ({
    day: dayLabel(d.date),
    owners: d.owners, seekers: d.seekers, agents: d.agents, agencies: d.agencies,
  }));

  // Revenue-by-plan pie — real plans as a share of realised revenue.
  const revenueTotal = revenue?.total ?? 0;
  const PLANS = (revenue?.byPlan ?? []).map((p, i) => ({
    name: p.planName,
    value: revenueTotal > 0 ? Math.round((p.amount / revenueTotal) * 100) : 0,
    color: PLAN_COLORS[i % PLAN_COLORS.length],
  }));

  const ACTIVITY = (activity ?? []).map((a) => ({
    icon: ACTIVITY_ICON[a.type] ?? "/icons/admin/alert-shield.svg",
    title: a.message,
    time: relativeTime(a.occurredAt),
  }));

  // Live values where /admin/stats provides them; original placeholders otherwise
  // (revenue + subscriber totals aren't exposed by the backend yet).
  const STATS: Stat[] = [
    { label: "Total Users", value: fmt(stats?.totalUsers, "—"), deltaNum: "", deltaPeriod: "", Icon: Users, highlight: true },
    { label: "Total Listings", value: fmt(stats?.totalProperties, "—"), deltaNum: "", deltaPeriod: "", Icon: Home, deltaColor: "#027B2A" },
    { label: "Revenue", value: revenue ? `₦${fmt(revenue.total, "0")}` : "—", deltaNum: "", deltaPeriod: "", Icon: CircleDollarSign, deltaColor: "#027B2A" },
    { label: "Total Subscribers", value: fmt(revenue?.totalSubscribers, "—"), deltaNum: "", deltaPeriod: "", Icon: Users, deltaColor: "#027B2A" },
    { label: "Daily Page Views", value: fmt(stats?.totalViewCount, "—"), deltaNum: "", deltaPeriod: "", Icon: Eye, deltaColor: "#027B2A" },
    { label: "Listings Awaiting Approval", value: fmt(stats?.awaitingApproval, "—"), deltaNum: "", deltaPeriod: "", Icon: Building2, deltaColor: "#CF3801" },
  ];

  const BANNERS = [
    { ...BANNER_STYLES[0], title: `${fmt(stats?.awaitingApproval, "0")} listings awaiting approval` },
    { ...BANNER_STYLES[1], title: `${fmt(stats?.identityKyc?.pending, "0")} identity verifications pending Qore ID manual review` },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Alert banners (stacked, full-width) ── */}
      <div className="flex flex-col gap-4">
        {BANNERS.map((b) => (
          <div key={b.title} className="flex items-center gap-4 rounded-[15px] p-4" style={{ background: b.bg, border: `1px solid ${b.border}` }}>
            <Image src={b.icon} alt="" width={40} height={40} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-medium text-[#121212]">{b.title}</p>
              <p className="text-[12px] text-[#807e7e]">{b.sub}</p>
            </div>
            <Link href={b.href} className="shrink-0 rounded-[20px] px-4 py-1.5 text-[13px] font-medium whitespace-nowrap hover:opacity-90" style={{ background: b.badgeBg, color: b.color }}>
              {b.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* ── Stat cards (2 rows × 3) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-[20px] px-6 py-4 flex flex-col gap-4"
            style={s.highlight ? { background: GRADIENT } : { background: "#fff", border: "1px solid #F6F6F6" }}
          >
            <div className="flex items-center gap-2">
              <s.Icon size={18} strokeWidth={1.7} color={s.highlight ? "#fff" : "#305E82"} />
              <span className="text-[12px] font-medium" style={{ color: s.highlight ? "#fff" : "#807E7E" }}>{s.label}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[32px] font-semibold leading-none" style={{ color: s.highlight ? "#fff" : "#121212" }}>{s.value}</span>
              {s.deltaNum ? (
                <span className="flex items-center gap-1 text-[12px]">
                  <ArrowUp size={14} color={s.highlight ? "#F6F6F6" : s.deltaColor} />
                  <span style={{ color: s.highlight ? "#F6F6F6" : s.deltaColor, fontWeight: 500 }}>{s.deltaNum} </span>
                  <span style={{ color: s.highlight ? "rgba(255,255,255,0.8)" : "#807E7E" }}>{s.deltaPeriod}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[12px]" style={{ color: s.highlight ? "rgba(255,255,255,0.8)" : "#807E7E" }}>&nbsp;</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations */}
        <div className="rounded-[16px] bg-white p-6 flex flex-col gap-6" style={{ border: "1px solid #F6F6F6" }}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold" style={{ color: "#16192C" }}>User Registrations</h3>
              <span className="flex items-center gap-1 text-[14px] text-[#000]">Last 7 Days <ChevronDown size={16} className="text-[#807e7e]" /></span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {SERIES.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-[12px] text-[#807e7e]">
                  <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: s.color }} />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{ width: "100%", height: 259 }}>
            <ResponsiveContainer>
              <BarChart data={REG_DATA} barGap={2} barCategoryGap="22%">
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#807e7e" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#121212" }} width={28} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(48,94,130,0.05)" }} contentStyle={{ borderRadius: 12, border: "1px solid #ededed", fontSize: 12 }} />
                {SERIES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={10} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan Type */}
        <div className="rounded-[16px] bg-white p-6 flex flex-col gap-6" style={{ border: "1px solid #F6F6F6" }}>
          <div className="flex flex-col gap-2">
            <h3 className="text-[16px] font-semibold" style={{ color: "#16192C" }}>Revenue by Plan Type</h3>
            <p className="text-[12px] text-[#807e7e]">Subscription revenue breakdown</p>
          </div>
          <div className="flex items-center gap-10 px-5 flex-1">
            <div style={{ width: 200, height: 200 }} className="shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={PLANS} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={1} stroke="none">
                    {PLANS.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid #ededed", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 flex flex-col gap-3">
              {PLANS.map((p) => (
                <li key={p.name} className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2 text-[#807e7e]">
                    <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-medium text-[#121212]">{p.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-[16px] bg-white p-6 flex flex-col gap-6" style={{ border: "1px solid #F6F6F6" }}>
        <h3 className="text-[16px] font-semibold" style={{ color: "#16192C" }}>Recent Activity</h3>
        {ACTIVITY.length === 0 && (
          <p className="text-[14px] text-[#807e7e]">No recent activity yet.</p>
        )}
        <ul className="flex flex-col gap-4">
          {ACTIVITY.map((a) => (
            <li key={a.title} className="flex items-center gap-3">
              <Image src={a.icon} alt="" width={40} height={40} className="shrink-0" />
              <span className="flex-1 text-[14px] text-[#121212]">{a.title}</span>
              <span className="text-[12px] text-[#807e7e] shrink-0">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
