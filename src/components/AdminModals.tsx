"use client";

import { useState } from "react";
import { X, ChevronDown, Eye, EyeOff } from "lucide-react";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { COUNTRIES, type Country } from "@/lib/countries";
import { ADMIN_ROLES, type AdminRole } from "@/lib/demoAdmins";

const fieldBase = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" };
const gradientBtn: React.CSSProperties = { height: 48, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, placeholder, value, onChange, options }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <Field label={label}>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldBase} h-12 px-4 pr-10 appearance-none cursor-pointer`} style={{ color: value ? "#121212" : "#807E7E" }}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o} style={{ color: "#121212" }}>{o}</option>)}
        </select>
        <ChevronDown size={20} color="#121212" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </Field>
  );
}

function PasswordField({ label, placeholder }: { label: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="flex items-center h-12 px-4 bg-[#F6F6F6] rounded-[12px]">
        <input type={show ? "text" : "password"} placeholder={placeholder} className="flex-1 bg-transparent outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]" />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="shrink-0 hover:opacity-70">
          {show ? <Eye size={20} color="#121212" /> : <EyeOff size={20} color="#121212" />}
        </button>
      </div>
    </Field>
  );
}

function Overlay({ maxWidth, onClose, children }: { maxWidth: number; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="relative bg-white rounded-[24px] w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 sm:right-10 sm:top-10 hover:opacity-70">
          <X size={24} color="#121212" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function AddAdminModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const US = COUNTRIES.find((c) => c.iso2 === "US") ?? COUNTRIES[0];
  const [country, setCountry] = useState<Country>(US);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  return (
    <Overlay maxWidth={720} onClose={onClose}>
      <h2 className="pr-8" style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>Add New Admin</h2>
      <form className="flex flex-col gap-5 mt-8" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name"><input className={`${fieldBase} h-12 px-4`} placeholder="Enter first name" /></Field>
          <Field label="Last name"><input className={`${fieldBase} h-12 px-4`} placeholder="Enter last name" /></Field>
        </div>
        <Field label="Email"><input type="email" className={`${fieldBase} h-12 px-4`} placeholder="Enter your email address here" /></Field>
        <Field label="Phone Number">
          <PhoneNumberInput country={country} onCountryChange={setCountry} value={phone} onChange={setPhone} />
        </Field>
        <SelectField label="Role" placeholder="Select role" value={role} onChange={setRole} options={ADMIN_ROLES} />
        <PasswordField label="Password" placeholder="Enter password here" />
        <PasswordField label="Confirm Password" placeholder="Enter password again" />
        <button type="submit" className="flex items-center justify-center text-white hover:opacity-90 mt-2" style={gradientBtn}>Send Invite</button>
      </form>
    </Overlay>
  );
}

export function EditRoleNameModal({ currentName, onClose, onSave }: { currentName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(currentName);
  return (
    <Overlay maxWidth={636} onClose={onClose}>
      <h2 className="pr-8" style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>Edit Role Name</h2>
      <div className="flex flex-col gap-6 mt-8">
        <Field label="Role"><input className={`${fieldBase} h-12 px-4`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter role name" /></Field>
        <button type="button" onClick={() => onSave(name)} className="flex items-center justify-center text-white hover:opacity-90" style={gradientBtn}>Save Changes</button>
      </div>
    </Overlay>
  );
}

export function ChangeRoleModal({ currentRole, onClose, onSave }: { currentRole: AdminRole; onClose: () => void; onSave: (role: string) => void }) {
  const [role, setRole] = useState<string>(currentRole);
  return (
    <Overlay maxWidth={636} onClose={onClose}>
      <h2 className="pr-8" style={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>Change Admin Role</h2>
      <div className="flex flex-col gap-6 mt-8">
        <SelectField label="Role" placeholder="Select role" value={role} onChange={setRole} options={ADMIN_ROLES} />
        <button type="button" onClick={() => onSave(role)} className="flex items-center justify-center text-white hover:opacity-90" style={gradientBtn}>Save Changes</button>
      </div>
    </Overlay>
  );
}
