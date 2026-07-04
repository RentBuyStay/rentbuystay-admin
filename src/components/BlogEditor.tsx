"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { SuccessModal } from "@/components/PlanModals";
import RichTextEditor from "@/components/RichTextEditor";
import { useUploadFileMutation } from "@/services/fileApi";
import {
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  type AdminBlogPost,
} from "@/services/adminApi";

const fieldBase = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" };

const PUBLISH_SUCCESS = { title: "Post Published Successfully", body: "Your blog post has been published and you can now keep track of this post (views and performance) on the Blog Management page." };
const UPDATE_SUCCESS = { title: "Changes Saved", body: "Your changes have been saved and the post has been updated on the Blog Management page." };

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  const mo = d.toLocaleDateString("en-US", { month: "long" });
  return `${wd}., ${mo} ${d.getDate()}, ${d.getFullYear()}`;
}

const TIME_24H: Record<string, string> = {
  "08:00AM": "08:00", "10:00AM": "10:00", "12:00PM": "12:00",
  "03:00PM": "15:00", "06:00PM": "18:00", "09:00PM": "21:00",
};

export default function BlogEditor({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const editing = !!post;
  const [scheduled, setScheduled] = useState(post?.status === "SCHEDULED");
  const [date, setDate] = useState(post?.scheduledAt ? post.scheduledAt.slice(0, 10) : "");
  const [time, setTime] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [bodyHtmlValue, setBodyHtmlValue] = useState(post?.body ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(post?.coverImageUrl ?? null);
  const [coverName, setCoverName] = useState(post?.coverImageUrl ? "current cover" : "");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const [createPost] = useCreateBlogPostMutation();
  const [updatePost] = useUpdateBlogPostMutation();
  const [uploadFile] = useUploadFileMutation();

  const onFile = (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return;
    setCoverName(f.name);
    setCoverFile(f);
    const r = new FileReader();
    r.onload = () => setCoverUrl(r.result as string);
    r.readAsDataURL(f);
  };

  // Uploads the newly chosen cover (if any) and returns its hosted URL.
  const resolveCoverUrl = async (): Promise<string | null> => {
    if (!coverFile) return post?.coverImageUrl ?? null;
    const fd = new FormData();
    fd.append("file", coverFile);
    const res = await uploadFile(fd).unwrap();
    return res.url;
  };

  const save = async (mode: "publish" | "schedule" | "draft") => {
    if (busy || !title.trim() || !bodyHtmlValue.trim()) return;
    setBusy(true);
    try {
      const cover = await resolveCoverUrl();
      const scheduledAt =
        mode === "schedule" && date
          ? new Date(`${date}T${TIME_24H[time] ?? "09:00"}:00`).toISOString()
          : null;
      const payload = {
        title: title.trim(),
        body: bodyHtmlValue,
        coverImageUrl: cover,
        publishNow: mode === "publish",
        scheduledAt,
      };
      if (editing) await updatePost({ id: post!.id, body: payload }).unwrap();
      else await createPost(payload).unwrap();
      if (mode === "schedule") {
        setSuccess({
          title: "Post Scheduled Successfully",
          body: `Your blog post has been scheduled and will be published on ${formatDate(date)}${time ? ` ${time}` : ""}. You can now keep track of it on the Blog Management page.`,
        });
      } else if (mode === "draft") {
        setSuccess({ title: "Draft Saved", body: "Your post has been saved as a draft. You can find it in the Drafts tab on the Blog Management page." });
      } else {
        setSuccess(editing ? UPDATE_SUCCESS : PUBLISH_SUCCESS);
      }
    } catch {
      // stay on the editor; nothing is lost
    } finally {
      setBusy(false);
    }
  };

  const submit = () => save(scheduled ? "schedule" : "publish");

  const primaryLabel = busy ? "Saving…" : scheduled ? "Schedule Now" : editing ? "Save Changes" : "Publish Now";

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/dashboard/blog" className="flex items-center gap-2 w-fit hover:opacity-70">
        <Image src="/icons/admin/blog/blog-back.svg" alt="" width={20} height={20} />
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Back</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>{editing ? "Edit Blog Post" : "New Blog Post"}</h2>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#807E7E" }}>{editing ? "Update the details below and save your changes" : "Fill the details below to create a new post"}</p>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" disabled={busy} onClick={() => save("draft")} className="hover:opacity-70 disabled:opacity-60" style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>Save to Draft</button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex items-center justify-center text-white hover:opacity-90 disabled:opacity-60"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>

      {/* Bog Title */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Bog Title</label>
        <input className={`${fieldBase} h-12 px-4`} placeholder="Enter blog title here" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Body</label>
        <RichTextEditor placeholder="Start writing here..." minHeight={258} defaultHtml={post?.body ?? undefined} onHtmlChange={setBodyHtmlValue} />
      </div>

      {/* Cover Image/Thumbnail */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Cover Image/Thumbnail</label>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}
          className="relative flex flex-col items-center justify-center gap-4 w-full cursor-pointer overflow-hidden"
          style={{ minHeight: 270, borderRadius: 20, padding: 24, background: dragging ? "rgba(26,115,225,0.04)" : "transparent" }}
        >
          {/* Exact Figma dashed border (#1A73E1 @ 0.8, 0.8px, dash 6/4) */}
          <svg className="absolute pointer-events-none" style={{ left: 0.4, top: 0.4, width: "calc(100% - 0.8px)", height: "calc(100% - 0.8px)" }} preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="100%" height="100%" rx="19.6" ry="19.6" fill="none" stroke="#1A73E1" strokeOpacity="0.8" strokeWidth="0.8" strokeDasharray="6 4" />
          </svg>

          {coverUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" style={{ borderRadius: 20 }} />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white truncate max-w-[80%]" style={{ background: "rgba(0,0,0,0.6)", fontSize: 12 }}>{coverName} · click to change</span>
            </>
          ) : (
            <>
              <Image src="/icons/admin/blog/blog-gallery.svg" alt="" width={64} height={64} />
              <div className="flex flex-col items-center gap-2">
                <span style={{ fontSize: 20, fontWeight: 600, color: "#121212" }}>
                  Drag &amp; drop photos or <span style={{ color: "#305E82", textDecoration: "underline" }}>click to upload</span>
                </span>
                <span className="text-center max-w-[420px]" style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>
                  To ensure best quality, please upload PNG, JPG up to 5MB each with high resolution (1280 x 600).
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule Post for Later */}
      <button type="button" onClick={() => setScheduled((v) => !v)} className="flex items-center gap-3 w-fit">
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 20, height: 20, borderRadius: 6, background: scheduled ? "#305E82" : "#FFFFFF", border: scheduled ? "none" : "1.5px solid #D0D5DD" }}
        >
          {scheduled && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </span>
        <span style={{ fontSize: 16, fontWeight: 400, color: "#121212" }}>Schedule Post for Later</span>
      </button>

      {/* Date + Time (revealed when scheduled) */}
      {scheduled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Date</label>
            <div className="relative">
              <input
                ref={dateRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={() => { try { dateRef.current?.showPicker?.(); } catch { /* falls back to native focus */ } }}
                aria-label="Date"
                className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-between h-12 px-4 bg-[#F6F6F6] rounded-[12px]">
                <span style={{ fontSize: 14, color: date ? "#121212" : "#807E7E" }}>{date ? formatDate(date) : "Select date"}</span>
                <Image src="/icons/admin/blog/blog-calendar.svg" alt="" width={16} height={16} className="shrink-0" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Time</label>
            <div className="relative">
              <select value={time} onChange={(e) => setTime(e.target.value)} className={`${fieldBase} h-12 px-4 pr-10 appearance-none cursor-pointer`} style={{ color: time ? "#121212" : "#807E7E" }}>
                <option value="" disabled>Select time</option>
                {["08:00AM", "10:00AM", "12:00PM", "03:00PM", "06:00PM", "09:00PM"].map((t) => <option key={t} value={t} style={{ color: "#121212" }}>{t}</option>)}
              </select>
              <ChevronDown size={20} color="#121212" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {success && <SuccessModal title={success.title} body={success.body} onClose={() => { setSuccess(null); router.push("/dashboard/blog"); }} />}
    </div>
  );
}
