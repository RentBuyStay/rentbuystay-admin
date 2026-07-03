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

/** Serialized User entity from GET /admin/users (Page<User>). */
export type AdminUserType =
  | "PROPERTY_SEEKER"
  | "PROPERTY_OWNER"
  | "PROPERTY_AGENT"
  | "PROPERTY_AGENCY"
  | "AGENCY_STAFF"
  | "ADMIN"
  | "SUPER_ADMIN";

export type AdminUserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type AdminUser = {
  id: string;
  email: string;
  userType: AdminUserType;
  status: AdminUserStatus;
  organizationId?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastSeenAt?: string | null;
  suspendReason?: string | null;
};

/** Spring Data page envelope. */
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page index (0-based)
  size: number;
};

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => ({ url: endpoints.adminStats, method: "GET" }),
      transformResponse: (res: ApiEnvelope<PlatformStats>) => res.data,
    }),
    getAdminUsers: builder.query<PageResponse<AdminUser>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: endpoints.adminUsers,
        method: "GET",
        params: { page, size, sort: "createdAt,desc" },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<AdminUser>>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
    suspendUser: builder.mutation<void, { id: string; reason?: string; notifyUser?: boolean }>({
      query: ({ id, reason = "", notifyUser = true }) => ({
        url: endpoints.adminUserSuspend(id),
        method: "POST",
        body: { reason, notifyUser: String(notifyUser) },
      }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
    unsuspendUser: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminUserUnsuspend(id), method: "POST" }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlatformStatsQuery,
  useGetAdminUsersQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
} = adminApi;
