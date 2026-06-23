"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Home, CircleDollarSign, Eye, Building2, ArrowUp, ChevronDown, type LucideIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const GRADIENT = "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)";

type Stat = {
  label: string; value: string; deltaNum: string; deltaPeriod: string;
  Icon: LucideIcon; highlight?: boolean; deltaColor?: string;
};
const STATS: Stat[] = [
  { label: "Total Users", value: "2,385", deltaNum: "+32%", deltaPeriod: "this week", Icon: Users, highlight: true },
  { label: "Total Listings", value: "847", deltaNum: "+63", deltaPeriod: "this month", Icon: Home, deltaColor: "#027B2A" },
  { label: "Revenue", value: "₦18.4m", deltaNum: "+31%", deltaPeriod: "vs last month", Icon: CircleDollarSign, deltaColor: "#027B2A" },
  { label: "Total Subscribers", value: "1,723", deltaNum: "+12%", deltaPeriod: "this month", Icon: Users, deltaColor: "#027B2A" },
  { label: "Daily Page Views", value: "9,347", deltaNum: "+13%", deltaPeriod: "today", Icon: Eye, deltaColor: "#027B2A" },
  { label: "Listings Awaiting Approval", value: "28", deltaNum: "5%", deltaPeriod: "this week", Icon: Building2, deltaColor: "#CF3801" },
];

const REG_DATA = [
  { day: "Mon", owners: 3200, seekers: 5100, agents: 1800, agencies: 900 },
  { day: "Tue", owners: 4100, seekers: 4400, agents: 2600, agencies: 1200 },
  { day: "Wed", owners: 2800, seekers: 6200, agents: 1500, agencies: 700 },
  { day: "Thur", owners: 5300, seekers: 6900, agents: 3100, agencies: 1600 },
  { day: "Fri", owners: 3700, seekers: 5800, agents: 2200, agencies: 1100 },
  { day: "Sat", owners: 2100, seekers: 3600, agents: 1300, agencies: 600 },
  { day: "Sun", owners: 2900, seekers: 4700, agents: 1900, agencies: 1000 },
];
const SERIES = [
  { key: "owners", name: "Property Owners", color: "#305E82" },
  { key: "seekers", name: "Property Seekers", color: "#75A3C7" },
  { key: "agents", name: "Agents", color: "#FFAE00" },
  { key: "agencies", name: "Agencies", color: "#C9A8F0" },
] as const;

const PLANS = [
  { name: "Agent Pro", value: 28.9, color: "#305E82" },
  { name: "Agency", value: 23.2, color: "#75A3C7" },
  { name: "RBS Owner", value: 21.3, color: "#FFAE00" },
  { name: "Agency Premium", value: 10.8, color: "#8A38F5" },
  { name: "Agent Enterprise", value: 8.6, color: "#027B2A" },
  { name: "Other", value: 7.2, color: "#E3E8EE" },
];

const BANNERS = [
  {
    icon: "/icons/admin/alert-clip.svg", title: "28 listings awaiting approval",
    sub: "4 have been flagged for possible duplicate of existing approved listing. Review immediately.",
    cta: "Review now", href: "/dashboard/awaiting-approval",
    bg: "rgba(234, 101, 26, 0.05)", border: "#EA651A", badgeBg: "rgba(234, 101, 26, 0.1)", color: "#EA651A",
  },
  {
    icon: "/icons/admin/alert-shield.svg", title: "18 identity verifications pending Qore ID manual review",
    sub: "Oldest: 36 hours ago.",
    cta: "Verify Users", href: "/dashboard/verifications",
    bg: "rgba(138, 56, 245, 0.05)", border: "#8A38F5", badgeBg: "rgba(138, 56, 245, 0.1)", color: "#8A38F5",
  },
];

const ACTIVITY = [
  { icon: "/icons/admin/act-users.svg", title: "142 new users registered today", time: "5 min ago" },
  { icon: "/icons/admin/act-listing.svg", title: "4 new listings submitted for approval", time: "15 min ago" },
  { icon: "/icons/admin/act-email.svg", title: "Email blast sent to 2,284 users", time: "10 min ago" },
  { icon: "/icons/admin/act-verify.svg", title: "Verification batch of 8 users approved", time: "1 hour ago" },
  { icon: "/icons/admin/act-uptime.svg", title: "System uptime recorded at 99.9% this week", time: "3 hours ago" },
];

export default function AdminDashboardPage() {
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
              <span className="flex items-center gap-1 text-[12px]">
                <ArrowUp size={14} color={s.highlight ? "#F6F6F6" : s.deltaColor} />
                <span style={{ color: s.highlight ? "#F6F6F6" : s.deltaColor, fontWeight: 500 }}>{s.deltaNum} </span>
                <span style={{ color: s.highlight ? "rgba(255,255,255,0.8)" : "#807E7E" }}>{s.deltaPeriod}</span>
              </span>
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
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#121212" }} width={28} domain={[0, 7000]} ticks={[1000, 2000, 3000, 4000, 5000, 6000, 7000]} tickFormatter={(v) => `${v / 1000}k`} />
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
