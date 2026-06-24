"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useGetAgentsQuery, useGetAgenciesQuery } from "@/services/agentApi";
import type { AgentListItem, AgencyListItem } from "@/services/types";
import AgentCard, { type Agent, useContact, SpecItem, Separator, ContactButton } from "@/components/AgentCard";

type Agency = {
  id: string;
  name: string;
  banner: string;
  location: string;
  rating: string;
  listings: string;
  verified: boolean;
  contactUserId?: string;
};

function rating(n?: number): string {
  return n && n > 0 ? n.toFixed(1) : "New";
}

function toAgencyVM(a: AgencyListItem): Agency {
  return {
    id: a.id,
    name: a.name,
    banner: "/images/prop1.jpg",
    location: a.registrationNumber ? `RC ${a.registrationNumber}` : "—",
    rating: rating(a.averageRating),
    listings: `${a.agentCount ?? 0} ${a.agentCount === 1 ? "agent" : "agents"}`,
    verified: !!a.businessVerified,
    contactUserId: a.ownerUserId,
  };
}

function toAgentVM(a: AgentListItem): Agent {
  const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "Agent";
  return {
    id: a.userId,
    name,
    avatar: a.avatarUrl ?? "",
    initials: ((a.firstName?.[0] ?? "") + (a.lastName?.[0] ?? "")).toUpperCase() || "A",
    company: a.organizationName ?? "Independent",
    location: a.online ? "Online" : "—",
    rating: rating(a.averageRating),
    listings: `${a.listingCount ?? 0} ${a.listingCount === 1 ? "listing" : "listings"}`,
    verified: !!a.identityVerified,
    contactUserId: a.userId,
  };
}

const LOCATIONS = ["All Location", "Lagos", "Abuja", "Port-Harcourt", "Kano"];

export default function DiscoverAgentsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);

  const { data: agenciesPage, isLoading: agenciesLoading } = useGetAgenciesQuery({
    page: 0,
    size: 50,
    q: search || undefined,
  });
  const { data: agentsPage, isLoading: agentsLoading } = useGetAgentsQuery({
    page: 0,
    size: 50,
    q: search || undefined,
  });

  const agencies = (agenciesPage?.content ?? []).map(toAgencyVM);
  const agents = (agentsPage?.content ?? []).map(toAgentVM);

  return (
    <div className="flex flex-col" style={{ gap: "40px" }}>
      <FilterBar
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
      />

      <Section title="All Agencies & Developers" viewAllHref="/dashboard/agents/all">
        {agenciesLoading ? (
          <EmptyBox>Loading agencies…</EmptyBox>
        ) : agencies.length === 0 ? (
          <EmptyBox>No agencies found.</EmptyBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
            {agencies.map((a) => (
              <AgencyCard key={a.id} agency={a} />
            ))}
          </div>
        )}
      </Section>

      <Section title="All Agents" viewAllHref="/dashboard/agents/all-agents">
        {agentsLoading ? (
          <EmptyBox>Loading agents…</EmptyBox>
        ) : agents.length === 0 ? (
          <EmptyBox>No agents found.</EmptyBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-white flex items-center justify-center"
      style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "48px", color: "#807E7E", fontSize: "14px" }}
    >
      {children}
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  location,
  setLocation,
}: {
  search: string;
  setSearch: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
}) {
  const locationSelect = (
    <div
      className="flex items-center shrink-0"
      style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}
    >
      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="outline-none bg-transparent appearance-none"
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          fontWeight: 400,
          color: "#121212",
          letterSpacing: "-0.02em",
          paddingRight: "8px",
        }}
      >
        {LOCATIONS.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <Image src="/icons/dash/form-chevron.svg" alt="" width={16} height={16} style={{ pointerEvents: "none" }} />
    </div>
  );

  const searchField = (
    <div
      className="flex items-center flex-1 min-w-0"
      style={{ height: "48px", background: "#F6F6F6", borderRadius: "12px", padding: "8px 16px", gap: "8px" }}
    >
      <Image src="/icons/dash/search-normal.svg" alt="" width={20} height={20} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Enter agency or agent name..."
        className="flex-1 min-w-0 outline-none bg-transparent"
        style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#121212", letterSpacing: "-0.02em" }}
      />
    </div>
  );

  const searchButton = (className: string) => (
    <button
      type="button"
      className={`flex items-center justify-center text-white hover:opacity-90 ${className}`}
      style={{
        height: "48px",
        padding: "8px 24px",
        background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
        border: "1px solid rgba(120,158,187,0.5)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Search
    </button>
  );

  const filterButton = (className: string, showText: boolean) => (
    <button
      type="button"
      aria-label="Filter"
      className={`inline-flex items-center justify-center hover:opacity-80 ${className}`}
      style={{
        height: "48px",
        padding: "8px 16px",
        gap: "8px",
        background: "#F6F6F6",
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        lineHeight: "24px",
        fontWeight: 400,
        color: "#121212",
        cursor: "pointer",
      }}
    >
      <Image src="/icons/dash/filter-setting.svg" alt="" width={16} height={16} />
      {showText && <span>Filter</span>}
    </button>
  );

  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <p style={{ fontSize: "14px", lineHeight: "20px", fontWeight: 400, color: "#807E7E" }}>
        Find agents and agencies to talk to about your needs.
      </p>

      {/* Desktop: single row */}
      <div className="hidden md:flex items-center" style={{ gap: "16px" }}>
        {locationSelect}
        {searchField}
        {searchButton("w-[160px]")}
        {filterButton("", true)}
      </div>

      {/* Mobile: two rows — location + search, then icon-only filter + wide Search */}
      <div className="flex flex-col md:hidden" style={{ gap: "8px" }}>
        <div className="flex items-center" style={{ gap: "8px" }}>
          {locationSelect}
          {searchField}
        </div>
        <div className="flex items-center" style={{ gap: "8px" }}>
          {filterButton("w-12 shrink-0 justify-center", false)}
          {searchButton("flex-1")}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      <div className="flex items-center justify-between">
        <h2
          className="text-[16px] md:text-[20px]"
          style={{
            lineHeight: "32px",
            fontWeight: 600,
            color: "#121212",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center hover:opacity-80"
          style={{
            gap: "8px",
            fontSize: "14px",
            lineHeight: "24px",
            fontWeight: 500,
            color: "#305E82",
          }}
        >
          View All
          <Image src="/icons/dash/arrow-right-blue.svg" alt="" width={20} height={20} />
        </Link>
      </div>
      {children}
    </div>
  );
}

function AgencyCard({ agency }: { agency: Agency }) {
  const contact = useContact(agency.contactUserId);
  return (
    <Link
      href={`/dashboard/agents/agency/${agency.id}`}
      className="block bg-white relative hover:shadow-md transition-shadow"
      style={{
        border: "1px solid #F6F6F6",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      <div
        className="relative"
        style={{ width: "100%", height: "200px", background: "#EDEDED" }}
      >
        <Image src={agency.banner} alt={agency.name} fill style={{ objectFit: "cover" }} sizes="532px" />
      </div>

      <div className="flex flex-col" style={{ padding: "24px", gap: "16px" }}>
        <div className="flex items-center" style={{ gap: "8px" }}>
          <h3 style={{ fontSize: "20px", lineHeight: "32px", fontWeight: 600, color: "#121212" }}>
            {agency.name}
          </h3>
          {agency.verified && (
            <Image src="/icons/dash/verify.svg" alt="" width={20} height={20} />
          )}
        </div>

        <div className="flex items-center" style={{ gap: "8px" }}>
          <Image src="/icons/dash/detail-location.svg" alt="" width={20} height={20} />
          <span style={{ fontSize: "14px", lineHeight: "24px", color: "#305E82" }}>
            {agency.location}
          </span>
        </div>

        <div className="flex items-center justify-between" style={{ paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}>
          <div className="flex items-center" style={{ gap: "16px" }}>
            <SpecItem icon="/icons/dash/icon-star.svg" label={agency.rating} />
            <Separator />
            <SpecItem icon="/icons/dash/icon-buildings.svg" label={agency.listings} />
          </div>

          <Link
            href={`/dashboard/agents/agency/${agency.id}`}
            className="hover:underline"
            style={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              color: "#305E82",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            View all Properties
          </Link>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "16px", paddingTop: "16px", borderTop: "1px solid #F6F6F6" }}
        >
          <ContactButton variant="outline" icon="/icons/dash/call-dark.svg" label="Call" onClick={contact} />
          <ContactButton variant="filled" icon="/icons/dash/messages-2.svg" label="Message" onClick={contact} />
        </div>
      </div>
    </Link>
  );
}

// AgentCard, SpecItem, Separator and ContactButton now live in
// @/components/AgentCard (shared with the admin agency-detail Agents tab).
