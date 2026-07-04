"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

/** Values captured by the notification/template form. */
export type NotificationFormValues = {
  type: string;
  audience: string;
  subject: string;
  bodyHtml: string;
};

const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" };
const fieldBase = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, placeholder, options, value, onChange }: { label: string; placeholder: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldBase} h-12 px-4 pr-10 appearance-none cursor-pointer ${"" /* keep placeholder grey */}`} style={{ color: value ? "#121212" : "#807E7E" }}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o} style={{ color: "#121212" }}>{o}</option>)}
        </select>
        <ChevronDown size={20} color="#121212" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </Field>
  );
}

export function NotificationFormModal({
  title,
  subtitle,
  submitLabel,
  showSaveAsTemplate,
  initial,
  notice,
  busy,
  onClose,
  onSubmit,
  onSaveAsTemplate,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  showSaveAsTemplate?: boolean;
  initial?: Partial<NotificationFormValues>;
  notice?: string;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: NotificationFormValues) => void;
  onSaveAsTemplate?: (values: NotificationFormValues) => void;
}) {
  const [type, setType] = useState(initial?.type ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? "");
  const values: NotificationFormValues = { type, audience, subject: subject.trim(), bodyHtml };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6 sm:p-10 flex flex-col gap-8 sm:gap-10" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 pr-8">
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{title}</h2>
          <p style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>{subtitle}</p>
        </div>

        {/* Form */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => { e.preventDefault(); onSubmit(values); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Notification Type" placeholder="Select notification type" options={["Announcement", "Promotion", "Reminder", "Alert"]} value={type} onChange={setType} />
            <SelectField label="Target Audience" placeholder="Select target audience" options={["All Users", "Owners", "Agents", "Agencies", "Seekers"]} value={audience} onChange={setAudience} />
          </div>

          <Field label="Subject/Title">
            <input className={`${fieldBase} h-12 px-4`} placeholder="e. g. New Listings Near You" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </Field>

          <Field label="Message Body">
            <RichTextEditor placeholder={"Hi [First Name],\n\nWe've just added ..."} minHeight={193} align defaultHtml={initial?.bodyHtml} onHtmlChange={setBodyHtml} />
          </Field>

          {/* Footer */}
          <div className="flex flex-col gap-4 mt-4">
            {notice && (
              <p style={{ fontSize: 13, lineHeight: "20px", color: "#EA651A", margin: 0 }}>{notice}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center text-white hover:opacity-90 disabled:opacity-60"
              style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
            >
              {busy ? "Saving…" : submitLabel}
            </button>
            {showSaveAsTemplate && (
              <button type="button" disabled={busy} onClick={() => onSaveAsTemplate?.(values)} className="flex items-center justify-center h-12 hover:opacity-70 disabled:opacity-60" style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>
                Save as Template
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
