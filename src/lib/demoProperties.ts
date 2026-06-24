import type { PropertyResponse } from "@/services/types";
import type { Role } from "@/lib/demoUsers";
import type { AdminProperty, AdminPropertyStatus } from "@/components/AdminPropertyCard";
import { toSeekerListing } from "@/lib/property";

/**
 * Static placeholder listings used while the admin is still UI-only (no backend
 * wiring yet). They let the cloned property-detail page (browse/[id]) render the
 * exact app UI for the placeholder cards shown on a user's "Listings" tab.
 * Swap for a real admin endpoint once integration begins.
 */

/** PropertyResponse plus admin-only lister/status info carried for the card + detail. */
export type DemoProperty = PropertyResponse & {
  listerName?: string;
  listerRole?: Role;
  listerVerified?: boolean;
  adminStatus?: AdminPropertyStatus;
};

const GALLERY = [
  "/images/prop1.jpg",
  "/images/prop2.jpg",
  "/images/prop3.jpg",
  "/images/prop4.jpg",
  "/images/prop5.jpg",
];

function photos(primary: string) {
  const ordered = [primary, ...GALLERY.filter((g) => g !== primary)];
  return ordered.map((url, i) => ({ url, sortOrder: i, isPrimary: i === 0 }));
}

function amenities(names: string[]) {
  return names.map((name, i) => ({ id: i + 1, name }));
}

const AMENITIES = [
  "Furnished", "Parking Space", "24/7 Power", "Security", "Air Conditioning",
  "Water Supply", "CCTV", "POP Ceiling", "Fitted Kitchen", "Balcony",
];

export const DEMO_PROPERTIES: DemoProperty[] = [
  {
    id: "1",
    referenceCode: "RBS-L-0001",
    title: "3-Bedroom Flat, Lekki Phase 1",
    description:
      "A beautifully finished 3-bedroom flat in the heart of Lekki Phase 1. Spacious living areas, en-suite bedrooms, 24/7 power and tight security make this the perfect home for professionals and families alike.",
    propertyTypeName: "Apartment",
    listingType: "RENT",
    price: 2800000,
    priceFrequency: "PER_YEAR",
    currency: "NGN",
    state: "Lagos",
    city: "Lekki Phase 1",
    address: "Admiralty Way, Lekki Phase 1, Lagos",
    latitude: 6.4474,
    longitude: 3.4736,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    totalAreaSqm: 1200,
    yearBuilt: 2021,
    status: "ACTIVE",
    viewCount: 248,
    isFurnished: true,
    listedAt: "2025-03-28",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(AMENITIES),
    photos: photos("/images/prop1.jpg"),
    charges: [
      { title: "Commission", amount: 280000, currency: "NGN" },
      { title: "Agreement", amount: 150000, currency: "NGN" },
    ],
  },
  {
    id: "2",
    referenceCode: "RBS-L-0002",
    title: "3-Bedroom Flat, Victoria Island",
    description:
      "Modern 3-bedroom apartment on Victoria Island with a pool, gym and dedicated parking. Walking distance to restaurants, banks and the business district.",
    propertyTypeName: "Apartment",
    listingType: "RENT",
    price: 650000,
    priceFrequency: "PER_MONTH",
    currency: "NGN",
    state: "Lagos",
    city: "Victoria Island",
    address: "Adeola Odeku Street, Victoria Island, Lagos",
    latitude: 6.4281,
    longitude: 3.4219,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 1,
    totalAreaSqm: 980,
    yearBuilt: 2020,
    status: "ACTIVE",
    viewCount: 176,
    isFurnished: false,
    listedAt: "2025-04-10",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(["Pool", "Gym", "Parking Space", ...AMENITIES.slice(2)]),
    photos: photos("/images/prop2.jpg"),
    charges: [
      { title: "Commission", amount: 65000, currency: "NGN" },
      { title: "Agreement", amount: 100000, currency: "NGN" },
    ],
  },
  {
    id: "3",
    referenceCode: "RBS-L-0003",
    title: "4-Bedroom Duplex, Ikoyi",
    description:
      "An elegant 4-bedroom duplex in Ikoyi featuring a private garden, boys' quarters, smart-home automation and round-the-clock CCTV. A rare opportunity in one of Lagos' most prestigious neighbourhoods.",
    propertyTypeName: "Duplex",
    listingType: "BUY",
    price: 95000000,
    priceFrequency: "OUTRIGHT",
    currency: "NGN",
    state: "Lagos",
    city: "Ikoyi",
    address: "Bourdillon Road, Ikoyi, Lagos",
    latitude: 6.4498,
    longitude: 3.4346,
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    totalAreaSqm: 2400,
    yearBuilt: 2022,
    status: "ACTIVE",
    viewCount: 312,
    isFurnished: true,
    listedAt: "2025-02-15",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(["BQ", "Garden", "Smart Home", "CCTV", ...AMENITIES.slice(0, 6)]),
    photos: photos("/images/prop3.jpg"),
    charges: [
      { title: "Commission", amount: 4750000, currency: "NGN" },
      { title: "Agreement", amount: 1000000, currency: "NGN" },
    ],
  },
];

/* Properties shown on the admin Property Management grid (own listers + statuses). */
function adminProp(o: {
  id: string; ref: string; title: string; type: PropertyResponse["listingType"]; price: number;
  freq: PropertyResponse["priceFrequency"]; status: PropertyResponse["status"]; adminStatus: AdminPropertyStatus;
  city: string; lat: number; lng: number; beds: number; baths: number; sqft: number; image: string;
  listerName: string; listerRole: Role; listerVerified: boolean; amenityNames: string[]; description: string;
}): DemoProperty {
  return {
    id: o.id, referenceCode: o.ref, title: o.title, description: o.description,
    propertyTypeName: o.beds >= 4 ? "Duplex" : "Apartment", listingType: o.type, price: o.price,
    priceFrequency: o.freq, currency: "NGN", state: "Lagos", city: o.city,
    address: `${o.city}, Lagos`, latitude: o.lat, longitude: o.lng,
    bedrooms: o.beds, bathrooms: o.baths, parkingSpaces: 2, totalAreaSqm: o.sqft, yearBuilt: 2021,
    status: o.status, viewCount: 248, isFurnished: true, listedAt: "2025-03-28",
    ownerName: o.listerName,
    amenities: amenities(o.amenityNames), photos: photos(o.image),
    charges: [
      { title: "Commission", amount: Math.round(o.price * 0.05), currency: "NGN" },
      { title: "Agreement", amount: 150000, currency: "NGN" },
    ],
    listerName: o.listerName, listerRole: o.listerRole, listerVerified: o.listerVerified, adminStatus: o.adminStatus,
  };
}

export const ADMIN_PROPERTIES: DemoProperty[] = [
  adminProp({ id: "pm1", ref: "RBS-L-1001", title: "3-Bedroom Flat, Lekki Phase 1", type: "RENT", price: 2800000, freq: "PER_YEAR", status: "ACTIVE", adminStatus: "Active", city: "Lekki Phase 1", lat: 6.4474, lng: 3.4736, beds: 3, baths: 4, sqft: 3500, image: "/images/prop1.jpg", listerName: "Urban Nest Realty", listerRole: "Agency", listerVerified: true, amenityNames: AMENITIES, description: "A beautifully finished 3-bedroom flat in the heart of Lekki Phase 1 with 24/7 power and tight security." }),
  adminProp({ id: "pm2", ref: "RBS-L-1002", title: "4-Bedroom Duplex, Ikoyi", type: "BUY", price: 260000000, freq: "OUTRIGHT", status: "REJECTED", adminStatus: "Removed", city: "Ikoyi", lat: 6.4498, lng: 3.4346, beds: 5, baths: 6, sqft: 5000, image: "/images/prop2.jpg", listerName: "Aura Homes", listerRole: "Agency", listerVerified: true, amenityNames: ["BQ", "Garden", "Smart Home", "CCTV", ...AMENITIES.slice(0, 6)], description: "An elegant duplex in Ikoyi featuring a private garden, smart-home automation and round-the-clock CCTV." }),
  adminProp({ id: "pm3", ref: "RBS-L-1003", title: "2-Bedroom Apartment, Yaba", type: "RENT", price: 1500000, freq: "PER_YEAR", status: "ACTIVE", adminStatus: "Active", city: "Yaba", lat: 6.5095, lng: 3.3711, beds: 2, baths: 2, sqft: 1800, image: "/images/prop3.jpg", listerName: "Fadeke Salami", listerRole: "Owner", listerVerified: false, amenityNames: AMENITIES.slice(0, 7), description: "A cosy 2-bedroom apartment in Yaba, close to transport, markets and the university." }),
  adminProp({ id: "pm4", ref: "RBS-L-1004", title: "3-Bedroom Terrace, Lekki", type: "BUY", price: 85000000, freq: "OUTRIGHT", status: "ACTIVE", adminStatus: "Active", city: "Lekki", lat: 6.4698, lng: 3.5852, beds: 3, baths: 3, sqft: 2400, image: "/images/prop4.jpg", listerName: "Chioma Ifeanyi", listerRole: "Agent", listerVerified: true, amenityNames: AMENITIES.slice(0, 8), description: "A modern 3-bedroom terrace in a secure Lekki estate with a fitted kitchen and ample parking." }),
  adminProp({ id: "pm5", ref: "RBS-L-1005", title: "Studio Apartment, Victoria Island", type: "SHORTLET", price: 450000, freq: "PER_NIGHT", status: "ARCHIVED", adminStatus: "Archived", city: "Victoria Island", lat: 6.4281, lng: 3.4219, beds: 1, baths: 1, sqft: 650, image: "/images/prop5.jpg", listerName: "Damilare John", listerRole: "Owner", listerVerified: false, amenityNames: AMENITIES.slice(0, 6), description: "A stylish serviced studio on Victoria Island, ideal for short stays near the business district." }),
  adminProp({ id: "pm6", ref: "RBS-L-1006", title: "4-Bedroom Semi-Detached, Ikeja", type: "RENT", price: 3200000, freq: "PER_YEAR", status: "ACTIVE", adminStatus: "Active", city: "Ikeja", lat: 6.6018, lng: 3.3515, beds: 4, baths: 4, sqft: 3200, image: "/images/prop1.jpg", listerName: "Michael Adebayo", listerRole: "Agent", listerVerified: true, amenityNames: AMENITIES, description: "A spacious 4-bedroom semi-detached home in Ikeja GRA with a generator, borehole and CCTV." }),
];

/* Properties on the Awaiting Approval screen (pending review + rejected). */
export const AWAITING_APPROVAL_PROPERTIES: DemoProperty[] = [
  adminProp({ id: "aa1", ref: "RBS-L-2001", title: "3-Bedroom Flat, Lekki Phase 1", type: "RENT", price: 2800000, freq: "PER_YEAR", status: "AWAITING_APPROVAL", adminStatus: "Awaiting Approval", city: "Lekki Phase 1", lat: 6.4474, lng: 3.4736, beds: 3, baths: 4, sqft: 3500, image: "/images/prop1.jpg", listerName: "Yemi Balogun", listerRole: "Owner", listerVerified: true, amenityNames: AMENITIES, description: "A beautifully finished 3-bedroom flat in the heart of Lekki Phase 1 with 24/7 power and tight security." }),
  adminProp({ id: "aa2", ref: "RBS-L-2002", title: "2-Bedroom Apartment, Victoria Island", type: "SHORTLET", price: 450000, freq: "PER_NIGHT", status: "AWAITING_APPROVAL", adminStatus: "Awaiting Approval", city: "Victoria Island", lat: 6.4281, lng: 3.4219, beds: 3, baths: 2, sqft: 1800, image: "/images/prop2.jpg", listerName: "Urban Nest Realty", listerRole: "Agency", listerVerified: true, amenityNames: AMENITIES.slice(0, 8), description: "A stylish serviced apartment on Victoria Island, ideal for short stays near the business district." }),
  adminProp({ id: "aa3", ref: "RBS-L-2003", title: "Office Space, Ikeja GRA", type: "RENT", price: 3400000, freq: "PER_YEAR", status: "AWAITING_APPROVAL", adminStatus: "Awaiting Approval", city: "Ikeja GRA", lat: 6.5775, lng: 3.3619, beds: 2, baths: 1, sqft: 1200, image: "/images/prop3.jpg", listerName: "Fadeke Salami", listerRole: "Agent", listerVerified: true, amenityNames: AMENITIES.slice(0, 6), description: "A serviced office space in Ikeja GRA with backup power, parking and 24/7 security." }),
  adminProp({ id: "aa4", ref: "RBS-L-2004", title: "4-Bedroom Duplex, Ikoyi", type: "BUY", price: 260000000, freq: "OUTRIGHT", status: "AWAITING_APPROVAL", adminStatus: "Awaiting Approval", city: "Ikoyi", lat: 6.4498, lng: 3.4346, beds: 5, baths: 6, sqft: 5000, image: "/images/prop4.jpg", listerName: "Wilson Falope", listerRole: "Agent", listerVerified: true, amenityNames: ["BQ", "Garden", "Smart Home", "CCTV", ...AMENITIES.slice(0, 6)], description: "An elegant duplex in Ikoyi featuring a private garden, smart-home automation and round-the-clock CCTV." }),
  adminProp({ id: "aa5", ref: "RBS-L-2005", title: "2-Bedroom Flat, Jibowu, Yaba", type: "RENT", price: 1800000, freq: "PER_YEAR", status: "AWAITING_APPROVAL", adminStatus: "Awaiting Approval", city: "Yaba", lat: 6.5095, lng: 3.3711, beds: 3, baths: 3, sqft: 2000, image: "/images/prop5.jpg", listerName: "Chioma Ifeanyi", listerRole: "Agent", listerVerified: true, amenityNames: AMENITIES.slice(0, 7), description: "A bright 2-bedroom flat in Jibowu, Yaba, close to transport, markets and the university." }),
  // Rejected
  adminProp({ id: "ar1", ref: "RBS-L-2101", title: "Studio Apartment, Surulere", type: "RENT", price: 900000, freq: "PER_YEAR", status: "REJECTED", adminStatus: "Rejected", city: "Surulere", lat: 6.4999, lng: 3.3543, beds: 1, baths: 1, sqft: 600, image: "/images/prop2.jpg", listerName: "Kola Adeyemi", listerRole: "Owner", listerVerified: false, amenityNames: AMENITIES.slice(0, 5), description: "A compact studio in Surulere — submission rejected pending clearer documents." }),
  adminProp({ id: "ar2", ref: "RBS-L-2102", title: "3-Bedroom Terrace, Lekki", type: "BUY", price: 90000000, freq: "OUTRIGHT", status: "REJECTED", adminStatus: "Rejected", city: "Lekki", lat: 6.4698, lng: 3.5852, beds: 3, baths: 3, sqft: 2400, image: "/images/prop3.jpg", listerName: "Bright Estates", listerRole: "Agency", listerVerified: true, amenityNames: AMENITIES.slice(0, 8), description: "A 3-bedroom terrace in Lekki — flagged as a possible duplicate of an existing listing." }),
  adminProp({ id: "ar3", ref: "RBS-L-2103", title: "Mini Flat, Ojota", type: "RENT", price: 700000, freq: "PER_YEAR", status: "REJECTED", adminStatus: "Rejected", city: "Ojota", lat: 6.5797, lng: 3.3833, beds: 1, baths: 1, sqft: 550, image: "/images/prop4.jpg", listerName: "Sandra Obi", listerRole: "Agent", listerVerified: false, amenityNames: AMENITIES.slice(0, 4), description: "A mini flat in Ojota — rejected for low-quality photos." }),
];

/** Maps a demo property to the card shape used by the Property Management grid. */
export function toAdminProperty(p: DemoProperty): AdminProperty {
  const l = toSeekerListing(p);
  const role: Role = p.listerRole ?? (p.assignedAgentName ? "Agent" : "Owner");
  const name = p.listerName ?? p.assignedAgentName ?? p.ownerName ?? "Property Owner";
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "P";
  return {
    id: p.id,
    image: l.image,
    listingType: p.listingType === "BUY" ? "For Sale" : p.listingType === "SHORTLET" ? "Shortlet" : "For Rent",
    price: l.price,
    priceSuffix: l.priceSuffix,
    status: p.adminStatus ?? "Active",
    title: p.title,
    location: l.location,
    sqft: p.totalAreaSqm ? `${p.totalAreaSqm.toLocaleString()} sqft` : "—",
    beds: p.bedrooms ?? 0,
    baths: p.bathrooms ?? 0,
    lister: { name, initials, verified: p.listerVerified ?? role !== "Owner", role },
  };
}

/** Returns the matching demo property (user-listing or admin grid), or a copy of the first keyed to `id`. */
export function getDemoProperty(id: string): DemoProperty {
  return (
    DEMO_PROPERTIES.find((p) => p.id === id) ??
    ADMIN_PROPERTIES.find((p) => p.id === id) ??
    AWAITING_APPROVAL_PROPERTIES.find((p) => p.id === id) ??
    { ...DEMO_PROPERTIES[0], id }
  );
}
