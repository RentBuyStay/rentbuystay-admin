"use client";

import Image from "next/image";

/* Email templates (swap for admin GET /admin/notification-templates). */
const TEMPLATES = [
  { title: "Welcome Email", sub: "New user onboarding · Email", icon: "tmpl-doc-blue.svg", accent: "#509CF5" },
  { title: "New Listing Alert", sub: "Notify seekers of matching listings · Push + Email", icon: "tmpl-doc-purple.svg", accent: "#8A38F5" },
  { title: "Subscription Reminder", sub: "7-day renewal reminder · Email + SMS", icon: "tmpl-doc-orange.svg", accent: "#EA651A" },
  { title: "Listing Expiry Warning", sub: "3 days before listing expires · Push + Email", icon: "tmpl-doc-green.svg", accent: "#009D35" },
];

/* Notification history (swap for admin GET /admin/notifications). */
const HISTORY = [
  { subject: "New Verified Listings Added!🏠", type: "Email + Push", recipients: "2,616", open: "52%", sent: "Today, 8am" },
  { subject: "Your subscription renews in 7 days", type: "Email + SMS", recipients: "58", open: "89%", sent: "Yesterday" },
  { subject: "Verify your identity to list properties", type: "Email", recipients: "1,812", open: "74%", sent: "2 days ago" },
  { subject: "Welcome to RentBuyStay!", type: "Email", recipients: "3,492", open: "91%", sent: "3 days ago" },
  { subject: "Your listing expires in 3 days⚠️", type: "Push + Email", recipients: "1,052", open: "78%", sent: "5 days ago" },
];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const th: React.CSSProperties = { height: 44, padding: "0 16px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px", borderBottom: "1px solid #F6F6F6" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* Email Templates header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>Email Templates</h2>
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-2 shrink-0" style={{ height: 48, padding: "0 24px", borderRadius: 12 }}>
            <Image src="/icons/admin/notif/notif-edit.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>New Template</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            Send Notification/Email
          </button>
        </div>
      </div>

      {/* Template cards */}
      <div className="flex flex-col gap-4">
        {TEMPLATES.map((t) => (
          <div key={t.title} className="flex items-center justify-between gap-3 bg-white" style={{ padding: 24, borderRadius: 20, border: "1px solid #F6F6F6" }}>
            <div className="flex items-center min-w-0" style={{ gap: 16 }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: 48, height: 48, borderRadius: 8, background: hexA(t.accent, 0.05) }}>
                <Image src={`/icons/admin/notif/${t.icon}`} alt="" width={20} height={20} />
              </span>
              <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                <span className="truncate" style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{t.title}</span>
                <span className="truncate" style={{ fontSize: 14, fontWeight: 400, lineHeight: "18px", color: "#807E7E" }}>{t.sub}</span>
              </div>
            </div>
            <div className="flex items-center shrink-0" style={{ gap: 8 }}>
              <button type="button" aria-label="Edit template" className="flex items-center justify-center hover:bg-[#fafafa]" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Image src="/icons/admin/notif/notif-edit.svg" alt="" width={20} height={20} />
              </button>
              <button type="button" aria-label="Send template" className="flex items-center justify-center hover:bg-[#fafafa]" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Image src="/icons/admin/notif/notif-send.svg" alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification History */}
      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <div className="p-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Notification History</h2>
        </div>
        <div className="mx-6 mb-6 overflow-x-auto">
          <table className="w-full" style={{ minWidth: 880, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, textAlign: "left", paddingLeft: 24 }}>Subject</th>
                <th style={{ ...th, textAlign: "center" }}>Type</th>
                <th style={{ ...th, textAlign: "center" }}>Recipients</th>
                <th style={{ ...th, textAlign: "center" }}>Open Rate</th>
                <th style={{ ...th, textAlign: "center" }}>Sent</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h) => (
                <tr key={h.subject}>
                  <td style={{ ...cell, paddingLeft: 24 }}><span style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{h.subject}</span></td>
                  <td style={cell} className="text-center"><Pill label={h.type} color="#305E82" /></td>
                  <td style={cell} className="text-center"><span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>{h.recipients}</span></td>
                  <td style={cell} className="text-center"><Pill label={h.open} color="#009D35" /></td>
                  <td style={cell} className="text-center"><span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>{h.sent}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(color, 0.08), color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{label}</span>;
}
