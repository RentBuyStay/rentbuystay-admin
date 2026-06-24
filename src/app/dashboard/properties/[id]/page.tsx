"use client";

import { use } from "react";
import AdminPropertyDetail from "@/components/AdminPropertyDetail";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <AdminPropertyDetail propertyId={id} />;
}
