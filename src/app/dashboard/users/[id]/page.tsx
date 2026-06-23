"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, UserX, Star } from "lucide-react";

/* Per-role badge colors (text = solid, bg = same hue @8%), from the Figma detail variants. */
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  Owner: { bg: "rgba(220,142,29,0.08)", color: "#DC8E1D" },
  Agent: { bg: "rgba(48,94,130,0.08)", color: "#305E82" },
  Agency: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Seeker: { bg: "rgba(20,174,92,0.08)", color: "#14AE5C" },
};

/* Placeholder user (swap for admin GET /admin/users/{id}). */
const USER = {
  name: "Olaitan Badejo",
  email: "olaitanbadejo@email.com",
  role: "Owner",
  verified: true,
  memberSince: "Jan 2026",
  firstName: "Olaitan",
  lastName: "Badejo",
  phone: "+234 801 234 5678",
  state: "Lagos",
  city: "Eti-Osa",
  bio: "Experienced property owner with 8+ years in Lagos real estate market. Specializing in residential and commercial properties in Lekki, VI, and Ikoyi.",
};

const LISTINGS = [
  { id: "1", title: "3-Bedroom Flat, Lekki Phase 1", price: "₦2,800,000", tag: "For Rent", beds: 3, baths: 3 },
  { id: "2", title: "3-Bedroom Flat, Victoria Island", price: "₦650,000", tag: "For Rent", beds: 3, baths: 3 },
];

const REVIEWS = [
  { name: "Alexa Henry", rating: 5, time: "2 days ago", text: "A lifesaver! After months of searching, they helped me find an amazing apartment in Yaba with 24/7 security and stable power." },
  { name: "Chinedu Okafor", rating: 4, time: "5 hours ago", text: "Working with them was a breeze. Found me a cozy studio near Lekki with great amenities and a friendly neighborhood." },
  { name: "Sade Ajayi", rating: 5, time: "1 week ago", text: "Their expertise helped me secure a beautiful family home in Ikeja. The entire process was transparent." },
];

const TABS = ["Profile Details", "Listings", "Reviews"] as const;

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

export default function UserDetailPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile Details");

  return (
    <div className="flex flex-col gap-10">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-3 hover:opacity-70 self-start" style={{ fontSize: 16, color: "#121212" }}>
        <ArrowLeft size={20} /> Back
      </button>

      {/* Header: avatar + name block (left) · actions (right) */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <span
            className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 120, height: 120, background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: 42, fontWeight: 700 }}
          >
            {initials(USER.name)}
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: 24, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>{USER.name}</h1>
              {USER.verified && <Image src="/icons/admin/verify-badge.svg" alt="verified" width={20} height={20} />}
              <span className="rounded-[16px]" style={{ background: ROLE_BADGE[USER.role]?.bg ?? "rgba(48,94,130,0.08)", color: ROLE_BADGE[USER.role]?.color ?? "#305E82", fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{USER.role}</span>
            </div>
            <span style={{ fontSize: 14, color: "#807E7E" }}>{USER.email}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#FFAE00" }}>Member since {USER.memberSince}</span>
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
        {TABS.map((t) => {
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
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
            <Field label="First Name" value={USER.firstName} />
            <Field label="Last Name" value={USER.lastName} />
            <Field label="Email Address" value={USER.email} />
          </div>
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-10">
            <Field label="Phone Number" value={USER.phone} />
            <Field label="State" value={USER.state} />
            <Field label="City" value={USER.city} />
          </div>
          <div className="flex flex-col gap-2">
            <span style={{ fontSize: 13, color: "#807E7E", letterSpacing: "-0.02em" }}>Bio</span>
            <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "32px", color: "#121212", letterSpacing: "-0.02em" }}>{USER.bio}</span>
          </div>
        </div>
      )}

      {/* Listings */}
      {tab === "Listings" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {LISTINGS.map((l) => (
            <div key={l.id} className="rounded-[16px] border border-[#ededed] overflow-hidden bg-white">
              <div className="h-[180px] bg-[#EAF2FA] flex items-center justify-center text-[#305e82] text-[13px]">Property image</div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-[12px] font-medium" style={{ color: "#305e82" }}>{l.tag}</span>
                <p className="text-[16px] font-semibold text-[#121212]">{l.price}</p>
                <p className="text-[14px] text-[#121212]">{l.title}</p>
                <p className="text-[13px] text-[#807e7e]">{l.beds} Beds · {l.baths} Baths</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      {tab === "Reviews" && (
        <div className="flex flex-col">
          {REVIEWS.map((rv, i) => (
            <div key={i} className="flex gap-3 py-5" style={{ borderBottom: i < REVIEWS.length - 1 ? "1px solid #f4f4f4" : "none" }}>
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: "rgba(48,94,130,0.05)", color: "#305e82", fontSize: 13, fontWeight: 600 }}>
                {initials(rv.name)}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#121212]">{rv.name}</span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={14} fill={s < rv.rating ? "#FFAE00" : "none"} color={s < rv.rating ? "#FFAE00" : "#D0D5DD"} />
                    ))}
                  </span>
                  <span className="text-[12px] text-[#807e7e]">{rv.time}</span>
                </div>
                <p className="text-[14px] text-[#121212]">{rv.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
