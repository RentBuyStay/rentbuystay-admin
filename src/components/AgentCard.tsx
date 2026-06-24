"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOpenDirectConversationMutation } from "@/services/conversationApi";

export type Agent = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  company: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
  contactUserId?: string;
};

/** Opens (or creates) a direct conversation with a user, then routes to it. */
export function useContact(userId?: string) {
  const router = useRouter();
  const [openDirect] = useOpenDirectConversationMutation();
  return () => {
    if (!userId) return;
    openDirect(userId)
      .unwrap()
      .then((conv) => router.push(`/dashboard/messages?c=${conv.id}`))
      .catch(() => {});
  };
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const contact = useContact(agent.contactUserId);
  return (
    <Link
      href={`/dashboard/agents/${agent.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden", padding: "24px" }}
    >
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <div
            className="rounded-full relative overflow-hidden shrink-0 flex items-center justify-center"
            style={{ width: "48px", height: "48px", background: "rgba(48,94,130,0.05)", color: "#305E82", fontSize: "16px", fontWeight: 600 }}
          >
            {agent.avatar ? (
              <Image src={agent.avatar} alt={agent.name} fill unoptimized sizes="48px" style={{ objectFit: "cover" }} />
            ) : (
              agent.initials
            )}
          </div>

          <div className="flex flex-col" style={{ gap: "4px", flex: 1, minWidth: 0 }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <span style={{ fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: "#121212" }}>{agent.name}</span>
              {agent.verified && <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />}
            </div>
            <span style={{ fontSize: "14px", lineHeight: "20px", color: "#807E7E" }}>{agent.company}</span>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#305E82" }}>{agent.location}</span>
        </div>

        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <SpecItem icon="/icons/dash/icon-star.svg" label={agent.rating} />
            <Separator />
            <SpecItem icon="/icons/dash/icon-buildings.svg" label={agent.listings} />
          </div>

          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="hover:underline"
            style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#305E82" }}
            onClick={(e) => e.stopPropagation()}
          >
            View all Properties
          </Link>
        </div>

        <div className="flex items-center" style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <ContactButton variant="outline" icon="/icons/dash/call-dark.svg" label="Call" onClick={contact} />
          <ContactButton variant="filled" icon="/icons/dash/messages-2.svg" label="Message" onClick={contact} />
        </div>
      </div>
    </Link>
  );
}

export function SpecItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      <Image src={icon} alt="" width={20} height={20} />
      <span style={{ fontSize: "12px", lineHeight: "24px", color: "#807E7E" }}>{label}</span>
    </div>
  );
}

export function Separator() {
  return <div style={{ width: "1px", height: "14px", background: "#F6F6F6" }} />;
}

export function ContactButton({
  variant,
  icon,
  label,
  onClick,
}: {
  variant: "outline" | "filled";
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  const filled = variant === "filled";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={`inline-flex items-center justify-center hover:opacity-90 ${filled ? "text-white" : ""}`}
      style={{
        flex: 1,
        height: "48px",
        padding: "8px 24px",
        gap: "8px",
        background: filled ? "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)" : "#FFFFFF",
        border: filled ? "1px solid rgba(120,158,187,0.5)" : "1px solid #F6F6F6",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        color: filled ? "#FFFFFF" : "#121212",
        cursor: "pointer",
      }}
    >
      <Image src={icon} alt="" width={20} height={20} />
      {label}
    </button>
  );
}
