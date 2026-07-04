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

/** GET /admin/stats/registrations — one zero-filled day in the time series. */
export type RegistrationDayStat = {
  date: string; // ISO date (yyyy-MM-dd)
  owners: number;
  seekers: number;
  agents: number;
  agencies: number;
  total: number;
};

/** GET /admin/stats/revenue — realised revenue by plan + subscriber totals. */
export type PlanRevenue = {
  planId: string;
  planName: string;
  amount: number;
  subscribers: number;
};
export type RevenueStats = {
  currency: string;
  total: number;
  totalSubscribers: number;
  byPlan: PlanRevenue[];
};

/** GET /admin/activity — one entry in the recent-activity feed. */
export type ActivityItem = {
  type: string;
  message: string;
  occurredAt: string; // ISO instant
};

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

/** Enriched row from GET /admin/users (AdminUserRow) — profile, org, listings + KYC flags. */
export type AdminUser = {
  id: string;
  email: string;
  userType: AdminUserType;
  status: AdminUserStatus;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  state?: string | null;
  city?: string | null;
  listingsCount?: number;
  identityVerified?: boolean;
  businessVerified?: boolean;
  roleId?: string | null;
  roleName?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
};

/** Full record from GET /admin/users/{id} (AdminUserDetail). */
export type AdminOrgInfo = {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  registrationNumber?: string | null;
  state?: string | null;
  city?: string | null;
  officeAddress?: string | null;
  website?: string | null;
  bio?: string | null;
  logoUrl?: string | null;
  status?: string | null;
  yearEstablished?: number | null;
};
export type AdminUserDetail = AdminUser & {
  whatsappNumber?: string | null;
  bio?: string | null;
  companyName?: string | null;
  avatarUrl?: string | null;
  organization?: AdminOrgInfo | null;
  roleId?: string | null;
  roleName?: string | null;
  suspendReason?: string | null;
  lastLoginAt?: string | null;
  updatedAt?: string | null;
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

/** GET /admin/kyc/users/{userId} — authoritative KYC state for any user.
 *  The admin identity list/queue also carries the subject's user reference. */
export type KycVerificationEntry = {
  id: string;
  userId?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
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

/** Item from GET /reviews/{subjectType}/{subjectId}. */
export type ReviewItem = {
  id: string;
  subjectType: "AGENT" | "AGENCY";
  subjectId: string;
  reviewerUserId?: string;
  reviewerFirstName?: string;
  reviewerLastName?: string;
  rating: number;
  body?: string;
  createdAt?: string;
};

/** SubscriptionPlan entity from /admin/subscription-plans. */
export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  listingLimit?: number | null;
  featuredLimit?: number | null;
  isActive?: boolean;
  description?: string | null;
  targetRole?: string | null;
  frequency?: { id: string; name: string; days?: number } | null;
  durationDays?: number | null;
  agentSeats?: number | null;
  features?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PlanFrequency = { id: string; name: string; days?: number };

/** UserSubscription entity from /admin/user-subscriptions. */
export type AdminUserSubscription = {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "GRACE" | "EXPIRED" | "CANCELLED";
  startsAt?: string;
  endsAt?: string;
  autoRenew?: boolean;
  cancellationReason?: string | null;
  internalNote?: string | null;
  createdAt?: string;
};

/** NotificationTemplate entity from /admin/notifications/templates. */
export type NotificationTemplate = {
  id: string;
  name: string;
  type?: string | null; // e.g. EMAIL, PUSH
  subject?: string | null;
  bodyHtml?: string | null;
  variables?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
};

/** NotificationBroadcast entity from /admin/notifications/history. */
export type NotificationBroadcast = {
  id: string;
  templateId?: string | null;
  subject: string;
  bodyHtml?: string | null;
  audience: "ALL" | "OWNERS" | "AGENTS" | "AGENCIES" | "SEEKERS";
  channels?: string[] | null;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: string;
  createdAt?: string;
  sentAt?: string | null;
};

/** Blog post from /admin/blog. */
export type BlogPostStatusApi = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export type AdminBlogPost = {
  id: string;
  title: string;
  body?: string | null;
  coverImageUrl?: string | null;
  status: BlogPostStatusApi;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  viewCount: number;
  authorId?: string;
  authorName?: string | null;
  slug?: string;
  onPageViews?: number;
  offPageViews?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogStats = {
  totalBlogPosts: number;
  totalViews: number;
  activePosts: number;
  inactivePosts: number;
  onPageViews: number;
  offPageViews: number;
};

export type BlogPostPayload = {
  title: string;
  body: string;
  coverImageUrl?: string | null;
  publishNow?: boolean;
  scheduledAt?: string | null;
};

/** Role permission entry (module + CRUD flags). */
export type RolePermissionDto = {
  module:
    | "USER_MANAGEMENT"
    | "VERIFICATION_MANAGEMENT"
    | "PROPERTY_MANAGEMENT"
    | "AWAITING_APPROVAL"
    | "SUBSCRIPTIONS"
    | "SETTINGS"
    | "BLOG_MANAGEMENT";
  canCreate: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type AdminRoleItem = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: RolePermissionDto[];
};

export type AddNewAdminPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  password: string;
  confirmPassword: string;
};

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => ({ url: endpoints.adminStats, method: "GET" }),
      transformResponse: (res: ApiEnvelope<PlatformStats>) => res.data,
    }),
    getRegistrationStats: builder.query<RegistrationDayStat[], { days?: number }>({
      query: ({ days = 7 } = {}) => ({
        url: endpoints.adminStatsRegistrations,
        method: "GET",
        params: { days },
      }),
      transformResponse: (res: ApiEnvelope<RegistrationDayStat[]>) => res.data,
    }),
    getRevenueStats: builder.query<RevenueStats, void>({
      query: () => ({ url: endpoints.adminStatsRevenue, method: "GET" }),
      transformResponse: (res: ApiEnvelope<RevenueStats>) => res.data,
    }),
    getRecentActivity: builder.query<ActivityItem[], { size?: number }>({
      query: ({ size = 10 } = {}) => ({
        url: endpoints.adminActivity,
        method: "GET",
        params: { size },
      }),
      transformResponse: (res: ApiEnvelope<ActivityItem[]>) => res.data,
    }),
    getAdminUsers: builder.query<
      PageResponse<AdminUser>,
      { page?: number; size?: number; type?: string; status?: string; q?: string }
    >({
      query: ({ page = 0, size = 20, type, status, q } = {}) => ({
        url: endpoints.adminUsers,
        method: "GET",
        params: {
          page, size, sort: "createdAt,desc",
          ...(type ? { type } : {}),
          ...(status ? { status } : {}),
          ...(q ? { q } : {}),
        },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<AdminUser>>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
    getAdminUser: builder.query<AdminUserDetail, string>({
      query: (id) => ({ url: `${endpoints.adminUsers}/${id}`, method: "GET" }),
      transformResponse: (res: ApiEnvelope<AdminUserDetail>) => res.data,
      providesTags: (r, e, id) => [{ type: "AdminUsers" as const, id }],
    }),
    changeUserRole: builder.mutation<AdminUserDetail, { id: string; roleId: string }>({
      query: ({ id, roleId }) => ({
        url: `${endpoints.adminUsers}/${id}/role`,
        method: "PATCH",
        body: { roleId },
      }),
      transformResponse: (res: ApiEnvelope<AdminUserDetail>) => res.data,
      invalidatesTags: (r, e, { id }) => [{ type: "AdminUsers" as const, id }, { type: "AdminUsers" as const, id: "LIST" }],
    }),
    notifyUser: builder.mutation<
      void,
      { id: string; subject: string; bodyHtml: string; channels: ("EMAIL" | "PUSH")[] }
    >({
      query: ({ id, subject, bodyHtml, channels }) => ({
        url: `${endpoints.adminUsers}/${id}/notify`,
        method: "POST",
        body: { subject, bodyHtml, channels },
      }),
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
    restoreAdminProperty: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminPropertyRestore(id), method: "POST" }),
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
    getSubjectReviews: builder.query<PageResponse<ReviewItem>, { subjectType: "AGENT" | "AGENCY"; subjectId: string }>({
      query: ({ subjectType, subjectId }) => ({
        url: endpoints.reviewsFor(subjectType, subjectId),
        method: "GET",
        params: { page: 0, size: 50 },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<ReviewItem>>) => res.data,
    }),
    // ── Subscriptions (admin) ──
    getAdminPlans: builder.query<AdminSubscriptionPlan[], void>({
      query: () => ({ url: endpoints.adminSubscriptionPlans, method: "GET" }),
      transformResponse: (res: ApiEnvelope<AdminSubscriptionPlan[]>) => res.data,
      providesTags: [{ type: "Subscription" as const, id: "ADMIN_PLANS" }],
    }),
    getPlanFrequencies: builder.query<PlanFrequency[], void>({
      query: () => ({ url: endpoints.adminSubscriptionFrequencies, method: "GET" }),
      transformResponse: (res: ApiEnvelope<PlanFrequency[]>) => res.data,
    }),
    createAdminPlan: builder.mutation<AdminSubscriptionPlan, Partial<AdminSubscriptionPlan>>({
      query: (body) => ({ url: endpoints.adminSubscriptionPlans, method: "POST", body }),
      invalidatesTags: [{ type: "Subscription" as const, id: "ADMIN_PLANS" }],
    }),
    updateAdminPlan: builder.mutation<AdminSubscriptionPlan, { id: string; body: Partial<AdminSubscriptionPlan> }>({
      query: ({ id, body }) => ({ url: endpoints.adminSubscriptionPlan(id), method: "PUT", body }),
      invalidatesTags: [{ type: "Subscription" as const, id: "ADMIN_PLANS" }],
    }),
    deleteAdminPlan: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminSubscriptionPlan(id), method: "DELETE" }),
      invalidatesTags: [{ type: "Subscription" as const, id: "ADMIN_PLANS" }],
    }),
    getAdminUserSubscriptions: builder.query<PageResponse<AdminUserSubscription>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: endpoints.adminUserSubscriptions,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<AdminUserSubscription>>) => res.data,
      providesTags: [{ type: "Subscription" as const, id: "ADMIN_SUBS" }],
    }),
    cancelUserSubscription: builder.mutation<void, { id: string; reason?: string; internalNote?: string }>({
      query: ({ id, reason = "Cancelled by admin", internalNote = "" }) => ({
        url: endpoints.adminUserSubscriptionCancel(id),
        method: "POST",
        body: { reason, internalNote },
      }),
      invalidatesTags: [{ type: "Subscription" as const, id: "ADMIN_SUBS" }],
    }),
    extendUserSubscription: builder.mutation<void, { id: string; newEndDate: string; reason?: string; internalNote?: string }>({
      query: ({ id, newEndDate, reason = "", internalNote = "" }) => ({
        url: endpoints.adminUserSubscriptionExtend(id),
        method: "POST",
        body: { newEndDate, reason, internalNote },
      }),
      invalidatesTags: [{ type: "Subscription" as const, id: "ADMIN_SUBS" }],
    }),
    getNotificationTemplates: builder.query<PageResponse<NotificationTemplate>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: endpoints.adminNotificationTemplates,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<NotificationTemplate>>) => res.data,
      providesTags: [{ type: "Notifications" as const, id: "TEMPLATES" }],
    }),
    createNotificationTemplate: builder.mutation<NotificationTemplate, Partial<NotificationTemplate>>({
      query: (body) => ({ url: endpoints.adminNotificationTemplates, method: "POST", body }),
      invalidatesTags: [{ type: "Notifications" as const, id: "TEMPLATES" }],
    }),
    updateNotificationTemplate: builder.mutation<NotificationTemplate, { id: string; body: Partial<NotificationTemplate> }>({
      query: ({ id, body }) => ({ url: endpoints.adminNotificationTemplate(id), method: "PUT", body }),
      invalidatesTags: [{ type: "Notifications" as const, id: "TEMPLATES" }],
    }),
    deleteNotificationTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminNotificationTemplate(id), method: "DELETE" }),
      invalidatesTags: [{ type: "Notifications" as const, id: "TEMPLATES" }],
    }),
    broadcastNotification: builder.mutation<
      NotificationBroadcast,
      { templateId?: string; subject?: string; bodyHtml?: string; audience: string; channels: string[] }
    >({
      query: (body) => ({ url: endpoints.adminNotificationBroadcast, method: "POST", body }),
      transformResponse: (res: ApiEnvelope<NotificationBroadcast>) => res.data,
      invalidatesTags: [{ type: "Notifications" as const, id: "HISTORY" }],
    }),
    getNotificationHistory: builder.query<PageResponse<NotificationBroadcast>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: endpoints.adminNotificationHistory,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<NotificationBroadcast>>) => res.data,
      providesTags: [{ type: "Notifications" as const, id: "HISTORY" }],
    }),
    // ── Blog (admin) ──
    getBlogStats: builder.query<BlogStats, void>({
      query: () => ({ url: endpoints.adminBlogStats, method: "GET" }),
      transformResponse: (res: ApiEnvelope<BlogStats>) => res.data,
      providesTags: [{ type: "Notifications" as const, id: "BLOG_STATS" }],
    }),
    getBlogPosts: builder.query<PageResponse<AdminBlogPost>, { status?: BlogPostStatusApi; page?: number; size?: number }>({
      query: ({ status, page = 0, size = 50 } = {}) => ({
        url: endpoints.adminBlog,
        method: "GET",
        params: { page, size, ...(status ? { status } : {}) },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<AdminBlogPost>>) => res.data,
      providesTags: [{ type: "Notifications" as const, id: "BLOG_LIST" }],
    }),
    getBlogPost: builder.query<AdminBlogPost, string>({
      query: (id) => ({ url: endpoints.adminBlogPost(id), method: "GET" }),
      transformResponse: (res: ApiEnvelope<AdminBlogPost>) => res.data,
      providesTags: (r, e, id) => [{ type: "Notifications" as const, id: `BLOG_${id}` }],
    }),
    createBlogPost: builder.mutation<AdminBlogPost, BlogPostPayload>({
      query: (body) => ({ url: endpoints.adminBlog, method: "POST", body }),
      invalidatesTags: [
        { type: "Notifications" as const, id: "BLOG_LIST" },
        { type: "Notifications" as const, id: "BLOG_STATS" },
      ],
    }),
    updateBlogPost: builder.mutation<AdminBlogPost, { id: string; body: Partial<BlogPostPayload> }>({
      query: ({ id, body }) => ({ url: endpoints.adminBlogPost(id), method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Notifications" as const, id: "BLOG_LIST" },
        { type: "Notifications" as const, id: "BLOG_STATS" },
        { type: "Notifications" as const, id: `BLOG_${id}` },
      ],
    }),
    unpublishBlogPost: builder.mutation<AdminBlogPost, string>({
      query: (id) => ({ url: endpoints.adminBlogUnpublish(id), method: "PUT" }),
      transformResponse: (res: ApiEnvelope<AdminBlogPost>) => res.data,
      invalidatesTags: (r, e, id) => [
        { type: "Notifications" as const, id: "BLOG_LIST" },
        { type: "Notifications" as const, id: "BLOG_STATS" },
        { type: "Notifications" as const, id: `BLOG_${id}` },
      ],
    }),
    deleteBlogPost: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminBlogPost(id), method: "DELETE" }),
      invalidatesTags: [
        { type: "Notifications" as const, id: "BLOG_LIST" },
        { type: "Notifications" as const, id: "BLOG_STATS" },
      ],
    }),
    // ── Roles & platform settings (admin) ──
    getAdminRoles: builder.query<AdminRoleItem[], void>({
      query: () => ({ url: endpoints.adminRoles, method: "GET" }),
      transformResponse: (res: ApiEnvelope<AdminRoleItem[]>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "ROLES" }],
    }),
    createAdminRole: builder.mutation<AdminRoleItem, { name: string; permissions: RolePermissionDto[] }>({
      query: (body) => ({ url: endpoints.adminRoles, method: "POST", body }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "ROLES" }],
    }),
    updateAdminRole: builder.mutation<AdminRoleItem, { id: string; body: { name: string; permissions: RolePermissionDto[] } }>({
      query: ({ id, body }) => ({ url: endpoints.adminRole(id), method: "PUT", body }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "ROLES" }],
    }),
    deleteAdminRole: builder.mutation<void, string>({
      query: (id) => ({ url: endpoints.adminRole(id), method: "DELETE" }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "ROLES" }],
    }),
    addNewAdmin: builder.mutation<unknown, AddNewAdminPayload>({
      query: (body) => ({ url: endpoints.adminCreateAdmin, method: "POST", body }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
    createNewUser: builder.mutation<
      unknown,
      { userType: string; firstName: string; lastName: string; email: string; phoneNumber: string }
    >({
      query: (body) => ({ url: endpoints.adminUserCreate, method: "POST", body }),
      invalidatesTags: [{ type: "AdminUsers" as const, id: "LIST" }],
    }),
    getSettingsGroup: builder.query<Record<string, string>, string>({
      query: (group) => ({ url: endpoints.adminSettingsGroup(group), method: "GET" }),
      transformResponse: (res: ApiEnvelope<Record<string, string>>) => res.data,
      providesTags: (r, e, group) => [{ type: "AdminUsers" as const, id: `SETTINGS_${group}` }],
    }),
    updateSettingsGroup: builder.mutation<void, { group: string; settings: Record<string, string> }>({
      query: ({ group, settings }) => ({ url: endpoints.adminSettingsGroup(group), method: "PUT", body: settings }),
      invalidatesTags: (r, e, { group }) => [{ type: "AdminUsers" as const, id: `SETTINGS_${group}` }],
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
    getIdentityKyc: builder.query<PageResponse<KycVerificationEntry>, { status?: string; page?: number; size?: number }>({
      query: ({ status = "PENDING", page = 0, size = 50 } = {}) => ({
        url: endpoints.adminKycIdentity,
        method: "GET",
        params: { status, page, size },
      }),
      transformResponse: (res: ApiEnvelope<PageResponse<KycVerificationEntry>>) => res.data,
      providesTags: [{ type: "AdminUsers" as const, id: "KYC_AWAITING" }],
    }),
    getBusinessKyc: builder.query<PageResponse<BusinessKycEntry>, { status?: string; page?: number; size?: number }>({
      query: ({ status = "PENDING", page = 0, size = 50 } = {}) => ({
        url: endpoints.adminKycBusiness,
        method: "GET",
        params: { status, page, size },
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
  useGetRegistrationStatsQuery,
  useGetRevenueStatsQuery,
  useGetRecentActivityQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useChangeUserRoleMutation,
  useNotifyUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetProfessionalsQuery,
  useGetUserKycStatusQuery,
  useGetAwaitingIdentityKycQuery,
  useGetAwaitingBusinessKycQuery,
  useGetIdentityKycQuery,
  useGetBusinessKycQuery,
  useDecideKycMutation,
  useGetAdminPropertiesQuery,
  useGetAwaitingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useRemovePropertyMutation,
  useArchiveAdminPropertyMutation,
  useRestoreAdminPropertyMutation,
  useGetSubjectReviewsQuery,
  useGetAdminPlansQuery,
  useGetPlanFrequenciesQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
  useGetAdminUserSubscriptionsQuery,
  useCancelUserSubscriptionMutation,
  useExtendUserSubscriptionMutation,
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useBroadcastNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetBlogStatsQuery,
  useGetBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useUnpublishBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetAdminRolesQuery,
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useAddNewAdminMutation,
  useCreateNewUserMutation,
  useGetSettingsGroupQuery,
  useUpdateSettingsGroupMutation,
} = adminApi;
