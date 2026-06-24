"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { X, ChevronUp, ChevronDown, Calendar, Info } from "lucide-react";

export type PlanInitial = {
  name?: string;
  amount?: string;
  duration?: string;
  listings?: string;
  featured?: string;
};

const FIELD = "h-12 px-4 bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <label style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>{label}</label>
      {children}
    </div>
  );
}

function Select({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select defaultValue="" className={`${FIELD} w-full appearance-none pr-10`}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Image src="/icons/admin/filter-arrow-down.svg" alt="" width={16} height={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function Stepper({ defaultValue = 0 }: { defaultValue?: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-[#F6F6F6] rounded-[12px]">
      <input
        type="number"
        value={v}
        onChange={(e) => setV(Math.max(0, Number(e.target.value) || 0))}
        className="bg-transparent outline-none w-full text-[14px] text-[#121212] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col shrink-0">
        <button type="button" onClick={() => setV((n) => n + 1)} className="hover:opacity-70" aria-label="Increase"><ChevronUp size={14} color="#807E7E" /></button>
        <button type="button" onClick={() => setV((n) => Math.max(0, n - 1))} className="hover:opacity-70" aria-label="Decrease"><ChevronDown size={14} color="#807E7E" /></button>
      </div>
    </div>
  );
}

export function PlanFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: PlanInitial;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6 sm:p-10" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>

        <div className="flex flex-col gap-2 max-w-[363px]">
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>
            {mode === "create" ? "Create Subscription Plan" : "Edit Subscription Plan"}
          </h2>
          <p style={{ fontSize: 12, lineHeight: "20px", color: "#807E7E" }}>Configure subscription plans available on the platform</p>
        </div>

        <form
          className="flex flex-col gap-4 mt-6"
          onSubmit={(e) => { e.preventDefault(); onSaved(); }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Field label="Plan Name">
              <input className={FIELD} defaultValue={initial?.name} placeholder="Enter plan name (e.g. Agency Enterprise)" />
            </Field>
            <Field label="Target Role">
              <Select placeholder="Select target role" options={["Owner", "Agent", "Agency", "Seeker"]} />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Field label="Duration">
              <Select placeholder="Select plan duration" options={["Monthly", "Quarterly", "Yearly"]} />
            </Field>
            <Field label="Price (₦)">
              <input className={FIELD} defaultValue={initial?.amount?.replace(/[^\d]/g, "")} placeholder="Enter price" inputMode="numeric" />
            </Field>
          </div>

          <Field label="Max Listings"><Stepper defaultValue={Number(initial?.listings) || 0} /></Field>
          <Field label="Featured Listings"><Stepper defaultValue={Number(initial?.featured) || 0} /></Field>
          <Field label="Agent Seats (for Agency Plans)"><Stepper /></Field>

          <Field label="Features (one per line)">
            <textarea className="h-[100px] p-4 bg-[#F6F6F6] rounded-[12px] outline-none resize-none text-[14px] text-[#121212] placeholder:text-[#807E7E]" placeholder="Write plan features here" />
          </Field>

          <button
            type="submit"
            className="flex items-center justify-center text-white hover:opacity-90 mt-2"
            style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            Save Plan
          </button>
        </form>
      </div>
    </div>
  );
}

export function SuccessModal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-w-[503px] p-6 sm:p-10 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>

        <div className="flex flex-col items-center gap-6 mt-6 w-full">
          <Image src="/icons/admin/success-illu.svg" alt="" width={165} height={113} />
          <div className="flex flex-col gap-2 text-center">
            <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "30px", color: "#121212" }}>{title}</h2>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#807E7E" }}>{body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center text-white hover:opacity-90 w-full"
            style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            Okay, got it
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="shrink-0 rounded-full transition-colors"
      style={{ width: 40, height: 20, padding: 2, background: on ? "#305E82" : "#D0D5DD" }}
    >
      <span className="block rounded-full bg-white transition-transform" style={{ width: 16, height: 16, transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

function NotifyCard({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center justify-between" style={{ background: "#F6F6F6", borderRadius: 20, padding: 24, gap: 16 }}>
      <div className="flex flex-col gap-2 min-w-0">
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "#121212" }}>Notify User</span>
        <span style={{ fontSize: 12, lineHeight: "20px", color: "#807E7E" }}>{subtitle}</span>
      </div>
      <Toggle />
    </div>
  );
}

export function ExtendModal({ subtitle, onClose, onConfirm }: { subtitle: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6 sm:p-10" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>
        <div className="flex flex-col gap-2 max-w-[363px]">
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>Extend Subscription</h2>
          <p style={{ fontSize: 12, lineHeight: "20px", color: "#807E7E" }}>{subtitle}</p>
        </div>

        <form className="flex flex-col gap-4 mt-6" onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
          <Field label="Duration"><Select placeholder="Select extension duration" options={["1 month", "3 months", "6 months", "1 year"]} /></Field>
          <Field label="End Date">
            <div className="flex items-center justify-between h-12 px-4 bg-[#F6F6F6] rounded-[12px]">
              <input className="bg-transparent outline-none w-full text-[14px] text-[#121212]" defaultValue="15 May, 2026" />
              <Calendar size={20} color="#807E7E" className="shrink-0" />
            </div>
          </Field>
          <Field label="Reason for Extension"><Select placeholder="Select reason for extension" options={["Goodwill gesture", "Service compensation", "Promotional offer", "Other"]} /></Field>
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>
              Internal Note <span style={{ color: "#807E7E", fontSize: 12 }}>(Optional)</span>
            </label>
            <textarea className="h-[111px] p-4 bg-[#F6F6F6] rounded-[12px] outline-none resize-none text-[14px] text-[#121212] placeholder:text-[#807E7E]" placeholder="Add a note for audit trail" />
          </div>
          <NotifyCard subtitle="Send user an email about this extension" />
          <button type="submit" className="flex items-center justify-center text-white hover:opacity-90 mt-2" style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
            Confirm Extension
          </button>
        </form>
      </div>
    </div>
  );
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
  maxWidth = 503,
  children,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  maxWidth?: number;
  children?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>
        <div className="flex flex-col items-center gap-6 mt-6">
          <Image src="/icons/admin/warning-illu.svg" alt="" width={165} height={113} />
          <div className="flex flex-col gap-2 text-center">
            <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "30px", color: "#121212" }}>{title}</h2>
            <p style={{ fontSize: 16, lineHeight: "24px", color: "#807E7E" }}>{body}</p>
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
        <div className="flex flex-col gap-4 mt-6">
          <button type="button" onClick={onConfirm} className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "#E30045" }}>
            {confirmLabel}
          </button>
          <button type="button" onClick={onClose} className="flex items-center justify-center hover:bg-[#fafafa]" style={{ height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#121212", border: "1px solid #F6F6F6" }}>
            No, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function CancelExtras() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>Reason for Cancellation</label>
        <Select placeholder="Select reason for cancellation" options={["User request", "Non-payment", "Policy violation", "Other"]} />
      </div>
      <NotifyCard subtitle="Send user an email about this cancellation" />
    </div>
  );
}

export function DeleteWarning() {
  return (
    <div style={{ background: "#F6F6F6", borderRadius: 20, padding: "16px" }} className="flex flex-col gap-1">
      <span className="flex items-center gap-2">
        <Info size={16} color="#E30045" />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#E30045" }}>WARNING</span>
      </span>
      <span style={{ fontSize: 12, lineHeight: "20px", color: "#807E7E" }}>Make sure there are no active subscribers on this plan before you proceed to delete.</span>
    </div>
  );
}
