"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Flame, Sun, Moon, LogOut, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/tournaments", label: "Tournaments" },
];

export function TopNav({ role, userName }: { role?: string; userName?: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-[var(--shadow-md)]">
              <Flame size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[24px] tracking-widest text-[var(--text-primary)] leading-none mt-0.5">TOURNEY</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                  {item.label}
                </Link>
              );
            })}
            {(role === "admin" || role === "superadmin") && (
              <Link href="/admin" className={`px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors ${pathname.startsWith("/admin") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors" title="Toggle theme">
            <Sun size={16} className="dark:hidden" />
            <Moon size={16} className="hidden dark:block" />
          </button>
          {userName ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors">
                <User size={14} />{userName.split("@")[0]}
              </Link>
              <button onClick={() => signOut()} className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-[var(--destructive-soft)] transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
