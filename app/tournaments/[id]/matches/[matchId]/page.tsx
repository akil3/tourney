"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useRole } from "@/lib/hooks/useRole";

interface SetScore { home: number; away: number; }
interface MatchData { id: string; homeTeam: { id: string; name: string } | null; awayTeam: { id: string; name: string } | null; winner: { id: string; name: string } | null; sets: string; homeScore: number; awayScore: number; status: string; court: string | null; pool: { name: string } | null; tournament: { settings: string }; }
interface Settings { setsToWin: number; pointsToWin: number; decidingSetPoints: number; winBy: number; pointCap: number | null; }

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

  const isComplete = match.status === "COMPLETED";
  let homeSetsWon = 0, awaySetsWon = 0;
  for (let i = 0; i < sets.length; i++) { if (isSetDone(sets[i], i)) { if (sets[i].home > sets[i].away) homeSetsWon++; else awaySetsWon++; } }
  const currentSetIndex = sets.findIndex((s, i) => !isSetDone(s, i));
  const currentSet = currentSetIndex >= 0 ? sets[currentSetIndex] : null;
  const canScore = isAuthenticated && !isComplete && match.homeTeam && match.awayTeam;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {match.pool && <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">{match.pool.name}</p>}
        <div className="flex items-center gap-2">
          {match.court && <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Court {match.court}</span>}
          <Badge variant={isComplete ? "completed" : match.status === "IN_PROGRESS" ? "in-progress" : "pending"}>
            {isComplete ? "FINAL" : match.status === "IN_PROGRESS" ? "LIVE" : match.status}
          </Badge>
        </div>
      </div>

      {/* ═══ CURRENT SET SCORE — THE HERO ═══ */}
      {currentSet && (
        <Card glow={match.status === "IN_PROGRESS"} className="mb-4 relative overflow-hidden">
          {match.status === "IN_PROGRESS" && <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />}
          <p className="text-[10px] font-bold text-[var(--accent)] text-center uppercase tracking-[0.2em] mb-4">Set {currentSetIndex + 1}</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <p className="text-[12px] font-bold text-[var(--text-muted)] mb-2 truncate uppercase tracking-wider">{match.homeTeam?.name ?? "TBD"}</p>
              <p className="font-display text-[80px] sm:text-[96px] leading-none text-[var(--text-primary)] tabular-nums">{currentSet.home}</p>
            </div>
            <span className="text-[24px] text-[var(--text-muted)]">:</span>
            <div className="flex-1 text-center">
              <p className="text-[12px] font-bold text-[var(--text-muted)] mb-2 truncate uppercase tracking-wider">{match.awayTeam?.name ?? "TBD"}</p>
              <p className="font-display text-[80px] sm:text-[96px] leading-none text-[var(--text-primary)] tabular-nums">{currentSet.away}</p>
            </div>
          </div>

          {/* Score buttons inline under the score */}
          {canScore && (
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
              {(["home", "away"] as const).map((team) => (
                <div key={team} className="flex flex-col items-center gap-2">
                  <Button onClick={() => addPoint(team)} disabled={saving} className="w-full h-16 text-2xl"><Plus size={28} /></Button>
                  <Button variant="ghost" onClick={() => subtractPoint(team)} disabled={saving} className="w-full" size="sm"><Minus size={16} /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Score buttons when no current set yet */}
      {canScore && !currentSet && (
        <Card className="mb-4">
          <p className="text-[14px] text-[var(--text-muted)] text-center mb-4">Tap + to start scoring</p>
          <div className="grid grid-cols-2 gap-4">
            {(["home", "away"] as const).map((team) => (
              <div key={team} className="flex flex-col items-center gap-2">
                <p className="text-[11px] font-bold text-[var(--text-muted)] truncate w-full text-center uppercase tracking-wider">{team === "home" ? match.homeTeam?.name : match.awayTeam?.name}</p>
                <Button onClick={() => addPoint(team)} disabled={saving} className="w-full h-16 text-2xl"><Plus size={28} /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ═══ SETS OVERVIEW — below the current score ═══ */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-bold text-[var(--accent)] uppercase tracking-[0.15em]">Match Score</h2>
          {isAuthenticated && !isComplete && sets.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setSets([]); saveScore([]); }}><RotateCcw size={14} /> Reset</Button>
          )}
        </div>

        {/* Sets won scoreboard */}
        <div className="flex items-center justify-center gap-8 py-4">
          <div className="text-center">
            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{match.homeTeam?.name ?? "TBD"}</p>
            <p className="font-display text-[48px] leading-none text-[var(--text-primary)] tabular-nums">{homeSetsWon}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-[2px] h-6 bg-[var(--border)]" />
            <span className="font-display text-[16px] tracking-widest text-[var(--text-muted)]">VS</span>
            <div className="w-[2px] h-6 bg-[var(--border)]" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{match.awayTeam?.name ?? "TBD"}</p>
            <p className="font-display text-[48px] leading-none text-[var(--text-primary)] tabular-nums">{awaySetsWon}</p>
          </div>
        </div>

        {/* Individual set scores */}
        {sets.length > 0 && (
          <div className="border-t border-[var(--border)] pt-3 mt-2">
            {sets.map((set, i) => (
              <div key={i} className="flex items-center text-[15px] py-2.5 border-b border-[var(--border)] last:border-0">
                <span className="text-[11px] font-bold text-[var(--text-muted)] w-14 uppercase tracking-wider">Set {i + 1}</span>
                <span className="flex-1 text-center font-display text-[24px] tracking-wider text-[var(--text-secondary)]">{set.home}</span>
                <span className="text-[var(--text-muted)]">:</span>
                <span className="flex-1 text-center font-display text-[24px] tracking-wider text-[var(--text-secondary)]">{set.away}</span>
                <span className="w-14 text-right">
                  {isSetDone(set, i) && <Badge variant={set.home > set.away ? "completed" : "destructive"}>{set.home > set.away ? "H" : "A"}</Badge>}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Winner */}
      {isComplete && match.winner && (
        <Card glow className="text-center py-6">
          <p className="text-[10px] font-bold text-[var(--success)] uppercase tracking-[0.2em]">Winner</p>
          <p className="font-display text-[36px] tracking-wider text-[var(--success)] mt-1">{match.winner.name.toUpperCase()}</p>
        </Card>
      )}

      <div className="mt-4">
        <Button variant="secondary" className="w-full" onClick={() => router.push(`/tournaments/${tournamentId}/schedule`)}>Back to Schedule</Button>
      </div>
    </div>
  );
}
