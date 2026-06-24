"use client";

import { useParams } from "next/navigation";
import BlogEditor from "@/components/BlogEditor";
import { getBlogPost, BLOG_POSTS } from "@/lib/demoBlog";

export default function Page() {
  const params = useParams<{ id: string }>();
  const post = getBlogPost(params.id) ?? BLOG_POSTS[3];
  return <BlogEditor post={post} />;
}
