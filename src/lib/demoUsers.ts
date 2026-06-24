/**
 * Static placeholder users for the admin User Management screens while the app
 * is still UI-only (no backend wiring yet). Shared by the users list and the
 * user-detail page so both stay consistent. Swap for a real admin endpoint
 * once integration begins.
 */

export type Role = "Seeker" | "Owner" | "Agent" | "Agency";
export type UserStatus = "Active" | "Suspended";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  location: string;
  joined: string;
  listings: number;
  status: UserStatus;
  verified: boolean;
  // Individual (Seeker / Owner / Agent) profile
  firstName?: string;
  lastName?: string;
  phone?: string;
  state?: string;
  city?: string;
  bio?: string;
  // Agency profile
  logoUrl?: string;
  whatsapp?: string;
  website?: string;
  officeAddress?: string;
  companyRegNo?: string;
  esvarbonLicence?: string;
  yearEstablished?: string;
  // Agent extras
  avatarUrl?: string;
  affiliatedWith?: string;
  rating?: string;
};

const BIO_BY_ROLE: Record<Role, string> = {
  Owner: "Experienced property owner with several residential listings across the Lagos real estate market.",
  Agent: "Licensed real estate agent helping clients find, inspect and close on the right properties with ease.",
  Seeker: "Actively searching for a new home that fits their lifestyle, location and budget.",
  Agency: "",
};

/** Builds an individual user, deriving first/last name and sensible defaults. */
function person(
  base: Omit<DemoUser, "firstName" | "lastName" | "phone" | "state" | "city" | "bio">,
  city: string,
): DemoUser {
  const parts = base.name.trim().split(/\s+/);
  return {
    ...base,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    phone: "+234 801 234 5678",
    state: base.location,
    city,
    bio: BIO_BY_ROLE[base.role],
  };
}

export const DEMO_USERS: DemoUser[] = [
  person({ id: "1", name: "Chiamaka Femi", email: "chiamakafemi@email.com", role: "Owner", location: "Lagos", joined: "Apr 2026", listings: 0, status: "Active", verified: true }, "Eti-Osa"),
  person({ id: "2", name: "Jasper Lin", email: "jasperlin@email.com", role: "Agent", location: "Lagos", joined: "Apr 2026", listings: 7, status: "Active", verified: true }, "Ikeja"),
  person({ id: "3", name: "Amina Yusuf", email: "aminayusuf@email.com", role: "Agent", location: "Ibadan", joined: "Mar 2026", listings: 12, status: "Active", verified: true }, "Bodija"),
  person({ id: "4", name: "Lara Moretti", email: "laramoretti@email.com", role: "Agent", location: "Lagos", joined: "Mar 2026", listings: 4, status: "Active", verified: true }, "Lekki"),
  person({ id: "5", name: "Sofia Garcia", email: "sofiagarcia@email.com", role: "Owner", location: "Ogun", joined: "Mar 2026", listings: 2, status: "Suspended", verified: false }, "Abeokuta"),
  {
    id: "6",
    name: "Urban Nest Realty",
    email: "urbannestrealty@email.com",
    role: "Agency",
    location: "Lagos",
    joined: "Jan 2026",
    listings: 28,
    status: "Active",
    verified: true,
    logoUrl: "/images/agencies/urban-nest-realty.png",
    phone: "+234 801 234 5678",
    whatsapp: "",
    website: "www.urbannestrealty.com",
    state: "Lagos",
    city: "Eti-Osa",
    officeAddress: "14 Adeola Odeku Street, Victoria Island",
    companyRegNo: "",
    esvarbonLicence: "",
    yearEstablished: "2018",
    bio: "Established in 2018, Urban Nest Realty offers a wide range of residential and commercial properties in Lagos, Abuja, Ogun, and Ibadan. Our experienced team is dedicated to helping you find the perfect space with confidence and ease.",
  },
  person({ id: "7", name: "Mira Patel", email: "mirapatel@email.com", role: "Seeker", location: "Lagos", joined: "Mar 2026", listings: 0, status: "Active", verified: true }, "Yaba"),
  person({ id: "8", name: "Omar Al-Faro", email: "omaralfaro@email.com", role: "Seeker", location: "Ogun", joined: "Mar 2026", listings: 0, status: "Active", verified: false }, "Sango-Ota"),
  person({ id: "9", name: "Lina Haddad", email: "linahaddad@email.com", role: "Agent", location: "Abuja", joined: "Feb 2026", listings: 11, status: "Suspended", verified: true }, "Maitama"),
  person({ id: "10", name: "Karim Mansour", email: "karimmansour@email.com", role: "Owner", location: "Lagos", joined: "Feb 2026", listings: 3, status: "Active", verified: true }, "Surulere"),
];

/** Builds an agent affiliated with an agency. */
function agentUser(o: {
  id: string;
  name: string;
  avatar: string;
  location: string;
  city: string;
  joined: string;
  listings: number;
  rating: string;
  verified: boolean;
  status?: UserStatus;
}): DemoUser {
  const parts = o.name.trim().split(/\s+/);
  return {
    id: o.id,
    name: o.name,
    email: `${(parts[0] ?? "").toLowerCase()}.${(parts[1] ?? "").toLowerCase()}@email.com`,
    role: "Agent",
    location: o.location,
    joined: o.joined,
    listings: o.listings,
    status: o.status ?? "Active",
    verified: o.verified,
    avatarUrl: o.avatar,
    affiliatedWith: "Urban Nest Realty",
    rating: o.rating,
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    phone: "+234 801 234 5678",
    whatsapp: "",
    state: o.location,
    city: o.city,
    bio: "Senior real estate professional with 9+ years of experience in Lagos residential and commercial property. Specialising in Lekki, Victoria Island, Ikoyi, and Ikeja. ESVARBON licensed.",
  };
}

/** Agents that belong to the Urban Nest Realty agency (shown in its Agents tab). */
export const DEMO_AGENCY_AGENTS: DemoUser[] = [
  agentUser({ id: "a1", name: "Amara Nwosu", avatar: "/images/agents/amara-nwosu.png", location: "Lagos", city: "Eti-Osa", joined: "Feb 2026", listings: 12, rating: "4.8", verified: true }),
  agentUser({ id: "a2", name: "Emeka Okafor", avatar: "/images/agents/emeka-okafor.png", location: "Lagos", city: "Ikeja", joined: "Feb 2026", listings: 9, rating: "4.6", verified: true }),
  agentUser({ id: "a3", name: "Zainab Bello", avatar: "/images/agents/zainab-bello.png", location: "Abuja", city: "Maitama", joined: "Jan 2026", listings: 15, rating: "4.9", verified: true }),
  agentUser({ id: "a4", name: "Chinedu Umeh", avatar: "/images/agents/chinedu-umeh.png", location: "Lagos", city: "Surulere", joined: "Mar 2026", listings: 3, rating: "New", verified: false }),
  agentUser({ id: "a5", name: "Fatima Yusuf", avatar: "/images/agents/fatima-yusuf.png", location: "Ibadan", city: "Bodija", joined: "Feb 2026", listings: 7, rating: "4.7", verified: true }),
  agentUser({ id: "a6", name: "Tunde Balogun", avatar: "/images/agents/tunde-balogun.png", location: "Lagos", city: "Yaba", joined: "Jan 2026", listings: 5, rating: "4.5", verified: false }),
];

/* ── Verification subjects (Verification Management) ────────────────────────
   Each is a full DemoUser so clicking the eye opens the same role-aware detail
   the User Management list uses, plus the verification-specific fields. */
export type VerificationStatus = "Pending" | "Approved" | "Rejected";
export type VerificationSubject = DemoUser & {
  doc: string;
  submitted: string;
  vstatus: VerificationStatus;
};

function verif(o: {
  id: string;
  name: string;
  email: string;
  role: Role;
  doc: string;
  submitted: string;
  vstatus: VerificationStatus;
  location?: string;
  city?: string;
  affiliatedWith?: string;
  logoUrl?: string;
}): VerificationSubject {
  const parts = o.name.trim().split(/\s+/);
  const base: DemoUser = {
    id: o.id,
    name: o.name,
    email: o.email,
    role: o.role,
    location: o.location ?? "Lagos",
    joined: "Jan 2026",
    listings: 0,
    status: "Active",
    verified: o.vstatus === "Approved",
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    phone: "+234 801 234 5678",
    whatsapp: "",
    state: o.location ?? "Lagos",
    city: o.city ?? "Eti-Osa",
    bio: BIO_BY_ROLE[o.role] || "",
  };
  if (o.role === "Agent") {
    base.affiliatedWith = o.affiliatedWith;
    base.avatarUrl = o.logoUrl;
  }
  if (o.role === "Agency") {
    base.logoUrl = o.logoUrl;
    base.website = `www.${o.name.toLowerCase().replace(/\s+/g, "")}.com`;
    base.officeAddress = "14 Adeola Odeku Street, Victoria Island";
    base.yearEstablished = "2018";
    base.bio = "A real estate agency offering residential and commercial properties across Nigeria.";
  }
  return { ...base, doc: o.doc, submitted: o.submitted, vstatus: o.vstatus };
}

export const DEMO_VERIFICATIONS: VerificationSubject[] = [
  // Pending
  verif({ id: "v1", name: "Michael Adegbite", email: "ademichael@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "2 hours ago", vstatus: "Pending" }),
  verif({ id: "v2", name: "Obinna Eze", email: "obinna.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "5 hours ago", vstatus: "Pending" }),
  verif({ id: "v3", name: "Kemi Adesanya", email: "kemiadesanya@gmail.com", role: "Agent", doc: "International Passport", submitted: "8 hours ago", vstatus: "Pending", affiliatedWith: "Urban Nest Realty" }),
  verif({ id: "v4", name: "Oladunni Praise", email: "praiserealty@gmail.com", role: "Agent", doc: "International Passport", submitted: "1 day ago", vstatus: "Pending" }),
  verif({ id: "v5", name: "Urban Nest Realty", email: "admin@urbannestrealty.com", role: "Agency", doc: "CAC + Director’s NIN", submitted: "2 days ago", vstatus: "Pending", logoUrl: "/images/agencies/urban-nest-realty.png" }),
  // Approved
  verif({ id: "v6", name: "Tunde Bakare", email: "tunde.b@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "1 day ago", vstatus: "Approved" }),
  verif({ id: "v7", name: "Grace Effiong", email: "grace.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "2 days ago", vstatus: "Approved" }),
  verif({ id: "v8", name: "Sydney Realtors", email: "admin@sydneyrealtors.com", role: "Agency", doc: "CAC + Director’s NIN", submitted: "3 days ago", vstatus: "Approved", logoUrl: "/images/agencies/sydney-realtors.png" }),
  // Rejected
  verif({ id: "v9", name: "Michael Adegbite", email: "ademichael@gmail.com", role: "Agent", doc: "NIN + Selfie", submitted: "2 hours ago", vstatus: "Rejected" }),
  verif({ id: "v10", name: "Obinna Eze", email: "obinna.e@gmail.com", role: "Owner", doc: "Driver’s License", submitted: "5 hours ago", vstatus: "Rejected" }),
  verif({ id: "v11", name: "Oladunni Praise", email: "praiserealty@gmail.com", role: "Agent", doc: "International Passport", submitted: "1 day ago", vstatus: "Rejected" }),
  verif({ id: "v12", name: "Ifeoma Chukwu", email: "ifeoma.c@gmail.com", role: "Owner", doc: "International Passport", submitted: "2 days ago", vstatus: "Rejected" }),
];

/** Returns the matching user (agency agent / verification subject too), or a copy of the first keyed to `id`. */
export function getDemoUser(id: string): DemoUser {
  return (
    DEMO_USERS.find((u) => u.id === id) ??
    DEMO_AGENCY_AGENTS.find((u) => u.id === id) ??
    DEMO_VERIFICATIONS.find((u) => u.id === id) ??
    { ...DEMO_USERS[0], id }
  );
}
