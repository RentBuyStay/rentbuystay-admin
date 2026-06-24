"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/* ── shared row primitives ─────────────────────────────── */
function SettingRow({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4" style={{ background: "#F6F6F6", borderRadius: 20, minHeight: 100, padding: 24 }}>
      <div className="flex flex-col gap-2 min-w-0">
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#121212" }}>{title}</span>
        {subtitle && <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>{subtitle}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => setOn((v) => !v)} className="relative shrink-0" style={{ width: 40, height: 20, borderRadius: 9999, background: on ? "#FFAE00" : "#E9EDF0", transition: "background 0.15s" }}>
      <span className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white" style={{ width: 14, height: 14, left: on ? 23 : 3, boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left 0.15s" }} />
    </button>
  );
}

function RowInput({ defaultValue }: { defaultValue: string }) {
  return <input defaultValue={defaultValue} className="bg-white rounded-[12px] h-12 px-4 outline-none text-[14px] text-[#121212] w-[200px] sm:w-[354px]" />;
}

function RowSelect({ value, options, width = 155 }: { value: string; options: string[]; width?: number }) {
  const [v, setV] = useState(value);
  return (
    <div className="relative" style={{ width }}>
      <select value={v} onChange={(e) => setV(e.target.value)} className="bg-white rounded-[12px] h-12 pl-4 pr-10 w-full appearance-none cursor-pointer outline-none text-[14px] text-[#121212]">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={20} color="#121212" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

/* ── Security ─────────────────────────────── */
export function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingRow title="2-Factor Authentication" subtitle="Require 2FA for all admin panel logins"><Toggle defaultOn /></SettingRow>
      <SettingRow title="Spam Detection" subtitle="Auto-flag duplicate and suspicious listings"><Toggle defaultOn /></SettingRow>
      <SettingRow title="Image Duplicate Detection" subtitle="Flag listings reusing stock/stolen images"><Toggle defaultOn /></SettingRow>
      <SettingRow title="Failed Login Lockout" subtitle="Lock account for 4 hours after 5 failed login attempts"><Toggle /></SettingRow>
      <SettingRow title="Session Timeout"><RowSelect value="1 hour" options={["30 minutes", "1 hour", "2 hours", "4 hours"]} width={129} /></SettingRow>
    </div>
  );
}

/* ── Email Config ─────────────────────────────── */
export function EmailTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingRow title="From Name"><RowInput defaultValue="RentBuyStay" /></SettingRow>
      <SettingRow title="From Email"><RowInput defaultValue="noreply@rentbuystay.ng" /></SettingRow>
      <SettingRow title="Reply-To-Email"><RowInput defaultValue="support@rentbuystay.ng" /></SettingRow>
      <SettingRow title="SMTP Provider"><RowSelect value="SendGrid" options={["SendGrid", "Mailgun", "Amazon SES", "Postmark"]} /></SettingRow>
      <SettingRow title="Welcome Email" subtitle="Send automatically on registration"><Toggle defaultOn /></SettingRow>
      <SettingRow title="Listing Expiry Reminder" subtitle="7-day and 1-day warnings"><Toggle /></SettingRow>
    </div>
  );
}

/* ── Moderation Rules ─────────────────────────────── */
export function ModerationTab() {
  return (
    <div className="flex flex-col gap-4">
      <SettingRow title="Auto-reject listings with stock images" subtitle="Uses AI image detection"><Toggle defaultOn /></SettingRow>
      <SettingRow title="Auto-flag listings with price anomalies" subtitle="Price deviates >60% from area average"><Toggle defaultOn /></SettingRow>
      <SettingRow title="User reports threshold for auto-suspend" subtitle="Suspend listing after N user reports"><RowSelect value="5" options={["3", "5", "10", "15"]} width={90} /></SettingRow>
      <SettingRow title="Require photos for new listing (min count)"><RowSelect value="3" options={["1", "2", "3", "4", "5"]} width={90} /></SettingRow>
      <SettingRow title="Listing approval for verified agents" subtitle="Verified agents with 0 violations skip review"><Toggle /></SettingRow>
    </div>
  );
}

/* ── SEO Settings ─────────────────────────────── */
const seoField = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";
const seoLabel: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" };

export function SeoTab({ onSaved }: { onSaved: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const onFile = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => setCoverUrl(r.result as string);
    r.readAsDataURL(f);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label style={seoLabel}>Default Meta Title</label>
        <input className={`${seoField} h-12 px-4`} defaultValue="RentBuyStay — Find Properties to Rent, Buy & Short Let in Nigeria" />
      </div>
      <div className="flex flex-col gap-2">
        <label style={seoLabel}>Default Meta Description</label>
        <textarea className={`${seoField} h-[111px] p-4 resize-none`} defaultValue="Nigeria's #1 real estate marketplace. Thousands of verified listings." />
      </div>

      <div className="flex flex-col gap-2">
        <label style={seoLabel}>Social Share image</label>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
          className="relative flex flex-col items-center justify-center gap-4 w-full cursor-pointer overflow-hidden"
          style={{ minHeight: 270, borderRadius: 20, padding: 24, background: dragging ? "rgba(26,115,225,0.04)" : "transparent" }}
        >
          <svg className="absolute pointer-events-none" style={{ left: 0.4, top: 0.4, width: "calc(100% - 0.8px)", height: "calc(100% - 0.8px)" }} preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="100%" height="100%" rx="19.6" ry="19.6" fill="none" stroke="#1A73E1" strokeOpacity="0.8" strokeWidth="0.8" strokeDasharray="6 4" />
          </svg>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Social share preview" className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: 20 }} />
          ) : (
            <>
              <Image src="/icons/admin/blog/blog-gallery.svg" alt="" width={64} height={64} />
              <div className="flex flex-col items-center gap-2">
                <span style={{ fontSize: 20, fontWeight: 600, color: "#121212" }}>
                  Drag &amp; drop photos or <span style={{ color: "#305E82", textDecoration: "underline" }}>click to upload</span>
                </span>
                <span className="text-center max-w-[440px]" style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>
                  To ensure best quality, please upload PNG, JPG up to 5MB each with high resolution. Min. 3 photos required.
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label style={seoLabel}>Google Analytics Tracking ID</label>
          <input className={`${seoField} h-12 px-4`} placeholder="G- XXXXXXXXXX" />
        </div>
        <div className="flex flex-col gap-2">
          <label style={seoLabel}>Facebook Pixel ID</label>
          <input className={`${seoField} h-12 px-4`} placeholder="XXXXXXXXXXXXXXX" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onSaved} className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
