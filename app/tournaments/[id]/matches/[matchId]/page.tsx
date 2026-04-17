"use client";
import { useState, useEffect, useCallback } from "react"; import { useParams, useRouter } from "next/navigation"; import { Card } from "@/components/ui/Card"; import { Button } from "@/components/ui/Button"; import { Badge } from "@/components/ui/Badge"; import { Minus, Plus, RotateCcw } from "lucide-react";
import { useRole } from "@/lib/hooks/useRole";
interface SetScore { home: number; away: number; } interface MatchData { id: string; homeTeam: { id: string; name: string } | null; awayTeam: { id: string; name: string } | null; winner: { id: string; name: string } | null; sets: string; homeScore: number; awayScore: number; status: string; court: string | null; pool: { name: string } | null; tournament: { settings: string }; } interface Settings { setsToWin: number; pointsToWin: number; decidingSetPoints: number; winBy: number; pointCap: number | null; }

export default function MatchPage() {
  const params = useParams(); const router = useRouter(); const tournamentId = params.id as string; const matchId = params.matchId as string;
  const { isAuthenticated } = useRole();
  const [match, setMatch] = useState<MatchData | null>(null); const [sets, setSets] = useState<SetScore[]>([]); const [settings, setSettings] = useState<Settings>({ setsToWin: 2, pointsToWin: 25, decidingSetPoints: 15, winBy: 2, pointCap: null }); const [saving, setSaving] = useState(false);
  const fetchMatch = useCallback(async () => { const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`); const data = await res.json(); setMatch(data); setSets(JSON.parse(data.sets || "[]")); const s = JSON.parse(data.tournament?.settings || "{}"); setSettings({ setsToWin: s.setsToWin ?? 2, pointsToWin: s.pointsToWin ?? 25, decidingSetPoints: s.decidingSetPoints ?? 15, winBy: s.winBy ?? 2, pointCap: s.pointCap ?? null }); }, [tournamentId, matchId]);
  useEffect(() => { fetchMatch(); }, [fetchMatch]);
  async function saveScore(newSets: SetScore[]) { setSaving(true); await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sets: newSets }) }); setSaving(false); fetchMatch(); }
  function isSetDone(set: SetScore, index: number): boolean { const isDeciding = index === settings.setsToWin * 2 - 2; const target = isDeciding ? settings.decidingSetPoints : settings.pointsToWin; const max = Math.max(set.home, set.away), min = Math.min(set.home, set.away); if (max < target) return false; if (settings.pointCap && max >= settings.pointCap) return true; return max - min >= settings.winBy; }
  function addPoint(team: "home" | "away") { const newSets = sets.length === 0 ? [{ home: 0, away: 0 }] : sets.map(s => ({ ...s })); let cur = newSets.length - 1; for (let i = 0; i < newSets.length; i++) { if (!isSetDone(newSets[i], i)) { cur = i; break; } if (i === newSets.length - 1) { newSets.push({ home: 0, away: 0 }); cur = newSets.length - 1; } } newSets[cur][team]++; setSets(newSets); saveScore(newSets); }
  function subtractPoint(team: "home" | "away") { if (sets.length === 0) return; const newSets = sets.map(s => ({ ...s })); let cur = newSets.length - 1; for (let i = 0; i < newSets.length; i++) { if (!isSetDone(newSets[i], i)) { cur = i; break; } } if (newSets[cur][team] > 0) { newSets[cur][team]--; setSets(newSets); saveScore(newSets); } }
  if (!match) return <div className="text-[15px] text-[var(--text-muted)]">Loading...</div>;
  const isComplete = match.status === "COMPLETED"; let homeSetsWon = 0, awaySetsWon = 0; for (let i = 0; i < sets.length; i++) { if (isSetDone(sets[i], i)) { if (sets[i].home > sets[i].away) homeSetsWon++; else awaySetsWon++; } }
  const currentSetIndex = sets.findIndex((s, i) => !isSetDone(s, i)); const currentSet = currentSetIndex >= 0 ? sets[currentSetIndex] : null;
  const canScore = isAuthenticated && !isComplete && match.homeTeam && match.awayTeam;

  return (
    <div className="max-w-lg mx-auto">
      {match.pool && <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-3">{match.pool.name}</p>}
      <Card glow={match.status === "IN_PROGRESS"} className="mb-4">
        <div className="flex items-center justify-between mb-6"><Badge variant={isComplete ? "completed" : match.status === "IN_PROGRESS" ? "in-progress" : "pending"}>{isComplete ? "FINAL" : match.status === "IN_PROGRESS" ? "LIVE" : match.status}</Badge>{match.court && <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Court {match.court}</span>}</div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center"><p className="text-[12px] font-bold text-[var(--text-muted)] mb-3 truncate uppercase tracking-wider">{match.homeTeam?.name ?? "TBD"}</p><p className="font-display text-[72px] sm:text-[96px] leading-none text-[var(--text-primary)] tabular-nums">{homeSetsWon}</p></div>
          <div className="flex flex-col items-center gap-1"><div className="w-[2px] h-8 bg-[var(--border)]" /><span className="font-display text-[20px] tracking-widest text-[var(--text-muted)]">VS</span><div className="w-[2px] h-8 bg-[var(--border)]" /></div>
          <div className="flex-1 text-center"><p className="text-[12px] font-bold text-[var(--text-muted)] mb-3 truncate uppercase tracking-wider">{match.awayTeam?.name ?? "TBD"}</p><p className="font-display text-[72px] sm:text-[96px] leading-none text-[var(--text-primary)] tabular-nums">{awaySetsWon}</p></div>
        </div>
        {currentSet && (<div className="mt-8 pt-6 border-t border-[var(--border)]"><p className="text-[10px] font-bold text-[var(--accent)] text-center uppercase tracking-[0.2em] mb-3">Set {currentSetIndex + 1}</p><div className="flex items-center justify-center gap-6"><span className="font-display text-[56px] leading-none text-[var(--text-primary)] tabular-nums">{currentSet.home}</span><span className="text-[24px] text-[var(--text-muted)]">:</span><span className="font-display text-[56px] leading-none text-[var(--text-primary)] tabular-nums">{currentSet.away}</span></div></div>)}
      </Card>

      {/* Score controls — only for authenticated admins */}
      {canScore && (<Card className="mb-4"><div className="grid grid-cols-2 gap-4">
        {(["home", "away"] as const).map((team) => (<div key={team} className="flex flex-col items-center gap-2"><p className="text-[11px] font-bold text-[var(--text-muted)] truncate w-full text-center uppercase tracking-wider">{team === "home" ? match.homeTeam!.name : match.awayTeam!.name}</p><Button onClick={() => addPoint(team)} disabled={saving} className="w-full h-20 text-2xl"><Plus size={28} /></Button><Button variant="ghost" onClick={() => subtractPoint(team)} disabled={saving} className="w-full" size="sm"><Minus size={16} /></Button></div>))}
      </div></Card>)}

      {/* Set history — visible to everyone */}
      {sets.length > 0 && (<Card><div className="flex items-center justify-between mb-3"><h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Set Scores</h2>{isAuthenticated && !isComplete && <Button variant="ghost" size="sm" onClick={() => { setSets([]); saveScore([]); }}><RotateCcw size={14} /> Reset</Button>}</div>
        {sets.map((set, i) => (<div key={i} className="flex items-center text-[15px] py-3 border-b border-[var(--border)] last:border-0"><span className="text-[11px] font-bold text-[var(--text-muted)] w-14 uppercase tracking-wider">Set {i + 1}</span><span className="flex-1 text-center font-display text-[24px] tracking-wider text-[var(--text-secondary)]">{set.home}</span><span className="text-[var(--text-muted)]">:</span><span className="flex-1 text-center font-display text-[24px] tracking-wider text-[var(--text-secondary)]">{set.away}</span><span className="w-14 text-right">{isSetDone(set, i) && <Badge variant={set.home > set.away ? "completed" : "destructive"}>{set.home > set.away ? "H" : "A"}</Badge>}</span></div>))}
      </Card>)}

      {isComplete && match.winner && (<Card glow className="mt-4 text-center py-6"><p className="text-[10px] font-bold text-[var(--success)] uppercase tracking-[0.2em]">Winner</p><p className="font-display text-[36px] tracking-wider text-[var(--success)] mt-1">{match.winner.name.toUpperCase()}</p></Card>)}
      <div className="mt-4"><Button variant="secondary" className="w-full" onClick={() => router.push(`/tournaments/${tournamentId}/schedule`)}>Back to Schedule</Button></div>
    </div>
  );
}
