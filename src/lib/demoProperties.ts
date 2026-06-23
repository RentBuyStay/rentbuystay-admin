import type { PropertyResponse } from "@/services/types";

/**
 * Static placeholder listings used while the admin is still UI-only (no backend
 * wiring yet). They let the cloned property-detail page (browse/[id]) render the
 * exact app UI for the placeholder cards shown on a user's "Listings" tab.
 * Swap for a real admin endpoint once integration begins.
 */

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

export const DEMO_PROPERTIES: PropertyResponse[] = [
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
    totalAreaSqm: 120,
    yearBuilt: 2021,
    status: "ACTIVE",
    viewCount: 248,
    isFurnished: true,
    listedAt: "2025-03-28",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(AMENITIES),
    photos: photos("/images/prop1.jpg"),
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
    totalAreaSqm: 98,
    yearBuilt: 2020,
    status: "ACTIVE",
    viewCount: 176,
    isFurnished: false,
    listedAt: "2025-04-10",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(["Pool", "Gym", "Parking Space", ...AMENITIES.slice(2)]),
    photos: photos("/images/prop2.jpg"),
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
    totalAreaSqm: 240,
    yearBuilt: 2022,
    status: "ACTIVE",
    viewCount: 312,
    isFurnished: true,
    listedAt: "2025-02-15",
    ownerUserId: "demo-owner",
    ownerName: "Olaitan Badejo",
    amenities: amenities(["BQ", "Garden", "Smart Home", "CCTV", ...AMENITIES.slice(0, 6)]),
    photos: photos("/images/prop3.jpg"),
  },
];

/** Returns the matching demo property, or a copy of the first keyed to `id`. */
export function getDemoProperty(id: string): PropertyResponse {
  return DEMO_PROPERTIES.find((p) => p.id === id) ?? { ...DEMO_PROPERTIES[0], id };
}
