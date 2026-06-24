"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SuccessModal } from "@/components/PlanModals";
import RichTextEditor from "@/components/RichTextEditor";

const fieldBase = "w-full bg-[#F6F6F6] rounded-[12px] outline-none text-[14px] text-[#121212] placeholder:text-[#807E7E]";
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.02em", color: "#121212" };

const PUBLISH_SUCCESS = { title: "Post Published Successfully", body: "Your blog post has been published and you can now keep track of this post (views and performance) on the Blog Management page." };

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  const mo = d.toLocaleDateString("en-US", { month: "long" });
  return `${wd}., ${mo} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function Page() {
  const [scheduled, setScheduled] = useState(false);
  const [date, setDate] = useState("2026-06-25");
  const [time, setTime] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const submit = () => {
    if (scheduled) {
      setSuccess({
        title: "Post Scheduled Successfully",
        body: `Your blog post has been scheduled and will be published on ${formatDate(date)}${time ? ` ${time}` : ""}. You can now keep track of it on the Blog Management page.`,
      });
    } else {
      setSuccess(PUBLISH_SUCCESS);
    }
  };

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
          <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>New Blog Post</h2>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: "24px", color: "#807E7E" }}>Fill the details below to create a new post</p>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" className="hover:opacity-70" style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>Save to Draft</button>
          <button
            type="button"
            onClick={submit}
            className="flex items-center justify-center text-white hover:opacity-90"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            {scheduled ? "Schedule Now" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Bog Title */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Bog Title</label>
        <input className={`${fieldBase} h-12 px-4`} placeholder="Enter blog title here" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Body</label>
        <RichTextEditor placeholder="Start writing here..." minHeight={258} />
      </div>

      {/* Cover Image/Thumbnail */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Cover Image/Thumbnail</label>
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-4 w-full hover:bg-[#fafafa] transition-colors"
          style={{ minHeight: 270, borderRadius: 20, border: "1px dashed #1A73E1", padding: 24 }}
        >
          <Image src="/icons/admin/blog/blog-gallery.svg" alt="" width={64} height={64} />
          <div className="flex flex-col items-center gap-2">
            <span style={{ fontSize: 20, fontWeight: 600, color: "#121212" }}>
              Drag &amp; drop photos or <span style={{ color: "#1A73E1", textDecoration: "underline" }}>click to upload</span>
            </span>
            <span className="text-center max-w-[420px]" style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "#807E7E" }}>
              To ensure best quality, please upload PNG, JPG up to 5MB each with high resolution (1280 x 600).
            </span>
          </div>
        </button>
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

      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}
