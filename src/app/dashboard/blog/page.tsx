"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_COLOR, type BlogStatus } from "@/lib/demoBlog";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { EmptyState } from "@/components/admin/userRows";
import { usePermissions } from "@/hooks/usePermissions";
import {
  useDeleteBlogPostMutation,
  useGetBlogPostsQuery,
  useGetBlogStatsQuery,
  type AdminBlogPost,
  type BlogPostStatusApi,
} from "@/services/adminApi";

const TABS = ["All Posts", "Published", "Scheduled", "Drafts", "Unpublished"] as const;
type Tab = (typeof TABS)[number];

/* Server statuses: DRAFT | PUBLISHED | SCHEDULED. Unpublished posts are saved
   as drafts (there is no separate status), so that tab maps to DRAFT too. */
const TAB_FILTER: Record<Tab, BlogPostStatusApi | undefined> = {
  "All Posts": undefined,
  Published: "PUBLISHED",
  Scheduled: "SCHEDULED",
  Drafts: "DRAFT",
  Unpublished: "DRAFT",
};

const STATUS_DISPLAY: Record<BlogPostStatusApi, BlogStatus> = {
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
  DRAFT: "Draft",
};

const fmtDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
};

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const th: React.CSSProperties = { height: 44, padding: "0 16px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E", textAlign: "left" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px", borderBottom: "1px solid #F6F6F6" };

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("All Posts");
  const [toDelete, setToDelete] = useState<AdminBlogPost | null>(null);
  const [deleted, setDeleted] = useState(false);
  const filter = TAB_FILTER[tab];

  const { data: stats } = useGetBlogStatsQuery();
  const { data: postsPage, isLoading } = useGetBlogPostsQuery({ status: filter });
  const { can } = usePermissions();
  const canCreateBlog = can("BLOG_MANAGEMENT", "CREATE");
  const canEditBlog = can("BLOG_MANAGEMENT", "EDIT");
  const canDeleteBlog = can("BLOG_MANAGEMENT", "DELETE");
  const [deletePost, { isLoading: deleting }] = useDeleteBlogPostMutation();
  const rows = postsPage?.content ?? [];

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePost(toDelete.id).unwrap();
      setToDelete(null);
      setDeleted(true);
    } catch {
      // keep the confirm open on failure
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Blog Post */}
        <div className="flex flex-col" style={{ padding: "16px 24px", gap: 16, borderRadius: 20, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" }}>
          <span className="flex items-center" style={{ gap: 8 }}>
            <Image src="/icons/admin/blog/blog-book.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF" }}>Total Blog Post</span>
          </span>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: "#FFFFFF" }}>{(stats?.totalBlogPosts ?? 0).toLocaleString("en-NG")}</span>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 12, color: "#FFFFFF" }}>Active Post: {stats?.activePosts ?? 0}</span>
              <span style={{ fontSize: 12, color: "#FFFFFF" }}>Inactive Post: {stats?.inactivePosts ?? 0}</span>
            </div>
          </div>
        </div>
        {/* Total Views */}
        <div className="flex flex-col bg-white" style={{ padding: "16px 24px", gap: 16, borderRadius: 20, border: "1px solid #F6F6F6" }}>
          <span className="flex items-center" style={{ gap: 8 }}>
            <Image src="/icons/admin/blog/blog-eye.svg" alt="" width={16} height={16} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#807E7E" }}>Total Views</span>
          </span>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 600, lineHeight: "40px", color: "#121212" }}>{(stats?.totalViews ?? 0).toLocaleString("en-NG")}</span>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <span style={{ fontSize: 12, color: "#807E7E" }}>On-page: <span style={{ fontSize: 12, color: "#121212" }}>{(stats?.onPageViews ?? 0).toLocaleString("en-NG")} </span></span>
              <span style={{ fontSize: 12, color: "#807E7E" }}>Off-page (Backlinks):<span style={{ fontSize: 12, color: "#121212" }}> {(stats?.offPageViews ?? 0).toLocaleString("en-NG")}</span> </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + New Blog Post */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="shrink-0"
                style={{ fontSize: 12, fontWeight: 500, lineHeight: "20px", padding: "8px 12px", color: active ? "#305E82" : "#807E7E", borderBottom: active ? "1px solid #305E82" : "1px solid transparent" }}
              >
                {t}
              </button>
            );
          })}
        </div>
        {canCreateBlog && (
        <Link
          href="/dashboard/blog/new"
          className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
          style={{ height: 48, padding: "0 24px", gap: 8, borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
        >
          <Image src="/icons/admin/blog/blog-add.svg" alt="" width={20} height={20} /> New Blog Post
        </Link>
        )}
      </div>

      {/* Table */}
      <section className="bg-white overflow-x-auto" style={{ border: "1px solid #F6F6F6", borderRadius: 15 }}>
        <table className="w-full" style={{ minWidth: 880, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, paddingLeft: 24 }}>Blog Title</th>
              <th style={th}>Added On</th>
              <th style={th}>Status</th>
              <th style={th}>Views</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} onClick={() => router.push(`/dashboard/blog/${p.id}`)} className="cursor-pointer hover:bg-[#fafafa]">
                <td style={{ ...cell, paddingLeft: 24 }}>
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <Image src="/icons/admin/blog/blog-avatar.png" alt="" width={40} height={40} className="rounded-full shrink-0 object-cover" style={{ width: 40, height: 40 }} />
                    <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: "#101828" }}>{p.title}</span>
                  </div>
                </td>
                <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{fmtDate(p.createdAt)}</span></td>
                <td style={cell}>
                  <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(STATUS_COLOR[STATUS_DISPLAY[p.status]], 0.08), color: STATUS_COLOR[STATUS_DISPLAY[p.status]], fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{STATUS_DISPLAY[p.status]}</span>
                </td>
                <td style={cell}><span style={{ fontSize: 14, fontWeight: 400, color: "#121212" }}>{p.viewCount.toLocaleString("en-NG")}</span></td>
                <td style={cell}>
                  <div className="flex items-center" style={{ gap: 24 }}>
                    {canEditBlog && (
                    <button type="button" aria-label="Edit post" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/blog/${p.id}/edit`); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-edit.svg" alt="" width={20} height={20} /></button>
                    )}
                    {canDeleteBlog && (
                    <button type="button" aria-label="Delete post" onClick={(e) => { e.stopPropagation(); setToDelete(p); }} className="hover:opacity-70"><Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} /></button>
                    )}
                    {!canEditBlog && !canDeleteBlog && <span style={{ fontSize: 12, color: "#807E7E" }}>—</span>}
                  </div>
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr><td colSpan={5} style={{ ...cell, paddingLeft: 24, color: "#807E7E", fontSize: 14 }}>Loading posts…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={5} style={{ ...cell, paddingLeft: 24, color: "#807E7E", fontSize: 14 }}>{tab === "Unpublished" ? "Unpublished posts are saved as drafts — check the Drafts tab." : "No posts in this category yet."}</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {toDelete && (
        <ConfirmModal
          title="Delete Blog Post"
          body={`You're about to permanently delete “${toDelete.title}”. This action cannot be undone.`}
          confirmLabel="Delete Post"
          busy={deleting}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
      {deleted && (
        <SuccessModal
          title="Post Deleted"
          body="The blog post has been removed and is no longer visible on the platform."
          onClose={() => setDeleted(false)}
        />
      )}
    </div>
  );
}
