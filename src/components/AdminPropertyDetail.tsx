"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Pencil } from "lucide-react";
import { getDemoProperty } from "@/lib/demoProperties";
import { toSeekerListing, formatPrice } from "@/lib/property";
import type { PropertyStatus } from "@/services/types";
import type { Role } from "@/lib/demoUsers";

const STATUS_BADGE: Record<PropertyStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "#ECFDF3", color: "#027A48" },
  AWAITING_APPROVAL: { label: "Pending", bg: "#FFFAEB", color: "#B54708" },
  ARCHIVED: { label: "Archived", bg: "#F2F4F7", color: "#475467" },
  REJECTED: { label: "Removed", bg: "rgba(227,0,69,0.08)", color: "#E30045" },
  DRAFT: { label: "Draft", bg: "#F2F4F7", color: "#475467" },
  LIMIT_EXCEEDED: { label: "Limit exceeded", bg: "#FEF3F2", color: "#B42318" },
};

const ADMIN_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  Active: { label: "Active", bg: "#ECFDF3", color: "#027A48" },
  Archived: { label: "Archived", bg: "#F2F4F7", color: "#475467" },
  Removed: { label: "Removed", bg: "rgba(227,0,69,0.08)", color: "#E30045" },
};

const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function initialsOf(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "P";
}

const SECTION_HEADING: React.CSSProperties = {
  fontSize: 20, lineHeight: "32px", fontWeight: 600, color: "#305E82",
};

export default function AdminPropertyDetail({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const property = getDemoProperty(propertyId);
  const listing = toSeekerListing(property);

  const tagWord = listing.tag === "FOR SALE" ? "Sale" : listing.tag === "SHORTLET" ? "Shortlet" : "Rent";
  const displayTitle = `${property.title} for ${tagWord} in ${listing.location}`;
  const status = property.adminStatus ? ADMIN_STATUS[property.adminStatus] : (STATUS_BADGE[property.status] ?? STATUS_BADGE.ACTIVE);
  const images = property.photos?.length ? property.photos.map((p) => p.url) : [listing.image];
  const sqft = property.totalAreaSqm ? `${property.totalAreaSqm.toLocaleString()} sqft` : listing.sqft;

  // Lister
  const listerRole: Role = property.listerRole ?? (property.assignedAgentName ? "Agent" : "Owner");
  const listerName = property.listerName ?? property.assignedAgentName ?? property.ownerName ?? listing.seller.name;
  const listerVerified = property.listerVerified ?? true;
  const roleBadge = ROLE_BADGE[listerRole];

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-3 hover:opacity-70 self-start" style={{ fontSize: 16, lineHeight: "24px", color: "#121212" }}>
        <Image src="/icons/dash/detail-back.svg" alt="" width={20} height={20} /> Back
      </button>

      {/* Header: title + meta (left) · actions (right) */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex flex-col" style={{ gap: 16 }}>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <h1 style={{ fontSize: 24, lineHeight: "32px", fontWeight: 600, letterSpacing: "-0.02em", color: "#121212", textTransform: "capitalize" }}>
              {displayTitle}
            </h1>
            <div className="flex items-center flex-wrap" style={{ gap: 16 }}>
              {/* Lister */}
              <div className="flex items-center" style={{ gap: 12 }}>
                <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: 14, fontWeight: 600 }}>
                  {initialsOf(listerName)}
                </span>
                <div className="flex items-center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{listerName}</span>
                  {listerVerified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
                  <span className="rounded-[16px]" style={{ background: roleBadge.bg, color: roleBadge.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{listerRole}</span>
                </div>
              </div>
              {/* Location */}
              <div className="flex items-center" style={{ gap: 8 }}>
                <Image src="/icons/dash/detail-location.svg" alt="" width={24} height={24} className="shrink-0" />
                <span style={{ fontSize: 14, lineHeight: "24px", color: "#807E7E", whiteSpace: "nowrap" }}>{listing.location}</span>
              </div>
              {/* Listed */}
              <span style={{ fontSize: 14, lineHeight: "24px", letterSpacing: "-0.02em", color: "#807E7E" }}>Listed on {fmtDate(property.listedAt)}</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap" style={{ gap: 24 }}>
            {/* Views */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <Image src="/icons/dash/metric-eye.svg" alt="" width={24} height={24} />
              <span style={{ fontSize: 14, lineHeight: "24px", letterSpacing: "-0.02em", color: "#807E7E" }}>{(property.viewCount ?? 0).toLocaleString()} views</span>
            </div>
            {/* Move to: status */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", color: "#305E82" }}>Move to:</span>
              <button type="button" className="flex items-center hover:opacity-80" style={{ gap: 8, padding: "4px 12px", borderRadius: 20, background: status.bg }}>
                <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "18px", color: status.color }}>{status.label}</span>
                <ChevronDown size={16} color={status.color} />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <button type="button" className="flex items-center justify-center hover:opacity-70" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#E30045" }}>
            <Trash2 size={20} /> Remove Listing
          </button>
          <button type="button" onClick={() => router.push(`/dashboard/properties/${propertyId}/edit`)} className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
            <Pencil size={20} /> Edit Property
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col" style={{ gap: 32 }}>
        <Gallery title={property.title} images={images} />
        <PriceSpecs price={listing.price} sqft={sqft} beds={listing.beds} baths={listing.baths} />

        <div className="flex flex-col" style={{ gap: 40 }}>
          <Description text={property.description} />

          <section className="flex flex-col" style={{ gap: 16 }}>
            <h2 style={SECTION_HEADING}>Amenities &amp; Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px 72px", maxWidth: 846 }}>
              {(property.amenities ?? []).map((a) => (
                <div key={a.id} className="flex items-center" style={{ gap: 8 }}>
                  <Image src="/icons/dash/tick-circle.svg" alt="" width={24} height={24} className="shrink-0" />
                  <span style={{ fontSize: 16, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>{a.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col" style={{ gap: 16 }}>
            <h2 style={SECTION_HEADING}>Property Details</h2>
            <div className="flex flex-col" style={{ gap: 24, maxWidth: 846 }}>
              <DetailRow
                left={{ label: "PROPERTY ID", value: property.referenceCode }}
                right={{ label: "TYPE", value: property.propertyTypeName ?? "—" }}
              />
              <DetailRow
                left={{ label: "STATUS", value: status.label }}
                right={{ label: "LISTED ON", value: fmtDate(property.listedAt) }}
              />
            </div>
          </section>

          {(property.charges?.length ?? 0) > 0 && (
            <section className="flex flex-col" style={{ gap: 16 }}>
              <h2 style={SECTION_HEADING}>Additional Charges</h2>
              <div className="flex flex-col" style={{ gap: 24, maxWidth: 846 }}>
                <DetailRow
                  left={{ label: property.charges![0].title.toUpperCase(), value: formatPrice(property.charges![0].amount, property.charges![0].currency) }}
                  right={property.charges![1] ? { label: property.charges![1].title.toUpperCase(), value: formatPrice(property.charges![1].amount, property.charges![1].currency) } : undefined}
                />
              </div>
            </section>
          )}

          <ViewMap lat={listing.lat} lng={listing.lng} />
        </div>
      </div>
    </div>
  );
}

/* ── Gallery: 450px, counter bottom-left, prev/next circular ── */
function Gallery({ title, images }: { title: string; images: string[] }) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="relative" style={{ width: "100%", height: 450, background: "#F6F6F6", borderRadius: 20, overflow: "hidden" }}>
      <Image key={index} src={images[index]} alt={`${title} — photo ${index + 1}`} fill style={{ objectFit: "cover" }} sizes="1088px" priority />
      <button type="button" onClick={prev} aria-label="Previous photo" className="absolute inline-flex items-center justify-center hover:opacity-90" style={{ left: 24, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: 14, background: "rgba(18,18,18,0.25)", color: "#fff" }}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M12.5 4L6.5 10L12.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" onClick={next} aria-label="Next photo" className="absolute inline-flex items-center justify-center hover:opacity-90" style={{ right: 24, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: 14, background: "rgba(18,18,18,0.25)", color: "#fff" }}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M7.5 4L13.5 10L7.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="absolute inline-flex items-center justify-center" style={{ left: 24, bottom: 24, height: 40, padding: "0 16px", gap: 6, background: "rgba(18,18,18,0.5)", borderRadius: 10, color: "#fff" }}>
        <Image src="/icons/dash/detail-gallery.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 400 }}>{index + 1}/{total}</span>
      </div>
    </div>
  );
}

function PriceSpecs({ price, sqft, beds, baths }: { price: string; sqft: string; beds: number; baths: number }) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <div style={{ height: 1, background: "#F6F6F6" }} />
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 16 }}>
        <span style={{ fontSize: 32, lineHeight: "56px", fontWeight: 700, letterSpacing: "-0.02em", color: "#305E82" }}>{price}</span>
        <div className="flex items-center" style={{ gap: 16 }}>
          <Spec icon="/icons/dash/detail-maximize.svg" label={sqft} />
          <span style={{ width: 1, height: 14, background: "#F4F4F4" }} />
          <Spec icon="/icons/dash/detail-bed.svg" label={`${beds} Beds`} />
          <span style={{ width: 1, height: 14, background: "#F4F4F4" }} />
          <Spec icon="/icons/dash/detail-bath.svg" label={`${baths} ${baths === 1 ? "Bath" : "Baths"}`} />
        </div>
      </div>
      <div style={{ height: 1, background: "#F6F6F6" }} />
    </div>
  );
}

function Spec({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <Image src={icon} alt="" width={24} height={24} />
      <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>{label}</span>
    </div>
  );
}

function Description({ text }: { text?: string }) {
  const [expanded, setExpanded] = useState(false);
  const body = text ?? "This stunning property is situated in a prime location with top-tier finishes throughout.";
  return (
    <section className="flex flex-col" style={{ gap: 16 }}>
      <h2 style={SECTION_HEADING}>Description</h2>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <p style={{ fontSize: 16, lineHeight: "24px", color: "#121212", display: expanded ? "block" : "-webkit-box", WebkitLineClamp: expanded ? "unset" : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</p>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="self-start hover:underline" style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#305E82" }}>
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    </section>
  );
}

function DetailRow({ left, right }: { left: { label: string; value: string }; right?: { label: string; value: string } }) {
  return (
    <div className="flex justify-between flex-wrap" style={{ gap: 24 }}>
      <Cell {...left} />
      {right && <Cell {...right} />}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 8, width: 401, maxWidth: "100%" }}>
      <span style={{ fontSize: 13, letterSpacing: "-0.02em", color: "#807E7E" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" }}>{value}</span>
    </div>
  );
}

function ViewMap({ lat, lng }: { lat?: number; lng?: number }) {
  const la = lat ?? 6.5;
  const ln = lng ?? 3.4;
  const pad = 0.01;
  const bbox = `${ln - pad}%2C${la - pad}%2C${ln + pad}%2C${la + pad}`;
  return (
    <section className="flex flex-col" style={{ gap: 16 }}>
      <h2 style={SECTION_HEADING}>View Map</h2>
      <div className="relative" style={{ height: 424, borderRadius: 20, background: "#F6F6F6", overflow: "hidden" }}>
        <iframe title="Property location" src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${la}%2C${ln}`} style={{ width: "100%", height: "100%", border: "none", display: "block" }} loading="lazy" />
        <div className="absolute inline-flex items-center justify-center" style={{ left: 24, top: 24, height: 32, padding: "0 24px", gap: 16, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <span style={{ fontSize: 16, color: "#121212" }}>Map</span>
          <span style={{ width: 1, height: 16, background: "#807E7E", opacity: 0.75 }} />
          <span style={{ fontSize: 16, color: "#121212" }}>Satellite</span>
        </div>
        <button type="button" aria-label="Open map fullscreen" className="absolute inline-flex items-center justify-center hover:opacity-80" style={{ right: 24, top: 24, width: 32, height: 32, background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <Image src="/icons/dash/maximize-2.svg" alt="" width={20} height={20} />
        </button>
      </div>
    </section>
  );
}
