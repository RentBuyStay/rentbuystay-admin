"use client";

import { use } from "react";
import AdminPropertyDetail from "@/components/AdminPropertyDetail";

export default function UserListingDetailPage({
  params,
}: {
  params: Promise<{ id: string; listingId: string }>;
}) {
  const { listingId } = use(params);
  return <AdminPropertyDetail propertyId={listingId} />;
}
