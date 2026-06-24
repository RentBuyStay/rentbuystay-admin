"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMINS, ROLE_COLOR, type Admin } from "@/lib/demoAdmins";
import { ROLES, type Role } from "@/lib/demoRoles";
import { AddAdminModal, EditRoleNameModal } from "@/components/AdminModals";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { SecurityTab, EmailTab, ModerationTab, SeoTab } from "@/components/SettingsTabs";

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
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
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
        {tab === "Administrators" && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "0 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/blog/blog-add.svg" alt="" width={20} height={20} /> New Admin
          </button>
        )}
        {tab === "Roles & Permissions" && (
          <Link
            href="/dashboard/settings/roles/new"
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "0 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/blog/blog-add.svg" alt="" width={20} height={20} /> New Role
          </Link>
        )}
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
      ) : tab === "Roles & Permissions" ? (
        <section className="bg-white overflow-x-auto" style={{ border: "1px solid #F6F6F6", borderRadius: 15 }}>
          <table className="w-full" style={{ minWidth: 760, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...th, paddingLeft: 24 }}>Role Name</th>
                <th style={th}>No. of Users</th>
                <th style={th}>Date Created</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.id} onClick={() => router.push(`/dashboard/settings/roles/${r.id}`)} className="cursor-pointer hover:bg-[#fafafa]">
                  <td style={{ ...cell, paddingLeft: 24 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{r.name}</span>
                      <button type="button" aria-label="Edit role name" onClick={(e) => { e.stopPropagation(); setEditRole(r); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-edit.svg" alt="" width={20} height={20} /></button>
                    </div>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{r.users}</span></td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{r.created}</span></td>
                  <td style={cell}>
                    <div className="flex items-center" style={{ gap: 24 }}>
                      <button type="button" aria-label="Manage role" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/settings/roles/${r.id}`); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-eye.svg" alt="" width={20} height={20} /></button>
                      <button type="button" aria-label="Delete role" onClick={(e) => { e.stopPropagation(); setDeleteRole(r); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : tab === "Security" ? (
        <SecurityTab />
      ) : tab === "Email Config" ? (
        <EmailTab />
      ) : tab === "Moderation Rules" ? (
        <ModerationTab />
      ) : (
        <SeoTab onSaved={() => setSuccess({ title: "Settings Saved", body: "Your platform settings have been updated successfully. The changes to your SEO configuration, meta details, and tracking integrations are now live and effective immediately." })} />
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
      {editRole && (
        <EditRoleNameModal
          currentName={editRole.name}
          onClose={() => setEditRole(null)}
          onSave={() => { setEditRole(null); setSuccess({ title: "Changes Saved", body: "Your changes have been saved successfully and are now live. Any updates you made will reflect immediately." }); }}
        />
      )}
      {deleteRole && (
        <ConfirmModal
          title="Delete Role"
          body="Are you sure you want to delete this role from the system? All users will lose their access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay except you reassign them a new role. This action cannot be undone."
          confirmLabel="Delete Role"
          onConfirm={() => { const name = deleteRole.name; setDeleteRole(null); setSuccess({ title: "Role Deleted Successfully", body: `Done! The ${name} role has been removed from the system. Anyone assigned to it has lost access, and this change has been recorded in your admin activity log.` }); }}
          onClose={() => setDeleteRole(null)}
        />
      )}
      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}
