"use client";

import Image from "next/image";
import { useState } from "react";
import NigeriaMap from "@/components/NigeriaMap";

const TABS = ["Platform Overview", "User Analytics", "Listing Analytics", "Geographic"] as const;

/* Stat cards (swap for admin GET /admin/analytics/overview). */
const STATS: { label: string; value: string; delta: string; gradient?: boolean }[] = [
  { label: "Total Sessions (30 Days)", value: "284k", delta: "+22%", gradient: true },
  { label: "Average Session (Min)", value: "8.4", delta: "+1.3min" },
  { label: "Bounce Rate", value: "34%", delta: "-5% this week" },
  { label: "Conversion Rate", value: "6.8%", delta: "+6.4%" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
const Y_AXIS = ["5k", "4k", "3k", "2k", "1k", "500", "200"];
const PLOT_H = 237;

const CYAN = "linear-gradient(180deg, #68DBF2 0%, #509CF5 100%)";
const BLUE = "linear-gradient(180deg, #75A3C7 0%, #305E82 100%)";
const GOLD = "linear-gradient(180deg, #FFEF5E 0%, #F7936F 100%)";

/* Chart series (swap for admin GET /admin/analytics/charts). */
const CHART1 = {
  title: "New Users vs Active Users",
  legend: [
    { name: "New Users", grad: CYAN },
    { name: "Active Users", grad: BLUE },
  ],
  a: [119, 79, 119, 86, 33, 76, 74],
  b: [94, 149, 119, 177, 59, 88, 121],
};
const CHART2 = {
  title: "Listings Posted vs Leads Generated",
  legend: [
    { name: "Listings Posted", grad: GOLD },
    { name: "Leads Generated", grad: BLUE },
  ],
  a: [143, 79, 148, 86, 196, 76, 74],
  b: [62, 86, 95, 36, 59, 88, 121],
};

/* Geographic distribution (swap for admin GET /admin/analytics/geo). */
const GEO_LEGEND = [
  { city: "Lagos", state: "Lagos", color: "#FF8800" },
  { city: "Abuja", state: "FCT", color: "#37B26E" },
  { city: "Port-Harcourt", state: "Rivers", color: "#8A38F5" },
  { city: "Ibadan", state: "Oyo", color: "#578AF0" },
  { city: "Ogun", state: "Ogun", color: "#44CFE4" },
  { city: "Kaduna", state: "Kaduna", color: "#EE46BC" },
];

/* Tint the map state that each city belongs to (built from the legend). */
const GEO_FILLS: Record<string, string> = Object.fromEntries(GEO_LEGEND.map((l) => [l.state, l.color]));
const GEO_ROWS = [
  { city: "Lagos", users: "1,842", listings: "612", leads: "4,820", revenue: "₦14.2M", growth: "+28%" },
  { city: "Abuja", users: "384", listings: "142", leads: "2,107", revenue: "₦7.4M", growth: "+19%" },
  { city: "Kaduna", users: "312", listings: "128", leads: "1,540", revenue: "₦6.2M", growth: "+21%" },
  { city: "Port-Harcourt", users: "209", listings: "119", leads: "980", revenue: "₦5.6M", growth: "+34%" },
  { city: "Ibadan", users: "124", listings: "83", leads: "320", revenue: "₦2.8M", growth: "+12%" },
  { city: "Ogun", users: "85", listings: "58", leads: "140", revenue: "₦1.7M", growth: "+8%" },
];

const cell: React.CSSProperties = { height: 72, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6" };
const val: React.CSSProperties = { fontSize: 14, fontWeight: 500, color: "#121212" };

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Platform Overview");

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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex flex-col"
            style={{
              padding: "16px 24px", borderRadius: 20, gap: 16, border: "1px solid #F6F6F6",
              background: s.gradient ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#FFFFFF",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "24px", color: s.gradient ? "#FFFFFF" : "#807E7E" }}>{s.label}</span>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: s.gradient ? "#FFFFFF" : "#121212" }}>{s.value}</span>
              <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "24px", color: s.gradient ? "#FFFFFF" : "#027B2A" }}>{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard chart={CHART1} />
        <BarChartCard chart={CHART2} />
      </div>

      {/* Geographic Distribution */}
      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Geographic Distribution</h2>
          <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>Top cities by listing activity</span>
        </div>

        {/* Map — real per-state Nigeria boundaries, tinted from the data */}
        <div className="mx-6 relative flex items-center justify-center overflow-hidden" style={{ background: "rgba(246,246,246,0.5)", borderRadius: 15, minHeight: 321, padding: "24px 0" }}>
          <NigeriaMap fills={GEO_FILLS} className="h-[240px] sm:h-[300px] lg:h-[340px] w-auto" />
          {/* Legend overlay (bottom-right, 2 rows) */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              {GEO_LEGEND.slice(0, 3).map((l) => <LegendDot key={l.city} {...l} />)}
            </div>
            <div className="flex items-center gap-4">
              {GEO_LEGEND.slice(3).map((l) => <LegendDot key={l.city} {...l} />)}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mx-6 mt-6 mb-6 overflow-x-auto">
          <table className="w-full" style={{ minWidth: 760, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["City", "Users", "Listings", "Leads", "Revenue", "Growth"].map((h) => (
                  <th
                    key={h}
                    className="text-left"
                    style={{ height: 44, padding: "0 16px 0 24px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GEO_ROWS.map((r) => (
                <tr key={r.city}>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{r.city}</span></td>
                  <td style={cell}><span style={val}>{r.users}</span></td>
                  <td style={cell}><span style={val}>{r.listings}</span></td>
                  <td style={cell}><span style={val}>{r.leads}</span></td>
                  <td style={cell}><span style={val}>{r.revenue}</span></td>
                  <td style={cell}>
                    <span className="inline-flex items-center rounded-[16px]" style={{ background: "rgba(0,157,53,0.08)", color: "#009D35", fontSize: 12, fontWeight: 500, lineHeight: "20px", padding: "2px 12px" }}>{r.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LegendDot({ city, color }: { city: string; color: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: color }} />
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", color: "#121212" }}>{city}</span>
    </span>
  );
}

function BarChartCard({ chart }: { chart: typeof CHART1 }) {
  return (
    <div className="flex flex-col bg-white" style={{ padding: 24, borderRadius: 16, gap: 24, border: "1px solid #F6F6F6" }}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{chart.title}</h3>
          <button type="button" className="flex items-center gap-2 shrink-0">
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "23px", color: "#000000" }}>Last 7 Days</span>
            <Image src="/icons/admin/analytics/chart-arrow-down.svg" alt="" width={20} height={20} />
          </button>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4">
          {chart.legend.map((l) => (
            <span key={l.name} className="flex items-center gap-2.5">
              <span className="rounded-full shrink-0" style={{ width: 8, height: 8, background: l.grad }} />
              <span style={{ fontSize: 11, fontWeight: 400, lineHeight: "12px", color: "#807E7E" }}>{l.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="flex gap-4">
        {/* Y axis */}
        <div className="flex flex-col justify-between shrink-0" style={{ height: PLOT_H }}>
          {Y_AXIS.map((y) => (
            <span key={y} style={{ fontSize: 10, fontWeight: 500, lineHeight: "10px", letterSpacing: "-0.005em", color: "#121212" }}>{y}</span>
          ))}
        </div>
        {/* Plot */}
        <div className="flex-1 flex justify-between" style={{ gap: 12 }}>
          {DAYS.map((d, i) => (
            <div key={d} className="flex flex-col items-center" style={{ gap: 12 }}>
              <div className="flex items-end" style={{ height: PLOT_H, gap: 6 }}>
                <Bar h={chart.a[i]} grad={chart.legend[0].grad} />
                <Bar h={chart.b[i]} grad={chart.legend[1].grad} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 400, lineHeight: "10px", letterSpacing: "-0.005em", color: "#807E7E" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bar({ h, grad }: { h: number; grad: string }) {
  return (
    <div className="relative rounded-full" style={{ width: 16, height: PLOT_H, background: "#F6F6F6" }}>
      <div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ height: h, background: grad }} />
    </div>
  );
}
