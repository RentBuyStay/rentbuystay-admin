"use client";

import Image from "next/image";
import { useState } from "react";
import NigeriaMap from "@/components/NigeriaMap";

const TABS = ["Platform Overview", "User Analytics", "Listing Analytics", "Geographic"] as const;
type Tab = (typeof TABS)[number];

/* ── palette ─────────────────────────────────────────────── */
const CYAN = "linear-gradient(180deg, #68DBF2 0%, #509CF5 100%)";
const BLUE = "linear-gradient(180deg, #75A3C7 0%, #305E82 100%)";
const GOLD = "linear-gradient(180deg, #FFEF5E 0%, #F7936F 100%)";
const CARD_GRADIENT = "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)";

const Y_AXIS = ["5k", "4k", "3k", "2k", "1k", "500", "200"];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ── shared styles ───────────────────────────────────────── */
const cardStyle: React.CSSProperties = { padding: 24, borderRadius: 16, gap: 24, border: "1px solid #F6F6F6" };
const th: React.CSSProperties = { height: 44, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6" };
const num: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: "#121212" };

export default function Page() {
  const [tab, setTab] = useState<Tab>("Platform Overview");
  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
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

      {tab === "Platform Overview" && <PlatformOverview />}
      {tab === "User Analytics" && <UserAnalytics />}
      {tab === "Listing Analytics" && <ListingAnalytics />}
      {tab === "Geographic" && <GeographicTab />}
    </div>
  );
}

/* ════════════ shared building blocks ════════════ */

type Stat = { label: string; value: string; delta: string; gradient?: boolean };
function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col" style={{ padding: "16px 24px", borderRadius: 20, gap: 16, border: "1px solid #F6F6F6", background: s.gradient ? CARD_GRADIENT : "#FFFFFF" }}>
          <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "24px", color: s.gradient ? "#FFFFFF" : "#807E7E" }}>{s.label}</span>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: s.gradient ? "#FFFFFF" : "#121212" }}>{s.value}</span>
            <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "24px", color: s.gradient ? "#FFFFFF" : "#027B2A" }}>{s.delta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dropdown({ label }: { label: string }) {
  return (
    <button type="button" className="flex items-center gap-2 shrink-0">
      <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "23px", color: "#000000" }}>{label}</span>
      <Image src="/icons/admin/analytics/chart-arrow-down.svg" alt="" width={20} height={20} />
    </button>
  );
}

function ChartHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-baseline gap-2 min-w-0">
        <h3 className="truncate" style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>{title}</h3>
        {subtitle && <span className="shrink-0" style={{ fontSize: 11, fontWeight: 400, color: "#807E7E" }}>{subtitle}</span>}
      </div>
      {right}
    </div>
  );
}

function Bar({ h, grad, w = 16, plotH }: { h: number; grad: string; w?: number; plotH: number }) {
  return (
    <div className="relative rounded-full" style={{ width: w, height: plotH, background: "#F6F6F6" }}>
      <div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ height: h, background: grad }} />
    </div>
  );
}

type Series = { heights: number[]; grad: string };
function ChartPlot({ labels, series, plotH = 237, barW = 16 }: { labels: string[]; series: Series[]; plotH?: number; barW?: number }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-between shrink-0" style={{ height: plotH }}>
        {Y_AXIS.map((y) => (
          <span key={y} style={{ fontSize: 10, fontWeight: 500, lineHeight: "10px", letterSpacing: "-0.005em", color: "#121212" }}>{y}</span>
        ))}
      </div>
      <div className="flex-1 flex justify-between" style={{ gap: 12 }}>
        {labels.map((d, i) => (
          <div key={d + i} className="flex flex-col items-center" style={{ gap: 12 }}>
            <div className="flex items-end" style={{ height: plotH, gap: 6 }}>
              {series.map((s, si) => <Bar key={si} h={s.heights[i]} grad={s.grad} w={barW} plotH={plotH} />)}
            </div>
            <span style={{ fontSize: 10, fontWeight: 400, lineHeight: "10px", letterSpacing: "-0.005em", color: "#807E7E" }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarRow({ label, color, pct, value, barPct, badgeW = 64 }: { label: string; color: string; pct: string; value: string; barPct: number; badgeW?: number }) {
  return (
    <div className="flex items-center" style={{ gap: 16 }}>
      <span className="inline-flex items-center justify-center rounded-[16px] shrink-0" style={{ width: badgeW, background: hexA(color, 0.08), color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 0" }}>{label}</span>
      <div className="relative flex-1 rounded-full" style={{ height: 6, background: "#EDF2F7" }}>
        <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${barPct}%`, background: color }} />
      </div>
      <span className="shrink-0 text-right" style={{ width: 26, fontSize: 11, fontWeight: 400, color: "#121212" }}>{pct}</span>
      <span className="shrink-0 text-right" style={{ width: 32, fontSize: 11, fontWeight: 400, color: "#807E7E" }}>{value}</span>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(color, 0.08), color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{label}</span>;
}

function LegendDot({ city, color }: { city: string; color: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: color }} />
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", color: "#121212" }}>{city}</span>
    </span>
  );
}

function Stack2({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 2 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{a}</span>
      <span style={{ fontSize: 12, color: "#807E7E" }}>{b}</span>
    </div>
  );
}

function TableCard({ title, right, head, minWidth = 760, children }: { title: string; right?: React.ReactNode; head: string[]; minWidth?: number; children: React.ReactNode }) {
  return (
    <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
      <div className="flex items-center justify-between gap-4 p-6">
        <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>{title}</h2>
        {right}
      </div>
      <div className="mx-6 mb-6 overflow-x-auto">
        <table className="w-full" style={{ minWidth, borderCollapse: "collapse" }}>
          <thead>
            <tr>{head.map((h) => <th key={h} className="text-left" style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}

const ROLE_COLOR: Record<string, string> = { Owner: "#DC8E1D", Agent: "#305E82", Agency: "#8A38F5", Seeker: "#1F7EEE" };
const TYPE_COLOR: Record<string, string> = { "For Rent": "#509CF5", "For Sale": "#DC8E1D", Shortlet: "#8A38F5" };
const STATUS_COLOR: Record<string, string> = { Active: "#009D35", Pending: "#DC8E1D", Expired: "#E30045" };

/* ════════════ Platform Overview ════════════ */

const PLATFORM_STATS: Stat[] = [
  { label: "Total Sessions (30 Days)", value: "284k", delta: "+22%", gradient: true },
  { label: "Average Session (Min)", value: "8.4", delta: "+1.3min" },
  { label: "Bounce Rate", value: "34%", delta: "-5% this week" },
  { label: "Conversion Rate", value: "6.8%", delta: "+6.4%" },
];
const DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
const GEO_LEGEND = [
  { city: "Lagos", state: "Lagos", color: "#FF8800" },
  { city: "Abuja", state: "FCT", color: "#37B26E" },
  { city: "Port-Harcourt", state: "Rivers", color: "#8A38F5" },
  { city: "Ibadan", state: "Oyo", color: "#578AF0" },
  { city: "Ogun", state: "Ogun", color: "#44CFE4" },
  { city: "Kaduna", state: "Kaduna", color: "#EE46BC" },
];
const GEO_FILLS = Object.fromEntries(GEO_LEGEND.map((l) => [l.state, l.color]));
const GEO_ROWS = [
  { city: "Lagos", users: "1,842", listings: "612", leads: "4,820", revenue: "₦14.2M", growth: "+28%" },
  { city: "Abuja", users: "384", listings: "142", leads: "2,107", revenue: "₦7.4M", growth: "+19%" },
  { city: "Kaduna", users: "312", listings: "128", leads: "1,540", revenue: "₦6.2M", growth: "+21%" },
  { city: "Port-Harcourt", users: "209", listings: "119", leads: "980", revenue: "₦5.6M", growth: "+34%" },
  { city: "Ibadan", users: "124", listings: "83", leads: "320", revenue: "₦2.8M", growth: "+12%" },
  { city: "Ogun", users: "85", listings: "58", leads: "140", revenue: "₦1.7M", growth: "+8%" },
];

function GeoMapCard({ title, subtitle, legend, fills }: { title: string; subtitle: string; legend: { city: string; color: string }[]; fills: Record<string, string> }) {
  return (
    <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
      <div className="flex items-start justify-between gap-4 p-6">
        <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>{title}</h2>
        <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>{subtitle}</span>
      </div>
      <div className="mx-6 mb-6 relative overflow-hidden h-80 sm:h-96" style={{ background: "rgba(246,246,246,0.5)", borderRadius: 15 }}>
        <NigeriaMap fills={fills} />
        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-10">
          <div className="flex items-center gap-4">{legend.slice(0, 3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
          <div className="flex items-center gap-4">{legend.slice(3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
        </div>
      </div>
    </section>
  );
}

function PlatformOverview() {
  return (
    <>
      <StatCards stats={PLATFORM_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <div className="flex flex-col gap-4">
            <ChartHeader title="New Users vs Active Users" right={<Dropdown label="Last 7 Days" />} />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: CYAN }} /><span style={{ fontSize: 11, color: "#807E7E" }}>New Users</span></span>
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: BLUE }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Active Users</span></span>
            </div>
          </div>
          <ChartPlot labels={DAYS} series={[{ heights: [119, 79, 119, 86, 33, 76, 74], grad: CYAN }, { heights: [94, 149, 119, 177, 59, 88, 121], grad: BLUE }]} />
        </div>
        <div className="flex flex-col bg-white" style={cardStyle}>
          <div className="flex flex-col gap-4">
            <ChartHeader title="Listings Posted vs Leads Generated" right={<Dropdown label="Last 7 Days" />} />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: GOLD }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Listings Posted</span></span>
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: BLUE }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Leads Generated</span></span>
            </div>
          </div>
          <ChartPlot labels={DAYS} series={[{ heights: [143, 79, 148, 86, 196, 76, 74], grad: GOLD }, { heights: [62, 86, 95, 36, 59, 88, 121], grad: BLUE }]} />
        </div>
      </div>
      {/* Geographic distribution — map + table in one card */}
      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <div className="flex items-start justify-between gap-4 p-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Geographic Distribution</h2>
          <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>Top cities by listing activity</span>
        </div>
        <div className="mx-6 relative overflow-hidden h-80 sm:h-96" style={{ background: "rgba(246,246,246,0.5)", borderRadius: 15 }}>
          <NigeriaMap fills={GEO_FILLS} />
          <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-10">
            <div className="flex items-center gap-4">{GEO_LEGEND.slice(0, 3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
            <div className="flex items-center gap-4">{GEO_LEGEND.slice(3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
          </div>
        </div>
        <div className="mx-6 mt-6 mb-6 overflow-x-auto">
          <table className="w-full" style={{ minWidth: 760, borderCollapse: "collapse" }}>
            <thead>
              <tr>{["City", "Users", "Listings", "Leads", "Revenue", "Growth"].map((h) => <th key={h} className="text-left" style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {GEO_ROWS.map((r) => (
                <tr key={r.city}>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{r.city}</span></td>
                  <td style={cell}><span style={num}>{r.users}</span></td>
                  <td style={cell}><span style={num}>{r.listings}</span></td>
                  <td style={cell}><span style={num}>{r.leads}</span></td>
                  <td style={cell}><span style={num}>{r.revenue}</span></td>
                  <td style={cell}><Pill label={r.growth} color="#009D35" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ════════════ User Analytics ════════════ */

const USER_STATS: Stat[] = [
  { label: "New This Month", value: "318", delta: "+28%", gradient: true },
  { label: "Verified Users", value: "1,284", delta: "67% of total" },
  { label: "Churn Rate (30 Days)", value: "1.8%", delta: "Improved 0.3%" },
  { label: "Avg. Account Age", value: "8mo", delta: "+0.7 monthly" },
];
const REG_BY_ROLE = [
  { role: "Seeker", pct: "53%", value: "1,284", barPct: 51 },
  { role: "Agent", pct: "25%", value: "612", barPct: 25 },
  { role: "Owner", pct: "16%", value: "384", barPct: 19 },
  { role: "Agency", pct: "16%", value: "136", barPct: 8 },
];
const HEAT_BG = ["#F6F6F6", "#F6F6F6", "#F6F6F6", "#F6F6F6", "#F6F6F6", "#FFFDE7", "#FFFDE7", "#FFF2CF", "#EA7917", "#EA7917", "#EA7917", "#EA7917", "#EA7917", "#EF9B51", "#EA7917", "#EA7917", "#EA7917", "#EA7917", "#EA7917", "#EF9B51", "#FFF2CF", "#FFFDE7", "#FFFDE7", "#FFFDE7"];
const TOP_USERS = [
  { name: "Tunde Adeyemi", email: "tundeade@gmail.com", role: "Agent", listings: "8", views: "2,616", leads: "16", since: "15 May 2025" },
  { name: "Urban Nest Realty", email: "contact@urbannestrealty.com", role: "Agency", listings: "4", views: "776", leads: "24", since: "15 May 2025" },
  { name: "Chinedu Nwosu", email: "chinedu.nwosu@example.com", role: "Agent", listings: "6", views: "1,812", leads: "36", since: "15 May 2025" },
  { name: "Bola Adebayo", email: "bola.adebayo@example.com", role: "Agent", listings: "11", views: "3,492", leads: "24", since: "15 May 2025" },
  { name: "Kemi Oladipo", email: "kemi.oladipo@example.com", role: "Owner", listings: "4", views: "1,052", leads: "12", since: "15 Apr 2025" },
  { name: "Emeka Obi", email: "emeka.obi@example.com", role: "Agent", listings: "7", views: "2,646", leads: "42", since: "17 Mar 2026" },
  { name: "Prime Properties Nigeria", email: "primeproperties@gmail.com", role: "Agency", listings: "3", views: "531", leads: "9", since: "28 Feb 2026" },
  { name: "Yewande Balogun", email: "yewande.balogun@example.com", role: "Owner", listings: "2", views: "602", leads: "6", since: "13 Feb 2026" },
];

function UserAnalytics() {
  return (
    <>
      <StatCards stats={USER_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="User Registrations by Role" right={<Dropdown label="Last 30 Days" />} />
          <div className="flex flex-col" style={{ gap: 24 }}>
            {REG_BY_ROLE.map((r) => <HBarRow key={r.role} label={r.role} color={ROLE_COLOR[r.role]} pct={r.pct} value={r.value} barPct={r.barPct} />)}
          </div>
        </div>
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="User Activity Heatmap" subtitle="Peak usage hours (WAT)" />
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {HEAT_BG.map((bg, i) => {
              const white = bg === "#EA7917" || bg === "#EF9B51";
              return (
                <div key={i} className="flex items-center justify-center shrink-0" style={{ width: 46, height: 38, borderRadius: 8, background: bg }}>
                  <span style={{ fontSize: 12, fontWeight: 400, color: white ? "#FFFFFF" : "#807E7E" }}>{i}h</span>
                </div>
              );
            })}
          </div>
          <span style={{ fontSize: 11, fontWeight: 400, color: "#807E7E" }}>Peak: 9AM–11AM and 4PM–6PM (WAT)</span>
        </div>
      </div>
      <TableCard title="Top Performing Users" head={["User", "Role", "Listings", "Total Views", "Leads", "Member Since"]} minWidth={840}>
        {TOP_USERS.map((u) => (
          <tr key={u.email}>
            <td style={cell}><Stack2 a={u.name} b={u.email} /></td>
            <td style={cell}><Pill label={u.role} color={ROLE_COLOR[u.role]} /></td>
            <td style={cell}><span style={num}>{u.listings}</span></td>
            <td style={cell}><span style={num}>{u.views}</span></td>
            <td style={cell}><span style={num}>{u.leads}</span></td>
            <td style={cell}><span style={num}>{u.since}</span></td>
          </tr>
        ))}
      </TableCard>
    </>
  );
}

/* ════════════ Listing Analytics ════════════ */

const LISTING_STATS: Stat[] = [
  { label: "Total Active", value: "847", delta: "+63 this month", gradient: true },
  { label: "Avg. Views/Listing", value: "284", delta: "+38 this month" },
  { label: "Avg. Inquiries/Listing", value: "6.4", delta: "+1.2" },
  { label: "Avg. Time to Rent/Sell", value: "18d", delta: "-3d improved" },
];
const LISTING_TYPES = [
  { label: "For Rent", pct: "57%", value: "482", barPct: 51 },
  { label: "For Sale", pct: "29%", value: "824", barPct: 25 },
  { label: "Shortlet", pct: "14%", value: "117", barPct: 8 },
];
const LISTING_TYPE_BARCOLOR: Record<string, string> = { "For Rent": "#1F7EEE", "For Sale": "#305E82", Shortlet: "#8A38F5" };
const PROPERTY_TYPES = [
  { label: "Flats/Apartments", value: "412" },
  { label: "House", value: "184" },
  { label: "Commercial Property", value: "112" },
  { label: "Co-working Space", value: "88" },
  { label: "Land", value: "34" },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NEW_LISTINGS = [33, 74, 50, 117, 102, 63, 157, 86, 102, 0, 0, 0];
const TOP_LISTINGS = [
  { id: "RBS-L-004821", title: "3-Bedroom Flat, Lekki Phase 1", loc: "Lekki Phase 1, Lagos", type: "For Rent", views: "2,616", inq: "16", conv: "1.9%", status: "Active" },
  { id: "RBS-L-004822", title: "2-Bedroom Apartment, Victoria Island", loc: "Victoria Island, Lagos", type: "Shortlet", views: "776", inq: "24", conv: "1.7%", status: "Active" },
  { id: "RBS-L-004823", title: "4-Bedroom Duplex, Ikoyi", loc: "Ikoyi, Lagos", type: "For Rent", views: "1,812", inq: "36", conv: "3.5%", status: "Active" },
  { id: "RBS-L-004824", title: "Office Space, Ikeja GRA", loc: "Ikeja GRA, Lagos", type: "For Rent", views: "3,492", inq: "24", conv: "1.6%", status: "Active" },
  { id: "RBS-L-004826", title: "2-Bedroom Flat, Lekki Phase 1", loc: "Lekki Phase 1, Lagos", type: "For Sale", views: "1,052", inq: "12", conv: "0.0%", status: "Pending" },
  { id: "RBS-L-004827", title: "2-Bedroom Flat, Lekki Phase 1", loc: "Lekki Phase 1, Lagos", type: "For Rent", views: "2,646", inq: "42", conv: "2.9%", status: "Active" },
  { id: "RBS-L-004828", title: "2-Bedroom Flat, Lekki Phase 1", loc: "Lekki Phase 1, Lagos", type: "Shortlet", views: "531", inq: "9", conv: "1.1%", status: "Expired" },
  { id: "RBS-L-004829", title: "2-Bedroom Flat, Lekki Phase 1", loc: "Lekki Phase 1, Lagos", type: "For Sale", views: "602", inq: "6", conv: "1.5%", status: "Active" },
];

function ListingAnalytics() {
  return (
    <>
      <StatCards stats={LISTING_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="User Registrations by Role" right={<Dropdown label="Last 30 Days" />} />
          <div className="flex flex-col" style={{ gap: 24 }}>
            {LISTING_TYPES.map((r) => <HBarRow key={r.label} label={r.label} color={LISTING_TYPE_BARCOLOR[r.label]} pct={r.pct} value={r.value} barPct={r.barPct} badgeW={72} />)}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Listings by Property Types</h3>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {PROPERTY_TYPES.map((p) => (
              <div key={p.label} className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: "#807E7E" }}>{p.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#121212" }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="New Listings Per Month" right={<Dropdown label="Last 12 months" />} />
          <div className="flex items-center" style={{ gap: 40 }}>
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#305E82" }}>92%</span>
              <span style={{ fontSize: 10, color: "#807E7E" }}>Approval Rate</span>
            </div>
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#305E82" }}>4.2h</span>
              <span style={{ fontSize: 10, color: "#807E7E" }}>Avg. Review Time</span>
            </div>
          </div>
          <ChartPlot labels={MONTHS} series={[{ heights: NEW_LISTINGS, grad: BLUE }]} plotH={237} barW={16} />
        </div>
      </div>
      <TableCard title="Top Performing Listings" head={["Property ID", "Property", "Type", "Total Views", "Inquiries", "Conversion", "Status"]} minWidth={980}>
        {TOP_LISTINGS.map((l) => (
          <tr key={l.id}>
            <td style={cell}><span style={num}>{l.id}</span></td>
            <td style={cell}><Stack2 a={l.title} b={l.loc} /></td>
            <td style={cell}><Pill label={l.type} color={TYPE_COLOR[l.type]} /></td>
            <td style={cell}><span style={num}>{l.views}</span></td>
            <td style={cell}><span style={num}>{l.inq}</span></td>
            <td style={cell}><span style={num}>{l.conv}</span></td>
            <td style={cell}><Pill label={l.status} color={STATUS_COLOR[l.status]} /></td>
          </tr>
        ))}
      </TableCard>
    </>
  );
}

/* ════════════ Geographic ════════════ */

const GEO_STATS: Stat[] = [
  { label: "Top City", value: "Lagos", delta: "76% of activity", gradient: true },
  { label: "Active States", value: "12", delta: "+3 this year" },
  { label: "Fastest Growing", value: "PH", delta: "+34% MoM" },
  { label: "Rural Listings", value: "4.2%", delta: "+1.1%" },
];
const GEO_TAB_LEGEND = GEO_LEGEND.slice(0, 5);
const GEO_TAB_FILLS = Object.fromEntries(GEO_TAB_LEGEND.map((l) => [l.state, l.color]));
const STATE_ROWS = [
  { city: "Lagos", users: "1,842", listings: "612", leads: "4,820", revenue: "₦14.2M", price: "₦14.2M", growth: "+28%" },
  { city: "Abuja", users: "384", listings: "142", leads: "2,107", revenue: "₦7.4M", price: "₦7.4M", growth: "+19%" },
  { city: "Port-Harcourt", users: "209", listings: "119", leads: "980", revenue: "₦5.6M", price: "₦5.6M", growth: "+34%" },
  { city: "Ibadan", users: "124", listings: "83", leads: "320", revenue: "₦2.8M", price: "₦2.8M", growth: "+12%" },
  { city: "Kano", users: "85", listings: "58", leads: "140", revenue: "₦1.7M", price: "₦1.7M", growth: "+8%" },
  { city: "Ogun", users: "58", listings: "27", leads: "84", revenue: "₦908K", price: "₦908K", growth: "+12%" },
  { city: "Enugu", users: "44", listings: "12", leads: "58", revenue: "₦673K", price: "₦673K", growth: "+22%" },
  { city: "Benin City", users: "32", listings: "8", leads: "42", revenue: "₦481K", price: "₦481K", growth: "+18%" },
];

function GeographicTab() {
  return (
    <>
      <StatCards stats={GEO_STATS} />
      <GeoMapCard title="Nigeria Market Distribution" subtitle="Click a division to drill down" legend={GEO_TAB_LEGEND} fills={GEO_TAB_FILLS} />
      <TableCard
        title="State-by-State Breakdown"
        head={["City", "Users", "Listings", "Leads", "Revenue", "Avg. Price (Rent)", "MoM Growth"]}
        minWidth={980}
        right={
          <button type="button" className="flex items-center gap-2 hover:opacity-80">
            <Image src="/icons/admin/analytics/export.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>Export</span>
          </button>
        }
      >
        {STATE_ROWS.map((r) => (
          <tr key={r.city}>
            <td style={cell}><span style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{r.city}</span></td>
            <td style={cell}><span style={num}>{r.users}</span></td>
            <td style={cell}><span style={num}>{r.listings}</span></td>
            <td style={cell}><span style={num}>{r.leads}</span></td>
            <td style={cell}><span style={num}>{r.revenue}</span></td>
            <td style={cell}><span style={num}>{r.price}</span></td>
            <td style={cell}><Pill label={r.growth} color="#009D35" /></td>
          </tr>
        ))}
      </TableCard>
    </>
  );
}
