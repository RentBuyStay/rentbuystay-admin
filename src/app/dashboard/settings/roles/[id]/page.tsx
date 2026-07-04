"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import RolePermissions from "@/components/RolePermissions";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { EmptyState } from "@/components/admin/userRows";
import { toPermMatrix, toPermissionDtos } from "@/lib/adminRoles";
import {
  useDeleteAdminRoleMutation,
  useGetAdminRolesQuery,
  useUpdateAdminRoleMutation,
} from "@/services/adminApi";

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: roles = [], isLoading } = useGetAdminRolesQuery();
  const role = roles.find((r) => r.id === params.id);
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleteRole, { isLoading: deleting }] = useDeleteAdminRoleMutation();
  const [updateRole] = useUpdateAdminRoleMutation();

  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
        Loading role…
      </div>
    );
  }
  if (!role) {
    return (
      <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <EmptyState title="Role not found" subtitle="This role may have been deleted. Go back to Platform Settings." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/settings" className="flex items-center gap-2 w-fit hover:opacity-70">
        <Image src="/icons/admin/blog/blog-back.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>Manage {role.name}</h2>
        <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-2 hover:opacity-70">
          <Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#E30045" }}>Delete Role</span>
        </button>
      </div>

      {/* Permission toggles save immediately. */}
      <RolePermissions
        key={role.id}
        initial={toPermMatrix(role)}
        onChange={(m) => updateRole({ id: role.id, body: { name: role.name, permissions: toPermissionDtos(m) } })}
      />

      {confirm && (
        <ConfirmModal
          title="Delete Role"
          body="Are you sure you want to delete this role from the system? All users will lose their access, be logged out of the panel, and will no longer be able to perform any administrative actions on RentBuyStay except you reassign them a new role. This action cannot be undone."
          confirmLabel="Delete Role"
          busy={deleting}
          onConfirm={async () => {
            try {
              await deleteRole(role.id).unwrap();
              setConfirm(false);
              setSuccess(true);
            } catch {
              setConfirm(false);
            }
          }}
          onClose={() => setConfirm(false)}
        />
      )}
      {success && (
        <SuccessModal
          title="Role Deleted Successfully"
          body={`Done! The ${role.name} role has been removed from the system. Anyone assigned to it has lost access, and this change has been recorded in your admin activity log.`}
          onClose={() => { setSuccess(false); router.push("/dashboard/settings"); }}
        />
      )}
    </div>
  );
}
