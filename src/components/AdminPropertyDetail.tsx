"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Pencil, X } from "lucide-react";
import { toSeekerListing, formatPrice } from "@/lib/property";
import type { PropertyStatus } from "@/services/types";
import type { Role } from "@/lib/demoUsers";
import { EmptyState } from "@/components/admin/userRows";
import {
  useApprovePropertyMutation,
  useArchiveAdminPropertyMutation,
  useGetAdminPropertiesQuery,
  useGetAwaitingPropertiesQuery,
  useRejectPropertyMutation,
  useRemovePropertyMutation,
} from "@/services/adminApi";

const STATUS_BADGE: Record<PropertyStatus, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Active", bg: "#ECFDF3", color: "#027A48" },
  AWAITING_APPROVAL: { label: "Pending", bg: "#FFF7E9", color: "#EA651A" },
  ARCHIVED: { label: "Archived", bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  REJECTED: { label: "Removed", bg: "rgba(227,0,69,0.05)", color: "#E30045" },
  DRAFT: { label: "Draft", bg: "#F2F4F7", color: "#475467" },
  LIMIT_EXCEEDED: { label: "Limit exceeded", bg: "#FEF3F2", color: "#B42318" },
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

function relativeTime(iso?: string): string {
  if (!iso) return "recently";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "recently";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) { const w = Math.floor(days / 7); return `${w} week${w > 1 ? "s" : ""} ago`; }
  if (days < 365) { const m = Math.floor(days / 30); return `${m} month${m > 1 ? "s" : ""} ago`; }
  const y = Math.floor(days / 365);
  return `${y} year${y > 1 ? "s" : ""} ago`;
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
  // Pending listings aren't reachable via the public /properties/{id}, so read
  // from the admin lists (both queries are already cached by the list pages).
  const { data: allPage, isLoading: loadingAll } = useGetAdminPropertiesQuery({ page: 0, size: 100 });
  const { data: awaitingPage, isLoading: loadingAwaiting } = useGetAwaitingPropertiesQuery({ page: 0, size: 100 });
  const [approveProperty, { isLoading: approving }] = useApprovePropertyMutation();
  const [rejectProperty, { isLoading: rejecting }] = useRejectPropertyMutation();
  const [removeProperty, { isLoading: removing }] = useRemovePropertyMutation();
  const [archiveProperty, { isLoading: archiving }] = useArchiveAdminPropertyMutation();

  const property =
    (awaitingPage?.content ?? []).find((p) => p.id === propertyId) ??
    (allPage?.content ?? []).find((p) => p.id === propertyId);

  if (loadingAll || loadingAwaiting) {
    return (
      <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
        Loading property…
      </div>
    );
  }
  if (!property) {
    return (
      <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <EmptyState title="Property not found" subtitle="This listing may have been removed, or it hasn't loaded yet. Go back and try again." />
      </div>
    );
  }
  return <DetailBody property={property} propertyId={propertyId} router={router} actions={{
    approve: () => approveProperty(propertyId).unwrap().catch(() => {}),
    reject: () => rejectProperty({ id: propertyId }).unwrap().catch(() => {}),
    remove: async () => {
      try {
        await removeProperty(propertyId).unwrap();
        router.push("/dashboard/properties");
      } catch {
        // stay on the page if removal failed
      }
    },
    archive: () => archiveProperty({ id: propertyId }).unwrap().catch(() => {}),
    busy: approving || rejecting || removing || archiving,
  }} />;
}

type DetailActions = { approve: () => void; reject: () => void; remove: () => void; archive: () => void; busy: boolean };

function DetailBody({
  property,
  propertyId,
  router,
  actions,
}: {
  property: import("@/services/types").PropertyResponse;
  propertyId: string;
  router: ReturnType<typeof useRouter>;
  actions: DetailActions;
}) {
  const listing = toSeekerListing(property);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const tagWord = listing.tag === "FOR SALE" ? "Sale" : listing.tag === "SHORTLET" ? "Shortlet" : "Rent";
  const displayTitle = `${property.title} for ${tagWord} in ${listing.location}`;
  const status = STATUS_BADGE[property.status] || STATUS_BADGE.ACTIVE;
  const images = property.photos?.length ? property.photos.map((p) => p.url) : [listing.image];
  const sqft = property.totalAreaSqm ? `${property.totalAreaSqm.toLocaleString()} sqft` : listing.sqft;

  // Lister
  const listerRole: Role = property.assignedAgentName ? "Agent" : property.organizationId ? "Agency" : "Owner";
  const listerName = property.assignedAgentName ?? property.ownerName ?? listing.seller.name;
  const listerVerified = false;
  const roleBadge = ROLE_BADGE[listerRole];
  const approvalFlow = property.status === "AWAITING_APPROVAL" || property.status === "REJECTED";
  const isRejected = property.status === "REJECTED";

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
              {/* Listed / Submitted */}
              <span style={{ fontSize: 14, lineHeight: "24px", letterSpacing: "-0.02em", color: "#807E7E" }}>
                {approvalFlow ? `Submitted ${relativeTime(property.listedAt)}` : `Listed on ${fmtDate(property.listedAt)}`}
              </span>
            </div>
          </div>

          {!approvalFlow && (
            <div className="flex items-center flex-wrap" style={{ gap: 24 }}>
              {/* Views */}
              <div className="flex items-center" style={{ gap: 8 }}>
                <Image src="/icons/dash/metric-eye.svg" alt="" width={24} height={24} />
                <span style={{ fontSize: 14, lineHeight: "24px", letterSpacing: "-0.02em", color: "#807E7E" }}>{(property.viewCount ?? 0).toLocaleString()} views</span>
              </div>
              {/* Move to: status */}
              <div className="relative flex items-center" style={{ gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", color: "#305E82" }}>Move to:</span>
                <button type="button" onClick={() => setStatusMenuOpen((v) => !v)} className="flex items-center hover:opacity-80" style={{ gap: 8, padding: "4px 12px", borderRadius: 20, background: status.bg }}>
                  <span style={{ fontSize: 12, fontWeight: 500, lineHeight: "18px", color: status.color }}>{status.label}</span>
                  <ChevronDown size={16} color={status.color} />
                </button>
                {statusMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusMenuOpen(false)} aria-hidden="true" />
                    <div
                      className="absolute left-16 top-9 z-20 bg-white rounded-[12px] border border-[#F6F6F6] overflow-hidden flex flex-col py-2"
                      style={{ minWidth: 180, boxShadow: "0px 15px 40px rgba(165,165,165,0.25)" }}
                    >
                      {/* Available admin transitions: archive + remove for published
                          listings (approve/reject apply to pending listings via the
                          header buttons; no restore path exists for archived ones). */}
                      {property.status === "ACTIVE" ? (
                        <>
                          <button
                            type="button"
                            disabled={actions.busy}
                            onClick={() => { setStatusMenuOpen(false); actions.archive(); }}
                            className="flex items-center w-full px-4 text-left hover:bg-[#fafafa] disabled:opacity-50"
                            style={{ height: 40, fontSize: 13, fontWeight: 500, color: "#8A38F5" }}
                          >
                            Archived
                          </button>
                          <button
                            type="button"
                            disabled={actions.busy}
                            onClick={() => { setStatusMenuOpen(false); actions.remove(); }}
                            className="flex items-center w-full px-4 text-left hover:bg-[#fafafa] disabled:opacity-50"
                            style={{ height: 40, fontSize: 13, fontWeight: 500, color: "#E30045" }}
                          >
                            Removed
                          </button>
                        </>
                      ) : (
                        <span className="flex items-center px-4" style={{ height: 40, fontSize: 13, color: "#807E7E" }}>
                          No status change available
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isRejected ? (
          <span className="inline-flex items-center self-start" style={{ padding: "4px 12px", borderRadius: 16, background: "#FFF7E9", color: "#EA651A", fontSize: 16, fontWeight: 500, lineHeight: "18px" }}>
            Rejected
          </span>
        ) : approvalFlow ? (
          <div className="flex items-center" style={{ gap: 16 }}>
            <button type="button" onClick={actions.reject} disabled={actions.busy} className="flex items-center justify-center hover:opacity-70 disabled:opacity-50" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#E30045" }}>
              <X size={20} /> Reject
            </button>
            <button type="button" onClick={actions.approve} disabled={actions.busy} className="flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
              <Image src="/icons/admin/verify/approve-check.svg" alt="" width={20} height={20} /> Approve
            </button>
          </div>
        ) : (
          <div className="flex items-center" style={{ gap: 16 }}>
            <button type="button" onClick={actions.remove} disabled={actions.busy} className="flex items-center justify-center hover:opacity-70 disabled:opacity-50" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#E30045" }}>
              <Trash2 size={20} /> Remove Listing
            </button>
            <button type="button" onClick={() => router.push(`/dashboard/properties/${propertyId}/edit`)} className="flex items-center justify-center text-white hover:opacity-90" style={{ height: 48, padding: "8px 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}>
              <Pencil size={20} /> Edit Property
            </button>
          </div>
        )}
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
