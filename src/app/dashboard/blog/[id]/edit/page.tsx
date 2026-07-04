"use client";

import { useParams } from "next/navigation";
import BlogEditor from "@/components/BlogEditor";
import { EmptyState } from "@/components/admin/userRows";
import { useGetBlogPostQuery } from "@/services/adminApi";

export default function Page() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading } = useGetBlogPostQuery(params.id);

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
  return <BlogEditor post={post} />;
}
