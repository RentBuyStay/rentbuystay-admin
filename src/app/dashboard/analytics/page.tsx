"use client";

import Image from "next/image";
import { useState } from "react";
import NigeriaMap from "@/components/NigeriaMap";
import { useMemo } from "react";
import {
  useGetPlatformStatsQuery,
  useGetRegistrationStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminPropertiesQuery,
} from "@/services/adminApi";
import { useGetAgentsQuery } from "@/services/agentApi";

const TABS = ["Platform Overview", "User Analytics", "Listing Analytics", "Geographic"] as const;
type Tab = (typeof TABS)[number];

/* ── palette ─────────────────────────────────────────────── */
const CYAN = "linear-gradient(180deg, #68DBF2 0%, #509CF5 100%)";
const BLUE = "linear-gradient(180deg, #75A3C7 0%, #305E82 100%)";
const GOLD = "linear-gradient(180deg, #FFEF5E 0%, #F7936F 100%)";
const CARD_GRADIENT = "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)";


function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/* ── shared styles ───────────────────────────────────────── */
const cardStyle: React.CSSProperties = { padding: 24, borderRadius: 16, gap: 24, border: "1px solid #F6F6F6" };
const th: React.CSSProperties = { height: 44, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6" };
const num: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: "#121212" };

const GEO_PALETTE = ["#FF8800", "#37B26E", "#8A38F5", "#578AF0", "#44CFE4", "#EE46BC"];

type PageData = {
  stats?: import("@/services/adminApi").PlatformStats;
  regByRole: { role: string; pct: string; value: string; barPct: number }[];
  newThisMonth: number;
  verified: number;
  verifiedPct: number;
  avgAccountAge: string;
  topUsers: { name: string; email: string; role: string; listings: string; views: string; leads: string; since: string }[];
  listingTypes: { label: string; pct: string; value: string; barPct: number }[];
  propertyTypes: { label: string; value: string }[];
  newListingsByMonth: number[];
  approvalRate: string;
  topListings: { id: string; title: string; loc: string; type: string; views: string; inq: string; conv: string; status: string }[];
  avgViews: string;
  geoLegend: { city: string; state: string; color: string }[];
  geoFills: Record<string, string>;
  geoRows: { city: string; users: string; listings: string; leads: string; revenue: string; price: string; growth: string }[];
  topState?: { state: string; count: number };
  topStatePct: string;
  activeStates: number;
  day7Labels: string[];
  newUsersByDay: number[];
  listingsByDay: number[];
};

export default function Page() {
  const [tab, setTab] = useState<Tab>("Platform Overview");
  const [poRange, setPoRange] = useState<number>(7);

  const { data: stats } = useGetPlatformStatsQuery();
  const { data: registrations } = useGetRegistrationStatsQuery({ days: poRange });
  const { data: usersPage } = useGetAdminUsersQuery({ page: 0, size: 200 });
  const { data: propsPage } = useGetAdminPropertiesQuery({ page: 0, size: 100 });
  const { data: agentsPage } = useGetAgentsQuery({ size: 200 });

  const data = useMemo(() => {
    const users = usersPage?.content ?? [];
    const props = propsPage?.content ?? [];
    const agents = agentsPage?.content ?? [];

    // Users by role (real percentages from /admin/stats).
    const byType = stats?.usersByType;
    const roleCounts = [
      { role: "Seeker", n: byType?.seekers ?? 0 },
      { role: "Agent", n: byType?.agents ?? 0 },
      { role: "Owner", n: byType?.owners ?? 0 },
      { role: "Agency", n: byType?.agencies ?? 0 },
    ];
    const roleTotal = Math.max(1, roleCounts.reduce((a, r) => a + r.n, 0));
    const regByRole = roleCounts.map((r) => ({
      role: r.role,
      pct: `${Math.round((r.n / roleTotal) * 100)}%`,
      value: r.n.toLocaleString("en-NG"),
      barPct: Math.round((r.n / roleTotal) * 100),
    }));

    const now = new Date();
    const newThisMonth = users.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const verified = (stats?.identityKyc?.verified ?? 0) + (stats?.businessKyc?.verified ?? 0);
    const verifiedPct = stats?.totalUsers ? Math.round((verified / stats.totalUsers) * 100) : 0;

    // Average age of user accounts (from createdAt on the loaded users).
    const ages = users
      .map((u) => now.getTime() - new Date(u.createdAt).getTime())
      .filter((ms) => Number.isFinite(ms) && ms > 0);
    const avgDays = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length / 86_400_000) : 0;
    const avgAccountAge = !ages.length
      ? "—"
      : avgDays >= 365
        ? `${(avgDays / 365).toFixed(1)} yrs`
        : avgDays >= 30
          ? `${Math.round(avgDays / 30)} mo`
          : `${avgDays} days`;

    const fmtSince = (iso?: string) => {
      if (!iso) return "—";
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
    };
    const topUsers = [...agents]
      .sort((a, b) => (b.listingCount ?? 0) - (a.listingCount ?? 0))
      .slice(0, 8)
      .map((a) => ({
        name: [a.firstName, a.lastName].filter(Boolean).join(" ") || "—",
        email: a.email ?? "—",
        role: "Agent",
        listings: String(a.listingCount ?? 0),
        views: "—",
        leads: "—",
        since: fmtSince(a.createdAt),
      }));

    // Listing type distribution from the platform properties.
    const typeCount = { RENT: 0, BUY: 0, SHORTLET: 0 } as Record<string, number>;
    props.forEach((pr) => { typeCount[pr.listingType] = (typeCount[pr.listingType] ?? 0) + 1; });
    const typeTotal = Math.max(1, props.length);
    const listingTypes = [
      { label: "For Rent", n: typeCount.RENT },
      { label: "For Sale", n: typeCount.BUY },
      { label: "Shortlet", n: typeCount.SHORTLET },
    ].map((t) => ({
      label: t.label,
      pct: `${Math.round((t.n / typeTotal) * 100)}%`,
      value: t.n.toLocaleString("en-NG"),
      barPct: Math.round((t.n / typeTotal) * 100),
    }));

    const propTypeCounts = new Map<string, number>();
    props.forEach((pr) => {
      const k = pr.propertyTypeName ?? "Other";
      propTypeCounts.set(k, (propTypeCounts.get(k) ?? 0) + 1);
    });
    const propertyTypes = [...propTypeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, n]) => ({ label, value: String(n) }));

    const monthly = Array(12).fill(0) as number[];
    props.forEach((pr) => {
      const d = new Date(pr.createdAt ?? "");
      if (!Number.isNaN(d.getTime()) && d.getFullYear() === now.getFullYear()) monthly[d.getMonth()] += 1;
    });

    const approvedish = (stats?.activeListings ?? 0);
    const rejectedish = (stats?.rejectedListings ?? 0);
    const approvalRate = approvedish + rejectedish > 0 ? `${Math.round((approvedish / (approvedish + rejectedish)) * 100)}%` : "—";

    const topListings = [...props]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 8)
      .map((pr) => ({
        id: pr.referenceCode,
        title: pr.title,
        loc: [pr.city, pr.state].filter(Boolean).join(", ") || "—",
        type: pr.listingType === "BUY" ? "For Sale" : pr.listingType === "SHORTLET" ? "Shortlet" : "For Rent",
        views: (pr.viewCount ?? 0).toLocaleString("en-NG"),
        inq: "—",
        conv: "—",
        status: pr.status === "ACTIVE" ? "Active" : pr.status === "AWAITING_APPROVAL" ? "Pending" : "Expired",
      }));

    const avgViews = stats?.totalProperties ? Math.round((stats.totalViewCount ?? 0) / stats.totalProperties).toLocaleString("en-NG") : "—";

    // Geographic: real listings-per-state from /admin/stats.
    const regions = [...(stats?.listingsByState ?? [])].sort((a, b) => b.count - a.count);
    const geoLegend = regions.slice(0, 6).map((r, i) => ({ city: r.state, state: r.state, color: GEO_PALETTE[i % GEO_PALETTE.length] }));
    const geoFills = Object.fromEntries(geoLegend.map((l) => [l.state, l.color]));
    const geoRows = regions.slice(0, 8).map((r) => ({
      city: r.state,
      users: "—",
      listings: r.count.toLocaleString("en-NG"),
      leads: "—",
      revenue: "—",
      price: "—",
      growth: "—",
    }));
    const listingsTotal = Math.max(1, regions.reduce((a, r) => a + r.count, 0));
    const topState = regions[0];

    // Platform-overview time series (real halves only). Longer ranges are
    // bucketed (weekly for 90d, ~3-day for 30d) so the bars stay in-bounds.
    const WD = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const listingsPerDate = new Map<string, number>();
    props.forEach((pr) => {
      const iso = (pr.createdAt ?? "").slice(0, 10);
      if (iso) listingsPerDate.set(iso, (listingsPerDate.get(iso) ?? 0) + 1);
    });
    const daily = (registrations ?? []).map((r) => ({
      date: r.date,
      newUsers: r.total ?? 0,
      listings: listingsPerDate.get(r.date) ?? 0,
    }));
    const bucketSize = daily.length > 45 ? 7 : daily.length > 14 ? 3 : 1;
    const day7Labels: string[] = [];
    const newUsersByDay: number[] = [];
    const listingsByDay: number[] = [];
    for (let i = 0; i < daily.length; i += bucketSize) {
      const slice = daily.slice(i, i + bucketSize);
      const d0 = new Date(`${slice[0].date}T00:00:00`);
      day7Labels.push(
        Number.isNaN(d0.getTime())
          ? slice[0].date
          : bucketSize === 1 ? WD[d0.getDay()] : `${d0.getDate()} ${MON[d0.getMonth()]}`,
      );
      newUsersByDay.push(slice.reduce((a, x) => a + x.newUsers, 0));
      listingsByDay.push(slice.reduce((a, x) => a + x.listings, 0));
    }

    return {
      stats,
      regByRole,
      newThisMonth,
      verified,
      verifiedPct,
      avgAccountAge,
      topUsers,
      listingTypes,
      propertyTypes,
      newListingsByMonth: monthly,
      approvalRate,
      topListings,
      avgViews,
      geoLegend,
      geoFills,
      geoRows,
      topState,
      topStatePct: topState ? `${Math.round((topState.count / listingsTotal) * 100)}% of listings` : "—",
      activeStates: regions.length,
      day7Labels,
      newUsersByDay,
      listingsByDay,
    };
  }, [stats, registrations, usersPage, propsPage, agentsPage]);

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

      {tab === "Platform Overview" && <PlatformOverview d={data} range={poRange} onRange={setPoRange} />}
      {tab === "User Analytics" && <UserAnalytics d={data} />}
      {tab === "Listing Analytics" && <ListingAnalytics d={data} />}
      {tab === "Geographic" && <GeographicTab d={data} />}
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

/** Static label (used where the data isn't windowable). */
function Dropdown({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 shrink-0">
      <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "23px", color: "#000000" }}>{label}</span>
    </span>
  );
}

/** Interactive range selector — used where the series can be re-queried by window. */
function RangeDropdown({ value, options, onChange }: { value: number; options: { days: number; label: string }[]; onChange: (days: number) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.days === value)?.label ?? options[0]?.label ?? "";
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 hover:opacity-80">
        <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "23px", color: "#000000" }}>{current}</span>
        <Image src="/icons/admin/analytics/chart-arrow-down.svg" alt="" width={20} height={20} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-[12px] border border-[#F6F6F6] overflow-hidden flex flex-col py-1" style={{ minWidth: 150, boxShadow: "0px 15px 40px rgba(165,165,165,0.25)" }}>
            {options.map((o) => (
              <button key={o.days} type="button" onClick={() => { onChange(o.days); setOpen(false); }} className="flex items-center w-full px-4 text-left hover:bg-[#fafafa]" style={{ height: 38, fontSize: 13, fontWeight: 500, color: o.days === value ? "#305E82" : "#807E7E", background: o.days === value ? "rgba(48,94,130,0.06)" : "transparent" }}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
const RANGE_OPTIONS = [
  { days: 7, label: "Last 7 Days" },
  { days: 30, label: "Last 30 Days" },
  { days: 90, label: "Last 90 Days" },
];

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

type Series = { values: number[]; grad: string };
// Nice integer y-axis: min top of 4, ~5 descending ticks.
function chartScale(max: number): { top: number; ticks: number[] } {
  const m = Math.max(1, max);
  let top: number;
  if (m <= 4) top = 4;
  else if (m <= 10) top = Math.ceil(m / 2) * 2;
  else { const pow = Math.pow(10, Math.floor(Math.log10(m))); const n = m / pow; top = (n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow; }
  const step = top / 4;
  const ticks: number[] = [];
  for (let v = top; v >= 0; v -= step) ticks.push(Math.round(v));
  return { top, ticks };
}
const kLabel = (v: number): string => (v >= 1000 ? `${v / 1000}k` : `${v}`);

function ChartPlot({ labels, series, plotH = 237, barW = 16 }: { labels: string[]; series: Series[]; plotH?: number; barW?: number }) {
  const { top, ticks } = chartScale(Math.max(1, ...series.flatMap((s) => s.values)));
  // Shrink bars + gaps as the group count grows so nothing spills past the card.
  const n = Math.max(1, labels.length);
  const w = n > 20 ? 6 : n > 12 ? 8 : n > 9 ? 12 : barW;
  const colGap = n > 12 ? 6 : 12;
  const barGap = series.length > 1 ? (n > 12 ? 3 : 6) : 6;
  const labelEvery = n > 16 ? Math.ceil(n / 10) : 1;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col justify-between shrink-0" style={{ height: plotH }}>
        {ticks.map((t, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 500, lineHeight: "10px", letterSpacing: "-0.005em", color: "#121212" }}>{kLabel(t)}</span>
        ))}
      </div>
      <div className="flex-1 flex justify-between min-w-0 overflow-hidden" style={{ gap: colGap }}>
        {labels.map((d, i) => (
          <div key={d + i} className="flex flex-col items-center min-w-0" style={{ gap: 12 }}>
            <div className="flex items-end" style={{ height: plotH, gap: barGap }}>
              {series.map((s, si) => {
                const v = s.values[i] ?? 0;
                const h = v <= 0 ? 0 : Math.max(6, Math.min(plotH, (v / top) * plotH));
                return <Bar key={si} h={h} grad={s.grad} w={w} plotH={plotH} />;
              })}
            </div>
            <span style={{ fontSize: 10, fontWeight: 400, lineHeight: "10px", letterSpacing: "-0.005em", color: "#807E7E", whiteSpace: "nowrap" }}>{i % labelEvery === 0 ? d : ""}</span>
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

/* Session/bounce/conversion tracking doesn't exist yet (backend issue #6). */
const PLATFORM_STATS: Stat[] = [
  { label: "Total Sessions (30 Days)", value: "—", delta: "Awaiting analytics data", gradient: true },
  { label: "Average Session (Min)", value: "—", delta: "Awaiting analytics data" },
  { label: "Bounce Rate", value: "—", delta: "Awaiting analytics data" },
  { label: "Conversion Rate", value: "—", delta: "Awaiting analytics data" },
];
const DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

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

function PlatformOverview({ d, range, onRange }: { d: PageData; range: number; onRange: (days: number) => void }) {
  return (
    <>
      <StatCards stats={PLATFORM_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <div className="flex flex-col gap-4">
            <ChartHeader title="New Users vs Active Users" right={<RangeDropdown value={range} options={RANGE_OPTIONS} onChange={onRange} />} />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: CYAN }} /><span style={{ fontSize: 11, color: "#807E7E" }}>New Users</span></span>
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: BLUE }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Active Users</span></span>
            </div>
          </div>
          <ChartPlot labels={d.day7Labels.length ? d.day7Labels : DAYS} series={[{ values: d.newUsersByDay, grad: CYAN }, { values: d.newUsersByDay.map(() => 0), grad: BLUE }]} />
        </div>
        <div className="flex flex-col bg-white" style={cardStyle}>
          <div className="flex flex-col gap-4">
            <ChartHeader title="Listings Posted vs Leads Generated" right={<RangeDropdown value={range} options={RANGE_OPTIONS} onChange={onRange} />} />
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: GOLD }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Listings Posted</span></span>
              <span className="flex items-center gap-2.5"><span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: BLUE }} /><span style={{ fontSize: 11, color: "#807E7E" }}>Leads Generated</span></span>
            </div>
          </div>
          <ChartPlot labels={d.day7Labels.length ? d.day7Labels : DAYS} series={[{ values: d.listingsByDay, grad: GOLD }, { values: d.listingsByDay.map(() => 0), grad: BLUE }]} />
        </div>
      </div>
      {/* Geographic distribution — map + table in one card */}
      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <div className="flex items-start justify-between gap-4 p-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Geographic Distribution</h2>
          <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>Top cities by listing activity</span>
        </div>
        <div className="mx-6 relative overflow-hidden h-80 sm:h-96" style={{ background: "rgba(246,246,246,0.5)", borderRadius: 15 }}>
          <NigeriaMap fills={d.geoFills} />
          <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-10">
            <div className="flex items-center gap-4">{d.geoLegend.slice(0, 3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
            <div className="flex items-center gap-4">{d.geoLegend.slice(3).map((l) => <LegendDot key={l.city} {...l} />)}</div>
          </div>
        </div>
        <div className="mx-6 mt-6 mb-6 overflow-x-auto">
          <table className="w-full" style={{ minWidth: 760, borderCollapse: "collapse" }}>
            <thead>
              <tr>{["City", "Users", "Listings", "Leads", "Revenue", "Growth"].map((h) => <th key={h} className="text-left" style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {d.geoRows.map((r) => (
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

/* Heatmap awaits session tracking (backend issue #6) — neutral cells, no fake peaks. */
const HEAT_BG = Array(24).fill("#F6F6F6");

function UserAnalytics({ d }: { d: PageData }) {
  const USER_STATS: Stat[] = [
    { label: "New This Month", value: String(d.newThisMonth), delta: "From latest signups", gradient: true },
    { label: "Verified Users", value: d.verified.toLocaleString("en-NG"), delta: `${d.verifiedPct}% of total` },
    { label: "Churn Rate (30 Days)", value: "—", delta: "Awaiting analytics data" },
    { label: "Avg. Account Age", value: d.avgAccountAge, delta: "Across all users" },
  ];
  return (
    <>
      <StatCards stats={USER_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="User Registrations by Role" right={<Dropdown label="All time" />} />
          <div className="flex flex-col" style={{ gap: 24 }}>
            {d.regByRole.map((r) => <HBarRow key={r.role} label={r.role} color={ROLE_COLOR[r.role]} pct={r.pct} value={r.value} barPct={r.barPct} />)}
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
          <span style={{ fontSize: 11, fontWeight: 400, color: "#807E7E" }}>Awaiting session tracking data</span>
        </div>
      </div>
      <TableCard title="Top Performing Users" head={["User", "Role", "Listings", "Total Views", "Leads", "Member Since"]} minWidth={840}>
        {d.topUsers.map((u) => (
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

const LISTING_TYPE_BARCOLOR: Record<string, string> = { "For Rent": "#1F7EEE", "For Sale": "#305E82", Shortlet: "#8A38F5" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ListingAnalytics({ d }: { d: PageData }) {
  const LISTING_STATS: Stat[] = [
    { label: "Total Active", value: (d.stats?.activeListings ?? 0).toLocaleString("en-NG"), delta: "Live", gradient: true },
    { label: "Avg. Views/Listing", value: d.avgViews, delta: "All time" },
    { label: "Avg. Inquiries/Listing", value: "—", delta: "Awaiting analytics data" },
    { label: "Avg. Time to Rent/Sell", value: "—", delta: "Awaiting analytics data" },
  ];
  return (
    <>
      <StatCards stats={LISTING_STATS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white" style={cardStyle}>
          <ChartHeader title="User Registrations by Role" right={<Dropdown label="All time" />} />
          <div className="flex flex-col" style={{ gap: 24 }}>
            {d.listingTypes.map((r) => <HBarRow key={r.label} label={r.label} color={LISTING_TYPE_BARCOLOR[r.label]} pct={r.pct} value={r.value} barPct={r.barPct} badgeW={72} />)}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Listings by Property Types</h3>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {d.propertyTypes.map((p) => (
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
              <span style={{ fontSize: 16, fontWeight: 600, color: "#305E82" }}>{d.approvalRate}</span>
              <span style={{ fontSize: 10, color: "#807E7E" }}>Approval Rate</span>
            </div>
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#305E82" }}>—</span>
              <span style={{ fontSize: 10, color: "#807E7E" }}>Avg. Review Time</span>
            </div>
          </div>
          <ChartPlot labels={MONTHS} series={[{ values: d.newListingsByMonth, grad: BLUE }]} plotH={237} barW={16} />
        </div>
      </div>
      <TableCard title="Top Performing Listings" head={["Property ID", "Property", "Type", "Total Views", "Inquiries", "Conversion", "Status"]} minWidth={980}>
        {d.topListings.map((l) => (
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


function GeographicTab({ d }: { d: PageData }) {
  const GEO_STATS: Stat[] = [
    { label: "Top City", value: d.topState?.state ?? "—", delta: d.topStatePct, gradient: true },
    { label: "Active States", value: String(d.activeStates), delta: "With live listings" },
    { label: "Fastest Growing", value: "—", delta: "Awaiting analytics data" },
    { label: "Rural Listings", value: "—", delta: "Awaiting analytics data" },
  ];
  return (
    <>
      <StatCards stats={GEO_STATS} />
      <GeoMapCard title="Nigeria Market Distribution" subtitle="Click a division to drill down" legend={d.geoLegend.slice(0, 5)} fills={d.geoFills} />
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
        {d.geoRows.map((r) => (
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
