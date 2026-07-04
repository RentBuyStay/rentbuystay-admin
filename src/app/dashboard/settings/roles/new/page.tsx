"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RolePermissions from "@/components/RolePermissions";
import { SuccessModal } from "@/components/PlanModals";
import { EMPTY_PERMS, type PermMatrix } from "@/lib/demoRoles";
import { toPermissionDtos } from "@/lib/adminRoles";
import { useCreateAdminRoleMutation } from "@/services/adminApi";

const fieldBase = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";

export default function Page() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<PermMatrix>(EMPTY_PERMS);
  const [createRole, { isLoading: creating }] = useCreateAdminRoleMutation();

  const handleCreate = async () => {
    if (creating || !name.trim()) return;
    try {
      await createRole({ name: name.trim(), permissions: toPermissionDtos(perms) }).unwrap();
      setSuccess(true);
    } catch {
      // stay on the page; nothing lost
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/settings" className="flex items-center gap-2 w-fit hover:opacity-70">
        <Image src="/icons/admin/blog/blog-back.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>Create New Role</h2>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center justify-center text-white hover:opacity-90 disabled:opacity-60"
          style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          {creating ? "Creating…" : "Create Role"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>Role Name</label>
        <input className={`${fieldBase} h-12 px-4`} placeholder="Enter role name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-4">
        <span style={{ fontSize: 16, fontWeight: 600, color: "#121212" }}>Forms &amp; Pages</span>
        <RolePermissions initial={EMPTY_PERMS} onChange={setPerms} />
      </div>

      {success && (
        <SuccessModal
          title="Role Created Successfully"
          body="Well-done! You’ve successfully created a new role for the admin system and assigned permissions. You can track or create new one from Admin Settings."
          onClose={() => { setSuccess(false); router.push("/dashboard/settings"); }}
        />
      )}
    </div>
  );
}
