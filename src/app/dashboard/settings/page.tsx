"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddAdminModal, EditRoleNameModal, type AddAdminValues } from "@/components/AdminModals";
import {
  useAddNewAdminMutation,
  useCreateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useGetAdminRolesQuery,
  useGetAdminUsersQuery,
  useSuspendUserMutation,
  useUpdateAdminRoleMutation,
  type AdminRoleItem,
  type AdminUser,
} from "@/services/adminApi";
import { fmtRoleDate } from "@/lib/adminRoles";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { usePermissions } from "@/hooks/usePermissions";
import { SecurityTab, EmailTab, ModerationTab, SeoTab } from "@/components/SettingsTabs";

const TABS = ["Administrators", "Roles & Permissions", "Security", "Email Config", "Moderation Rules", "SEO Settings"] as const;
type Tab = (typeof TABS)[number];

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const th: React.CSSProperties = { height: 44, padding: "0 16px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E", textAlign: "left" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px", borderBottom: "1px solid #F6F6F6" };

const ROLE_PILL_COLORS = ["#305E82", "#8A38F5", "#DC8E1D", "#009D35"];

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Administrators");
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<AdminRoleItem | null>(null);
  const [deleteRole, setDeleteRole] = useState<AdminRoleItem | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const { data: usersPage } = useGetAdminUsersQuery({ page: 0, size: 200 });
  const { data: roles = [] } = useGetAdminRolesQuery();
  const [addNewAdmin, { isLoading: addingAdmin }] = useAddNewAdminMutation();
  const { isSuperAdmin } = usePermissions();
  // Admin & role management endpoints are SUPER_ADMIN-only on the backend.
  const canManageSettings = isSuperAdmin;
  const [suspendUser] = useSuspendUserMutation();
  const [updateRole] = useUpdateAdminRoleMutation();
  const [deleteRoleMut, { isLoading: deletingRole }] = useDeleteAdminRoleMutation();
  const [createRole] = useCreateAdminRoleMutation();
  void createRole;

  // Dynamic admins = users with ADMIN type (SUPER_ADMIN is the root account).
  const admins = (usersPage?.content ?? []).filter((u) => u.userType === "ADMIN" || u.userType === "SUPER_ADMIN");
  const roleColor = (name?: string | null) => {
    const idx = Math.max(0, roles.findIndex((r) => r.name === name));
    return ROLE_PILL_COLORS[idx % ROLE_PILL_COLORS.length];
  };
  const roleUserCount = (roleId: string) => {
    const counts = admins.filter((a) => a.roleId === roleId).length;
    return admins.some((a) => a.roleId) ? String(counts) : "—";
  };
  const fmtDate = fmtRoleDate;

  const handleAddAdmin = async (v: AddAdminValues) => {
    const role = roles.find((r) => r.name === v.roleName);
    if (!role) return;
    try {
      await addNewAdmin({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phoneNumber,
        roleId: role.id,
        password: v.password,
        confirmPassword: v.confirmPassword,
      }).unwrap();
      setAddOpen(false);
      setSuccess({ title: "Admin Invite Sent", body: "An invitation email has been sent with a log in link and credentials. Once they sign in, their account will be active and ready for use based on their role. You can track or resend the invite from Admin Settings." });
    } catch {
      // keep the modal open (validation errors, duplicate email, …)
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removing) return;
    try {
      // No delete-user endpoint exists — suspension revokes access immediately.
      await suspendUser({ id: removing.id, reason: "Admin access revoked", notifyUser: true }).unwrap();
      const name = removing.email;
      setRemoving(null);
      setSuccess({ title: "Admin Removed Successfully", body: `Done! ${name} has been suspended. Their access has been revoked immediately and all active sessions have been terminated. This change has been recorded in your admin activity log.` });
    } catch {
      setRemoving(null);
    }
  };

  const handleRenameRole = async (name: string) => {
    if (!editRole) return;
    try {
      await updateRole({ id: editRole.id, body: { name, permissions: editRole.permissions ?? [] } }).unwrap();
      setEditRole(null);
      setSuccess({ title: "Changes Saved", body: "Your changes have been saved successfully and are now live. Any updates you made will reflect immediately." });
    } catch {
      // keep modal open
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;
    try {
      await deleteRoleMut(deleteRole.id).unwrap();
      const name = deleteRole.name;
      setDeleteRole(null);
      setSuccess({ title: "Role Deleted Successfully", body: `Done! The ${name} role has been removed from the system. Anyone assigned to it has lost access, and this change has been recorded in your admin activity log.` });
    } catch {
      setDeleteRole(null);
    }
  };

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
        {tab === "Administrators" && canManageSettings && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "0 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/blog/blog-add.svg" alt="" width={20} height={20} /> New Admin
          </button>
        )}
        {tab === "Roles & Permissions" && canManageSettings && (
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
              {admins.map((a) => {
                const roleName = a.roleName ?? (a.userType === "SUPER_ADMIN" ? "Super Admin" : "Admin");
                const color = a.userType === "SUPER_ADMIN" ? "#305E82" : roleColor(a.roleName);
                return (
                <tr key={a.id} onClick={() => router.push(`/dashboard/settings/${a.id}`)} className="cursor-pointer hover:bg-[#fafafa]">
                  <td style={{ ...cell, paddingLeft: 24 }}>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{a.email.split("@")[0]}</span>
                      <span style={{ fontSize: 12, fontWeight: 400, color: "#807E7E" }}>{a.email}</span>
                    </div>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{a.phoneNumber || "—"}</span></td>
                  <td style={cell}>
                    <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(color, 0.08), color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{roleName}</span>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{fmtDate(a.createdAt)}</span></td>
                  <td style={cell}>
                    <div className="flex items-center" style={{ gap: 24 }}>
                      <button type="button" aria-label="Edit admin" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/settings/${a.id}`); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-edit.svg" alt="" width={20} height={20} /></button>
                      <button type="button" aria-label="Remove admin" onClick={(e) => { e.stopPropagation(); setRemoving(a); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
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
              {roles.map((r) => (
                <tr key={r.id} onClick={() => router.push(`/dashboard/settings/roles/${r.id}`)} className="cursor-pointer hover:bg-[#fafafa]">
                  <td style={{ ...cell, paddingLeft: 24 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{r.name}</span>
                      <button type="button" aria-label="Edit role name" onClick={(e) => { e.stopPropagation(); setEditRole(r); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-edit.svg" alt="" width={20} height={20} /></button>
                    </div>
                  </td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{roleUserCount(r.id)}</span></td>
                  <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{fmtDate(r.createdAt)}</span></td>
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
          roleOptions={roles.map((r) => r.name)}
          busy={addingAdmin}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAddAdmin}
        />
      )}
      {removing && (
        <ConfirmModal
          title="Remove Admin"
          body={`Are you sure you want to remove ${removing.email} from the system? They will immediately lose all admin access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay. This action cannot be undone.`}
          confirmLabel="Remove Admin"
          onConfirm={handleRemoveAdmin}
          onClose={() => setRemoving(null)}
        />
      )}
      {editRole && (
        <EditRoleNameModal
          currentName={editRole.name}
          onClose={() => setEditRole(null)}
          onSave={handleRenameRole}
        />
      )}
      {deleteRole && (
        <ConfirmModal
          title="Delete Role"
          body="Are you sure you want to delete this role from the system? All users will lose their access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay except you reassign them a new role. This action cannot be undone."
          confirmLabel="Delete Role"
          busy={deletingRole}
          onConfirm={handleDeleteRole}
          onClose={() => setDeleteRole(null)}
        />
      )}
      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}
