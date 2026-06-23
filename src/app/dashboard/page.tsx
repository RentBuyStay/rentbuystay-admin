"use client";

import Link from "next/link";
import {
  Users,
  Building2,
  Wallet,
  CalendarCheck,
  Eye,
  ClipboardCheck,
  ShieldCheck,
  Mail,
  Activity,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GRADIENT = "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)";

/* ---- placeholder figures (swap for admin analytics API once exposed) ---- */
type Stat = { label: string; value: string; delta?: string; Icon: LucideIcon; highlight?: boolean };
const STATS: Stat[] = [
  { label: "Total Users", value: "2,385", delta: "↑ 12% this week", Icon: Users, highlight: true },
  { label: "Total Listings", value: "847", Icon: Building2 },
  { label: "Revenue", value: "₦18.4m", Icon: Wallet },
  { label: "Total Inspections", value: "1,723", Icon: CalendarCheck },
  { label: "Daily Page Views", value: "9,347", Icon: Eye },
  { label: "Listings Awaiting Approval", value: "28", Icon: ClipboardCheck },
];

const REG_DATA = [
  { day: "Mon", owners: 18, seekers: 30, agents: 8 },
  { day: "Tue", owners: 22, seekers: 26, agents: 11 },
  { day: "Wed", owners: 15, seekers: 34, agents: 7 },
  { day: "Thu", owners: 28, seekers: 41, agents: 13 },
  { day: "Fri", owners: 20, seekers: 38, agents: 9 },
  { day: "Sat", owners: 12, seekers: 22, agents: 6 },
  { day: "Sun", owners: 16, seekers: 28, agents: 10 },
];

const PLAN_DATA = [
  { name: "Agent Pro", value: 52, color: "#305E82" },
  { name: "Premium", value: 21, color: "#FFAE00" },
  { name: "Basic", value: 15, color: "#75A3C7" },
  { name: "Free", value: 12, color: "#E3E8EE" },
];

type ActivityItem = { Icon: LucideIcon; text: string; time: string; tint: string };
const ACTIVITY: ActivityItem[] = [
  { Icon: Users, text: "142 new users registered today", time: "2h ago", tint: "#EAF2FA" },
  { Icon: Building2, text: "4 new listings submitted for approval", time: "5h ago", tint: "#FFF4E5" },
  { Icon: Mail, text: "Email blast sent to 2,384 users", time: "8h ago", tint: "#F3F0FF" },
  { Icon: ShieldCheck, text: "Verification batch of 8 users approved", time: "1d ago", tint: "#E8F7EE" },
  { Icon: Activity, text: "System uptime restored at 99.9% this week", time: "2d ago", tint: "#FDECEC" },
];

function Banner({
  tint,
  iconBg,
  Icon,
  title,
  subtitle,
  cta,
  href,
  ctaColor,
}: {
  tint: string;
  iconBg: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  ctaColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[16px] p-4" style={{ background: tint }}>
      <div className="flex items-center justify-center rounded-[12px] shrink-0" style={{ width: 44, height: 44, background: iconBg }}>
        <Icon size={22} strokeWidth={1.7} color="#fff" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#121212]">{title}</p>
        <p className="text-[12px] text-[#807e7e] truncate">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-[8px] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
        style={{ background: ctaColor }}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Alert banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Banner
          tint="#FFF7EC"
          iconBg="#FFAE00"
          Icon={ClipboardCheck}
          title="28 listings awaiting approval"
          subtitle="New listings have been submitted and are awaiting approval. Review them now."
          cta="Review now"
          href="/dashboard/awaiting-approval"
          ctaColor="#FFAE00"
        />
        <Banner
          tint="#F4F1FF"
          iconBg="#7C5CFC"
          Icon={ShieldCheck}
          title="16 identity verifications pending Qore ID manual review"
          subtitle="These users need a manual identity review to be verified."
          cta="Verify now"
          href="/dashboard/verifications"
          ctaColor="#7C5CFC"
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] p-5 flex flex-col gap-3"
            style={
              s.highlight
                ? { background: GRADIENT, color: "#fff" }
                : { background: "#fff", border: "1px solid #ededed" }
            }
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: s.highlight ? "rgba(255,255,255,0.85)" : "#807e7e" }}>
                {s.label}
              </span>
              <s.Icon size={20} strokeWidth={1.6} color={s.highlight ? "#fff" : "#305e82"} />
            </div>
            <span className="text-[28px] font-semibold leading-none" style={{ color: s.highlight ? "#fff" : "#121212" }}>
              {s.value}
            </span>
            {s.delta && (
              <span className="text-[12px]" style={{ color: s.highlight ? "rgba(255,255,255,0.9)" : "#14ae5c" }}>
                {s.delta}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        {/* User Registrations */}
        <div className="rounded-[16px] bg-white p-5" style={{ border: "1px solid #ededed" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-semibold text-[#121212]">User Registrations</h3>
            <span className="text-[12px] text-[#807e7e] border border-[#ededed] rounded-[8px] px-3 py-1.5">Last 7 Days</span>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={REG_DATA} barGap={4} barCategoryGap="25%">
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#807e7e" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#807e7e" }} width={28} />
                <Tooltip cursor={{ fill: "rgba(48,94,130,0.05)" }} contentStyle={{ borderRadius: 12, border: "1px solid #ededed", fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="owners" name="Property Owners" fill="#305E82" radius={[4, 4, 0, 0]} />
                <Bar dataKey="seekers" name="Property Seekers" fill="#75A3C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="agents" name="Agents" fill="#FFAE00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan Type */}
        <div className="rounded-[16px] bg-white p-5" style={{ border: "1px solid #ededed" }}>
          <h3 className="text-[16px] font-semibold text-[#121212] mb-4">Revenue by Plan Type</h3>
          <div className="flex items-center gap-4">
            <div style={{ width: 160, height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={PLAN_DATA} dataKey="value" innerRadius={48} outerRadius={76} paddingAngle={2} stroke="none">
                    {PLAN_DATA.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, border: "1px solid #ededed", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 flex flex-col gap-3">
              {PLAN_DATA.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2 text-[#121212]">
                    <span className="inline-block rounded-full" style={{ width: 10, height: 10, background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-medium text-[#807e7e]">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-[16px] bg-white p-5" style={{ border: "1px solid #ededed" }}>
        <h3 className="text-[16px] font-semibold text-[#121212] mb-4">Recent Activity</h3>
        <ul className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid #f4f4f4" : "none" }}
            >
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 36, height: 36, background: a.tint }}>
                <a.Icon size={18} strokeWidth={1.7} color="#305e82" />
              </span>
              <span className="flex-1 text-[14px] text-[#121212]">{a.text}</span>
              <span className="text-[12px] text-[#807e7e] shrink-0">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
