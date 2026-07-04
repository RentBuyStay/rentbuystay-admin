"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { BLOG_COVER } from "@/lib/demoBlog";
import { EmptyState } from "@/components/admin/userRows";
import { useGetBlogPostQuery, useUnpublishBlogPostMutation } from "@/services/adminApi";

const fmtDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading } = useGetBlogPostQuery(params.id);
  const [unpublishPost, { isLoading: unpublishing }] = useUnpublishBlogPostMutation();
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
        Loading post…
      </div>
    );
  }
  if (!post) {
    return (
      <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <EmptyState title="Post not found" subtitle="This post may have been deleted. Go back to Blog Management." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/dashboard/blog" className="flex items-center gap-2 w-fit hover:opacity-70">
        <Image src="/icons/admin/blog/blog-back.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      {/* Title + meta + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0">
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>{post.title}</h2>
          <div className="flex items-center" style={{ gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>{post.status === "PUBLISHED" ? `Published ${fmtDate(post.publishedAt)}` : post.status === "SCHEDULED" ? `Scheduled for ${fmtDate(post.scheduledAt)}` : `Draft · created ${fmtDate(post.createdAt)}`}</span>
            <span className="flex items-center" style={{ gap: 8 }}>
              <Image src="/icons/admin/blog/blog-eye.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>{post.viewCount.toLocaleString("en-NG")} views</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {post.status === "PUBLISHED" && (
            <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-2 hover:opacity-70">
              <Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#E30045" }}>Unpublish Post</span>
            </button>
          )}
          <Link
            href={`/dashboard/blog/${post.id}/edit`}
            className="flex items-center justify-center gap-2 text-white hover:opacity-90"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            <Image src="/icons/admin/blog/blog-edit-white.svg" alt="" width={20} height={20} /> Edit Post
          </Link>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative w-full overflow-hidden" style={{ borderRadius: 20, aspectRatio: "1088 / 510" }}>
        <Image src={post.coverImageUrl || BLOG_COVER} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 1088px" className="object-cover" unoptimized={!!post.coverImageUrl} />
      </div>

      {/* Body — the editor stores HTML */}
      <div
        className="flex flex-col gap-4 [&_p]:m-0"
        style={{ fontSize: 18, fontWeight: 400, lineHeight: "40px", color: "#121212" }}
        dangerouslySetInnerHTML={{ __html: post.body ?? "" }}
      />

      {confirm && (
        <ConfirmModal
          title="Unpublish Post"
          body="This post will be taken down and will no longer be visible to users on the platform. It will be saved as a draft so you can review, edit, or republish it at any time. No content or engagement data will be lost."
          confirmLabel="Unpublish Post"
          busy={unpublishing}
          onConfirm={async () => {
            try {
              await unpublishPost(params.id).unwrap();
              setConfirm(false);
              setSuccess(true);
            } catch {
              setConfirm(false);
            }
          }}
          onClose={() => setConfirm(false)}
        />
      )}
      {success && (
        <SuccessModal
          title="Post Unpublished"
          body="The post has been taken down and saved as a draft. You can review, edit, or republish it any time from Blog Management."
          onClose={() => setSuccess(false)}
        />
      )}
    </div>
  );
}
