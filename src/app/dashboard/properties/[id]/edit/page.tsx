"use client";

import { use } from "react";
import PropertyForm, { type PropertyFormInitial } from "@/components/PropertyForm";
import { useGetMyPropertiesQuery } from "@/services/propertyApi";
import { getDemoProperty } from "@/lib/demoProperties";
import type { ListingType, PriceFrequency } from "@/services/types";

const TAG_BY_LISTING: Record<ListingType, string> = {
  RENT: "For Rent",
  BUY: "For Sale",
  SHORTLET: "Shortlet",
};

const FREQUENCY_LABEL: Record<PriceFrequency, string> = {
  PER_NIGHT: "per night",
  PER_WEEK: "per week",
  PER_MONTH: "per month",
  PER_YEAR: "per year",
  OUTRIGHT: "outright sale",
};

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Prefer the backend record when present; otherwise fall back to the shared
  // demo property so the form prefills while the admin is still UI-only.
  const { data: backend } = useGetMyPropertiesQuery(
    { page: 0, size: 100 },
    { selectFromResult: ({ data }) => ({ data: data?.content.find((p) => p.id === id) }) },
  );
  const property = backend ?? getDemoProperty(id);

  const initial: PropertyFormInitial = {
    title: property.title,
    propertyType: property.propertyTypeName ?? "",
    listingType: TAG_BY_LISTING[property.listingType],
    price: String(property.price ?? ""),
    frequency: FREQUENCY_LABEL[property.priceFrequency],
    state: property.state ?? "",
    city: property.city ?? "",
    address: property.address ?? "",
    description: property.description ?? "",
    amenities: (property.amenities ?? []).map((a) => a.name),
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    parking: property.parkingSpaces ?? 0,
    totalArea: property.totalAreaSqm ?? 0,
    yearBuilt: property.yearBuilt ? String(property.yearBuilt) : "",
    existingPhotos: (property.photos ?? [])
      .filter((p): p is { id: string; url: string } => typeof p.id === "string")
      .map((p) => ({ id: p.id, url: p.url })),
    charges: (property.charges ?? []).map((c, i) => ({
      id: c.id ?? `c${i}`,
      title: c.title,
      amount: String(c.amount),
    })),
  };

  return <PropertyForm mode="edit" propertyId={id} initial={initial} />;
}
