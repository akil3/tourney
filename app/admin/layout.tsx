"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/lib/hooks/useRole";
import { LayoutDashboard, Users, Trophy, Wrench } from "lucide-react";
import { useEffect } from "react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push("/");
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) return <div className="text-[15px] text-[var(--text-muted)] py-12 text-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none">ADMIN</h1>
        <p className="text-[14px] text-[var(--text-muted)] mt-2">Manage your platform</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-48 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {adminNav.filter(item => {
            if (item.href === "/admin/users" || item.href === "/admin/tools") return isSuperAdmin;
            return true;
          }).map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"}`}>
                <item.icon size={16} strokeWidth={1.5} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
