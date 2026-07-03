import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope } from "./types";

/** Shapes from GET /admin/stats (PlatformStatsResponse). */
export type UserBreakdown = {
  seekers: number;
  owners: number;
  agents: number;
  agencies: number;
  agencyStaff: number;
  admins: number;
  superAdmins: number;
};

export type KycStats = {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
};

export type RegionStat = { state: string; count: number };

export type PlatformStats = {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  deactivatedUsers: number;
  usersByType: UserBreakdown;
  totalProperties: number;
  activeListings: number;
  awaitingApproval: number;
  archivedListings: number;
  rejectedListings: number;
  totalViewCount: number;
  listingsByState: RegionStat[];
  identityKyc: KycStats;
  businessKyc: KycStats;
  totalAgencies: number;
  totalReviews: number;
  totalReports: number;
  pendingReports: number;
};

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => ({ url: endpoints.adminStats, method: "GET" }),
      transformResponse: (res: ApiEnvelope<PlatformStats>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetPlatformStatsQuery } = adminApi;
