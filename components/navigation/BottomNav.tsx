"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Home, Trophy, User, Settings, Sun, Moon } from "lucide-react";

const navItems = [{ href: "/", label: "Home", icon: Home }, { href: "/tournaments", label: "Tourneys", icon: Trophy }, { href: "/profile", label: "Profile", icon: User }, { href: "/admin", label: "Admin", icon: Settings }];

export function BottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const items = navItems.filter((item) => item.href !== "/admin" || role === "admin" || role === "superadmin");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)]/90 backdrop-blur-xl border-t border-[var(--border)] md:hidden z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => { const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] justify-center transition-colors ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        ); })}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] justify-center text-[var(--text-muted)]">
          <Sun size={20} strokeWidth={1.5} className="dark:hidden" />
          <Moon size={20} strokeWidth={1.5} className="hidden dark:block" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Theme</span>
        </button>
      </div>
    </nav>
  );
}
