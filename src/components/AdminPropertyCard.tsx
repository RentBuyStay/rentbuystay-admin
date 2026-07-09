"use client";

import Image from "next/image";
import Link from "next/link";
import type { Role } from "@/lib/demoUsers";
import { PropertyCardImage } from "@/components/PropertyGallery";

export type AdminPropertyStatus = "Active" | "Archived" | "Removed" | "Awaiting Approval" | "Rejected";

export type AdminProperty = {
  id: string;
  image: string;
  images?: string[];
  listingType: "For Rent" | "For Sale" | "Shortlet";
  price: string;
  priceSuffix?: string;
  status: AdminPropertyStatus;
  title: string;
  location: string;
  sqft: string;
  beds: number;
  baths: number;
  lister: { name: string; initials: string; verified: boolean; role: Role };
};

const STATUS_BADGE: Record<AdminPropertyStatus, { bg: string; color: string }> = {
  Active: { bg: "#ECFDF3", color: "#027A48" },
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Removed: { bg: "rgba(227,0,69,0.05)", color: "#E30045" },
  "Awaiting Approval": { bg: "#FFF7E9", color: "#EA651A" },
  Rejected: { bg: "#FFF7E9", color: "#EA651A" },
};

const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

export default function AdminPropertyCard({ property: p, hideTrash, onDelete }: { property: AdminProperty; hideTrash?: boolean; onDelete?: (id: string) => void }) {
  const status = STATUS_BADGE[p.status];
  const role = ROLE_BADGE[p.lister.role];
  return (
    <Link href={`/dashboard/properties/${p.id}`} className="flex flex-col bg-white overflow-hidden hover:shadow-md transition-shadow" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
      {/* Image + listing-type pill */}
      <div className="relative" style={{ height: 218, background: "#EDEDED" }}>
        <PropertyCardImage images={p.images ?? [p.image]} alt={p.title} sizes="352px" />
        <span
          className="absolute z-10 inline-flex items-center justify-center"
          style={{ right: 16, bottom: 16, height: 32, padding: "0 8px", background: "#FFAE00", color: "#FFFFFF", borderRadius: 50, fontSize: 12, fontWeight: 600, lineHeight: "20px" }}
        >
          {p.listingType}
        </span>
      </div>

      {/* Price + status + trash, title, location */}
      <div className="flex flex-col px-4 pt-4" style={{ gap: 8 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: "#305E82" }}>
              {p.price}
              {p.priceSuffix && <span style={{ fontSize: 12, fontWeight: 400, color: "#807E7E" }}>{p.priceSuffix}</span>}
            </span>
            <span className="rounded-[16px]" style={{ background: status.bg, color: status.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{p.status}</span>
          </div>
          {!hideTrash && (
            <button type="button" aria-label="Delete listing" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(p.id); }} className="hover:opacity-70 shrink-0">
              <Image src="/icons/admin/prop-trash.svg" alt="" width={20} height={20} />
            </button>
          )}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", color: "#121212" }}>{p.title}</h3>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Image src="/icons/dash/card-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: 12, lineHeight: "20px", color: "#305E82" }}>{p.location}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F6F6F6", marginTop: 16 }} />

      {/* Specs */}
      <div className="flex items-center px-4 py-4" style={{ gap: 16 }}>
        <Spec icon="/icons/dash/card-maximize.svg" label={p.sqft} />
        <Sep />
        <Spec icon="/icons/dash/card-bed.svg" label={`${p.beds} Beds`} />
        <Sep />
        <Spec icon="/icons/dash/card-bath.svg" label={`${p.baths} ${p.baths === 1 ? "Bath" : "Baths"}`} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#F6F6F6" }} />

      {/* Lister */}
      <div className="flex items-center px-4 py-4" style={{ gap: 12 }}>
        <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: 14, fontWeight: 600 }}>
          {p.lister.initials}
        </span>
        <div className="flex items-center min-w-0" style={{ gap: 8 }}>
          <span className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{p.lister.name}</span>
          {p.lister.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} className="shrink-0" />}
          <span className="rounded-[16px] shrink-0" style={{ background: role.bg, color: role.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{p.lister.role}</span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: 12, lineHeight: "24px", color: "#807E7E" }}>{label}</span>
    </div>
  );
}

function Sep() {
  return <span style={{ width: 1, height: 14, background: "#F6F6F6" }} />;
}
