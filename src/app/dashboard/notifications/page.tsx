"use client";

import Image from "next/image";
import { useState } from "react";
import { NotificationFormModal, type NotificationFormValues } from "@/components/NotificationModals";
import { ConfirmModal, SuccessModal } from "@/components/PlanModals";
import { EmptyState } from "@/components/admin/userRows";
import {
  useBroadcastNotificationMutation,
  useCreateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useGetNotificationHistoryQuery,
  useGetNotificationTemplatesQuery,
  useUpdateNotificationTemplateMutation,
  type NotificationTemplate,
} from "@/services/adminApi";

/* Form audience label → backend BroadcastAudience. */
const AUDIENCE_MAP: Record<string, string> = {
  "All Users": "ALL",
  Owners: "OWNERS",
  Agents: "AGENTS",
  Agencies: "AGENCIES",
  Seekers: "SEEKERS",
};

const SUCCESS_COPY = {
  send: { title: "Notification Sent", body: "Done! Your message has been successfully broadcast to the selected audience. Sit back — delivery is in progress. Check the Sent History tab to monitor open rates and engagement." },
  new: { title: "Template Created", body: "Your new notification template has been saved and is ready to use anytime you send a notification or email." },
  edit: { title: "Changes Saved", body: "Your notification template has been updated successfully. The changes will apply the next time you use this template." },
};

const FORM_COPY = {
  send: { title: "Send Notification", subtitle: "Broadcast to targeted user segments", submitLabel: "Send Notification", showSaveAsTemplate: true },
  new: { title: "New Template", subtitle: "Create a new notification template", submitLabel: "Save Template", showSaveAsTemplate: false },
  edit: { title: "Edit Template", subtitle: "Make changes to the notification template", submitLabel: "Save Changes", showSaveAsTemplate: false },
};

/* Card icon/accent palette cycled per template row. */
const TEMPLATE_LOOKS = [
  { icon: "tmpl-doc-blue.svg", accent: "#509CF5" },
  { icon: "tmpl-doc-purple.svg", accent: "#8A38F5" },
  { icon: "tmpl-doc-orange.svg", accent: "#EA651A" },
  { icon: "tmpl-doc-green.svg", accent: "#009D35" },
];

const fmtDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: "All Users", OWNERS: "Owners", AGENTS: "Agents", AGENCIES: "Agencies", SEEKERS: "Seekers",
};

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

const th: React.CSSProperties = { height: 44, padding: "0 16px", borderBottom: "1px solid #F6F6F6", fontSize: 12, fontWeight: 500, lineHeight: "20px", color: "#807E7E" };
const cell: React.CSSProperties = { height: 72, padding: "0 16px", borderBottom: "1px solid #F6F6F6" };

export default function Page() {
  const [modal, setModal] = useState<"send" | "new" | "edit" | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [sendNotice, setSendNotice] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState<NotificationTemplate | null>(null);

  const { data: templatesPage, isLoading } = useGetNotificationTemplatesQuery({});
  const { data: historyPage } = useGetNotificationHistoryQuery({});
  const [createTemplate, { isLoading: creating }] = useCreateNotificationTemplateMutation();
  const [updateTemplate, { isLoading: updating }] = useUpdateNotificationTemplateMutation();
  const [deleteTemplate, { isLoading: deletingTpl }] = useDeleteNotificationTemplateMutation();
  const [broadcast, { isLoading: sending }] = useBroadcastNotificationMutation();
  const templates = templatesPage?.content ?? [];
  const history = historyPage?.content ?? [];

  const toBody = (v: NotificationFormValues) => ({
    name: v.subject,
    type: [v.type, v.audience].filter(Boolean).join(" · ") || null,
    subject: v.subject,
    bodyHtml: v.bodyHtml,
    variables: [],
  });

  const handleSubmit = async (v: NotificationFormValues) => {
    if (modal === "send") {
      if (!v.audience) { setSendNotice("Please choose a target audience."); return; }
      try {
        await broadcast({
          templateId: editing?.id,
          subject: v.subject,
          bodyHtml: v.bodyHtml,
          audience: AUDIENCE_MAP[v.audience] ?? "ALL",
          channels: ["EMAIL"],
        }).unwrap();
        setModal(null);
        setEditing(null);
        setSendNotice(undefined);
        setSuccess(SUCCESS_COPY.send);
      } catch {
        setSendNotice("Couldn't send the broadcast. Please try again.");
      }
      return;
    }
    try {
      if (modal === "edit" && editing) await updateTemplate({ id: editing.id, body: { ...editing, ...toBody(v) } }).unwrap();
      else await createTemplate(toBody(v)).unwrap();
      const copy = modal === "edit" ? { title: "Changes Saved", body: "The template has been updated." } : SUCCESS_COPY.new;
      setModal(null);
      setEditing(null);
      setSuccess(copy);
    } catch {
      // keep the modal open on failure
    }
  };

  const handleSaveAsTemplate = async (v: NotificationFormValues) => {
    try {
      await createTemplate(toBody(v)).unwrap();
      setModal(null);
      setEditing(null);
      setSendNotice(undefined);
      setSuccess(SUCCESS_COPY.new);
    } catch {
      // keep the modal open on failure
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Email Templates header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: "32px", color: "#121212" }}>Email Templates</h2>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setModal("new")} className="flex items-center gap-2 shrink-0" style={{ height: 48, padding: "0 24px", borderRadius: 12 }}>
            <Image src="/icons/admin/notif/notif-edit.svg" alt="" width={20} height={20} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#305E82" }}>New Template</span>
          </button>
          <button
            type="button"
            onClick={() => setModal("send")}
            className="flex items-center justify-center text-white hover:opacity-90 shrink-0"
            style={{ height: 48, padding: "0 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)", border: "1px solid rgba(120,158,187,0.5)" }}
          >
            Send Notification/Email
          </button>
        </div>
      </div>

      {/* Template cards */}
      {isLoading ? (
        <div className="bg-white flex items-center justify-center text-center" style={{ border: "1px solid #F6F6F6", borderRadius: 20, padding: "64px 24px", color: "#807E7E", fontSize: 14 }}>
          Loading templates…
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
          <EmptyState title="No templates yet" subtitle="Create your first template with the New Template button above." />
        </div>
      ) : (
      <div className="flex flex-col gap-4">
        {templates.map((tpl, i) => {
          const look = TEMPLATE_LOOKS[i % TEMPLATE_LOOKS.length];
          const t = {
            title: tpl.name,
            sub: [tpl.subject && tpl.subject !== tpl.name ? tpl.subject : null, tpl.type].filter(Boolean).join(" · ") || "—",
            icon: look.icon,
            accent: look.accent,
          };
          return (
          <div key={tpl.id} className="flex items-center justify-between gap-3 bg-white" style={{ padding: 24, borderRadius: 20, border: "1px solid #F6F6F6" }}>
            <div className="flex items-center min-w-0" style={{ gap: 16 }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: 48, height: 48, borderRadius: 8, background: hexA(t.accent, 0.05) }}>
                <Image src={`/icons/admin/notif/${t.icon}`} alt="" width={20} height={20} />
              </span>
              <div className="flex flex-col min-w-0" style={{ gap: 8 }}>
                <span className="truncate" style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#121212" }}>{t.title}</span>
                <span className="truncate" style={{ fontSize: 14, fontWeight: 400, lineHeight: "18px", color: "#807E7E" }}>{t.sub}</span>
              </div>
            </div>
            <div className="flex items-center shrink-0" style={{ gap: 8 }}>
              <button type="button" onClick={() => { setEditing(tpl); setModal("edit"); }} aria-label="Edit template" className="flex items-center justify-center hover:bg-[#fafafa]" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Image src="/icons/admin/notif/notif-edit.svg" alt="" width={20} height={20} />
              </button>
              <button type="button" onClick={() => { setEditing(tpl); setSendNotice(undefined); setModal("send"); }} aria-label="Send template" className="flex items-center justify-center hover:bg-[#fafafa]" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Image src="/icons/admin/notif/notif-send.svg" alt="" width={24} height={24} />
              </button>
              <button type="button" onClick={() => setDeleting(tpl)} aria-label="Delete template" className="flex items-center justify-center hover:bg-[#fafafa]" style={{ width: 48, height: 48, borderRadius: 12 }}>
                <Image src="/icons/admin/blog/blog-trash.svg" alt="" width={20} height={20} />
              </button>
            </div>
          </div>
          );
        })}
      </div>
      )}

      {/* Notification History */}
      <section className="bg-white" style={{ border: "1px solid #F6F6F6", borderRadius: 20 }}>
        <div className="p-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, lineHeight: "24px", color: "#16192C" }}>Notification History</h2>
        </div>
        <div className="mx-6 mb-6">
          {history.length === 0 ? (
            <EmptyState title="No notification history yet" subtitle="Sent broadcasts and their delivery stats will appear here once you send one." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 720, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: "left", paddingLeft: 0 }}>Subject</th>
                    <th style={{ ...th, textAlign: "left" }}>Audience</th>
                    <th style={{ ...th, textAlign: "left" }}>Recipients</th>
                    <th style={{ ...th, textAlign: "left" }}>Status</th>
                    <th style={{ ...th, textAlign: "left" }}>Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((b) => (
                    <tr key={b.id}>
                      <td style={{ ...cell, paddingLeft: 0 }}><span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{b.subject}</span></td>
                      <td style={cell}><Pill label={AUDIENCE_LABEL[b.audience] ?? b.audience} color="#305E82" /></td>
                      <td style={cell}><span style={{ fontSize: 14, color: "#121212" }}>{b.sentCount}/{b.recipientCount}{b.failedCount ? ` · ${b.failedCount} failed` : ""}</span></td>
                      <td style={cell}><Pill label={b.status} color={b.status === "SENT" || b.status === "COMPLETED" ? "#009D35" : b.status === "FAILED" ? "#E30045" : "#DC8E1D"} /></td>
                      <td style={cell}><span style={{ fontSize: 14, color: "#807E7E" }}>{fmtDateTime(b.sentAt ?? b.createdAt)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modal && (
        <NotificationFormModal
          key={`${modal}-${editing?.id ?? "blank"}`}
          initial={
            editing
              ? { subject: editing.subject ?? editing.name, bodyHtml: editing.bodyHtml ?? "" }
              : undefined
          }
          notice={modal === "send" ? sendNotice : undefined}
          busy={creating || updating || sending}
          title={FORM_COPY[modal].title}
          subtitle={FORM_COPY[modal].subtitle}
          submitLabel={FORM_COPY[modal].submitLabel}
          showSaveAsTemplate={FORM_COPY[modal].showSaveAsTemplate}
          onClose={() => { setModal(null); setEditing(null); setSendNotice(undefined); }}
          onSubmit={handleSubmit}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete Template"
          body={`Are you sure you want to delete the "${deleting.name}" template? This can't be undone.`}
          confirmLabel="Delete Template"
          busy={deletingTpl}
          onConfirm={async () => {
            try {
              await deleteTemplate(deleting.id).unwrap();
              setDeleting(null);
              setSuccess({ title: "Template Deleted", body: "The notification template has been removed." });
            } catch {
              setDeleting(null);
            }
          }}
          onClose={() => setDeleting(null)}
        />
      )}
      {success && <SuccessModal title={success.title} body={success.body} onClose={() => setSuccess(null)} />}
    </div>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return <span className="inline-flex items-center rounded-[16px] whitespace-nowrap" style={{ background: hexA(color, 0.08), color, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "2px 12px" }}>{label}</span>;
}
