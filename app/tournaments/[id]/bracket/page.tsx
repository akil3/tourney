import { notFound } from "next/navigation"; import { prisma } from "@/lib/prisma"; import { GitBranch } from "lucide-react"; import { Card } from "@/components/ui/Card";

export default async function BracketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const tournament = await prisma.tournament.findUnique({ where: { id }, include: { brackets: { include: { matches: { include: { homeTeam: true, awayTeam: true, winner: true }, orderBy: [{ round: "asc" }, { matchNumber: "asc" }] } } } } }); if (!tournament) notFound();
  if (tournament.brackets.length === 0) return (<div className="text-center py-16"><GitBranch size={48} className="mx-auto text-[var(--text-muted)] mb-4" strokeWidth={1} /><p className="font-display text-[28px] tracking-wider text-[var(--text-secondary)]">NO BRACKET</p><p className="text-[14px] text-[var(--text-muted)] mt-2">{tournament.format === "POOL_PLAY" ? "Complete pool play first" : "Generate from Overview tab"}</p></div>);
  return (
    <div><h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none mb-8">BRACKET</h1>
      {tournament.brackets.map((bracket: typeof tournament.brackets[number]) => {
        const typeGroups = new Map<string, Map<number, typeof bracket.matches>>(); for (const match of bracket.matches) { const bt = match.bracketType || "WINNERS"; if (!typeGroups.has(bt)) typeGroups.set(bt, new Map()); const rm = typeGroups.get(bt)!; if (!rm.has(match.round)) rm.set(match.round, []); rm.get(match.round)!.push(match); }
        return (<div key={bracket.id} className="space-y-8">{Array.from(typeGroups.entries()).map(([bracketType, roundMap]) => (<div key={bracketType}>
          <h2 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-4">{bracketType === "WINNERS" ? "Winners" : bracketType === "LOSERS" ? "Losers" : bracketType === "GRAND_FINALS" ? "Grand Finals" : "Bracket"}</h2>
          <div className="overflow-x-auto pb-4"><div className="flex gap-6 min-w-max snap-x snap-mandatory">{Array.from(roundMap.entries()).sort(([a], [b]) => a - b).map(([round, matches]) => (<div key={round} className="flex flex-col gap-4 min-w-[230px] snap-start">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] text-center">Round {round}</h3>
            <div className="flex flex-col gap-4 justify-around flex-1">{matches.map((match: typeof matches[number]) => (<a key={match.id} href={`/tournaments/${id}/matches/${match.id}`}>
              <Card padding={false} className="overflow-hidden hover:shadow-[var(--shadow-md)] transition-all">
                <div className={`flex items-center justify-between px-3 py-2.5 ${match.winner?.id === match.homeTeam?.id ? "bg-[var(--success-soft)] border-l-2 border-l-[var(--success)]" : "border-l-2 border-l-transparent"}`}><span className={match.winner?.id === match.homeTeam?.id ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)]"}>{match.homeTeam?.name ?? "TBD"}</span>{match.status === "COMPLETED" && <span className="font-display text-[18px] tracking-wider text-[var(--accent)]">{match.homeScore}</span>}</div>
                <div className="border-t border-[var(--border)]" />
                <div className={`flex items-center justify-between px-3 py-2.5 ${match.winner?.id === match.awayTeam?.id ? "bg-[var(--success-soft)] border-l-2 border-l-[var(--success)]" : "border-l-2 border-l-transparent"}`}><span className={match.winner?.id === match.awayTeam?.id ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)]"}>{match.awayTeam?.name ?? "TBD"}</span>{match.status === "COMPLETED" && <span className="font-display text-[18px] tracking-wider text-[var(--accent)]">{match.awayScore}</span>}</div>
                {match.status === "BYE" && <div className="border-t border-[var(--border)] px-3 py-1 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">BYE</div>}
              </Card></a>))}</div>
          </div>))}</div></div></div>))}</div>);
      })}
    </div>
  );
}
