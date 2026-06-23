"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Bell, UserX, Star } from "lucide-react";

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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] text-[#807e7e]">{label}</span>
      <span className="text-[16px] text-[#121212]">{value}</span>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile Details");

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[16px] text-[#121212] hover:opacity-70 self-start">
        <ArrowLeft size={20} /> Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 96, height: 96, background: "#EAF2FA", color: "#305e82", fontSize: 30, fontWeight: 600 }}>
            {initials(USER.name)}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-[#121212]">{USER.name}</h1>
              {USER.verified && <BadgeCheck size={20} color="#17B26A" />}
              <span className="rounded-full" style={{ background: "#FEF0C7", color: "#B54708", fontSize: 12, fontWeight: 500, padding: "2px 10px" }}>{USER.role}</span>
            </div>
            <span className="text-[14px] text-[#807e7e]">{USER.email}</span>
            <span className="text-[12px] font-medium" style={{ color: "#DC6803" }}>Member since {USER.memberSince}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-[14px] font-medium hover:opacity-70" style={{ color: "#E30045" }}>
            <UserX size={18} /> Suspend User
          </button>
          <button
            className="flex items-center gap-2 text-white rounded-[12px] h-12 px-6 text-[14px] font-medium hover:opacity-90"
            style={{ background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Bell size={18} /> Send Notification
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[#ededed]">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="pb-3 text-[14px] transition-colors"
              style={{ color: active ? "#305E82" : "#807E7E", fontWeight: active ? 600 : 400, borderBottom: active ? "2px solid #305E82" : "2px solid transparent" }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Profile Details */}
      {tab === "Profile Details" && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            <Field label="First Name" value={USER.firstName} />
            <Field label="Last Name" value={USER.lastName} />
            <Field label="Email Address" value={USER.email} />
            <Field label="Phone Number" value={USER.phone} />
            <Field label="State" value={USER.state} />
            <Field label="City" value={USER.city} />
          </div>
          <Field label="Bio" value={USER.bio} />
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
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 40, height: 40, background: "#EAF2FA", color: "#305e82", fontSize: 13, fontWeight: 600 }}>
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
