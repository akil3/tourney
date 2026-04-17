import { notFound } from "next/navigation"; import Link from "next/link"; import { prisma } from "@/lib/prisma"; import { Card } from "@/components/ui/Card"; import { Badge } from "@/components/ui/Badge"; import { Calendar } from "lucide-react";
const statusVariant = { PENDING: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const, BYE: "default" as const };

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const tournament = await prisma.tournament.findUnique({ where: { id }, include: { matches: { include: { homeTeam: true, awayTeam: true, winner: true, pool: true }, orderBy: [{ round: "asc" }, { matchNumber: "asc" }] } } }); if (!tournament) notFound();
  if (tournament.matches.length === 0) return (<div className="text-center py-16"><Calendar size={48} className="mx-auto text-[var(--text-muted)] mb-4" strokeWidth={1} /><p className="font-display text-[28px] tracking-wider text-[var(--text-secondary)]">NO MATCHES YET</p><p className="text-[14px] text-[var(--text-muted)] mt-2">Generate a schedule from the Overview tab</p></div>);
  const rounds = new Map<number, typeof tournament.matches>(); for (const match of tournament.matches) { if (!rounds.has(match.round)) rounds.set(match.round, []); rounds.get(match.round)!.push(match); }
  return (
    <div><h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none mb-8">SCHEDULE</h1><div className="space-y-8">
      {Array.from(rounds.entries()).map(([round, matches]) => (<div key={round}><h2 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-3">Round {round}</h2><div className="space-y-2">
        {matches.map((match: typeof matches[number]) => (<Link key={match.id} href={`/tournaments/${id}/matches/${match.id}`}><Card className="hover:shadow-[var(--shadow-md)] hover:border-[var(--border-hover)] transition-all cursor-pointer group"><div className="flex items-center justify-between"><div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[15px]"><span className={match.winnerId === match.homeTeamId ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)]"}>{match.homeTeam?.name ?? "TBD"}</span>{match.status === "COMPLETED" && <span className="font-display text-[18px] tracking-wider text-[var(--accent)]">{match.homeScore}</span>}</div>
          <div className="flex items-center gap-2 text-[15px] mt-1"><span className={match.winnerId === match.awayTeamId ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)]"}>{match.awayTeam?.name ?? "TBD"}</span>{match.status === "COMPLETED" && <span className="font-display text-[18px] tracking-wider text-[var(--accent)]">{match.awayScore}</span>}</div>
        </div><div className="flex items-center gap-3">{match.pool && <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{match.pool.name}</span>}<Badge variant={statusVariant[match.status as keyof typeof statusVariant] ?? "pending"}>{match.status === "IN_PROGRESS" ? "LIVE" : match.status}</Badge></div></div></Card></Link>))}
      </div></div>))}
    </div></div>
  );
}
