"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Bell, UserX, Star, ChevronDown } from "lucide-react";
import SeekerPropertyCard, { type SeekerListing } from "@/components/SeekerPropertyCard";
import AgentCard, { type Agent } from "@/components/AgentCard";
import { getDemoUser } from "@/lib/demoUsers";

/* Per-role badge colors (text = solid, bg = same hue @8%), from the Figma detail variants. */
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

/* Listing template — seller is filled in from the viewed user. */
const BASE_LISTINGS: Omit<SeekerListing, "seller">[] = [
  {
    id: "1", title: "3-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos",
    price: "₦2,800,000", priceSuffix: "/year", tag: "FOR RENT", sqft: "1,200 sqft", beds: 3, baths: 3,
    image: "/images/prop1.jpg", amenities: ["Furnished", "Parking", "24/7 Power", "Security"],
  },
  {
    id: "2", title: "3-Bedroom Flat, Victoria Island", location: "Victoria Island, Lagos",
    price: "₦650,000", priceSuffix: "/year", tag: "FOR RENT", sqft: "980 sqft", beds: 3, baths: 3,
    image: "/images/prop2.jpg", amenities: ["Pool", "Gym", "Parking"],
  },
  {
    id: "3", title: "4-Bedroom Duplex, Ikoyi", location: "Ikoyi, Lagos",
    price: "₦95,000,000", tag: "FOR SALE", sqft: "2,400 sqft", beds: 4, baths: 5,
    image: "/images/prop3.jpg", amenities: ["BQ", "Garden", "Smart Home", "CCTV"],
  },
];

/* Agents under an agency — company is filled in from the viewed agency.
   Uses the same AgentCard the app renders in the agency dashboard. */
const BASE_AGENTS: Omit<Agent, "company">[] = [
  { id: "a1", name: "Amara Nwosu", avatar: "/images/agents/amara-nwosu.png", initials: "AN", location: "Lagos", rating: "4.8", listings: "12 listings", verified: true, contactUserId: "a1" },
  { id: "a2", name: "Emeka Okafor", avatar: "/images/agents/emeka-okafor.png", initials: "EO", location: "Lagos", rating: "4.6", listings: "9 listings", verified: true, contactUserId: "a2" },
  { id: "a3", name: "Zainab Bello", avatar: "/images/agents/zainab-bello.png", initials: "ZB", location: "Abuja", rating: "4.9", listings: "15 listings", verified: true, contactUserId: "a3" },
  { id: "a4", name: "Chinedu Umeh", avatar: "/images/agents/chinedu-umeh.png", initials: "CU", location: "Lagos", rating: "New", listings: "3 listings", verified: false, contactUserId: "a4" },
  { id: "a5", name: "Fatima Yusuf", avatar: "/images/agents/fatima-yusuf.png", initials: "FY", location: "Ibadan", rating: "4.7", listings: "7 listings", verified: true, contactUserId: "a5" },
  { id: "a6", name: "Tunde Balogun", avatar: "/images/agents/tunde-balogun.png", initials: "TB", location: "Lagos", rating: "4.5", listings: "5 listings", verified: false, contactUserId: "a6" },
];

/* Reviews left for this user (swap for admin GET /admin/users/{id}/reviews). */
const REVIEWS = [
  {
    name: "Alexa Henry", avatar: "/images/seekers/aishat-dada.png", rating: 5, time: "2 days ago",
    text: "Ibrahim is a lifesaver! After months of searching, he helped me find an amazing apartment in Yaba with 24/7 security and stable power. Moving to Lagos was daunting, but Ibrahim made the process smooth and stress-free. Highly recommend his services!",
  },
  {
    name: "Chinedu Okafor", avatar: "/images/seekers/bayo-lawal.png", rating: 4, time: "5 hours ago",
    text: "Working with Ibrahim was a breeze. He found me a cozy studio near Lekki with great amenities and a friendly neighborhood. ",
  },
  {
    name: "Sade Ajayi", avatar: "/images/seekers/olaide-batifeori.png", rating: 5, time: "1 week ago",
    text: "Ibrahim's expertise helped me secure a beautiful family home in Ikeja. The entire process was transparent, and he was always available to answer my questions. I felt supported every step of the way.",
  },
];

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
  const user = getDemoUser(userId);
  const isAgency = user.role === "Agency";

  const tabs = isAgency
    ? ["Profile Details", "Agents", "Listings", "Reviews"]
    : ["Profile Details", "Listings", "Reviews"];
  const [tab, setTab] = useState("Profile Details");

  const badge = ROLE_BADGE[user.role] ?? ROLE_BADGE.Owner;
  const listings: SeekerListing[] =
    user.listings > 0
      ? BASE_LISTINGS.map((l) => ({ ...l, seller: { name: user.name, initials: initials(user.name), verified: user.verified } }))
      : [];
  const agents: Agent[] = BASE_AGENTS.map((a) => ({ ...a, company: user.name }));

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
            {user.logoUrl ? (
              <Image src={user.logoUrl} alt={user.name} fill sizes="120px" style={{ objectFit: "cover" }} />
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
            <span style={{ fontSize: 12, fontWeight: 500, color: "#FFAE00" }}>Member since {user.joined}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 hover:opacity-70" style={{ height: 48, padding: "8px 24px", fontSize: 14, fontWeight: 500, color: "#E30045" }}>
            <UserX size={20} /> Suspend User
          </button>
          <button
            className="flex items-center gap-2 text-white hover:opacity-90"
            style={{ height: 48, padding: "8px 24px", fontSize: 14, fontWeight: 500, borderRadius: 12, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Bell size={20} /> Send Notification
          </button>
        </div>
      </div>

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
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        )
      )}

      {/* Listings — same card the rest of the app uses (SeekerPropertyCard) */}
      {tab === "Listings" && (
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
