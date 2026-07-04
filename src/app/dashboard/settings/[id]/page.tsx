"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChangeRoleModal } from "@/components/AdminModals";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { EmptyState } from "@/components/admin/userRows";
import { fmtRoleDate } from "@/lib/adminRoles";
import {
  useGetAdminRolesQuery,
  useGetAdminUserQuery,
  useChangeUserRoleMutation,
  useSuspendUserMutation,
} from "@/services/adminApi";

const adminInitials = (name: string) => {
  const p = name.trim().split(/[\s.@_-]+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "A";
};

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const fieldLabel: React.CSSProperties = { fontSize: 13, fontWeight: 400, color: "#807E7E" };
const fieldValue: React.CSSProperties = { fontSize: 16, fontWeight: 400, color: "#121212" };

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: base, isLoading } = useGetAdminUserQuery(params.id);
  const { data: roles = [] } = useGetAdminRolesQuery();
  const [suspendUser] = useSuspendUserMutation();
  const [changeUserRole, { isLoading: changingRole }] = useChangeUserRoleMutation();
  const [changeOpen, setChangeOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const admin = base
    ? {
        id: base.id,
        name: (base.fullName && base.fullName.trim()) || base.email.split("@")[0],
        firstName: base.firstName || "—",
        lastName: base.lastName || "—",
        email: base.email,
        phone: base.phoneNumber || "—",
        added: fmtRoleDate(base.createdAt),
      }
    : null;
  const role = base?.roleName ?? (base?.userType === "SUPER_ADMIN" ? "Super Admin" : "Admin");

  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
        Loading admin…
      </div>
    );
  }
  if (!admin) {
    return (
      <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <EmptyState title="Admin not found" subtitle="This account may have been removed. Go back to Platform Settings." />
      </div>
    );
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
      <span style={fieldLabel}>{label}</span>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Back */}
      <Link href="/dashboard/settings" className="flex items-center gap-2 w-fit hover:opacity-70">
        <Image src="/icons/admin/blog/blog-back.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      {/* Identity + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center" style={{ gap: 16 }}>
          <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 64, height: 64, background: "rgba(48,94,130,0.08)", color: "#305E82", fontSize: 22, fontWeight: 600 }}>
            {adminInitials(admin.name)}
          </span>
          <div className="flex flex-col gap-2">
            <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>{admin.name}</h2>
            <span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>{admin.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => setRemoving(true)} className="flex items-center gap-2 hover:opacity-70">
            <Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#E30045" }}>Remove Admin</span>
          </button>
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="flex items-center justify-center gap-2 text-white hover:opacity-90"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/blog/blog-edit-white.svg" alt="" width={20} height={20} /> Change Role
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        <Field label="First Name"><span style={fieldValue}>{admin.firstName}</span></Field>
        <Field label="Last Name"><span style={fieldValue}>{admin.lastName}</span></Field>
        <Field label="Email Address"><span style={fieldValue}>{admin.email}</span></Field>
        <Field label="Phone Number"><span style={fieldValue}>{admin.phone}</span></Field>
        <Field label="Role">
          <span className="inline-flex items-center rounded-[16px] w-fit" style={{ background: hexA("#305E82", 0.08), color: "#305E82", fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{role}</span>
        </Field>
        <Field label="Added on"><span style={fieldValue}>{admin.added}</span></Field>
      </div>

      {changeOpen && (
        <ChangeRoleModal
          currentRole={role}
          roleOptions={roles.map((r) => r.name)}
          busy={changingRole}
          onClose={() => setChangeOpen(false)}
          onSave={async (roleName: string) => {
            const target = roles.find((r) => r.name === roleName);
            if (!target) return;
            try {
              await changeUserRole({ id: params.id, roleId: target.id }).unwrap();
              setChangeOpen(false);
              setSuccess({ title: "Role Updated Successfully", body: `Done! This admin's role has been changed to ${roleName}. The new permissions take effect the next time they sign in.` });
            } catch {
              // keep the modal open on failure
            }
          }}
        />
      )}
      {removing && (
        <ConfirmModal
          title="Remove Admin"
          body={`Are you sure you want to remove ${admin.name} from the system? They will immediately lose all admin access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay. This action cannot be undone.`}
          confirmLabel="Remove Admin"
          onConfirm={async () => {
            try {
              await suspendUser({ id: admin.id, reason: "Admin access revoked", notifyUser: true }).unwrap();
              setRemoving(false);
              setSuccess({ title: "Admin Removed Successfully", body: `Done! ${admin.name} has been suspended. Their access has been revoked immediately and all active sessions have been terminated. This change has been recorded in your admin activity log.` });
            } catch {
              setRemoving(false);
            }
          }}
          onClose={() => setRemoving(false)}
        />
      )}
      {success && (
        <SuccessModal
          title={success.title}
          body={success.body}
          onClose={() => { const wasRemoved = success.title.startsWith("Admin Removed"); setSuccess(null); if (wasRemoved) router.push("/dashboard/settings"); }}
        />
      )}
    </div>
  );
}
