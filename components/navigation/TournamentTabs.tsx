"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [{ href: "", label: "Overview" }, { href: "/teams", label: "Teams" }, { href: "/schedule", label: "Schedule" }, { href: "/bracket", label: "Bracket" }, { href: "/standings", label: "Standings" }];

export function TournamentTabs({ tournamentId }: { tournamentId: string }) {
  const pathname = usePathname(); const base = `/tournaments/${tournamentId}`;
  return (
    <div className="border-b border-[var(--border)] overflow-x-auto">
      <nav className="flex gap-0 min-w-max px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {tabs.map((tab) => { const href = `${base}${tab.href}`; const isActive = tab.href === "" ? pathname === base : pathname.startsWith(href); return (
          <Link key={tab.href} href={href} className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap min-h-[44px] flex items-center ${isActive ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
            {tab.label}
          </Link>
        ); })}
      </nav>
    </div>
  );
}
