"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Bell, UserX, Star, ChevronDown } from "lucide-react";
import SeekerPropertyCard, { type SeekerListing } from "@/components/SeekerPropertyCard";
import { type Agent } from "@/components/AgentCard";
import {
  useGetAdminUserQuery,
  useGetAdminPropertiesQuery,
  useGetSubjectReviewsQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
} from "@/services/adminApi";
import { useGetAgentsQuery } from "@/services/agentApi";
import { toSeekerListing } from "@/lib/property";
import { EmptyState as RichEmptyState } from "@/components/admin/userRows";
import NotifyUserModal from "@/components/admin/NotifyUserModal";

/* Per-role badge colors (text = solid, bg = same hue @8%), from the Figma detail variants. */
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
  Admin: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Staff: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
};

const ROLE_BY_TYPE: Record<string, string> = {
  PROPERTY_SEEKER: "Seeker",
  PROPERTY_OWNER: "Owner",
  PROPERTY_AGENT: "Agent",
  PROPERTY_AGENCY: "Agency",
  AGENCY_STAFF: "Staff",
  ADMIN: "Admin",
  SUPER_ADMIN: "Admin",
};

function relTime(iso?: string): string {
  if (!iso) return "recently";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "recently";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) { const w = Math.floor(days / 7); return `${w} week${w > 1 ? "s" : ""} ago`; }
  if (days < 365) { const m = Math.floor(days / 30); return `${m} month${m > 1 ? "s" : ""} ago`; }
  const y = Math.floor(days / 365);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}

/* Field: 13px label / 16px-Medium value, column gap 8, fixed 300px (Figma EL-aeb7c54b). */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 w-[300px] max-w-full">
      <span style={{ fontSize: 13, color: "#807E7E", letterSpacing: "-0.02em" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "32px", color: "#121212", letterSpacing: "-0.02em" }}>{value}</span>
    </div>
  );
}

const NS = "Not Specified";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = String(params?.id ?? "");

  // Authoritative single-user record; listings/agents/reviews come from their
  // own endpoints (they're not part of the user payload).
  const { data: detail, isLoading: loadingUser } = useGetAdminUserQuery(userId);
  const { data: agentsPage } = useGetAgentsQuery({ size: 200 });
  const { data: propsPage } = useGetAdminPropertiesQuery({ page: 0, size: 100 });
  const [suspendUser, { isLoading: suspending }] = useSuspendUserMutation();
  const [unsuspendUser, { isLoading: unsuspending }] = useUnsuspendUserMutation();
  const [notifyOpen, setNotifyOpen] = useState(false);

  const base = detail;
  const org = detail?.organization;

  const role = base ? ROLE_BY_TYPE[base.userType] ?? "Seeker" : "Seeker";
  const isAgency = role === "Agency";
  const isAgent = role === "Agent";

  const name =
    (base?.fullName && base.fullName.trim()) ||
    [base?.firstName, base?.lastName].filter(Boolean).join(" ") ||
    base?.organizationName ||
    base?.companyName ||
    base?.email?.split("@")[0] ||
    "—";
  const joinedDate = base?.createdAt ? new Date(base.createdAt) : null;
  const NSDASH = "Not Specified";
  const user = {
    name,
    email: base?.email ?? "—",
    role,
    verified: Boolean(base?.identityVerified || base?.businessVerified),
    joined: joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    firstName: base?.firstName ?? "",
    lastName: base?.lastName ?? "",
    phone: base?.phoneNumber ?? "",
    state: base?.state ?? org?.state ?? "",
    city: base?.city ?? org?.city ?? "",
    bio: base?.bio || org?.bio || NSDASH,
    whatsapp: base?.whatsappNumber ?? "",
    website: org?.website ?? "",
    officeAddress: org?.officeAddress ?? "",
    companyRegNo: org?.registrationNumber ?? "",
    esvarbonLicence: "",
    yearEstablished: org?.yearEstablished ? String(org.yearEstablished) : "",
    affiliatedWith: base?.organizationName ?? "",
    logoUrl: org?.logoUrl ?? undefined,
    avatarUrl: base?.avatarUrl ?? undefined,
  };

  const tabs = isAgency
    ? ["Profile Details", "Agents", "Listings", "Reviews"]
    : isAgent
    ? ["Profile Details", "Assigned Listings", "Reviews"]
    : ["Profile Details", "Listings", "Reviews"];
  const [tab, setTab] = useState("Profile Details");

  // Their listings across the platform (owned, assigned, or via their org).
  const listings: SeekerListing[] = (propsPage?.content ?? [])
    .filter((p) => p.ownerUserId === userId || p.assignedAgentUserId === userId || (!!base?.organizationId && p.organizationId === base.organizationId))
    .map(toSeekerListing);

  // Agency roster from the public agents directory.
  const agents: Agent[] = (agentsPage?.content ?? [])
    .filter((a) => !!base?.organizationId && a.organizationId === base.organizationId)
    .map((a) => {
      const fullName = [a.firstName, a.lastName].filter(Boolean).join(" ") || "—";
      return {
        id: a.userId,
        name: fullName,
        avatar: a.avatarUrl ?? "",
        initials: initials(fullName),
        company: a.organizationName ?? name,
        location: [a.city, a.state].filter(Boolean).join(", ") || "—",
        rating: a.averageRating ? a.averageRating.toFixed(1) : "New",
        listings: `${a.listingCount ?? 0} listings`,
        verified: !!a.identityVerified,
        contactUserId: a.userId,
      };
    });

  // Reviews target the agent (userId) or the agency (organizationId).
  const reviewSubject = isAgency && base?.organizationId
    ? { subjectType: "AGENCY" as const, subjectId: base.organizationId }
    : { subjectType: "AGENT" as const, subjectId: userId };
  const { data: reviewsPage } = useGetSubjectReviewsQuery(reviewSubject, { skip: !base });
  const REVIEWS = (reviewsPage?.content ?? []).map((r) => ({
    name: [r.reviewerFirstName, r.reviewerLastName].filter(Boolean).join(" ") || "Anonymous",
    avatar: "",
    rating: r.rating,
    time: relTime(r.createdAt),
    text: r.body ?? "",
  }));

  const isSuspended = base?.status === "SUSPENDED";
  const handleSuspendToggle = async () => {
    if (!base || suspending || unsuspending) return;
    try {
      if (isSuspended) await unsuspendUser(userId).unwrap();
      else await suspendUser({ id: userId, reason: "Suspended by admin", notifyUser: true }).unwrap();
    } catch {
      // page re-renders from tag invalidation; state unchanged on failure
    }
  };

  if (loadingUser) {
    return (
      <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
        Loading user…
      </div>
    );
  }
  if (!base) {
    return (
      <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <RichEmptyState title="User not found" subtitle="This account may have been removed, or it hasn't loaded yet. Go back and try again." />
      </div>
    );
  }

  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.Owner;
  const avatarImg = user.logoUrl || user.avatarUrl;

  return (
    <div className="flex flex-col gap-10">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-3 hover:opacity-70 self-start" style={{ fontSize: 16, color: "#121212" }}>
        <Image src="/icons/dash/detail-back.svg" alt="" width={20} height={20} /> Back
      </button>

      {/* Header: avatar + name block (left) · actions (right) */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <span
            className="relative flex items-center justify-center rounded-full shrink-0 overflow-hidden"
            style={{ width: 120, height: 120, background: "rgba(48,94,130,0.05)" }}
          >
            {avatarImg ? (
              <Image src={avatarImg} alt={user.name} fill sizes="120px" style={{ objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#305E82", fontSize: 42, fontWeight: 700 }}>{initials(user.name)}</span>
            )}
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>{user.name}</h1>
              {user.verified && <Image src="/icons/admin/verify-badge.svg" alt="verified" width={20} height={20} />}
              <span className="rounded-[16px]" style={{ background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{user.role}</span>
            </div>
            <span style={{ fontSize: 14, color: "#807E7E" }}>{user.email}</span>
            {isAgent && user.affiliatedWith && (
              <span style={{ fontSize: 12, lineHeight: "24px", color: "#807E7E" }}>
                Affiliated with <span style={{ fontSize: 14, fontWeight: 600, color: "#305E82" }}>{user.affiliatedWith}</span>
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 500, color: "#FFAE00" }}>Member since {user.joined}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSuspendToggle} disabled={suspending || unsuspending} className="flex items-center gap-2 hover:opacity-70 disabled:opacity-50" style={{ height: 48, padding: "8px 24px", fontSize: 14, fontWeight: 500, color: isSuspended ? "#009D35" : "#E30045" }}>
            <UserX size={20} /> {isSuspended ? "Reactivate User" : "Suspend User"}
          </button>
          <button
            onClick={() => setNotifyOpen(true)}
            className="flex items-center gap-2 text-white hover:opacity-90"
            style={{ height: 48, padding: "8px 24px", fontSize: 14, fontWeight: 500, borderRadius: 12, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Bell size={20} /> Send Notification
          </button>
        </div>
      </div>

      {notifyOpen && (
        <NotifyUserModal userId={userId} userName={user.name !== "—" ? user.name : user.email} onClose={() => setNotifyOpen(false)} />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 -mt-4">
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 12, fontWeight: 500, padding: "8px 12px",
                color: active ? "#305E82" : "#807E7E",
                borderBottom: active ? "1px solid #305E82" : "1px solid transparent",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Profile Details */}
      {tab === "Profile Details" && (
        isAgency ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="Company Name" value={user.name} />
              <Field label="Email Address" value={user.email} />
              <Field label="Phone Number" value={user.phone || NS} />
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="Whatsapp Number" value={user.whatsapp || NS} />
              <Field label="Website" value={user.website || NS} />
              <Field label="State" value={user.state || NS} />
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="City" value={user.city || NS} />
              <Field label="Office Address" value={user.officeAddress || NS} />
              <Field label="Company Reg No" value={user.companyRegNo || NS} />
            </div>
            <div className="flex flex-wrap gap-x-[94px] gap-y-10">
              <Field label="ESVARBON Licence Number" value={user.esvarbonLicence || NS} />
              <Field label="Year Established" value={user.yearEstablished || NS} />
            </div>
            <div className="flex flex-col gap-2">
              <span style={{ fontSize: 13, color: "#807E7E", letterSpacing: "-0.02em" }}>Bio</span>
              <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "32px", color: "#121212", letterSpacing: "-0.02em" }}>{user.bio}</span>
            </div>
          </div>
        ) : isAgent ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="First Name" value={user.firstName || NS} />
              <Field label="Last Name" value={user.lastName || NS} />
              <Field label="Email Address" value={user.email} />
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="Phone Number" value={user.phone || NS} />
              <Field label="Whatsapp Number" value={user.whatsapp || NS} />
              <Field label="State" value={user.state || NS} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-10">
              <Field label="City" value={user.city || NS} />
            </div>
            <div className="flex flex-col gap-2">
              <span style={{ fontSize: 13, color: "#807E7E", letterSpacing: "-0.02em" }}>Bio</span>
              <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "32px", color: "#121212", letterSpacing: "-0.02em" }}>{user.bio}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="First Name" value={user.firstName || NS} />
              <Field label="Last Name" value={user.lastName || NS} />
              <Field label="Email Address" value={user.email} />
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
              <Field label="Phone Number" value={user.phone || NS} />
              <Field label="State" value={user.state || NS} />
              <Field label="City" value={user.city || NS} />
            </div>
            <div className="flex flex-col gap-2">
              <span style={{ fontSize: 13, color: "#807E7E", letterSpacing: "-0.02em" }}>Bio</span>
              <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "32px", color: "#121212", letterSpacing: "-0.02em" }}>{user.bio}</span>
            </div>
          </div>
        )
      )}

      {/* Agents (agency only) — same AgentCard the app uses in the agency dashboard */}
      {tab === "Agents" && (
        agents.length === 0 ? (
          <EmptyState>No agents listed for this agency yet.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 24 }}>
            {agents.map((a) => (
              <AgencyAgentCard key={a.id} agent={a} />
            ))}
          </div>
        )
      )}

      {/* Listings — same card the rest of the app uses (SeekerPropertyCard) */}
      {(tab === "Listings" || tab === "Assigned Listings") && (
        listings.length === 0 ? (
          <EmptyState>This user doesn&rsquo;t have any published listings yet.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "24px 16px" }}>
            {listings.map((l) => (
              <SeekerPropertyCard key={l.id} listing={l} hrefBase={`/dashboard/users/${userId}/listings`} />
            ))}
          </div>
        )
      )}

      {/* Reviews — exact Figma (item gap 24, full-width divider between, Show more) */}
      {tab === "Reviews" && (
        REVIEWS.length === 0 ? (
          <EmptyState>No reviews yet.</EmptyState>
        ) : (
          <div className="flex flex-col" style={{ gap: 24 }}>
            {REVIEWS.map((rv, i) => (
              <div key={i} className="flex flex-col" style={{ gap: 24 }}>
                <div className="flex flex-col" style={{ gap: 16 }}>
                  <div className="flex" style={{ gap: 8, width: 303, maxWidth: "100%" }}>
                    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: 56, height: 56 }}>
                      <Image src={rv.avatar} alt={rv.name} fill sizes="56px" style={{ objectFit: "cover" }} />
                    </span>
                    <div className="flex flex-col min-w-0 flex-1" style={{ gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.01em", color: "#121212" }}>{rv.name}</span>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <span className="flex items-center" style={{ gap: 4 }}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={20} strokeWidth={0} fill={s < rv.rating ? "#FFAE00" : "rgba(255,174,0,0.15)"} />
                          ))}
                        </span>
                        <span style={{ fontSize: 14, lineHeight: "24px", letterSpacing: "-0.01em", color: "#807E7E" }}>{rv.time}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "32px", color: "#333333" }}>{rv.text}</p>
                </div>
                {i < REVIEWS.length - 1 && <div style={{ height: 1, background: "#F6F6F6" }} />}
              </div>
            ))}
            <button type="button" className="flex items-center self-start hover:opacity-70" style={{ gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#305E82" }}>Show more</span>
              <ChevronDown size={16} color="#305E82" />
            </button>
          </div>
        )
      )}
    </div>
  );
}

/* Agency agent card — exact Figma (avatar 64 · name 18 · company 12 · location ·
   full-width divider · rating/listings row · View Profile, no contact buttons). */
function AgencyAgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-white flex flex-col" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
      <div className="flex" style={{ gap: 16, padding: "24px 24px 0" }}>
        <span
          className="relative shrink-0 overflow-hidden rounded-full flex items-center justify-center"
          style={{ width: 64, height: 64, background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: 18, fontWeight: 600 }}
        >
          {agent.avatar ? (
            <Image src={agent.avatar} alt={agent.name} fill sizes="64px" style={{ objectFit: "cover" }} />
          ) : (
            agent.initials
          )}
        </span>
        <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{agent.name}</span>
            {agent.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
          </div>
          <span style={{ fontSize: 12, lineHeight: "20px", color: "#807E7E" }}>{agent.company}</span>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Image src="/icons/dash/detail-location.svg" alt="" width={24} height={24} />
            <span style={{ fontSize: 12, lineHeight: "24px", color: "#305E82" }}>{agent.location}</span>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "#F6F6F6", marginTop: 24 }} />
      <div className="flex items-center justify-between" style={{ padding: "16px 24px 24px" }}>
        <div className="flex items-center" style={{ gap: 16 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Image src="/icons/dash/icon-star.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 12, lineHeight: "24px", color: "#807E7E" }}>{agent.rating}</span>
          </div>
          <span style={{ width: 1, height: 14, background: "#F6F6F6" }} />
          <div className="flex items-center" style={{ gap: 8 }}>
            <Image src="/icons/dash/icon-buildings.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 12, lineHeight: "24px", color: "#807E7E" }}>{agent.listings}</span>
          </div>
        </div>
        <Link href={`/dashboard/users/${agent.id}`} className="hover:underline shrink-0" style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>
          View Profile
        </Link>
      </div>
    </div>
  );
}

/* Matches the app's detail pages (agents/agency) empty state. */
function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center text-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "64px 24px", color: "#807E7E", fontSize: "14px" }}
    >
      {children}
    </div>
  );
}
