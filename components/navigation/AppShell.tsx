"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav role={session?.user?.role} userName={session?.user?.name ?? session?.user?.email} />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-6 sm:py-8">
          {children}
        </div>
      </main>
      <BottomNav role={session?.user?.role} />
    </div>
  );
}
