"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { getBlogPost, BLOG_POSTS, BLOG_BODY, BLOG_COVER } from "@/lib/demoBlog";

export default function Page() {
  const params = useParams<{ id: string }>();
  const post = getBlogPost(params.id) ?? BLOG_POSTS[3];
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

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
            <span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>Published {post.added}</span>
            <span className="flex items-center" style={{ gap: 8 }}>
              <Image src="/icons/admin/blog/blog-eye.svg" alt="" width={16} height={16} />
              <span style={{ fontSize: 14, fontWeight: 400, color: "#807E7E" }}>{post.views} views</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <button type="button" onClick={() => setConfirm(true)} className="flex items-center gap-2 hover:opacity-70">
            <Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#E30045" }}>Unpublish Post</span>
          </button>
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
        <Image src={BLOG_COVER} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 1088px" className="object-cover" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4">
        {BLOG_BODY.map((p, i) => (
          <p key={i} style={{ fontSize: 18, fontWeight: 400, lineHeight: "40px", color: "#121212" }}>{p}</p>
        ))}
      </div>

      {confirm && (
        <ConfirmModal
          title="Unpublish Post"
          body="This post will be taken down and will no longer be visible to users on the platform. It will be saved as a draft so you can review, edit, or republish it at any time. No content or engagement data will be lost."
          confirmLabel="Unpublish Post"
          onConfirm={() => { setConfirm(false); setSuccess(true); }}
          onClose={() => setConfirm(false)}
        />
      )}
      {success && (
        <SuccessModal
          title="Post Unpublished"
          body="The post has been successfully unpublished and is no longer visible to users. It has been saved as a draft and can be found in your drafts section whenever you're ready to review or republish it."
          onClose={() => setSuccess(false)}
        />
      )}
    </div>
  );
}
