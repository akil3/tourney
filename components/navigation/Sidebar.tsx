"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, Settings, LogOut, Flame } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [{ href: "/", label: "Dashboard", icon: Home }, { href: "/tournaments", label: "Tournaments", icon: Trophy }, { href: "/profile", label: "Profile", icon: User }, { href: "/admin", label: "Admin", icon: Settings }];

export function Sidebar({ role, userName }: { role?: string; userName?: string }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.href !== "/admin" || role === "admin" || role === "superadmin");
  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#221e1b] border-r border-[rgba(255,240,220,0.06)] h-screen sticky top-0">
      <div className="p-5 border-b border-[rgba(255,240,220,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(255,107,53,0.3)]"><Flame size={16} className="text-white" strokeWidth={2.5} /></div>
          <span className="font-display text-[28px] tracking-wider text-[#f5efe6] leading-none mt-1">TOURNEY</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[10px] font-bold text-[#5a5048] uppercase tracking-[0.2em] px-3 mb-2">Menu</p>
        {items.map((item) => { const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 mb-0.5 ${isActive ? "bg-[rgba(255,107,53,0.12)] text-[#FF6B35] border border-[rgba(255,107,53,0.2)] shadow-[0_0_12px_rgba(255,107,53,0.08)]" : "text-[#8a7e70] hover:text-[#f5efe6] hover:bg-[rgba(255,240,220,0.04)]"}`}>
            <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />{item.label}
          </Link>
        ); })}
      </nav>
      <div className="p-4 border-t border-[rgba(255,240,220,0.06)]">
        {userName && <div className="text-[11px] font-semibold text-[#5a5048] mb-2 truncate uppercase tracking-wider">{userName}</div>}
        <button onClick={() => signOut()} className="flex items-center gap-2 text-[13px] font-medium text-[#5a5048] hover:text-[#f5efe6] transition-colors w-full px-3 py-2 rounded-lg hover:bg-[rgba(255,240,220,0.04)]"><LogOut size={14} strokeWidth={1.5} />Sign out</button>
      </div>
    </aside>
  );
}
