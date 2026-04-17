import { notFound } from "next/navigation"; import Link from "next/link"; import { prisma } from "@/lib/prisma"; import { Card } from "@/components/ui/Card"; import { Badge } from "@/components/ui/Badge"; import { Button } from "@/components/ui/Button"; import { TournamentSettings, DEFAULT_SETTINGS } from "@/lib/types"; import { Users, Calendar, Swords, BarChart3, Zap } from "lucide-react";
import { TournamentActions } from "@/components/tournament/TournamentActions";

const statusVariant = { DRAFT: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const };

export default async function TournamentOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const tournament = await prisma.tournament.findUnique({ where: { id }, include: { _count: { select: { teams: true, matches: true, pools: true } } } }); if (!tournament) notFound();
  const settings: TournamentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(tournament.settings || "{}") }; const completedMatches = await prisma.match.count({ where: { tournamentId: id, status: "COMPLETED" } }); const liveMatches = await prisma.match.count({ where: { tournamentId: id, status: "IN_PROGRESS" } });
  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div><h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none">{tournament.name.toUpperCase()}</h1>{tournament.venue && <p className="text-[15px] text-[var(--text-muted)] mt-2">{tournament.venue}</p>}</div>
        <Badge variant={statusVariant[tournament.status as keyof typeof statusVariant] ?? "pending"}>{tournament.status.replace("_", " ")}</Badge>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[{ icon: Users, value: tournament._count.teams, label: "Teams" }, { icon: Calendar, value: tournament._count.matches, label: "Matches" }, { icon: Zap, value: liveMatches, label: "Live" }, { icon: BarChart3, value: completedMatches, label: "Done" }].map(({ icon: Icon, value, label }, idx) => (
          <Card key={label}><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${idx === 2 ? "bg-[var(--accent-soft)]" : idx === 3 ? "bg-[var(--success-soft)]" : "bg-[var(--bg-muted)]"}`}><Icon size={18} className={idx === 2 ? "text-[var(--accent)]" : idx === 3 ? "text-[var(--success)]" : "text-[var(--text-secondary)]"} strokeWidth={1.5} /></div><div><p className="font-display text-[32px] tracking-wider text-[var(--text-primary)] leading-none">{value}</p><p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mt-1">{label}</p></div></div></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Tournament Info</h2><dl className="space-y-3 text-[15px]">
          {[["Format", tournament.format.replace(/_/g, " ").toLowerCase()], ["Sets to Win", `Best of ${settings.setsToWin * 2 - 1}`], ["Points per Set", `${settings.pointsToWin} (deciding: ${settings.decidingSetPoints})`], ["Win By", String(settings.winBy)], ...(settings.pointCap ? [["Point Cap", String(settings.pointCap)]] : []), ...(tournament.format === "POOL_PLAY" ? [["Pools", String(settings.poolCount)], ["Advance per Pool", String(settings.advancePerPool)]] : [])].map(([key, val]) => (<div key={key} className="flex justify-between"><dt className="text-[var(--text-muted)]">{key}</dt><dd className="text-[var(--text-primary)] capitalize font-medium">{val}</dd></div>))}
        </dl></Card>
        <Card><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-4">Navigation</h2><div className="flex flex-col gap-2">
          {tournament._count.matches > 0 && (<>
            <Link href={`/tournaments/${id}/schedule`}><Button variant="secondary" className="w-full justify-start"><Calendar size={16} /> Schedule</Button></Link>
            <Link href={`/tournaments/${id}/standings`}><Button variant="secondary" className="w-full justify-start"><BarChart3 size={16} /> Standings</Button></Link>
            <Link href={`/tournaments/${id}/bracket`}><Button variant="secondary" className="w-full justify-start"><Swords size={16} /> Bracket</Button></Link>
          </>)}
          <Link href={`/tournaments/${id}/teams`}><Button variant="secondary" className="w-full justify-start"><Users size={16} /> Teams</Button></Link>
          <TournamentActions tournamentId={id} status={tournament.status} teamCount={tournament._count.teams} />
        </div></Card>
      </div>
    </div>
  );
}
