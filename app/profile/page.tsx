"use client";
import { useSession, signOut } from "next-auth/react"; import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button"; import { Badge } from "@/components/ui/Badge"; import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="text-[15px] text-[var(--text-muted)]">Loading...</div>;
  if (!session) return (<div className="max-w-sm mx-auto text-center py-16"><h1 className="font-display text-[40px] tracking-wider text-[var(--text-primary)] leading-none mb-4">PROFILE</h1><p className="text-[15px] text-[var(--text-muted)] mb-6">Sign in to manage your teams</p><Link href="/auth/login"><Button>Sign in</Button></Link></div>);
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-display text-[40px] tracking-wider text-[var(--text-primary)] leading-none mb-8">PROFILE</h1>
      <Card>
        <div className="space-y-5">
          {[["Name", session.user.name || "Not set"], ["Email", session.user.email]].map(([label, val]) => (<div key={label}><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">{label}</p><p className="text-[16px] text-[var(--text-primary)] mt-1">{val}</p></div>))}
          <div><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Role</p><div className="mt-1.5"><Badge>{session.user.role}</Badge></div></div>
        </div>
        <Button variant="secondary" className="w-full mt-6" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>
      </Card>
    </div>
  );
}
