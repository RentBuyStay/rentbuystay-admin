"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMINS, ROLE_COLOR, type Admin } from "@/lib/demoAdmins";
import { AddAdminModal } from "@/components/AdminModals";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";

const TABS = ["Administrators", "Roles & Permissions", "Security", "Email Config", "Moderation Rules", "SEO Settings"] as const;
type Tab = (typeof TABS)[number];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const th: React.CSSProperties = { height: 44, padding: "0 16px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E", textAlign: "left" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px", borderBottom: "1px solid #F6F6F6" };

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Administrators");
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<Admin | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs + New Admin */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)} className="shrink-0" style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", padding: "8px 0", color: active ? "#305E82" : "#807E7E", borderBottom: active ? "1px solid #305E82" : "1px solid transparent" }}>
                {t}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
          style={{ height: 48, padding: "0 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/blog/blog-add.svg" alt="" width={20} height={20} /> New Admin
        </button>
      </div>

      {tab === "Administrators" ? (
        <section className="bg-white overflow-x-auto" style={{ border: "1px solid #F6F6F6", borderRadius: 15 }}>
          <table className="w-full" style={{ minWidth: 880, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 24 }}>User</th>
                <th style={th}>Phone Number</th>
                <th style={th}>Role</th>
                <th style={th}>Added On</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ADMINS.map((a) => (
                <tr key={a.id} onClick={() => router.push(`/dashboard/settings/${a.id}`)} className="cursor-pointer hover:bg-[#fafafa]">
                  <td style={{ ...cell, paddingLeft: 24 }}>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{a.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: "#807E7E" }}>{a.email}</span>
                    </div>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{a.phone}</span></td>
                  <td style={cell}>
                    <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(ROLE_COLOR[a.role], 0.08), color: ROLE_COLOR[a.role], fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{a.role}</span>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{a.added}</span></td>
                  <td style={cell}>
                    <div className="flex items-center" style={{ gap: 24 }}>
                      <button type="button" aria-label="Edit admin" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/settings/${a.id}`); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-edit.svg" alt="" width={20} height={20} /></button>
                      <button type="button" aria-label="Remove admin" onClick={(e) => { e.stopPropagation(); setRemoving(a); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white flex flex-col items-center justify-center gap-2 text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 15, minHeight: 360, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#121212" }}>{tab}</h3>
          <p style={{ fontSize: 14, color: "#807E7E" }}>This section is coming soon.</p>
        </section>
      )}

      {addOpen && (
        <AddAdminModal
          onClose={() => setAddOpen(false)}
          onSubmit={() => { setAddOpen(false); setSuccess({ title: "Admin Invite Sent", body: "An invitation email has been sent with a log in link and credentials. Once they sign in, their account will be active and ready for use based on their role. You can track or resend the invite from Admin Settings." }); }}
        />
      )}
      {removing && (
        <ConfirmModal
          title="Remove Admin"
          body={`Are you sure you want to remove ${removing.name} from the system? They will immediately lose all admin access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay. This action cannot be undone.`}
          confirmLabel="Remove Admin"
          onConfirm={() => { const name = removing.name; setRemoving(null); setSuccess({ title: "Admin Removed Successfully", body: `Done! ${name} has been removed from the system. Their access has been revoked immediately and all active sessions have been terminated. This change has been recorded in your admin activity log.` }); }}
          onClose={() => setRemoving(null)}
        />
      )}
      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}
