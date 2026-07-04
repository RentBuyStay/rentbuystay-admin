"use client";

import { useState } from "react";
import Image from "next/image";
import { useNotifyUserMutation } from "@/services/adminApi";

const CHANNELS: { value: "EMAIL" | "PUSH"; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "PUSH", label: "Push notification" },
];

/** One-off notification to a single user — POST /admin/users/{id}/notify. */
export default function NotifyUserModal({
  userId,
  userName,
  onClose,
}: {
  userId: string;
  userName: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channels, setChannels] = useState<("EMAIL" | "PUSH")[]>(["EMAIL"]);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [notifyUser, { isLoading }] = useNotifyUserMutation();

  const toggle = (c: "EMAIL" | "PUSH") =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = async () => {
    setError(null);
    if (!subject.trim() || !body.trim()) {
      setError("Please enter a subject and message.");
      return;
    }
    if (channels.length === 0) {
      setError("Select at least one channel.");
      return;
    }
    try {
      await notifyUser({ id: userId, subject: subject.trim(), bodyHtml: body.trim(), channels }).unwrap();
      setSent(true);
      setTimeout(onClose, 1200);
    } catch {
      setError("Couldn't send the notification. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center md:p-4"
      style={{ background: "rgba(18,18,18,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full md:w-[520px] md:max-w-full rounded-t-[25px] md:rounded-[24px] overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 24px)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute hover:opacity-70 top-6 right-6 md:top-8 md:right-8"
          style={{ width: 24, height: 24, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Image src="/icons/modal-cancel.svg" alt="" width={24} height={24} />
        </button>

        <div className="flex flex-col p-6 md:p-8">
          <div className="flex flex-col gap-1" style={{ paddingRight: 32 }}>
            <h2 style={{ fontSize: 20, lineHeight: "24px", fontWeight: 600, color: "#121212" }}>Send Notification</h2>
            <p style={{ fontSize: 14, lineHeight: "22px", color: "#807E7E" }}>To {userName}</p>
          </div>

          {sent ? (
            <p className="mt-6 text-[14px] font-medium" style={{ color: "#009D35" }}>Notification sent.</p>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              {error && <p style={{ fontSize: 14, color: "#D92D20", fontWeight: 500, margin: 0 }}>{error}</p>}

              <label className="flex flex-col gap-2">
                <span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>Subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Notification subject"
                  className="w-full outline-none"
                  style={{ background: "#F6F6F6", borderRadius: 12, padding: "12px 16px", height: 48, fontSize: 14, color: "#121212" }}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>Message</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message…"
                  rows={5}
                  className="w-full outline-none resize-none"
                  style={{ background: "#F6F6F6", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#121212" }}
                />
              </label>

              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>Channels</span>
                <div className="flex items-center gap-4">
                  {CHANNELS.map((c) => (
                    <label key={c.value} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 14, color: "#121212" }}>
                      <input
                        type="checkbox"
                        checked={channels.includes(c.value)}
                        onChange={() => toggle(c.value)}
                        className="w-4 h-4 rounded accent-[#305E82]"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={isLoading}
                className="flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ width: "100%", height: 52, borderRadius: 12, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)", fontSize: 14, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", marginTop: 8 }}
              >
                {isLoading ? "Sending…" : "Send Notification"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
