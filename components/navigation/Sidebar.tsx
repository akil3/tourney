"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

const navItems = [{ href: "/", label: "Dashboard", icon: Home }, { href: "/tournaments", label: "Tournaments", icon: Trophy }, { href: "/profile", label: "Profile", icon: User }, { href: "/admin", label: "Admin", icon: Settings }];

export function Sidebar({ role, userName }: { role?: string; userName?: string }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.href !== "/admin" || role === "admin" || role === "superadmin");
  return (
    <aside className="hidden md:flex flex-col w-60 bg-[var(--bg-surface)] border-r border-[var(--border)] h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icons/icon-64.png" alt="Tourney" width={32} height={32} className="rounded-lg" />
          <span className="font-display text-[28px] tracking-wider text-[var(--text-primary)] leading-none mt-1">TOURNEY</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] px-3 mb-2">Menu</p>
        {items.map((item) => { const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 mb-0.5 ${isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"}`}>
            <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />{item.label}
          </Link>
        ); })}
      </nav>
      <div className="p-4 border-t border-[var(--border)]">
        {userName && <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 truncate uppercase tracking-wider">{userName}</div>}
        <button onClick={() => signOut()} className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors w-full px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)]"><LogOut size={14} strokeWidth={1.5} />Sign out</button>
      </div>
    </aside>
  );
}
