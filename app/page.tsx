import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trophy, Plus, Users, Swords } from "lucide-react";

const statusVariant = { DRAFT: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const };

export default async function HomePage() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { teams: true, matches: true } } } });
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-[clamp(40px,7vw,72px)] tracking-wider text-[var(--text-primary)] leading-none">TOURNAMENTS</h1>
          <p className="text-[15px] text-[var(--text-muted)] mt-2">Manage your volleyball competitions</p>
        </div>
        <Link href="/tournaments/new"><Button><Plus size={16} strokeWidth={2.5} /> New</Button></Link>
      </div>
      {tournaments.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-5">
            <Trophy size={28} className="text-[var(--accent)]" strokeWidth={1.5} />
          </div>
          <p className="font-display text-[28px] tracking-wider text-[var(--text-secondary)] mb-2">NO TOURNAMENTS YET</p>
          <p className="text-[15px] text-[var(--text-muted)] mb-8">Create your first tournament to get started</p>
          <Link href="/tournaments/new"><Button size="lg">Create Tournament</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t: typeof tournaments[number]) => (
            <Link key={t.id} href={`/tournaments/${t.id}`}>
              <Card className="hover:shadow-[var(--shadow-md)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate pr-2">{t.name}</h2>
                  <Badge variant={statusVariant[t.status as keyof typeof statusVariant] ?? "pending"}>{t.status.replace("_", " ")}</Badge>
                </div>
                <div className="flex items-center gap-5 text-[13px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5"><Users size={13} />{t._count.teams}</span>
                  <span className="flex items-center gap-1.5"><Swords size={13} />{t._count.matches}</span>
                  <span className="capitalize">{t.format.replace("_", " ").toLowerCase()}</span>
                </div>
                {t.venue && <p className="text-[13px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border)]">{t.venue}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
