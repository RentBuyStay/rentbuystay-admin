import { api } from "./api";
import { endpoints } from "./endpoints";
import type { ApiEnvelope, PropertyResponse } from "./types";

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

/** Item from GET /professionals (agents + agencies public directory). */
export type ProfessionalListItem = {
  id: string; // userId or organizationId
  type: "INDIVIDUAL" | "ORGANIZATION";
  name?: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  organizationId?: string;
  organizationName?: string;
  verified?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
};

/** GET /admin/kyc/users/{userId} — authoritative KYC state for any user. */
export type KycVerificationEntry = {
  id: string;
  verificationType?: string;
  provider?: string;
  documentType?: string;
  status: "PENDING" | "IN_PROGRESS" | "VERIFIED" | "REJECTED" | "EXPIRED" | "FAILED";
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  attempts?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type KycStatus = {
  identity?: KycVerificationEntry | null;
  business?: KycVerificationEntry | null;
};

/** Item from GET /admin/kyc/business/awaiting — unlike identity, it names its subject. */
export type BusinessKycEntry = KycVerificationEntry & {
  subjectKind?: "USER" | "ORGANIZATION";
  subjectId?: string;
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
    // Public directory of agents + agencies — used to enrich the admin user list
    // with names/avatars until /admin/users returns profile fields.
    getProfessionals: builder.query<PageResponse<ProfessionalListItem>, { page?: number; size?: number; search?: string }>({
      query: ({ page = 0, size = 100, search } = {}) => ({
        url: endpoints.professionals,
        method: "GET",
        params: { page, size, ...(search ? { search } : {}) },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<ProfessionalListItem>>) => res.data,
    }),
    // ── Properties (admin moderation) ──
    getAdminProperties: builder.query<PageResponse<PropertyResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 } = {}) => ({
        url: endpoints.adminProperties,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<PropertyResponse>>) => res.data,
      providesTags: [{ type: "Properties" as const, id: "ADMIN_LIST" }],
    }),
    getAwaitingProperties: builder.query<PageResponse<PropertyResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 } = {}) => ({
        url: endpoints.adminPropertiesAwaiting,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<PropertyResponse>>) => res.data,
      providesTags: [{ type: "Properties" as const, id: "ADMIN_AWAITING" }],
    }),
    approveProperty: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminPropertyApprove(id), method: "POST" }),
      invalidatesTags: [
        { type: "Properties" as const, id: "ADMIN_LIST" },
        { type: "Properties" as const, id: "ADMIN_AWAITING" },
        "Property" as const,
      ],
    }),
    rejectProperty: builder.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: endpoints.adminPropertyReject(id),
        method: "POST",
        body: { reason: reason || "Rejected by admin review" },
      }),
      invalidatesTags: [
        { type: "Properties" as const, id: "ADMIN_LIST" },
        { type: "Properties" as const, id: "ADMIN_AWAITING" },
        "Property" as const,
      ],
    }),
    archiveAdminProperty: builder.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason = "OTHER" }) => ({
        url: endpoints.adminPropertyArchive(id),
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: [
        { type: "Properties" as const, id: "ADMIN_LIST" },
        { type: "Properties" as const, id: "ADMIN_AWAITING" },
        "Property" as const,
      ],
    }),
    removeProperty: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminProperty(id), method: "DELETE" }),
      invalidatesTags: [
        { type: "Properties" as const, id: "ADMIN_LIST" },
        { type: "Properties" as const, id: "ADMIN_AWAITING" },
      ],
    }),
    getUserKycStatus: builder.query<KycStatus, string>({
      query: (userId) => ({ url: endpoints.adminUserKyc(userId), method: "GET" }),
      transformResponse: (res: ApiEnvelope<KycStatus>) => res.data,
    }),
    getAwaitingIdentityKyc: builder.query<PageResponse<KycVerificationEntry>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: endpoints.adminKycIdentityAwaiting,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<KycVerificationEntry>>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "KYC_AWAITING" }],
    }),
    getAwaitingBusinessKyc: builder.query<PageResponse<BusinessKycEntry>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: endpoints.adminKycBusinessAwaiting,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<BusinessKycEntry>>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "KYC_AWAITING" }],
    }),
    decideKyc: builder.mutation<void, { kind: "identity" | "business"; id: string; approve: boolean; reason?: string }>({
      query: ({ kind, id, approve, reason }) => ({
        url:
          kind === "identity"
            ? approve
              ? endpoints.adminKycIdentityApprove(id)
              : endpoints.adminKycIdentityReject(id)
            : approve
            ? endpoints.adminKycBusinessApprove(id)
            : endpoints.adminKycBusinessReject(id),
        method: "POST",
        ...(approve ? {} : { body: { reason: reason || "Rejected by admin review" } }),
      }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "KYC_AWAITING" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPlatformStatsQuery,
  useGetAdminUsersQuery,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetProfessionalsQuery,
  useGetUserKycStatusQuery,
  useGetAwaitingIdentityKycQuery,
  useGetAwaitingBusinessKycQuery,
  useDecideKycMutation,
  useGetAdminPropertiesQuery,
  useGetAwaitingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useRemovePropertyMutation,
  useArchiveAdminPropertyMutation,
} = adminApi;
