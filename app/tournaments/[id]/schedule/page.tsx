import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar } from "lucide-react";

const statusVariant = { PENDING: "pending" as const, IN_PROGRESS: "in-progress" as const, COMPLETED: "completed" as const, BYE: "default" as const };

interface SetScore { home: number; away: number; }

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { matches: { include: { homeTeam: true, awayTeam: true, winner: true, pool: true }, orderBy: [{ round: "asc" }, { matchNumber: "asc" }] } },
  });
  if (!tournament) notFound();

  if (tournament.matches.length === 0) {
    return (
      <Card className="text-center py-16 border-dashed">
        <Calendar size={48} className="mx-auto text-[var(--text-muted)] mb-4" strokeWidth={1} />
        <p className="font-display text-[28px] tracking-wider text-[var(--text-secondary)]">NO MATCHES YET</p>
        <p className="text-[14px] text-[var(--text-muted)] mt-2">Generate a schedule from the Overview tab</p>
      </Card>
    );
  }

  const rounds = new Map<number, typeof tournament.matches>();
  for (const match of tournament.matches) {
    if (!rounds.has(match.round)) rounds.set(match.round, []);
    rounds.get(match.round)!.push(match);
  }

  return (
    <div>
      <h1 className="font-display text-[clamp(36px,5vw,52px)] tracking-wider text-[var(--text-primary)] leading-none mb-8">SCHEDULE</h1>
      <div className="space-y-8">
        {Array.from(rounds.entries()).map(([round, matches]) => (
          <div key={round}>
            <h2 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-3">Round {round}</h2>
            <div className="space-y-2">
              {matches.map((match: typeof matches[number]) => {
                const sets: SetScore[] = JSON.parse(match.sets || "[]");
                const homeWon = match.winnerId === match.homeTeamId;
                const awayWon = match.winnerId === match.awayTeamId;
                const isComplete = match.status === "COMPLETED";

                return (
                  <Link key={match.id} href={`/tournaments/${id}/matches/${match.id}`}>
                    <Card className="hover:shadow-[var(--shadow-md)] hover:border-[var(--border-hover)] transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        {/* Score column */}
                        {isComplete ? (
                          <div className="flex items-center gap-1 shrink-0 w-16 justify-center">
                            <span className={`font-display text-[28px] tracking-wider ${homeWon ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>{match.homeScore}</span>
                            <span className="text-[var(--text-muted)] text-[14px]">:</span>
                            <span className={`font-display text-[28px] tracking-wider ${awayWon ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>{match.awayScore}</span>
                          </div>
                        ) : (
                          <div className="w-16 flex justify-center">
                            <Badge variant={statusVariant[match.status as keyof typeof statusVariant] ?? "pending"}>
                              {match.status === "IN_PROGRESS" ? "LIVE" : match.status}
                            </Badge>
                          </div>
                        )}

                        {/* Teams */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] truncate ${homeWon ? "font-semibold text-[var(--text-primary)]" : isComplete && awayWon ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                            {match.homeTeam?.name ?? "TBD"}
                          </p>
                          <p className={`text-[15px] truncate mt-0.5 ${awayWon ? "font-semibold text-[var(--text-primary)]" : isComplete && homeWon ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                            {match.awayTeam?.name ?? "TBD"}
                          </p>
                        </div>

                        {/* Set scores */}
                        {sets.length > 0 && (
                          <div className="hidden sm:flex gap-1.5 shrink-0">
                            {sets.map((s: SetScore, i: number) => (
                              <span key={i} className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-muted)] px-2 py-1 rounded-md">
                                {s.home}-{s.away}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
                          {match.pool && <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{match.pool.name}</span>}
                          {match.court && <span className="text-[11px] text-[var(--text-muted)]">Court {match.court}</span>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
